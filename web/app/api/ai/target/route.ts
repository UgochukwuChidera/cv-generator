import { NextRequest, NextResponse } from 'next/server';
import { targetJD } from '@/lib/ai';
import { normalizeMCS } from '@/lib/mcs';

export async function POST(req: NextRequest) {
  try {
    const { mcs, jd, provider, model } = (await req.json()) as {
      mcs?: unknown;
      jd?: string;
      provider?: 'claude' | 'openai' | 'gemini' | 'openrouter';
      model?: string;
    };

    const apiKey = req.headers.get('x-api-key') || '';
    if (!apiKey) return NextResponse.json({ ok: false, error: 'API key required' }, { status: 401 });
    if (!mcs || !jd?.trim()) {
      return NextResponse.json({ ok: false, error: 'mcs and jd are required' }, { status: 400 });
    }

    const normalized = normalizeMCS(mcs);
    const result = await targetJD({ provider: provider || 'openai', apiKey, model }, normalized, jd);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'JD targeting failed' },
      { status: 500 }
    );
  }
}
