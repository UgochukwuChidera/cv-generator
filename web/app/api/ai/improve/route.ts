import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { bullet, provider, model } = await req.json();
  const apiKey = req.headers.get('x-api-key') || '';

  if (!apiKey) return NextResponse.json({ error: 'API key required' }, { status: 401 });

  try {
    const { improveBullet } = await import('@/lib/ai');
    const variants = await improveBullet({ provider, apiKey, model }, bullet);
    return NextResponse.json({ variants });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
