import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromUpload, type UploadedPayload } from '@/lib/upload';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { file?: UploadedPayload };
    if (!body.file) {
      return NextResponse.json({ ok: false, error: 'file is required' }, { status: 400 });
    }

    const text = extractTextFromUpload(body.file);
    return NextResponse.json({ ok: true, text });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Text extraction failed' },
      { status: 500 }
    );
  }
}
