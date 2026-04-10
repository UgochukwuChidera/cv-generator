'use client';
import { useState } from 'react';
import { useNexusStore } from '@/lib/store';
import Link from 'next/link';

type Format = 'pdf' | 'docx' | 'html' | 'json' | 'yaml';
type Status = 'idle' | 'loading' | 'done' | 'error';

const FORMATS: { id: Format; icon: string; label: string; ext: string; desc: string; mime: string }[] = [
  { id: 'pdf',  icon: '⬡', label: 'PDF',  ext: '.pdf',  desc: 'Print-ready, pixel-perfect',    mime: 'application/pdf' },
  { id: 'docx', icon: '◈', label: 'DOCX', ext: '.docx', desc: 'Editable in Microsoft Word',     mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
  { id: 'html', icon: '◇', label: 'HTML', ext: '.html', desc: 'Portfolio page, self-contained', mime: 'text/html' },
  { id: 'json', icon: '{ }',label: 'JSON', ext: '.json', desc: 'Full schema — developer export', mime: 'application/json' },
  { id: 'yaml', icon: '≡',  label: 'YAML', ext: '.yaml', desc: 'Human-readable data export',    mime: 'text/yaml' },
];

function buildHtml(mcs: any): string {
  const p = mcs.personal ?? {};
  const esc = (s: string | undefined) => (s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>${esc(p.name)} — Resume</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Plus+Jakarta+Sans:wght@400;500&display=swap" rel="stylesheet">
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Plus Jakarta Sans',sans-serif;background:#fafaf8;color:#111;max-width:820px;margin:48px auto;padding:0 32px;font-size:14px;line-height:1.6}h1{font-family:'Playfair Display',Georgia;font-size:32px;font-weight:700;margin-bottom:4px}h2{font-family:'Plus Jakarta Sans',sans-serif;font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#E8B84B;border-bottom:1px solid #f0e8d0;padding-bottom:6px;margin:24px 0 12px}.contact{display:flex;flex-wrap:wrap;gap:4px 16px;font-size:12px;color:#666;margin-top:8px}.job{margin-bottom:16px}.job-header{display:flex;justify-content:space-between;align-items:baseline}.company{font-size:12px;color:#888;margin-bottom:4px}ul{padding-left:18px}li{font-size:13px;margin-bottom:3px;color:#333}.skill{display:inline-block;background:#fef3c7;border:1px solid #fde68a;border-radius:4px;padding:2px 8px;font-size:11px;margin:3px;color:#92400e}</style>
</head><body>
<header style="border-bottom:2px solid #E8B84B;padding-bottom:16px;margin-bottom:20px">
<h1>${esc(p.name)}</h1>${p.title ? `<p style="color:#555;font-size:15px">${esc(p.title)}</p>` : ''}
<div class="contact">${[p.email && `✉ ${esc(p.email)}`, p.phone && `📞 ${esc(p.phone)}`, p.location && `📍 ${esc(p.location)}`, p.linkedin && `LinkedIn: ${esc(p.linkedin)}`, p.github && `GitHub: ${esc(p.github)}`].filter(Boolean).map(s => `<span>${s}</span>`).join('')}</div>
</header>
${mcs.summary ? `<h2>Profile</h2><p style="color:#333;line-height:1.7">${esc(mcs.summary)}</p>` : ''}
${(mcs.experience?.length ?? 0) > 0 ? `<h2>Experience</h2>${mcs.experience.map((e: any) => `<div class="job"><div class="job-header"><strong>${esc(e.role)}</strong><span style="font-size:11px;color:#888">${esc(e.startDate)}${e.current ? ' – Present' : e.endDate ? ` – ${esc(e.endDate)}` : ''}</span></div><p class="company">${esc(e.company)}${e.location ? ` · ${esc(e.location)}` : ''}</p>${e.bullets?.length ? `<ul>${e.bullets.map((b: string) => `<li>${esc(b)}</li>`).join('')}</ul>` : ''}</div>`).join('')}` : ''}
${(mcs.education?.length ?? 0) > 0 ? `<h2>Education</h2>${mcs.education.map((e: any) => `<div class="job"><div class="job-header"><strong>${esc(e.institution)}</strong><span style="font-size:11px;color:#888">${esc(e.startDate)}${e.endDate ? ` – ${esc(e.endDate)}` : ''}</span></div><p class="company">${esc(e.degree)}${e.field ? ` in ${esc(e.field)}` : ''}${e.gpa ? ` · GPA ${esc(e.gpa)}` : ''}</p></div>`).join('')}` : ''}
${(mcs.skills?.length ?? 0) > 0 ? `<h2>Skills</h2><div>${mcs.skills.map((s: any) => `<span class="skill">${esc(s.name)}</span>`).join('')}</div>` : ''}
</body></html>`;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}

export default function ExportPage() {
  const { mcs } = useNexusStore();
  const [statuses, setStatuses] = useState<Record<Format, Status>>({ pdf: 'idle', docx: 'idle', html: 'idle', json: 'idle', yaml: 'idle' });

  function setStatus(fmt: Format, s: Status) {
    setStatuses(prev => ({ ...prev, [fmt]: s }));
  }

  async function handleExport(fmt: Format) {
    if (!mcs) return;
    setStatus(fmt, 'loading');
    const slug = (mcs.personal?.name ?? 'resume').toLowerCase().replace(/\s+/g, '-');

    try {
      if (fmt === 'json') {
        const blob = new Blob([JSON.stringify(mcs, null, 2)], { type: 'application/json' });
        downloadBlob(blob, `${slug}.json`);
        setStatus(fmt, 'done');
        setTimeout(() => setStatus(fmt, 'idle'), 2000);
        return;
      }
      if (fmt === 'yaml') {
        const yaml = await import('js-yaml');
        const blob = new Blob([yaml.dump(mcs)], { type: 'text/yaml' });
        downloadBlob(blob, `${slug}.yaml`);
        setStatus(fmt, 'done');
        setTimeout(() => setStatus(fmt, 'idle'), 2000);
        return;
      }
      if (fmt === 'html') {
        const blob = new Blob([buildHtml(mcs)], { type: 'text/html' });
        downloadBlob(blob, `${slug}.html`);
        setStatus(fmt, 'done');
        setTimeout(() => setStatus(fmt, 'idle'), 2000);
        return;
      }
      if (fmt === 'pdf') {
        // Trigger print dialog on the preview
        const preview = window.open('/api/generate/preview?' + new URLSearchParams({ mcs: JSON.stringify(mcs) }), '_blank');
        if (!preview) alert('Allow pop-ups to generate PDF, then use File → Print → Save as PDF.');
        setStatus(fmt, 'done');
        setTimeout(() => setStatus(fmt, 'idle'), 2000);
        return;
      }
      if (fmt === 'docx') {
        const res = await fetch('/api/generate/docx', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mcs }),
        });
        if (!res.ok) throw new Error('DOCX generation failed — add the server-side route.');
        const blob = await res.blob();
        downloadBlob(blob, `${slug}.docx`);
        setStatus(fmt, 'done');
        setTimeout(() => setStatus(fmt, 'idle'), 2000);
        return;
      }
    } catch (e) {
      console.error(e);
      setStatus(fmt, 'error');
      setTimeout(() => setStatus(fmt, 'idle'), 3000);
    }
  }

  const statusIcon = (s: Status) => ({
    idle: null, loading: '⌛', done: '✓', error: '✕',
  }[s]);

  const statusColor = (s: Status) => ({
    idle: 'var(--text-2)', loading: 'var(--gold)', done: 'var(--green)', error: 'var(--red)',
  }[s]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Topbar */}
      <div className="topbar">
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{ width: 28, height: 28, background: 'var(--gold)', borderRadius: 'var(--r)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: 'var(--text-inv)' }}>⬡</div>
          <span className="display" style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>Nexus</span>
        </Link>
        <span style={{ color: 'var(--text-3)', fontSize: 13 }}>/ Export</span>
        <div style={{ flex: 1 }} />
        <Link href="/editor" className="btn btn-ghost" style={{ textDecoration: 'none', fontSize: 13 }}>← Editor</Link>
      </div>

      {/* Content */}
      <div style={{ flex: 1, maxWidth: 680, width: '100%', margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ marginBottom: 40 }}>
          <h1 className="display" style={{ fontSize: 28, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>Export</h1>
          <p style={{ color: 'var(--text-2)', fontSize: 14 }}>
            Download your profile as any format. Documents are generated from your current editor state.
          </p>
          {!mcs && (
            <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(224,82,82,0.08)', border: '1px solid rgba(224,82,82,0.2)', borderRadius: 'var(--r)', fontSize: 13, color: 'var(--red)' }}>
              No data loaded — <Link href="/" style={{ color: 'var(--red)', fontWeight: 500 }}>build your profile first</Link>.
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {FORMATS.map(f => {
            const s = statuses[f.id];
            return (
              <button key={f.id} className="format-card" onClick={() => handleExport(f.id)}
                disabled={!mcs || s === 'loading'}
                style={{ textAlign: 'left', cursor: !mcs || s === 'loading' ? 'not-allowed' : 'pointer', opacity: !mcs ? 0.45 : 1, borderColor: s === 'done' ? 'var(--green)' : s === 'error' ? 'var(--red)' : s === 'loading' ? 'var(--gold)' : 'var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ width: 40, height: 40, background: 'var(--surface-2)', borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: 'var(--text-2)' }}>{f.icon}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {s === 'loading' && <span className="spinner spinner-sm" />}
                    {(s === 'done' || s === 'error') && (
                      <span style={{ fontSize: 14, color: statusColor(s) }}>{statusIcon(s)}</span>
                    )}
                    <span style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>{f.ext}</span>
                  </div>
                </div>
                <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 3 }}>{f.label}</p>
                <p style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.4 }}>{f.desc}</p>
                <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: statusColor(s) }}>
                    {s === 'idle' ? 'Click to download' : s === 'loading' ? 'Generating…' : s === 'done' ? 'Downloaded!' : 'Error — retry'}
                  </span>
                  {s === 'idle' && <span style={{ fontSize: 14, color: 'var(--text-3)' }}>↓</span>}
                </div>
              </button>
            );
          })}
        </div>

        {/* Cover letter card */}
        <div style={{ marginTop: 24 }}>
          <Link href="/jd-targeting" style={{ textDecoration: 'none', display: 'block' }}>
            <div className="card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', transition: 'border-color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--gold)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
              <div style={{ width: 44, height: 44, background: 'var(--gold-dim)', borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>⚡</div>
              <div>
                <p style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>Generate cover letter</p>
                <p style={{ fontSize: 12, color: 'var(--text-3)' }}>Paste a job description → AI tailors and writes a cover letter → export as PDF, DOCX, or HTML</p>
              </div>
              <span style={{ marginLeft: 'auto', color: 'var(--text-3)', fontSize: 16, flexShrink: 0 }}>→</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
