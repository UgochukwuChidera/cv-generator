import { NextRequest, NextResponse } from 'next/server';
import { generateCoverLetter } from '@/lib/ai';
import { normalizeMCS } from '@/lib/mcs';

type Tone = 'formal' | 'conversational' | 'technical' | 'storytelling';

export async function POST(req: NextRequest) {
  try {
    const { mcs, jd, tone, provider, model } = (await req.json()) as {
      mcs?: unknown;
      jd?: string;
      tone?: Tone;
      provider?: 'claude' | 'openai' | 'gemini' | 'openrouter';
      model?: string;
    };

    const apiKey = req.headers.get('x-api-key') || '';
    if (!apiKey) return NextResponse.json({ ok: false, error: 'API key required' }, { status: 401 });
    if (!mcs || !jd?.trim()) {
      return NextResponse.json({ ok: false, error: 'mcs and jd are required' }, { status: 400 });
    }

    const normalized = normalizeMCS(mcs);
    const coverLetter = await generateCoverLetter(
      { provider: provider || 'openai', apiKey, model },
      normalized,
      jd,
      tone || 'formal'
    );

    return NextResponse.json({ ok: true, coverLetter });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Cover generation failed' },
      { status: 500 }
    );
  }
}
