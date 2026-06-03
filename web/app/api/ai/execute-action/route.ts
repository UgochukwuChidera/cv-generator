export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { normalizeMCS } from '@/lib/mcs';
import { parseAIJson, targetJD, type ChatMessage } from '@/lib/ai';

const PROVIDER_CONFIG: Record<string, { baseURL: string; defaultModel: string }> = {
  groq: { baseURL: 'https://api.groq.com/openai/v1', defaultModel: 'llama-3.3-70b-versatile' },
  openai: { baseURL: 'https://api.openai.com/v1', defaultModel: 'gpt-4o-mini' },
  openrouter: { baseURL: 'https://openrouter.ai/api/v1', defaultModel: 'openai/gpt-4o-mini' },
};

const APP_CAPABILITIES = `Available actions you can trigger:
1. compare-jd — Compare the user's CV against a job description. Returns fit score (0-100), sub-scores, missing skills, bullet suggestions.
2. edit-section — Edit a specific CV section (summary, experience, skills, education, projects, languages, personal).
3. improve-bullet — Improve a single bullet point with 3 quantified variants.
4. score-resume — Score the resume completeness across all sections (0-100).
5. generate-summary — Generate or rewrite the professional summary.
6. generate-cover-letter — Generate a cover letter tailored to a job description.
7. suggest-skills — Suggest skills to add based on experience and target role.
8. export-cv — Export the CV in a given format (pdf, docx, html, json, yaml).
9. clarify-question — Ask the user a clarifying question about their profile.`;

const ACTION_PROMPT = `You are Nexus, an elite career intelligence AI embedded in a CV builder app.
The user is on the "${"{{PAGE}}"}" page and says: "${"{{QUERY}}"}" 

${APP_CAPABILITIES}

FIRST: Determine if the user's message requires an action or is just a conversation.
- If it's a simple question or chat, respond conversationally.
- If it requires executing a capability, respond conversationally AND include a JSON action block at the end.

Action JSON block format (place at the very end of your response inside \`\`\`action ... \`\`\`):
{
  "actionType": "compare-jd | edit-section | improve-bullet | score-resume | generate-summary | generate-cover-letter | suggest-skills | export-cv | clarify-question",
  "params": { ... relevant parameters ... }
}

Rules:
- For compare-jd, params should include: { "jdText": "the job description text" }
- For edit-section, params should include: { "section": "summary|experience|skills|etc", "change": "description of change" }
- For score-resume, params: {}
- For improve-bullet, params: { "bullet": "the bullet text" }
- Be helpful, professional, and concise.
- If the user wants to compare against a JD, extract the JD text from their message.
- If they ask for a score, trigger score-resume.
- Always return the conversational response first, then the action block.`;

