import type { MCS } from '@nexus/schema';

export function esc(str: string | undefined): string {
  return (str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function mcsToHtml(mcs: MCS, theme: string = 'Professional', documentType: 'resume' | 'cv' = 'resume') {
  const accent =
    theme === 'Modern' ? '#2d6cdf' :
    theme === 'Creative' ? '#8a3ffc' :
    theme === 'Academic' ? '#3a3a3a' :
    theme === 'Minimal' ? '#111111' : '#ff4d6a';
  const maxExperience = documentType === 'cv' ? 8 : 4;
  const maxProjects = documentType === 'cv' ? 5 : 2;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${esc(mcs.personal?.name || 'Resume')}</title>
  <style>
    body{font-family:Inter,Arial,sans-serif;max-width:900px;margin:24px auto;padding:0 24px;color:#111;line-height:1.55;background:#f8f9fd}
    main{background:#fff;padding:26px;border-radius:${theme === 'Minimal' ? '4px' : '14px'};border:1px solid rgba(0,0,0,.07);box-shadow:${theme === 'Academic' || theme === 'Minimal' ? 'none' : '0 16px 42px rgba(0,0,0,.09)'};border-top:${theme === 'Professional' ? `6px solid ${accent}` : '1px solid rgba(0,0,0,.07)'};border-left:${theme === 'Creative' ? `8px solid ${accent}` : '1px solid rgba(0,0,0,.07)'}}
    h1{font-size:31px;margin:0 0 4px;color:${accent}}
    h2{font-size:14px;font-weight:500;margin:0 0 14px;color:#444}
    h3{font-size:12px;letter-spacing:.1em;text-transform:uppercase;margin:18px 0 8px;color:${theme === 'Academic' ? '#222' : accent};border-bottom:${theme === 'Academic' ? '1px solid #cfcfcf' : 'none'};padding-bottom:3px}
    p,li{font-size:13px}
    .row{display:flex;justify-content:space-between;gap:12px}
    .meta{color:#666;font-size:12px}
    .skills{display:flex;flex-wrap:wrap;gap:6px}
    .skills span{border:1px solid #d4d6dd;border-radius:999px;padding:2px 8px;font-size:12px;background:${theme === 'Creative' ? 'rgba(138,63,252,.08)' : '#fff'}}
  </style>
</head>
<body>
  <main>
  <h1>${esc(mcs.personal?.name)}</h1>
  <h2>${[mcs.personal?.title, mcs.personal?.email, mcs.personal?.phone, mcs.personal?.location].filter(Boolean).map(esc).join(' · ')}</h2>
  ${mcs.summary ? `<p>${esc(mcs.summary)}</p>` : ''}

  ${(mcs.experience ?? []).length ? `<h3>Experience</h3>
  ${(mcs.experience ?? []).slice(0, maxExperience).map((e) => `<div>
    <div class="row"><strong>${esc(e.role)} — ${esc(e.company)}</strong><span class="meta">${[e.startDate, e.current ? 'Present' : e.endDate].filter(Boolean).map(esc).join(' — ')}</span></div>
    <div class="meta">${esc(e.location)}</div>
    ${(e.bullets ?? []).length ? `<ul>${(e.bullets ?? []).map((b) => `<li>${esc(b)}</li>`).join('')}</ul>` : ''}
  </div>`).join('')}` : ''}

  ${(mcs.education ?? []).length ? `<h3>Education</h3>
  ${(mcs.education ?? []).map((e) => `<p><strong>${esc(e.institution)}</strong> · ${esc([e.degree, e.field].filter(Boolean).join(' in '))}</p>`).join('')}` : ''}

  ${(mcs.skills ?? []).length ? `<h3>Skills</h3><div class="skills">${(mcs.skills ?? []).map((s) => `<span>${esc(s.name)}</span>`).join('')}</div>` : ''}

  ${(mcs.projects ?? []).length ? `<h3>Projects</h3>
  ${(mcs.projects ?? []).slice(0, maxProjects).map((p) => `<p><strong>${esc(p.name)}</strong>${p.url ? ` · <a href="${esc(p.url)}">${esc(p.url)}</a>` : ''}${p.description ? ` — ${esc(p.description)}` : ''}</p>`).join('')}` : ''}

  ${(mcs.languages ?? []).length ? `<h3>Languages</h3><p>${(mcs.languages ?? []).map((l) => esc([l.language, l.proficiency].filter(Boolean).join(' '))).join(' · ')}</p>` : ''}
  </main>
</body>
</html>`;
}
