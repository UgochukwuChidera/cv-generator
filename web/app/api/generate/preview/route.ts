import { NextRequest, NextResponse } from 'next/server';
import { normalizeMCS } from '@/lib/mcs';
import { mcsToHtml } from '@/lib/render';

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get('mcs');
  const theme = req.nextUrl.searchParams.get('theme') || 'Professional';
  if (!raw) return NextResponse.json({ error: 'missing mcs query param' }, { status: 400 });

  try {
    const mcs = normalizeMCS(JSON.parse(raw));
    const html = mcsToHtml(mcs, theme);
    return new NextResponse(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Preview failed' }, { status: 400 });
  }
}
