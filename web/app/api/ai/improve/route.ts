import { NextRequest, NextResponse } from 'next/server';
import { improveBullet } from '@/lib/ai';

export async function POST(req: NextRequest) {
  try {
    const { bullet, provider, model } = (await req.json()) as {
      bullet?: string;
      provider?: 'claude' | 'openai' | 'gemini' | 'openrouter';
      model?: string;
    };

    const apiKey = req.headers.get('x-api-key') || '';
    if (!apiKey) return NextResponse.json({ ok: false, error: 'API key required' }, { status: 401 });
    if (!bullet?.trim()) return NextResponse.json({ ok: false, error: 'bullet is required' }, { status: 400 });

    const variants = await improveBullet({ provider: provider || 'openai', apiKey, model }, bullet);
    return NextResponse.json({ ok: true, variants });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Bullet improvement failed' },
      { status: 500 }
    );
  }
}
