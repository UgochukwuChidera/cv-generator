import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { mcs, jd, provider, model } = await req.json();
  const apiKey = req.headers.get('x-api-key') || '';

  if (!apiKey) return NextResponse.json({ error: 'API key required' }, { status: 401 });

  try {
    const { targetJD } = await import('@/lib/ai');
    const result = await targetJD({ provider, apiKey, model }, mcs, jd);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
