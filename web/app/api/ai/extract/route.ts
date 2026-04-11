import { NextRequest, NextResponse } from 'next/server';
import { extractGuidedMCS } from '@/lib/ai';
import { extractTextFromUpload, type UploadedPayload } from '@/lib/upload';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      text?: string;
      provider?: 'claude' | 'openai' | 'gemini' | 'openrouter';
      model?: string;
      file?: UploadedPayload;
    };

    const apiKey = req.headers.get('x-api-key') || '';
    if (!apiKey) {
      return NextResponse.json({ ok: false, error: 'API key required' }, { status: 401 });
    }

    const textFromFile = body.file ? extractTextFromUpload(body.file) : '';
    const source = [body.text ?? '', textFromFile].filter(Boolean).join('\n\n').trim();

    if (!source) {
      return NextResponse.json({ ok: false, error: 'Provide text or upload a supported file.' }, { status: 400 });
    }

    const result = await extractGuidedMCS(
      {
        provider: body.provider || 'openai',
        apiKey,
        model: body.model,
      },
      source
    );

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Extraction failed' },
      { status: 500 }
    );
  }
}
