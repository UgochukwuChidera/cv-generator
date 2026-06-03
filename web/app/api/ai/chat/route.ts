import { NextRequest } from 'next/server';
import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { normalizeMCS } from '@/lib/mcs';
import { parseAIJson, type ChatMessage } from '@/lib/ai';

const PROVIDER_CONFIG: Record<string, { baseURL: string; defaultModel: string }> = {
  groq: { baseURL: 'https://api.groq.com/openai/v1', defaultModel: 'llama-3.3-70b-versatile' },
  openai: { baseURL: 'https://api.openai.com/v1', defaultModel: 'gpt-4o-mini' },
  openrouter: { baseURL: 'https://openrouter.ai/api/v1', defaultModel: 'openai/gpt-4o-mini' },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, mcs, provider, model } = body as {
      messages: ChatMessage[];
      mcs?: unknown;
      provider?: string;
      model?: string;
    };
    const apiKey = req.headers.get('x-api-key') || '';

    if (!apiKey) {
      return Response.json({ ok: false, error: 'AI API key required' }, { status: 401 });
    }

    const prov = provider || 'openai';
    const cfg = PROVIDER_CONFIG[prov];
    if (!cfg) {
      return Response.json({ ok: false, error: `Unsupported provider: ${prov}` }, { status: 400 });
    }

    const currentMcs = normalizeMCS(mcs || {});
    const systemPrompt = `App capabilities:
- Extract profile data from pasted text or uploaded TXT/PDF/DOCX/JSON/YAML.
- Ask clarification questions for missing required profile fields.
- Edit profile sections (personal, summary, experience, education, skills, projects, languages).
- Run JD targeting analysis with fit score and sub-scores.
- Generate tailored bullet suggestions and cover letters.
- Export deliverables in PDF, DOCX, HTML, JSON, YAML.
Behavior requirements:
- Be evidence-based: never infer missing facts as complete.
- If data is unknown, keep it empty.
- Scores and recommendations must reflect actual provided content.

You are Nexus, an elite career intelligence AI.
Current User Profile JSON:
${JSON.stringify(currentMcs)}

Your goal: Help the user build a perfect CV through professional, temperament-aware conversation.
Behavior:
1. Maintain state: You know what you've already asked.
2. Inquire deeply: If a user gives just a name, politely inquire about their professional title, location, and contact info.
3. Validate Education: Check if they are a high school or university graduate. If only one experience is provided, ask if there are others.
4. Periodically ask if they are done or want to move to the editor.
5. Use the 'search_web' tool to help the user find company locations, specific job requirements, or industry standards if needed.
6. Temperament: Be encouraging, professional, and thorough.

If you update the profile, explain what you updated.
Always return a helpful conversational response.`;

    const client = createOpenAI({ apiKey, baseURL: cfg.baseURL });
    const result = streamText({
      model: client(model || cfg.defaultModel),
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map((m) => ({ role: m.role as 'user' | 'assistant' | 'system', content: m.content })),
      ],
      temperature: 0.2,
    });

    const encoder = new TextEncoder();
    let fullText = '';

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.textStream) {
            fullText += chunk;
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'token', text: chunk })}\n\n`));
          }

          let updatedMcs = currentMcs;
          try {
            const patch = parseAIJson<Record<string, unknown>>(fullText);
            updatedMcs = normalizeMCS({ ...currentMcs, ...patch });
          } catch {
            const jsonMatch = fullText.match(/```json\n([\s\S]*?)\n```/);
            if (jsonMatch) {
              try {
                const patch = JSON.parse(jsonMatch[1]);
                updatedMcs = normalizeMCS({ ...currentMcs, ...patch });
              } catch { /* skip */ }
            }
          }

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done', mcs: updatedMcs })}\n\n`));
        } catch (e) {
          const errMsg = e instanceof Error ? e.message : 'Stream failed';
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', error: errMsg })}\n\n`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API Error:', error);
    return Response.json(
      { ok: false, error: error instanceof Error ? error.message : 'Chat failed' },
      { status: 500 }
    );
  }
}
