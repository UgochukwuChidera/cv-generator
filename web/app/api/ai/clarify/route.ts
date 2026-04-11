import { NextRequest, NextResponse } from 'next/server';
import type { MCS } from '@nexus/schema';
import { extractGuidedMCS } from '@/lib/ai';
import { mergeClarificationAnswers, normalizeMCS } from '@/lib/mcs';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      mcs?: MCS;
      text?: string;
      answers?: Record<string, string>;
      provider?: 'claude' | 'openai' | 'gemini' | 'openrouter';
      model?: string;
    };

    const apiKey = req.headers.get('x-api-key') || '';
    if (!apiKey) {
      return NextResponse.json({ ok: false, error: 'API key required' }, { status: 401 });
    }

    if (!body.mcs) {
      return NextResponse.json({ ok: false, error: 'mcs is required' }, { status: 400 });
    }

    let next = normalizeMCS(body.mcs);

    if (body.answers && Object.keys(body.answers).length > 0) {
      next = mergeClarificationAnswers(next, body.answers);
    }

    if (body.text?.trim()) {
      const patchResult = await extractGuidedMCS(
        { provider: body.provider || 'openai', apiKey, model: body.model },
        `Existing profile JSON:\n${JSON.stringify(next)}\n\nAdditional clarification:\n${body.text}`
      );
      next = normalizeMCS({ ...next, ...patchResult.mcs });
    }

    const result = await extractGuidedMCS(
      { provider: body.provider || 'openai', apiKey, model: body.model },
      JSON.stringify(next)
    );

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Clarification failed' },
      { status: 500 }
    );
  }
}
