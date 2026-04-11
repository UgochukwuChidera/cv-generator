export type AIProvider = 'claude' | 'openai' | 'gemini' | 'openrouter';

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  model?: string;
}

export async function callAI(
  config: AIConfig,
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  const { provider, apiKey, model } = config;

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
        temperature: 0.7,
      }),
    });
    if (!res.ok) throw new Error(`AI error: ${res.status} ${await res.text()}`);
    const data = await res.json();
    return data.choices[0].message.content;
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
    if (!res.ok) throw new Error(`AI error: ${res.status} ${await res.text()}`);
    const data = await res.json();
    return data.content[0].text;
  }

  if (provider === 'gemini') {
    const rawModel = model || 'gemini-1.5-flash';
    // Validate model name to prevent URL injection (only allow alphanumeric, hyphens, and dots)
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
    if (!res.ok) throw new Error(`AI error: ${res.status} ${await res.text()}`);
    const data = await res.json();
    return data.candidates[0].content.parts[0].text;
  }

  throw new Error(`Unknown provider: ${provider}`);
}

export async function extractMCS(config: AIConfig, text: string) {
  const systemPrompt = `You are a resume parser. Extract career information from the provided text and return a JSON object matching this structure. Return ONLY valid JSON, no markdown.

The JSON structure:
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
}`;
  const raw = await callAI(config, systemPrompt, `Extract career info from:\n\n${text}`);
  return JSON.parse(raw.replace(/```json\n?|\n?```/g, '').trim());
}

export async function improveBullet(config: AIConfig, bullet: string): Promise<string[]> {
  const systemPrompt = `You are a resume expert. Given a resume bullet point, return 3 improved versions as a JSON array of strings. Use strong action verbs and quantify where possible. Return ONLY a JSON array, no markdown.`;
  const raw = await callAI(config, systemPrompt, `Improve this bullet: "${bullet}"`);
  return JSON.parse(raw.replace(/```json\n?|\n?```/g, '').trim());
}

export async function targetJD(
  config: AIConfig,
  mcs: object,
  jd: string
): Promise<{ score: number; tailored: object; coverLetter: string }> {
  const systemPrompt = `You are a career coach. Given a resume and job description, return a JSON object with:
- score: number 0-100 fit score
- tailored: modified resume object with reordered/improved bullets for the JD  
- coverLetter: a professional cover letter string
Return ONLY valid JSON.`;
  const raw = await callAI(
    config,
    systemPrompt,
    `Resume: ${JSON.stringify(mcs)}\n\nJob Description: ${jd}`
  );
  return JSON.parse(raw.replace(/```json\n?|\n?```/g, '').trim());
}

export async function generateCoverLetter(
  config: AIConfig,
  mcs: object,
  jd: string,
  tone: 'formal' | 'conversational' | 'technical' | 'storytelling' = 'formal'
): Promise<string> {
  const systemPrompt = `You are an expert resume writer.
Write a concise cover letter tailored to the job description and candidate profile.
Tone: ${tone}.
Return plain text only. No markdown, no JSON, no code fences.`;
  const raw = await callAI(
    config,
    systemPrompt,
    `Candidate profile: ${JSON.stringify(mcs)}\n\nJob Description: ${jd}`
  );
  return raw.replace(/```[a-zA-Z]*\n?|\n?```/g, '').trim();
}