function extractActionBlock(text: string): { actionType?: string; params?: Record<string, unknown> } | null {
  const match = text.match(/```action\n([\s\S]*?)\n```/);
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

function cleanResponse(text: string): string {
  return text.replace(/```action\n[\s\S]*?\n```/g, '').trim();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, mcs, page, provider, model } = body as {
      messages?: ChatMessage[];
      mcs?: unknown;
      page?: string;
      provider?: string;
      model?: string;
    };
    const apiKey = req.headers.get('x-api-key') || '';

    if (!apiKey) {
      return Response.json({ ok: false, error: 'AI API key required' }, { status: 401 });
    }

    const currentMcs = normalizeMCS(mcs || {});
    const prov = provider || 'openai';
    const cfg = PROVIDER_CONFIG[prov];
    if (!cfg) {
      return Response.json({ ok: false, error: `Unsupported provider: ${prov}` }, { status: 400 });
    }

    const lastUserMsg = [...(messages || [])].reverse().find((m) => m.role === 'user');
    const query = lastUserMsg?.content || '';

    const systemPrompt = ACTION_PROMPT
      .replace('{{PAGE}}', page || 'unknown')
      .replace('{{QUERY}}', query);

    const client = createOpenAI({ apiKey, baseURL: cfg.baseURL });
    const result = streamText({
      model: client(model || cfg.defaultModel),
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'system', content: `Current Profile JSON:\n${JSON.stringify(currentMcs)}` },
        ...(messages || []).map((m) => ({ role: m.role as 'user' | 'assistant' | 'system', content: m.content })),
      ],
      temperature: 0.2,
    });

    let fullText = '';
    for await (const chunk of result.textStream) {
      fullText += chunk;
    }

    const actionBlock = extractActionBlock(fullText);
    const response = cleanResponse(fullText);

    // Execute the detected action
    let mcsPatch: Record<string, unknown> | undefined;
    let jdAnalysis: Record<string, unknown> | undefined;
    let executedAction: { type: string; params: Record<string, unknown>; status: string } | undefined;

    if (actionBlock?.actionType) {
      executedAction = {
        type: actionBlock.actionType,
        params: (actionBlock.params || {}) as Record<string, unknown>,
        status: 'done',
      };

      switch (actionBlock.actionType) {
        case 'compare-jd': {
          const jdText = (actionBlock.params?.jdText as string) || '';
          if (jdText && currentMcs) {
            try {
              const result = await targetJD(
                { provider: prov as 'claude' | 'openai' | 'gemini' | 'openrouter' | 'groq', apiKey, model: model || cfg.defaultModel },
                currentMcs,
                jdText
              );
              jdAnalysis = result as unknown as Record<string, unknown>;
            } catch (e) {
              executedAction.status = 'failed';
              executedAction.params.error = String(e);
            }
          }
          break;
        }

        case 'score-resume': {
          try {
            const { assessMCSQuality } = await import('@/lib/mcs');
            const quality = assessMCSQuality(currentMcs);
            mcsPatch = { quality: quality as unknown as Record<string, unknown> };
          } catch { /* skip */ }
          break;
        }

        case 'edit-section': {
          const section = (actionBlock.params?.section as string) || '';
          const change = (actionBlock.params?.change as string) || '';
          if (section && change) {
            try {
              const editResult = await streamText({
                model: client(model || cfg.defaultModel),
                messages: [
                  { role: 'system', content: `You are a CV editor. Edit the "${section}" section of this CV. User request: ${change}. Return ONLY a JSON patch object that can be merged into the CV.` },
                  { role: 'user', content: `Current CV:\n${JSON.stringify(currentMcs)}\n\nEdit the "${section}" section: ${change}` },
                ],
                temperature: 0.3,
              });
              let editText = '';
              for await (const chunk of editResult.textStream) {
                editText += chunk;
              }
              try {
                const patch = parseAIJson<Record<string, unknown>>(editText);
                if (patch && Object.keys(patch).length > 0) {
                  mcsPatch = patch;
                }
              } catch { /* skip */ }
            } catch { /* skip */ }
          }
          break;
        }

        case 'improve-bullet': {
          const bullet = (actionBlock.params?.bullet as string) || '';
          if (bullet) {
            try {
              const { improveBullet } = await import('@/lib/ai');
              const variants = await improveBullet(
                { provider: prov as 'claude' | 'openai' | 'gemini' | 'openrouter' | 'groq', apiKey, model: model || cfg.defaultModel },
                bullet
              );
              mcsPatch = { improvedBullets: variants } as unknown as Record<string, unknown>;
            } catch { /* skip */ }
          }
          break;
        }

        case 'generate-summary': {
          try {
            const summaryResult = await streamText({
              model: client(model || cfg.defaultModel),
              messages: [
                { role: 'system', content: 'Write a compelling professional summary (2-3 sentences) for this CV. Return ONLY the summary text, no JSON.' },
                { role: 'user', content: `Generate a summary for:\n${JSON.stringify(currentMcs)}` },
              ],
              temperature: 0.4,
            });
            let summaryText = '';
            for await (const chunk of summaryResult.textStream) {
              summaryText += chunk;
            }
            mcsPatch = { summary: summaryText.trim() };
          } catch { /* skip */ }
          break;
        }

        default:
          break;
      }
    }

    // Also try to extract MCS patch from response JSON
    if (!mcsPatch) {
      try {
        const patch = parseAIJson<Record<string, unknown>>(fullText);
        if (patch && !('actionType' in patch)) {
          const hasMcsField = ['personal', 'summary', 'experience', 'education', 'skills', 'projects'].some(
            (k) => k in patch
          );
          if (hasMcsField) mcsPatch = patch;
        }
      } catch { /* skip */ }
    }

    return Response.json({
      ok: true,
      response,
      action: executedAction,
      mcsPatch,
      jdAnalysis,
    });
  } catch (error) {
    console.error('ExecuteAction API Error:', error);
    return Response.json(
      { ok: false, error: error instanceof Error ? error.message : 'Action execution failed' },
      { status: 500 }
    );
  }
}
