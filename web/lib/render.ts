import type { MCS } from '@nexus/schema';

export function esc(str: string | undefined | null): string {
  return (str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function bullets(list: string[] | undefined): string {
  if (!list || list.length === 0) return '';
  return `<ul>${list.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>`;
}

/* ─────────────────────────────────────────────
   PROFESSIONAL
   Burgundy top bar · serif name · ruled sections
───────────────────────────────────────────── */
function renderProfessional(mcs: MCS, maxExp: number, maxProj: number, accent: string, fontFamily: string): string {
  const p = mcs.personal;

  const section = (label: string, content: string) =>
    content.trim()
      ? `<section>
          <h3>${esc(label)}</h3>
          ${content}
        </section>`
      : '';

  const experienceHtml = mcs.experience
    .slice(0, maxExp)
    .map(
      (e) => `
      <div class="entry">
        <div class="entry-head">
          <span class="role">${esc(e.role)}</span>
          <span class="date">${[e.startDate, e.current ? 'Present' : e.endDate].filter(Boolean).map(esc).join(' – ')}</span>
        </div>
        <div class="company">${esc(e.company)}${e.location ? `, ${esc(e.location)}` : ''}</div>
        ${bullets(e.bullets)}
      </div>`
    )
    .join('');

  const educationHtml = mcs.education
    .map(
      (e) => `
      <div class="entry">
        <div class="entry-head">
          <span class="role">${esc(e.institution)}</span>
          <span class="date">${[e.startDate, e.endDate].filter(Boolean).map(esc).join(' – ')}</span>
        </div>
        <div class="company">${[e.degree, e.field ? `in ${e.field}` : ''].filter(Boolean).map(esc).join(' ')}</div>
      </div>`
    )
    .join('');

  const projectsHtml = (mcs.projects ?? [])
    .slice(0, maxProj)
    .map(
      (proj) => `
      <div class="entry">
        <span class="role">${esc(proj.name)}</span>
        ${proj.description ? `<span class="company"> — ${esc(proj.description)}</span>` : ''}
      </div>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${esc(p.name || 'Resume')}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:${fontFamily};background:#f4f4f4;color:#1a1a1a;line-height:1.55}
  .page{max-width:780px;margin:32px auto;background:#fff;box-shadow:0 4px 24px rgba(0,0,0,.12)}
  .top-bar{height:6px;background:${accent}}
  .inner{padding:28px 32px}
  .header{border-bottom:2px solid ${accent};padding-bottom:14px;margin-bottom:16px}
  .name{font-size:30px;font-weight:700;letter-spacing:-.5px;color:#111}
  .contact{font-size:12px;color:#555;margin-top:4px;font-family:Arial,sans-serif}
  .links{font-size:11px;color:${accent};margin-top:2px;font-family:Arial,sans-serif}
  section{margin-bottom:14px}
  h3{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:${accent};border-bottom:1px solid ${accent}44;padding-bottom:3px;margin-bottom:8px;font-family:Arial,sans-serif}
  .entry{margin-bottom:10px}
  .entry-head{display:flex;justify-content:space-between;align-items:baseline}
  .role{font-size:13px;font-weight:700}
  .date{font-size:11px;color:#666;font-family:Arial,sans-serif;white-space:nowrap;margin-left:8px}
  .company{font-size:12px;color:#555;font-style:italic;margin-bottom:3px;font-family:Arial,sans-serif}
  ul{margin:4px 0 0 18px;font-size:12px}
  li{margin-bottom:2px;color:#333}
  .skills{font-size:12.5px;color:#333;line-height:1.8}
</style>
</head>
<body>
<div class="page">
  <div class="top-bar"></div>
  <div class="inner">
    <header class="header">
      <div class="name">${esc(p.name || 'Your Name')}</div>
      <div class="contact">${[p.title, p.email, p.phone, p.location].filter(Boolean).map(esc).join('  ·  ')}</div>
      ${p.linkedin || p.github ? `<div class="links">${[p.linkedin, p.github].filter(Boolean).map(esc).join('  ·  ')}</div>` : ''}
    </header>
    ${section('Professional Summary', mcs.summary ? `<p style="font-size:12.5px;line-height:1.65;color:#333">${esc(mcs.summary)}</p>` : '')}
    ${section('Experience', experienceHtml)}
    ${section('Education', educationHtml)}
    ${section('Skills', mcs.skills.length ? `<div class="skills">${mcs.skills.map((s) => esc(s.name)).join('  ·  ')}</div>` : '')}
    ${section('Projects', projectsHtml)}
  </div>
</div>
</body></html>`;
}

/* ─────────────────────────────────────────────
   MODERN
   Dark sidebar · avatar initials · blue accents
───────────────────────────────────────────── */
function renderModern(mcs: MCS, maxExp: number, maxProj: number, accent: string, fontFamily: string): string {
  const p = mcs.personal;
  const sidebar = '#0f172a';
  const initials = (p.name ?? '')
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0] || '')
    .join('')
    .toUpperCase() || 'YN';

  const sideSection = (label: string, content: string) =>
    content.trim()
      ? `<div class="ss"><div class="ss-label">${esc(label)}</div>${content}</div>`
      : '';

  const mainSection = (label: string, content: string) =>
    content.trim()
      ? `<div class="ms"><div class="ms-label">${esc(label)}</div>${content}</div>`
      : '';

  const expHtml = mcs.experience
    .slice(0, maxExp)
    .map(
      (e) => `
      <div class="entry">
        <div class="entry-head">
          <span class="role">${esc(e.role)}</span>
          <span class="date">${[e.startDate, e.current ? 'Present' : e.endDate].filter(Boolean).map(esc).join(' – ')}</span>
        </div>
        <div class="co">${esc(e.company)}${e.location ? ` · ${esc(e.location)}` : ''}</div>
        ${bullets(e.bullets)}
      </div>`
    )
    .join('');

  const eduHtml = mcs.education
    .map(
      (e) => `
      <div class="entry">
        <div class="role">${esc(e.institution)}</div>
        <div class="co">${[e.degree, e.field ? `in ${e.field}` : ''].filter(Boolean).map(esc).join(' ')}${e.endDate ? ` · ${esc(e.endDate)}` : ''}</div>
      </div>`
    )
    .join('');

  const projHtml = (mcs.projects ?? [])
    .slice(0, maxProj)
    .map(
      (proj) => `
      <div class="entry">
        <span class="role">${esc(proj.name)}</span>
        ${proj.description ? `<span class="co"> — ${esc(proj.description)}</span>` : ''}
        ${(proj.tech ?? []).length ? `<div class="tech">${(proj.tech ?? []).map((t) => `<span class="pill">${esc(t)}</span>`).join('')}</div>` : ''}
      </div>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${esc(p.name || 'Resume')}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:${fontFamily};background:#e2e8f0;color:#1e293b;line-height:1.55}
  .page{max-width:820px;margin:32px auto;display:flex;background:#fff;box-shadow:0 4px 24px rgba(0,0,0,.15);min-height:600px}
  .sidebar{width:200px;background:${sidebar};padding:24px 16px;flex-shrink:0}
  .avatar{width:60px;height:60px;border-radius:50%;background:${accent};display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700;color:#fff;margin:0 auto 18px;letter-spacing:-1px}
  .ss{margin-bottom:16px}
  .ss-label{font-size:8.5px;font-weight:700;text-transform:uppercase;letter-spacing:.14em;color:#475569;margin-bottom:6px}
  .si{font-size:10px;color:#94a3b8;margin-bottom:5px;word-break:break-all;line-height:1.4;border-bottom:1px solid rgba(255,255,255,.06);padding-bottom:4px}
  .main{flex:1;padding:24px 20px}
  .mhead{margin-bottom:16px}
  .name{font-size:24px;font-weight:700;letter-spacing:-.5px;color:#0f172a}
  .title{font-size:11px;color:${accent};font-weight:700;text-transform:uppercase;letter-spacing:.09em;margin-top:3px}
  .summary{font-size:11.5px;color:#475569;line-height:1.7;border-left:3px solid ${accent};padding-left:10px;margin-bottom:14px}
  .ms{margin-bottom:14px}
  .ms-label{font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:.14em;color:${accent};margin-bottom:7px}
  .entry{margin-bottom:10px}
  .entry-head{display:flex;justify-content:space-between;align-items:baseline}
  .role{font-size:12.5px;font-weight:700;color:#0f172a}
  .date{font-size:10px;color:#94a3b8;white-space:nowrap;margin-left:8px}
  .co{font-size:10.5px;color:${accent};margin-bottom:3px}
  ul{margin:3px 0 0 14px;font-size:10.5px}
  li{margin-bottom:2px;color:#334155}
  .tech{margin-top:4px}
  .pill{display:inline-block;border:1px solid ${accent}44;border-radius:999px;padding:1px 8px;font-size:10px;color:${accent};margin-right:4px;margin-bottom:3px}
</style>
</head>
<body>
<div class="page">
  <aside class="sidebar">
    <div class="avatar">${esc(initials)}</div>
    ${sideSection('Contact', [p.email, p.phone, p.location, p.linkedin, p.github].filter(Boolean).map((item) => `<div class="si">${esc(item as string)}</div>`).join(''))}
    ${mcs.skills.length ? sideSection('Skills', mcs.skills.slice(0, 12).map((s) => `<div class="si">${esc(s.name)}</div>`).join('')) : ''}
    ${(mcs.languages ?? []).length ? sideSection('Languages', (mcs.languages ?? []).map((l) => `<div class="si">${esc(l.language)}${l.proficiency ? ` <span style="color:#475569">${esc(l.proficiency)}</span>` : ''}</div>`).join('')) : ''}
  </aside>
  <main class="main">
    <div class="mhead">
      <div class="name">${esc(p.name || 'Your Name')}</div>
      ${p.title ? `<div class="title">${esc(p.title)}</div>` : ''}
    </div>
    ${mcs.summary ? `<p class="summary">${esc(mcs.summary)}</p>` : ''}
    ${mainSection('Experience', expHtml)}
    ${mainSection('Education', eduHtml)}
    ${(mcs.projects ?? []).length ? mainSection('Projects', projHtml) : ''}
  </main>
</div>
</body></html>`;
}

/* ─────────────────────────────────────────────
   ACADEMIC
   Serif throughout · centered header · heavy rules
───────────────────────────────────────────── */
function renderAcademic(mcs: MCS, maxExp: number, maxProj: number, accent: string, fontFamily: string): string {
  const p = mcs.personal;

  const section = (label: string, content: string) =>
    content.trim()
      ? `<section><h3>${esc(label)}</h3>${content}</section>`
      : '';

  const expHtml = mcs.experience
    .slice(0, maxExp)
    .map(
      (e) => `
      <div class="entry">
        <div class="entry-head">
          <span class="co">${esc(e.company)}</span>
          <span class="date">${[e.startDate, e.current ? 'Present' : e.endDate].filter(Boolean).map(esc).join(' – ')}</span>
        </div>
        <div class="role">${esc(e.role)}${e.location ? `, ${esc(e.location)}` : ''}</div>
        ${bullets(e.bullets)}
      </div>`
    )
    .join('');

  const eduHtml = mcs.education
    .map(
      (e) => `
      <div class="entry">
        <div class="entry-head">
          <span class="co">${esc(e.institution)}</span>
          <span class="date">${[e.startDate, e.endDate].filter(Boolean).map(esc).join(' – ')}</span>
        </div>
        <div class="role">${[e.degree, e.field ? `in ${e.field}` : ''].filter(Boolean).map(esc).join(' ')}${e.gpa ? ` — GPA: ${esc(e.gpa)}` : ''}</div>
        ${e.honors ? `<div class="honors">${esc(e.honors)}</div>` : ''}
      </div>`
    )
    .join('');

  const projHtml = (mcs.projects ?? [])
    .slice(0, maxProj)
    .map(
      (proj) => `
      <div class="entry">
        <span class="co">${esc(proj.name)}</span>
        ${proj.url ? ` <span class="date"> — ${esc(proj.url)}</span>` : ''}
        ${proj.description ? `<div class="role">${esc(proj.description)}</div>` : ''}
      </div>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${esc(p.name || 'CV')}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:${fontFamily};background:#f9f8f3;color:#111;line-height:1.6}
  .page{max-width:780px;margin:32px auto;background:#fffef9;padding:36px 40px;box-shadow:0 2px 16px rgba(0,0,0,.1);border:1px solid #e8e6dc}
  header{text-align:center;border-bottom:2px solid ${accent};padding-bottom:14px;margin-bottom:18px}
  .name{font-size:28px;font-weight:700;letter-spacing:.03em;color:${accent}}
  .title{font-size:13px;color:#444;margin-top:3px;font-style:italic}
  .contact{font-size:12px;color:#555;margin-top:5px}
  .links{font-size:11px;color:#777;margin-top:3px}
  section{margin-bottom:16px}
  h3{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:${accent};border-bottom:1.5px solid ${accent};padding-bottom:3px;margin-bottom:9px}
  .entry{margin-bottom:10px}
  .entry-head{display:flex;justify-content:space-between;align-items:baseline}
  .co{font-size:13px;font-weight:700}
  .role{font-size:12.5px;font-style:italic;color:#333;margin-bottom:3px}
  .date{font-size:11.5px;color:#555;white-space:nowrap;margin-left:8px}
  .honors{font-size:11.5px;color:#555}
  ul{margin:4px 0 0 18px;font-size:12px}
  li{margin-bottom:2px}
  .skills{font-size:12.5px;line-height:1.8;color:#333}
</style>
</head>
<body>
<div class="page">
  <header>
    <div class="name">${esc(p.name || 'Your Name')}</div>
    ${p.title ? `<div class="title">${esc(p.title)}</div>` : ''}
    <div class="contact">${[p.email, p.phone, p.location].filter(Boolean).map(esc).join('  ·  ')}</div>
    ${[p.website, p.linkedin, p.github].filter(Boolean).length ? `<div class="links">${[p.website, p.linkedin, p.github].filter(Boolean).map(esc).join('  ·  ')}</div>` : ''}
  </header>
  ${mcs.summary ? section('Research Interests / Summary', `<p style="font-size:12.5px">${esc(mcs.summary)}</p>`) : ''}
  ${mcs.education.length ? section('Education', eduHtml) : ''}
  ${mcs.experience.length ? section('Professional Experience', expHtml) : ''}
  ${mcs.skills.length ? section('Skills &amp; Expertise', `<div class="skills">${mcs.skills.map((s) => esc(s.name)).join(' · ')}</div>`) : ''}
  ${(mcs.projects ?? []).length ? section('Selected Projects / Publications', projHtml) : ''}
  ${(mcs.languages ?? []).length ? section('Languages', `<div class="skills">${(mcs.languages ?? []).map((l) => [l.language, l.proficiency].filter(Boolean).map(esc).join(' ')).join('  ·  ')}</div>`) : ''}
</div>
</body></html>`;
}

/* ─────────────────────────────────────────────
   MINIMAL
   Pure whitespace · date-left grid · no borders
───────────────────────────────────────────── */
function renderMinimal(mcs: MCS, maxExp: number, maxProj: number, accent: string, fontFamily: string): string {
  const p = mcs.personal;

  const section = (label: string, content: string) =>
    content.trim()
      ? `<section><div class="sl">${esc(label)}</div>${content}</section>`
      : '';

  const expHtml = mcs.experience
    .slice(0, maxExp)
    .map(
      (e) => `
      <div class="row">
        <div class="dcol">
          ${e.startDate ? `<span>${esc(e.startDate)}</span>` : ''}
          <span>${e.current ? 'Present' : esc(e.endDate)}</span>
        </div>
        <div class="mcol">
          <div class="role">${esc(e.role)}</div>
          <div class="sub">${esc(e.company)}${e.location ? ` — ${esc(e.location)}` : ''}</div>
          ${bullets(e.bullets)}
        </div>
      </div>`
    )
    .join('');

  const eduHtml = mcs.education
    .map(
      (e) => `
      <div class="row">
        <div class="dcol"><span>${esc(e.endDate || e.startDate)}</span></div>
        <div class="mcol">
          <div class="role">${esc(e.institution)}</div>
          <div class="sub">${[e.degree, e.field ? `in ${e.field}` : ''].filter(Boolean).map(esc).join(' ')}</div>
        </div>
      </div>`
    )
    .join('');

  const projHtml = (mcs.projects ?? [])
    .slice(0, maxProj)
    .map(
      (proj) => `
      <div class="row">
        <div class="dcol"></div>
        <div class="mcol">
          <span class="role">${esc(proj.name)}</span>
          ${proj.description ? `<span class="sub"> — ${esc(proj.description)}</span>` : ''}
        </div>
      </div>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${esc(p.name || 'Resume')}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:${fontFamily};background:#f7f7f5;color:#111;line-height:1.6}
  .page{max-width:740px;margin:32px auto;background:#fff;padding:36px 40px}
  .header{margin-bottom:22px}
  .name{font-size:28px;font-weight:300;letter-spacing:-.3px;color:#000}
  .meta{display:flex;flex-wrap:wrap;gap:4px 18px;margin-top:6px}
  .meta span{font-size:11px;color:#888}
  .meta span:first-child{color:${accent};font-weight:500}
  section{border-top:1px solid ${accent}33;padding-top:14px;margin-bottom:14px}
  .sl{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.18em;color:${accent};margin-bottom:10px}
  .row{display:grid;grid-template-columns:96px 1fr;gap:0 16px;margin-bottom:10px}
  .dcol{font-size:10px;color:#aaa;padding-top:2px;line-height:1.5;display:flex;flex-direction:column}
  .role{font-size:12.5px;font-weight:600;color:#000}
  .sub{font-size:11px;color:#666;margin-bottom:3px}
  ul{margin:0;padding:0 0 0 14px;font-size:11px;color:#444}
  li{margin-bottom:2px}
  .skills{display:flex;flex-wrap:wrap;gap:6px 0}
  .skills span{font-size:12px;color:#333;margin-right:16px}
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="name">${esc(p.name || 'Your Name')}</div>
    <div class="meta">
      ${[p.title, p.email, p.phone, p.location].filter(Boolean).map((item, i) => `<span style="${i===0 ? 'color:#111;font-weight:500' : ''}">${esc(item as string)}</span>`).join('')}
    </div>
  </div>
  ${mcs.summary ? section('Summary', `<p style="font-size:11px;color:#555;line-height:1.75;padding-left:112px">${esc(mcs.summary)}</p>`) : ''}
  ${mcs.experience.length ? section('Experience', expHtml) : ''}
  ${mcs.education.length ? section('Education', eduHtml) : ''}
  ${mcs.skills.length ? section('Skills', `<div class="skills" style="padding-left:112px">${mcs.skills.map((s) => `<span>${esc(s.name)}</span>`).join('')}</div>`) : ''}
  ${(mcs.projects ?? []).length ? section('Projects', projHtml) : ''}
</div>
</body></html>`;
}

/* ─────────────────────────────────────────────
   CREATIVE
   Violet hero · bold left bar · alternating skill chips
───────────────────────────────────────────── */
function renderCreative(mcs: MCS, maxExp: number, maxProj: number, accent: string, fontFamily: string): string {
  const p = mcs.personal;
  const light = `${accent}22`;

  const section = (label: string, content: string) =>
    content.trim()
      ? `<section><h3><span class="rule"></span>${esc(label)}</h3>${content}</section>`
      : '';

  const expHtml = mcs.experience
    .slice(0, maxExp)
    .map(
      (e, i) => `
      <div class="entry${i < mcs.experience.slice(0,maxExp).length - 1 ? ' sep' : ''}">
        <div class="entry-head">
          <div>
            <span class="role">${esc(e.role)}</span>
            <span class="badge">${esc(e.company)}</span>
          </div>
          <span class="date">${[e.startDate, e.current ? 'Now' : e.endDate].filter(Boolean).map(esc).join(' → ')}</span>
        </div>
        ${bullets(e.bullets)}
      </div>`
    )
    .join('');

  const skillChips = mcs.skills
    .map(
      (s, i) =>
        `<span class="chip${i % 3 === 0 ? ' chip-acc' : i % 3 === 1 ? ' chip-light' : ''}">${esc(s.name)}</span>`
    )
    .join('');

  const projHtml = (mcs.projects ?? [])
    .slice(0, maxProj)
    .map(
      (proj) => `
      <div class="proj">
        <div class="role">${esc(proj.name)}</div>
        ${proj.description ? `<div class="pDesc">${esc(proj.description)}</div>` : ''}
        ${(proj.tech ?? []).length ? `<div class="tech">${(proj.tech ?? []).map((t) => `<span class="pill">${esc(t)}</span>`).join('')}</div>` : ''}
      </div>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${esc(p.name || 'Resume')}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:${fontFamily};background:#f5f5f5;color:#111;line-height:1.55}
  .page{max-width:780px;margin:32px auto;background:#fff;box-shadow:0 4px 24px rgba(0,0,0,.12);border-left:7px solid ${accent}}
  .hero{background:${light};padding:24px 24px 20px}
  .name{font-size:30px;font-weight:800;letter-spacing:-1px;color:#111;line-height:1.1}
  .title-badge{display:inline-block;background:${accent};color:#fff;font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;padding:3px 12px;border-radius:999px;margin-top:8px}
  .contacts{font-size:10.5px;color:${accent};margin-top:10px;display:flex;flex-wrap:wrap;gap:4px 14px}
  .inner{padding:18px 24px}
  .summary{font-size:11px;color:#333;line-height:1.75;background:${light};padding:9px 13px;border-radius:6px;border-left:3px solid ${accent};margin-bottom:16px}
  section{margin-bottom:16px}
  h3{font-size:9.5px;font-weight:800;text-transform:uppercase;letter-spacing:.14em;color:${accent};display:flex;align-items:center;gap:8px;margin-bottom:9px}
  .rule{display:inline-block;width:18px;height:2px;background:${accent};border-radius:1px;flex-shrink:0}
  .entry{margin-bottom:12px}
  .sep{padding-bottom:11px;border-bottom:1px dashed ${accent}44}
  .entry-head{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:4px}
  .role{font-size:12.5px;font-weight:700;color:#111}
  .badge{display:inline-block;background:${light};color:${accent};border-radius:999px;padding:1px 9px;font-size:9.5px;font-weight:600;margin-left:8px}
  .date{font-size:9.5px;color:${accent};opacity:.7;white-space:nowrap;margin-left:8px}
  ul{margin:0 0 0 14px;font-size:10.5px;color:#374151}
  li{margin-bottom:2px}
  .two{display:grid;grid-template-columns:1fr 1fr;gap:16px}
  .chip{display:inline-block;border-radius:4px;padding:2px 8px;font-size:9.5px;font-weight:600;margin-right:5px;margin-bottom:5px;background:#f5f5f5;color:${accent}}
  .chip-acc{background:${accent};color:#fff}
  .chip-light{background:${light};color:${accent}}
  .proj{padding:8px 11px;background:${light};border-radius:6px;border-left:3px solid ${accent};margin-bottom:8px}
  .pDesc{font-size:10.5px;color:${accent};margin-top:1px}
  .tech{margin-top:4px}
  .pill{display:inline-block;border:1px solid ${accent}44;border-radius:999px;padding:1px 8px;font-size:10px;color:${accent};margin-right:4px;margin-bottom:2px}
  .edu-entry{margin-bottom:7px}
  .edu-inst{font-size:12px;font-weight:700;color:#111}
  .edu-deg{font-size:10.5px;color:${accent}}
</style>
</head>
<body>
<div class="page">
  <div class="hero">
    <div class="name">${esc(p.name || 'Your Name')}</div>
    ${p.title ? `<div class="title-badge">${esc(p.title)}</div>` : ''}
    <div class="contacts">
      ${[p.email, p.phone, p.location, p.linkedin, p.github].filter(Boolean).map((item) => `<span>${esc(item as string)}</span>`).join('')}
    </div>
  </div>
  <div class="inner">
    ${mcs.summary ? `<p class="summary">${esc(mcs.summary)}</p>` : ''}
    ${section('Experience', expHtml)}
    <div class="two">
      ${mcs.education.length ? section('Education', mcs.education.map((e) => `<div class="edu-entry"><div class="edu-inst">${esc(e.institution)}</div><div class="edu-deg">${[e.degree, e.field].filter(Boolean).map(esc).join(' in ')}${e.endDate ? ` · ${esc(e.endDate)}` : ''}</div></div>`).join('')) : ''}
      ${mcs.skills.length ? section('Skills', `<div>${skillChips}</div>`) : ''}
    </div>
    ${(mcs.projects ?? []).length ? section('Projects', projHtml) : ''}
  </div>
</div>
</body></html>`;
}

/* ─────────────────────────────────────────────
   Main export
───────────────────────────────────────────── */
export function mcsToHtml(
  mcs: MCS,
  theme: string = 'Professional',
  documentType: 'resume' | 'cv' = 'resume',
  accent?: string,
  fontFamily?: string,
): string {
  const maxExp = documentType === 'cv' ? 8 : 4;
  const maxProj = documentType === 'cv' ? 5 : 2;

  const resolvedAccent = accent ?? (
    theme === 'Modern' ? '#2563eb'
    : theme === 'Academic' ? '#3a3a3a'
    : theme === 'Minimal' ? '#111111'
    : theme === 'Creative' ? '#7c3aed'
    : '#b91c1c'
  );
  const resolvedFont = fontFamily ?? (
    theme === 'Academic' ? `'Palatino Linotype','Book Antiqua',Palatino,serif`
    : theme === 'Professional' ? `Georgia,'Times New Roman',serif`
    : `'Helvetica Neue',Arial,sans-serif`
  );

  switch (theme) {
    case 'Modern':   return renderModern(mcs, maxExp, maxProj, resolvedAccent, resolvedFont);
    case 'Academic': return renderAcademic(mcs, maxExp, maxProj, resolvedAccent, resolvedFont);
    case 'Minimal':  return renderMinimal(mcs, maxExp, maxProj, resolvedAccent, resolvedFont);
    case 'Creative': return renderCreative(mcs, maxExp, maxProj, resolvedAccent, resolvedFont);
    default:         return renderProfessional(mcs, maxExp, maxProj, resolvedAccent, resolvedFont);
  }
}