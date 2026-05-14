import { NextRequest, NextResponse } from 'next/server';
import { createOpenAI } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { normalizeMCS } from '@/lib/mcs';
import { VoiceAssistantOutputSchema } from '@/lib/voice';

const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';
const GROQ_TRANSCRIPTION_MODEL = 'whisper-large-v3';
const GROQ_LLM_MODEL = 'llama-3.3-70b-versatile';

async function transcribeAudio(audio: File, apiKey: string): Promise<string> {
  const formData = new FormData();
  formData.set('file', audio);
  formData.set('model', GROQ_TRANSCRIPTION_MODEL);
  formData.set('response_format', 'json');
  formData.set('temperature', '0');

  const response = await fetch(`${GROQ_BASE_URL}/audio/transcriptions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Transcription failed (${response.status}): ${await response.text()}`);
  }

  const data = (await response.json()) as { text?: string };
  return (data.text ?? '').trim();
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = req.headers.get('x-api-key') || '';
    if (!apiKey) {
      return NextResponse.json({ ok: false, error: 'API key required' }, { status: 401 });
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

    const transcript = await transcribeAudio(audio, apiKey);
    if (!transcript) {
      return NextResponse.json({ ok: false, error: 'Empty transcription received.' }, { status: 400 });
    }

    const groq = createOpenAI({
      apiKey,
      baseURL: GROQ_BASE_URL,
    });

    const result = await generateObject({
      model: groq(GROQ_LLM_MODEL),
      schema: VoiceAssistantOutputSchema,
      temperature: 0.2,
      system: `You are Nexus voice assistant for CV editing.
Return structured output only.
Choose a single best action from supported actions:
- updateExperience (for role/company/dates/location/bullets updates)
- addSkill (for adding one skill)
- generateSummary (for creating/updating summary)
- updatePersonal (for profile/contact fields)
- noop (when no CV update should happen)

Always provide a concise and friendly assistantResponse.`,
      prompt: `Current CV JSON:
${JSON.stringify(currentMcs)}

User voice transcript:
${transcript}`,
    });

    return NextResponse.json({
      ok: true,
      transcript,
      action: result.object.action,
      assistantResponse: result.object.assistantResponse,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Voice request failed' },
      { status: 500 }
    );
  }
}
