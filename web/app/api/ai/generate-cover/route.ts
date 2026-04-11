import { NextRequest, NextResponse } from 'next/server';

type Tone = 'formal' | 'conversational' | 'technical' | 'storytelling';

export async function POST(req: NextRequest) {
  const { mcs, jd, tone, provider, model } = await req.json();
  const apiKey = req.headers.get('x-api-key') || '';

  if (!apiKey) return NextResponse.json({ error: 'API key required' }, { status: 401 });

  try {
    const { generateCoverLetter } = await import('@/lib/ai');
    const coverLetter = await generateCoverLetter(
      { provider, apiKey, model },
      mcs,
      jd,
      tone as Tone
    );
    return NextResponse.json({ coverLetter });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
