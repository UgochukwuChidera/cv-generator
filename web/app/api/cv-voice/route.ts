import { NextRequest, NextResponse } from 'next/server';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { normalizeMCS } from '@/lib/mcs';
import { VoiceAssistantOutputSchema } from '@/lib/voice';

const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';
const OPENAI_BASE_URL = 'https://api.openai.com/v1';
const GROQ_TRANSCRIPTION_MODEL = 'whisper-large-v3';
const GROQ_LLM_MODEL = 'llama-3.3-70b-versatile';
const OPENAI_TRANSCRIPTION_MODEL = 'whisper-1';
const OPENAI_LLM_MODEL = 'gpt-4o-mini';

async function transcribeGroq(audio: File, apiKey: string): Promise<string> {
  const formData = new FormData();
  formData.set('file', audio);
  formData.set('model', GROQ_TRANSCRIPTION_MODEL);
  formData.set('response_format', 'json');
  formData.set('temperature', '0');

  const response = await fetch(`${GROQ_BASE_URL}/audio/transcriptions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Transcription failed (${response.status}): ${await response.text()}`);
  }
  const data = (await response.json()) as { text?: string };
  return (data.text ?? '').trim();
}

async function transcribeOpenAI(audio: File, apiKey: string): Promise<string> {
  const formData = new FormData();
  formData.set('file', audio);
  formData.set('model', OPENAI_TRANSCRIPTION_MODEL);
  formData.set('response_format', 'json');

  const response = await fetch(`${OPENAI_BASE_URL}/audio/transcriptions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Transcription failed (${response.status}): ${await response.text()}`);
  }
  const data = (await response.json()) as { text?: string };
  return (data.text ?? '').trim();
}

const SCHEMA_JSON = `{
  "action": {
    "type": "updateExperience | addSkill | generateSummary | updatePersonal | noop",
    "index": 0,
    "experience": { "company": "", "role": "", "startDate": "", "endDate": "", "current": false, "location": "", "bullets": [""] },
    "skill": { "name": "", "category": "" },
    "summary": "",
    "personal": { "name": "", "title": "", "location": "", "email": "", "phone": "", "website": "", "linkedin": "", "github": "", "twitter": "" },
    "reason": ""
  },
  "assistantResponse": "friendly reply to the user"
}`;

export async function POST(req: NextRequest) {
  try {
    const apiKey = req.headers.get('x-api-key') || '';
    if (!apiKey) {
      return NextResponse.json({ ok: false, error: 'API key required' }, { status: 401 });
    }

    const provider = req.headers.get('x-provider') || 'groq';
    if (provider !== 'groq' && provider !== 'openai') {
      return NextResponse.json({ ok: false, error: 'Voice only supports groq or openai provider.' }, { status: 400 });
    }

    const body = await req.formData();
    const audio = body.get('audio');
    if (!(audio instanceof File)) {
      return NextResponse.json({ ok: false, error: 'Audio file is required.' }, { status: 400 });
    }

    const mcsRaw = body.get('mcs');
    let currentMcs = normalizeMCS({});
    if (typeof mcsRaw === 'string' && mcsRaw.trim().length > 0) {
      try {
        currentMcs = normalizeMCS(JSON.parse(mcsRaw));
      } catch {
        return NextResponse.json({ ok: false, error: 'Invalid mcs payload.' }, { status: 400 });
      }
    }

    const transcript =
      provider === 'openai' ? await transcribeOpenAI(audio, apiKey) : await transcribeGroq(audio, apiKey);
    if (!transcript) {
      return NextResponse.json({ ok: false, error: 'Empty transcription received.' }, { status: 400 });
    }

    const baseURL = provider === 'openai' ? OPENAI_BASE_URL : GROQ_BASE_URL;
    const model = provider === 'openai' ? OPENAI_LLM_MODEL : GROQ_LLM_MODEL;
    const client = createOpenAI({ apiKey, baseURL });

    const { text } = await generateText({
      model: client(model),
      temperature: 0.2,
      system: `You are Nexus voice assistant for CV editing.
Return ONLY valid JSON matching this schema — no markdown, no code fences, no extra text:
${SCHEMA_JSON}

Rules:
- Choose one action type that best matches the user's intent.
- For updateExperience: include index (default 0), and any fields in experience to update.
- For addSkill: set skill.name and optionally skill.category.
- For generateSummary: set summary to the new summary text.
- For updatePersonal: include only the personal fields that changed.
- For noop: optionally set reason.
- assistantResponse must be a concise, friendly reply to the user.`,
      prompt: `Current CV JSON:
${JSON.stringify(currentMcs)}

User voice transcript:
${transcript}`,
    });

    const raw = text.trim();
    const parsed = JSON.parse(raw);
    const validated = VoiceAssistantOutputSchema.parse(parsed);

    return NextResponse.json({
      ok: true,
      transcript,
      action: validated.action,
      assistantResponse: validated.assistantResponse,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Voice request failed' },
      { status: 500 }
    );
  }
}
