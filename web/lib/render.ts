import type { MCS } from '@nexus/schema';

export function esc(str: string | undefined): string {
  return (str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function mcsToHtml(mcs: MCS, theme: string = 'Professional') {
  const accent =
    theme === 'Modern' ? '#2d6cdf' :
    theme === 'Creative' ? '#8a3ffc' :
    theme === 'Academic' ? '#3a3a3a' :
    theme === 'Minimal' ? '#111111' : '#ff4d6a';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${esc(mcs.personal?.name || 'Resume')}</title>
  <style>
    body{font-family:Inter,Arial,sans-serif;max-width:860px;margin:32px auto;padding:0 24px;color:#111;line-height:1.55}
    h1{font-size:28px;margin:0 0 4px;color:${accent}}
    h2{font-size:14px;font-weight:500;margin:0 0 14px;color:#444}
    h3{font-size:12px;letter-spacing:.1em;text-transform:uppercase;margin:18px 0 8px;color:${accent}}
    p,li{font-size:13px}
    .row{display:flex;justify-content:space-between;gap:12px}
    .meta{color:#666;font-size:12px}
  </style>
</head>
<body>
  <h1>${esc(mcs.personal?.name)}</h1>
  <h2>${[mcs.personal?.title, mcs.personal?.email, mcs.personal?.phone, mcs.personal?.location].filter(Boolean).map(esc).join(' · ')}</h2>
  ${mcs.summary ? `<p>${esc(mcs.summary)}</p>` : ''}

  ${(mcs.experience ?? []).length ? `<h3>Experience</h3>
  ${(mcs.experience ?? []).map((e) => `<div>
    <div class="row"><strong>${esc(e.role)} — ${esc(e.company)}</strong><span class="meta">${[e.startDate, e.current ? 'Present' : e.endDate].filter(Boolean).map(esc).join(' — ')}</span></div>
    <div class="meta">${esc(e.location)}</div>
    ${(e.bullets ?? []).length ? `<ul>${(e.bullets ?? []).map((b) => `<li>${esc(b)}</li>`).join('')}</ul>` : ''}
  </div>`).join('')}` : ''}

  ${(mcs.education ?? []).length ? `<h3>Education</h3>
  ${(mcs.education ?? []).map((e) => `<p><strong>${esc(e.institution)}</strong> · ${esc([e.degree, e.field].filter(Boolean).join(' in '))}</p>`).join('')}` : ''}

  ${(mcs.skills ?? []).length ? `<h3>Skills</h3><p>${(mcs.skills ?? []).map((s) => esc(s.name)).join(' · ')}</p>` : ''}

  ${(mcs.projects ?? []).length ? `<h3>Projects</h3>
  ${(mcs.projects ?? []).map((p) => `<p><strong>${esc(p.name)}</strong>${p.url ? ` · <a href="${esc(p.url)}">${esc(p.url)}</a>` : ''}${p.description ? ` — ${esc(p.description)}` : ''}</p>`).join('')}` : ''}

  ${(mcs.languages ?? []).length ? `<h3>Languages</h3><p>${(mcs.languages ?? []).map((l) => esc([l.language, l.proficiency].filter(Boolean).join(' '))).join(' · ')}</p>` : ''}
</body>
</html>`;
}
