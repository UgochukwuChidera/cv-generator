import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { text, provider, model } = await req.json();
  const apiKey = req.headers.get('x-api-key') || '';
  
  if (!apiKey) return NextResponse.json({ error: 'API key required' }, { status: 401 });

  try {
    const { extractMCS } = await import('@/lib/ai');
    const result = await extractMCS({ provider, apiKey, model }, text);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
