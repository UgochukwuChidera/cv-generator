import type { MCS } from '@nexus/schema';
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

export async function callAI(
  config: AIConfig,
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  const { provider, apiKey, model } = config;

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
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.2,
      }),
    });

    if (!res.ok) {
      throw new Error(`AI error (${provider}): ${res.status} ${await res.text()}`);
    }

    const data = await res.json();
    return String(data?.choices?.[0]?.message?.content ?? '');
  }

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
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      }),
    });

    if (!res.ok) {
      throw new Error(`AI error (${provider}): ${res.status} ${await res.text()}`);
    }

    const data = await res.json();
    return String(data?.content?.[0]?.text ?? '');
  }

  if (provider === 'gemini') {
    const rawModel = model || 'gemini-1.5-flash';
    const modelName = /^[a-z0-9.-]+$/i.test(rawModel) ? rawModel : 'gemini-1.5-flash';

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemPrompt}\n\n${userMessage}` }] }],
        }),
      }
    );

    if (!res.ok) {
      throw new Error(`AI error (${provider}): ${res.status} ${await res.text()}`);
    }

    const data = await res.json();
    return String(data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '');
  }

  throw new Error(`Unknown provider: ${provider}`);
}

export type GuidedExtractResult = {
  mcs: MCS;
  quality: MCSQuality;
  clarificationQuestions: string[];
};

export async function extractGuidedMCS(config: AIConfig, text: string): Promise<GuidedExtractResult> {
  const systemPrompt = `You are an expert resume parser.
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
- Keep only facts supported by the input text.`;

  const raw = await callAI(config, systemPrompt, `Extract profile from:\n\n${text}`);
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

  const raw = await callAI(config, systemPrompt, `Improve this bullet: ${bullet}`);
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
  const systemPrompt = `You are a career coach.
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
- bulletSuggestions should be practical rewritten achievements.`;

  const raw = await callAI(
    config,
    systemPrompt,
    `Resume:\n${JSON.stringify(mcs)}\n\nJob Description:\n${jd}`
  );

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
  const systemPrompt = `You are an expert resume writer.
Write a concise, role-specific cover letter.
Tone: ${tone}.
Return plain text only.`;

  const raw = await callAI(
    config,
    systemPrompt,
    `Candidate profile:\n${JSON.stringify(mcs)}\n\nJob Description:\n${jd}`
  );

  return raw.replace(/```[a-zA-Z]*\n?|\n?```/g, '').trim();
}
