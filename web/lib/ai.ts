import type { MCS } from '@nexus/schema';
import { TOOL_DEFINITIONS, TOOLS } from './tools';
import {
  assessMCSQuality,
  buildClarificationQuestions,
  normalizeMCS,
  type MCSQuality,
} from './mcs';

export type AIProvider = 'claude' | 'openai' | 'gemini' | 'openrouter';

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  model?: string;
  tavilyKey?: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  tool_calls?: any[];
  tool_call_id?: string;
}

const APP_CAPABILITIES_CONTEXT = `App capabilities:
- Extract profile data from pasted text or uploaded TXT/PDF/DOCX/JSON/YAML.
- Ask clarification questions for missing required profile fields.
- Edit profile sections (personal, summary, experience, education, skills, projects, languages).
- Run JD targeting analysis with fit score and sub-scores.
- Generate tailored bullet suggestions and cover letters.
- Export deliverables in PDF, DOCX, HTML, JSON, YAML.
Behavior requirements:
- Be evidence-based: never infer missing facts as complete.
- If data is unknown, keep it empty.
- Scores and recommendations must reflect actual provided content.`;

export async function callAI(
  config: AIConfig,
  messages: ChatMessage[]
): Promise<ChatMessage> {
  const { provider, apiKey, model, tavilyKey } = config;

  if (!apiKey) throw new Error('API key is required');

  if (provider === 'openai' || provider === 'openrouter') {
    const baseURL =
      provider === 'openrouter'
        ? 'https://openrouter.ai/api/v1'
        : 'https://api.openai.com/v1';

    const res = await fetch(`${baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model || (provider === 'openai' ? 'gpt-4o-mini' : 'openai/gpt-4o-mini'),
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
          tool_calls: m.tool_calls,
          tool_call_id: m.tool_call_id
        })),
        tools: provider === 'openai' ? TOOL_DEFINITIONS.map(d => ({ type: 'function', function: d })) : undefined,
        temperature: 0.2,
      }),
    });

    if (!res.ok) {
      throw new Error(`AI error (${provider}): ${res.status} ${await res.text()}`);
    }

    const data = await res.json();
    const msg = data?.choices?.[0]?.message;
    
    if (msg?.tool_calls && provider === 'openai') {
      const toolResults: ChatMessage[] = [];
      for (const tc of msg.tool_calls) {
        const tool = TOOLS.find(t => t.name === tc.function.name);
        if (tool) {
          try {
            const args = JSON.parse(tc.function.arguments);
            const result = await tool.execute(args, { tavilyKey });
            toolResults.push({
              role: 'tool',
              tool_call_id: tc.id,
              content: JSON.stringify(result)
            });
          } catch (e) {
            toolResults.push({
              role: 'tool',
              tool_call_id: tc.id,
              content: JSON.stringify({ error: String(e) })
            });
          }
        }
      }
      return callAI(config, [...messages, msg, ...toolResults]);
    }

    return { role: 'assistant', content: String(msg?.content ?? '') };
  }

  if (provider === 'claude' || provider === 'gemini') {
     const system = messages.find(m => m.role === 'system')?.content || '';
     
     if (provider === 'claude') {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: model || 'claude-3-haiku-20240307',
            max_tokens: 4096,
            system,
            messages: messages.filter(m => m.role !== 'system').map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content })),
          }),
        });
        if (!res.ok) throw new Error(`AI error (claude): ${res.status} ${await res.text()}`);
        const data = await res.json();
        return { role: 'assistant', content: String(data?.content?.[0]?.text ?? '') };
     } else {
        const rawModel = model || 'gemini-1.5-flash';
        const modelName = /^[a-z0-9.-]+$/i.test(rawModel) ? rawModel : 'gemini-1.5-flash';
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: messages.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
            }),
          }
        );
        if (!res.ok) throw new Error(`AI error (gemini): ${res.status} ${await res.text()}`);
        const data = await res.json();
        return { role: 'assistant', content: String(data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '') };
     }
  }

  throw new Error(`Unknown provider: ${provider}`);
}

export async function chatWithAI(
  config: AIConfig,
  messages: ChatMessage[],
  mcs: MCS
): Promise<{ message: string; mcs: MCS }> {
  const systemPrompt = `${APP_CAPABILITIES_CONTEXT}
You are Nexus, an elite career intelligence AI.
Current User Profile JSON:
${JSON.stringify(mcs)}

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

  const fullMessages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...messages
  ];

  const response = await callAI(config, fullMessages);
  
  let updatedMcs = mcs;
  const jsonMatch = response.content.match(/```json\n([\s\S]*?)\n```/);
  if (jsonMatch) {
    try {
      const patch = JSON.parse(jsonMatch[1]);
      updatedMcs = normalizeMCS({ ...mcs, ...patch });
    } catch (e) {
      console.warn('Failed to parse MCS patch from AI response', e);
    }
  }

  return {
    message: response.content,
    mcs: updatedMcs
  };
}

function parseAIJson<T>(raw: string): T {
  const stripped = raw
    .replace(/```json\n?/gi, '')
    .replace(/```\n?/g, '')
    .trim();

  try {
    return JSON.parse(stripped) as T;
  } catch {
    const start = stripped.indexOf('{');
    const end = stripped.lastIndexOf('}');
    if (start >= 0 && end > start) {
      return JSON.parse(stripped.slice(start, end + 1)) as T;
    }
    throw new Error('Invalid JSON response from AI provider');
  }
}

export type GuidedExtractResult = {
  mcs: MCS;
  quality: MCSQuality;
  clarificationQuestions: string[];
};

export async function extractGuidedMCS(config: AIConfig, text: string): Promise<GuidedExtractResult> {
  const systemPrompt = `${APP_CAPABILITIES_CONTEXT}
You are an expert resume parser.
Return STRICT JSON only with this structure:
{
  "personal": { "name": "", "title": "", "location": "", "email": "", "phone": "", "website": "", "linkedin": "", "github": "", "twitter": "" },
  "summary": "",
  "experience": [{ "company": "", "role": "", "startDate": "", "endDate": "", "current": false, "location": "", "bullets": [] }],
  "education": [{ "institution": "", "degree": "", "field": "", "startDate": "", "endDate": "", "gpa": "", "honors": "" }],
  "skills": [{ "name": "", "category": "" }],
  "projects": [{ "name": "", "description": "", "url": "", "tech": [], "bullets": [] }],
  "languages": [{ "language": "", "proficiency": "" }],
  "meta": { "version": 1, "updated_at": "${new Date().toISOString()}" },
  "history": []
}
Rules:
- Never return null; use empty strings/arrays when unknown.
- Keep only facts supported by the input text.
- Do not invent languages, projects, education, or achievements.`;

  const rawMsg = await callAI(config, [{ role: 'system', content: systemPrompt }, { role: 'user', content: `Extract profile from:\n\n${text}` }]);
  const raw = rawMsg.content;
  const draft = parseAIJson<unknown>(raw);
  const mcs = normalizeMCS(draft);
  const quality = assessMCSQuality(mcs);

  return {
    mcs,
    quality,
    clarificationQuestions: buildClarificationQuestions(quality),
  };
}

export async function improveBullet(config: AIConfig, bullet: string): Promise<string[]> {
  const systemPrompt = `You are a resume expert.
Return STRICT JSON object: { "variants": ["", "", ""] }.
Use quantified impact and concise professional language.`;

  const rawMsg = await callAI(config, [{ role: 'system', content: systemPrompt }, { role: 'user', content: `Improve this bullet: ${bullet}` }]);
  const raw = rawMsg.content;
  const parsed = parseAIJson<{ variants?: string[] }>(raw);
  return (parsed.variants ?? []).map((x) => x.trim()).filter(Boolean).slice(0, 3);
}

export type JDTargetResult = {
  score: number;
  subScores: {
    skills: number;
    experience: number;
    domain: number;
  };
  tailored: MCS;
  coverLetter: string;
  missingSkills: string[];
  implicitSkills: string[];
  bulletSuggestions: string[];
};

export async function targetJD(config: AIConfig, mcs: MCS, jd: string): Promise<JDTargetResult> {
  const systemPrompt = `${APP_CAPABILITIES_CONTEXT}
You are a career coach.
Return STRICT JSON with this exact structure:
{
  "score": 0,
  "subScores": { "skills": 0, "experience": 0, "domain": 0 },
  "tailored": {},
  "coverLetter": "",
  "missingSkills": [],
  "implicitSkills": [],
  "bulletSuggestions": []
}
Rules:
- score and subScores are 0-100 integers.
- tailored must keep same resume shape and avoid nulls.
- bulletSuggestions should be practical rewritten achievements.
- Never inflate scores when source data is missing.
- Missing or empty sections must reduce relevant scores.`;

  const rawMsg = await callAI(
    config,
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Resume:\n${JSON.stringify(mcs)}\n\nJob Description:\n${jd}` }
    ]
  );
  const raw = rawMsg.content;

  const parsed = parseAIJson<{
    score?: number;
    subScores?: { skills?: number; experience?: number; domain?: number };
    tailored?: unknown;
    coverLetter?: string;
    missingSkills?: string[];
    implicitSkills?: string[];
    bulletSuggestions?: string[];
  }>(raw);

  return {
    score: Math.max(0, Math.min(100, Math.round(parsed.score ?? 0))),
    subScores: {
      skills: Math.max(0, Math.min(100, Math.round(parsed.subScores?.skills ?? 0))),
      experience: Math.max(0, Math.min(100, Math.round(parsed.subScores?.experience ?? 0))),
      domain: Math.max(0, Math.min(100, Math.round(parsed.subScores?.domain ?? 0))),
    },
    tailored: normalizeMCS(parsed.tailored ?? mcs),
    coverLetter: String(parsed.coverLetter ?? '').trim(),
    missingSkills: Array.isArray(parsed.missingSkills)
      ? parsed.missingSkills.map((x) => String(x).trim()).filter(Boolean)
      : [],
    implicitSkills: Array.isArray(parsed.implicitSkills)
      ? parsed.implicitSkills.map((x) => String(x).trim()).filter(Boolean)
      : [],
    bulletSuggestions: Array.isArray(parsed.bulletSuggestions)
      ? parsed.bulletSuggestions.map((x) => String(x).trim()).filter(Boolean)
      : [],
  };
}

export async function generateCoverLetter(
  config: AIConfig,
  mcs: MCS,
  jd: string,
  tone: 'formal' | 'conversational' | 'technical' | 'storytelling' = 'formal'
): Promise<string> {
  const systemPrompt = `${APP_CAPABILITIES_CONTEXT}
You are an expert resume writer.
Write a concise, role-specific cover letter.
Tone: ${tone}.
Return plain text only.`;

  const rawMsg = await callAI(
    config,
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Candidate profile:\n${JSON.stringify(mcs)}\n\nJob Description:\n${jd}` }
    ]
  );

  return rawMsg.content.replace(/```[a-zA-Z]*\n?|\n?```/g, '').trim();
}
