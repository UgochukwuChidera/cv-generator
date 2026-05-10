import { NextRequest, NextResponse } from 'next/server';
import { chatWithAI, type ChatMessage } from '@/lib/ai';
import { normalizeMCS } from '@/lib/mcs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, mcs, provider, model } = body;
    const apiKey = req.headers.get('x-api-key') || '';
    const tavilyKey = req.headers.get('x-tavily-key') || '';

    if (!apiKey) {
      return NextResponse.json({ ok: false, error: 'AI API key required' }, { status: 401 });
    }

    const config = {
      provider: provider || 'openai',
      apiKey,
      model,
      tavilyKey,
    };

    const currentMcs = normalizeMCS(mcs || {});
    const result = await chatWithAI(config, messages as ChatMessage[], currentMcs);

    return NextResponse.json({
      ok: true,
      message: result.message,
      mcs: result.mcs,
    });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Chat failed' },
      { status: 500 }
    );
  }
}
