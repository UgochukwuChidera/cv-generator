import { NextRequest, NextResponse } from 'next/server';
import type { MCS } from '@nexus/schema';

function esc(str: string | undefined): string {
  return (str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get('mcs');
  if (!raw) return NextResponse.json({ error: 'missing mcs query param' }, { status: 400 });

  try {
    const mcs = JSON.parse(raw) as MCS;
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${esc(mcs.personal?.name || 'Resume')}</title>
  <style>
    body{font-family:'JetBrains Mono','Consolas',monospace;max-width:760px;margin:48px auto;padding:0 24px;color:#111}
    h1{font-size:24px;margin:0 0 4px}
    h2{font-size:12px;margin:0 0 8px;color:#444;font-weight:400}
    h3{font-size:11px;text-transform:uppercase;margin:18px 0 8px}
    p,li{font-size:11px;line-height:1.6}
  </style>
</head>
<body>
  <h1>${esc(mcs.personal?.name)}</h1>
  <h2>${esc(mcs.personal?.title)} · ${esc(mcs.personal?.email)} · ${esc(mcs.personal?.location)}</h2>
  ${mcs.summary ? `<p>${esc(mcs.summary)}</p>` : ''}
  <h3>Experience</h3>
  ${(mcs.experience ?? [])
    .map(
      (e) => `<p><strong>${esc(e.role)}</strong> — ${esc(e.company)}</p><ul>${(e.bullets ?? []).map((b) => `<li>${esc(b)}</li>`).join('')}</ul>`
    )
    .join('')}
  <h3>Skills</h3>
  <p>${(mcs.skills ?? []).map((s) => esc(s.name)).join(' · ')}</p>
</body>
</html>`;
    return new NextResponse(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 400 });
  }
}
