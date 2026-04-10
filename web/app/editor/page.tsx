'use client';
import { useState } from 'react';
import { useNexusStore } from '@/lib/store';
import Link from 'next/link';
import type { MCS } from '@nexus/schema';

type Tab = 'personal' | 'experience' | 'education' | 'skills' | 'raw';

/* ── Shared field ──────────────────────────────────────────── */
function Field({ label, value, onChange, placeholder, mono, multiline }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; mono?: boolean; multiline?: boolean;
}) {
  const style: React.CSSProperties = {
    width: '100%', background: 'var(--bg)', border: '1px solid var(--border)',
    borderRadius: 'var(--r)', padding: '7px 10px', fontSize: 13,
    color: 'var(--text)', fontFamily: mono ? 'var(--font-mono)' : 'var(--font-body)',
    outline: 'none', resize: 'none', lineHeight: 1.55,
    transition: 'border-color 0.13s',
  };
  const handlers = {
    onFocus: (e: React.FocusEvent<any>) => (e.target.style.borderColor = 'var(--gold)'),
    onBlur:  (e: React.FocusEvent<any>) => (e.target.style.borderColor = 'var(--border)'),
  };
  return (
    <label style={{ display: 'block' }}>
      <span style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-3)', marginBottom: 4, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{label}</span>
      {multiline
        ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} style={{ ...style, height: 'auto' }} {...handlers} />
        : <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ ...style, height: 34 }} {...handlers} />
      }
    </label>
  );
}

function Grid2({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>{children}</div>;
}

/* ── Personal tab ──────────────────────────────────────────── */
function PersonalTab() {
  const { mcs, updateMCS } = useNexusStore();
  const p = mcs?.personal ?? {} as any;
  const set = (k: string, v: string) => updateMCS({ personal: { ...p, [k]: v } });
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Field label="Full name"          value={p.name      ?? ''} onChange={v => set('name', v)}      placeholder="Jane Doe" />
      <Field label="Professional title" value={p.title     ?? ''} onChange={v => set('title', v)}     placeholder="Senior Product Designer" />
      <Field label="Summary"            value={mcs?.summary ?? ''} onChange={v => updateMCS({ summary: v })} placeholder="Brief professional summary…" multiline />
      <div className="glow-line" style={{ margin: '4px 0' }} />
      <Grid2>
        <Field label="Email"    value={p.email    ?? ''} onChange={v => set('email', v)}    placeholder="jane@example.com" />
        <Field label="Phone"    value={p.phone    ?? ''} onChange={v => set('phone', v)}    placeholder="+1 555 000 0000" />
        <Field label="Location" value={p.location ?? ''} onChange={v => set('location', v)} placeholder="San Francisco, CA" />
        <Field label="Website"  value={p.website  ?? ''} onChange={v => set('website', v)}  placeholder="https://janedoe.dev" />
        <Field label="LinkedIn" value={p.linkedin ?? ''} onChange={v => set('linkedin', v)} placeholder="jane-doe" />
        <Field label="GitHub"   value={p.github   ?? ''} onChange={v => set('github', v)}   placeholder="janedoe" />
      </Grid2>
    </div>
  );
}

/* ── Experience tab ────────────────────────────────────────── */
function ExperienceTab() {
  const { mcs, updateMCS } = useNexusStore();
  const [open, setOpen] = useState<number | null>(0);
  const [improving, setImproving] = useState<string | null>(null);
  const [variants, setVariants] = useState<Record<string, string[]>>({});
  const { aiProvider, aiKey, aiModel } = useNexusStore();

  const exps = mcs?.experience ?? [];

  function updateExp(i: number, patch: any) {
    const next = exps.map((e, idx) => idx === i ? { ...e, ...patch } : e);
    updateMCS({ experience: next });
  }

  function addExp() {
    updateMCS({ experience: [...exps, { company: '', role: '', startDate: '', endDate: '', current: false, bullets: [''] }] });
    setOpen(exps.length);
  }

  function removeExp(i: number) {
    updateMCS({ experience: exps.filter((_, idx) => idx !== i) });
    if (open === i) setOpen(null);
  }

  async function improveBullet(expIdx: number, bIdx: number, bullet: string) {
    if (!aiKey) return;
    const key = `${expIdx}-${bIdx}`;
    setImproving(key);
    try {
      const res = await fetch('/api/ai/improve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': aiKey },
        body: JSON.stringify({ bullet, provider: aiProvider, model: aiModel }),
      });
      const { variants: v } = await res.json();
      setVariants(prev => ({ ...prev, [key]: v }));
    } finally { setImproving(null); }
  }

  function acceptVariant(expIdx: number, bIdx: number, text: string) {
    const key = `${expIdx}-${bIdx}`;
    const bullets = [...(exps[expIdx].bullets ?? [])];
    bullets[bIdx] = text;
    updateExp(expIdx, { bullets });
    setVariants(prev => { const n = { ...prev }; delete n[key]; return n; });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {exps.length === 0 && (
        <p style={{ color: 'var(--text-3)', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>No experience entries. Add one below.</p>
      )}
      {exps.map((exp, i) => (
        <div key={i} className={`entry-card ${open === i ? 'open' : ''}`}>
          <div className="entry-header" onClick={() => setOpen(open === i ? null : i)}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: open === i ? 'var(--gold)' : 'var(--text-3)', flexShrink: 0, marginTop: 1 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', truncate: true, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {exp.role || 'New role'}{exp.company ? ` · ${exp.company}` : ''}
              </p>
              <p style={{ fontSize: 11, color: 'var(--text-3)' }}>
                {exp.startDate || '—'}{exp.current ? ' → Present' : exp.endDate ? ` → ${exp.endDate}` : ''}
              </p>
            </div>
            <button onClick={e => { e.stopPropagation(); removeExp(i); }}
              style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 16, padding: '0 4px', lineHeight: 1 }}>×</button>
            <span style={{ color: 'var(--text-3)', fontSize: 12 }}>{open === i ? '▲' : '▼'}</span>
          </div>
          {open === i && (
            <div className="entry-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Grid2>
                  <Field label="Company"  value={exp.company   ?? ''} onChange={v => updateExp(i, { company: v })}   placeholder="Acme Corp" />
                  <Field label="Role"     value={exp.role      ?? ''} onChange={v => updateExp(i, { role: v })}      placeholder="Senior Engineer" />
                  <Field label="Start"    value={exp.startDate ?? ''} onChange={v => updateExp(i, { startDate: v })} placeholder="Jan 2022" />
                  <Field label="End"      value={exp.endDate   ?? ''} onChange={v => updateExp(i, { endDate: v })}   placeholder="Present" />
                </Grid2>
                <Field label="Location" value={exp.location ?? ''} onChange={v => updateExp(i, { location: v })} placeholder="Remote / London" />

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Bullets</span>
                  </div>
                  {(exp.bullets ?? []).map((b, bi) => {
                    const key = `${i}-${bi}`;
                    const vars = variants[key];
                    return (
                      <div key={bi} style={{ marginBottom: 8 }}>
                        <div className="bullet-row">
                          <div className="bullet-dot" />
                          <textarea
                            value={b}
                            onChange={e => { const bullets = [...(exp.bullets ?? [])]; bullets[bi] = e.target.value; updateExp(i, { bullets }); }}
                            rows={2}
                            style={{ flex: 1, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '6px 10px', fontSize: 12.5, color: 'var(--text)', fontFamily: 'var(--font-body)', outline: 'none', resize: 'none', lineHeight: 1.5, transition: 'border-color 0.12s' }}
                            onFocus={e => (e.target.style.borderColor = 'var(--gold)')}
                            onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                          />
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <button
                              onClick={() => improveBullet(i, bi, b)} disabled={!b.trim() || improving === key}
                              title="AI improve" style={{ width: 26, height: 26, borderRadius: 'var(--r-sm)', background: 'var(--gold-dim)', border: '1px solid rgba(232,184,75,0.2)', color: 'var(--gold)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>
                              {improving === key ? <span className="spinner spinner-sm" style={{ width: 10, height: 10, borderWidth: 1.5 }} /> : '✦'}
                            </button>
                            <button
                              onClick={() => { const bullets = (exp.bullets ?? []).filter((_, j) => j !== bi); updateExp(i, { bullets }); }}
                              style={{ width: 26, height: 26, borderRadius: 'var(--r-sm)', background: 'none', border: '1px solid var(--border)', color: 'var(--text-3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>×</button>
                          </div>
                        </div>
                        {vars && (
                          <div style={{ marginLeft: 14, display: 'flex', flexDirection: 'column', gap: 6, marginTop: 6 }}>
                            {vars.map((v, vi) => (
                              <div key={vi} className="variant-block">
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                                  <div style={{ flex: 1, fontSize: 12, lineHeight: 1.55 }}>{v}</div>
                                  <button onClick={() => acceptVariant(i, bi, v)} style={{ flexShrink: 0, width: 22, height: 22, borderRadius: 'var(--r-sm)', background: 'var(--gold)', border: 'none', color: 'var(--text-inv)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>✓</button>
                                </div>
                              </div>
                            ))}
                            <button onClick={() => setVariants(prev => { const n = { ...prev }; delete n[key]; return n; })} style={{ fontSize: 11, color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', paddingLeft: 0 }}>Dismiss</button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <button onClick={() => { const bullets = [...(exp.bullets ?? []), '']; updateExp(i, { bullets }); }}
                    style={{ fontSize: 12, color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>+ Add bullet</button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
      <button onClick={addExp} style={{ width: '100%', padding: '10px 0', border: '1px dashed var(--border-2)', borderRadius: 'var(--r-md)', background: 'none', color: 'var(--text-3)', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.12s' }}
        onMouseEnter={e => { (e.currentTarget.style.borderColor = 'var(--gold)'); (e.currentTarget.style.color = 'var(--gold)'); }}
        onMouseLeave={e => { (e.currentTarget.style.borderColor = 'var(--border-2)'); (e.currentTarget.style.color = 'var(--text-3)'); }}>
        + Add experience
      </button>
    </div>
  );
}

/* ── Education tab ─────────────────────────────────────────── */
function EducationTab() {
  const { mcs, updateMCS } = useNexusStore();
  const [open, setOpen] = useState<number | null>(0);
  const edu = mcs?.education ?? [];

  function updateEdu(i: number, patch: any) {
    updateMCS({ education: edu.map((e, idx) => idx === i ? { ...e, ...patch } : e) });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {edu.map((e, i) => (
        <div key={i} className={`entry-card ${open === i ? 'open' : ''}`}>
          <div className="entry-header" onClick={() => setOpen(open === i ? null : i)}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{e.institution || 'Institution'}</p>
              <p style={{ fontSize: 11, color: 'var(--text-3)' }}>{e.degree} {e.field ? `· ${e.field}` : ''}</p>
            </div>
            <span style={{ color: 'var(--text-3)', fontSize: 12 }}>{open === i ? '▲' : '▼'}</span>
          </div>
          {open === i && (
            <div className="entry-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Field label="Institution" value={e.institution ?? ''} onChange={v => updateEdu(i, { institution: v })} placeholder="MIT" />
                <Grid2>
                  <Field label="Degree" value={e.degree ?? ''} onChange={v => updateEdu(i, { degree: v })} placeholder="BSc" />
                  <Field label="Field"  value={e.field  ?? ''} onChange={v => updateEdu(i, { field: v })}  placeholder="Computer Science" />
                  <Field label="Start"  value={e.startDate ?? ''} onChange={v => updateEdu(i, { startDate: v })} placeholder="Sep 2018" />
                  <Field label="End"    value={e.endDate   ?? ''} onChange={v => updateEdu(i, { endDate: v })}   placeholder="Jun 2022" />
                </Grid2>
                <Field label="GPA / Honors" value={e.gpa ?? ''} onChange={v => updateEdu(i, { gpa: v })} placeholder="3.9 / 4.0" />
              </div>
            </div>
          )}
        </div>
      ))}
      <button onClick={() => { updateMCS({ education: [...edu, { institution: '', degree: '', field: '', startDate: '', endDate: '', gpa: '' }] }); setOpen(edu.length); }}
        style={{ width: '100%', padding: '10px 0', border: '1px dashed var(--border-2)', borderRadius: 'var(--r-md)', background: 'none', color: 'var(--text-3)', fontSize: 13, cursor: 'pointer' }}>
        + Add education
      </button>
    </div>
  );
}

/* ── Skills tab ────────────────────────────────────────────── */
function SkillsTab() {
  const { mcs, updateMCS } = useNexusStore();
  const skills = mcs?.skills ?? [];

  function removeSkill(i: number) {
    updateMCS({ skills: skills.filter((_, idx) => idx !== i) });
  }

  function addSkill(name: string) {
    if (!name.trim()) return;
    updateMCS({ skills: [...skills, { name: name.trim() }] });
  }

  const [draft, setDraft] = useState('');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {skills.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 99, padding: '4px 10px', fontSize: 12, color: 'var(--text-2)' }}>
            {s.name}
            <button onClick={() => removeSkill(i)} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', lineHeight: 1, fontSize: 14, padding: '0 0 0 2px' }}>×</button>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input className="nx-input" value={draft} onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { addSkill(draft); setDraft(''); } }}
          placeholder="Type a skill and press Enter…" style={{ flex: 1 }} />
        <button className="btn btn-ghost" onClick={() => { addSkill(draft); setDraft(''); }}>Add</button>
      </div>
    </div>
  );
}

/* ── Raw tab ───────────────────────────────────────────────── */
function RawTab() {
  const { mcs, setMCS } = useNexusStore();
  const [raw, setRaw] = useState(JSON.stringify(mcs, null, 2));
  const [err, setErr] = useState('');

  function handleBlur() {
    try { setMCS(JSON.parse(raw)); setErr(''); }
    catch { setErr('Invalid JSON'); }
  }

  return (
    <div>
      {err && <p style={{ fontSize: 12, color: 'var(--red)', marginBottom: 6 }}>{err}</p>}
      <textarea
        value={raw} onChange={e => setRaw(e.target.value)} onBlur={handleBlur}
        rows={30}
        style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '12px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-2)', outline: 'none', resize: 'none', lineHeight: 1.7 }}
        onFocus={e => (e.target.style.borderColor = 'var(--gold)')}
        onBlur2={e => (e.target.style.borderColor = 'var(--border)')}
      />
    </div>
  );
}

/* ── Live preview ──────────────────────────────────────────── */
function LivePreview() {
  const { mcs } = useNexusStore();
  if (!mcs) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, color: 'var(--text-3)' }}>
      <div style={{ fontSize: 32 }}>📄</div>
      <p style={{ fontSize: 13 }}>No data yet — start editing</p>
    </div>
  );

  const p = mcs.personal ?? ({} as any);
  const primaryColor = '#E8B84B';

  return (
    <div style={{ background: '#fff', color: '#111', fontFamily: 'Georgia, serif', maxWidth: 700, margin: '0 auto', padding: '40px 48px', minHeight: '100%', lineHeight: 1.5, fontSize: 13 }}>
      {/* Header */}
      <div style={{ borderBottom: `2px solid ${primaryColor}`, paddingBottom: 16, marginBottom: 20 }}>
        <h1 style={{ fontFamily: "'Playfair Display', Georgia", fontSize: 28, fontWeight: 700, color: '#0a0a0a', marginBottom: 3 }}>{p.name || 'Your Name'}</h1>
        {p.title && <p style={{ fontSize: 14, color: '#555', fontFamily: 'system-ui' }}>{p.title}</p>}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px', marginTop: 8, fontSize: 12, color: '#777', fontFamily: 'system-ui' }}>
          {p.email    && <span>✉ {p.email}</span>}
          {p.phone    && <span>📞 {p.phone}</span>}
          {p.location && <span>📍 {p.location}</span>}
          {p.linkedin && <span>in {p.linkedin}</span>}
          {p.github   && <span>⊞ {p.github}</span>}
        </div>
      </div>

      {mcs.summary && (
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'system-ui', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: primaryColor, marginBottom: 8 }}>Profile</h2>
          <p style={{ fontSize: 13, lineHeight: 1.7, color: '#333' }}>{mcs.summary}</p>
        </div>
      )}

      {mcs.experience?.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'system-ui', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: primaryColor, marginBottom: 12 }}>Experience</h2>
          {mcs.experience.map((e: any, i: number) => (
            <div key={i} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <strong style={{ fontSize: 14, color: '#111', fontFamily: 'system-ui' }}>{e.role}</strong>
                <span style={{ fontSize: 11, color: '#888', fontFamily: 'system-ui' }}>{e.startDate}{e.current ? ' – Present' : e.endDate ? ` – ${e.endDate}` : ''}</span>
              </div>
              <p style={{ fontSize: 12, color: '#666', fontFamily: 'system-ui', marginBottom: 5 }}>{e.company}{e.location ? ` · ${e.location}` : ''}</p>
              {e.bullets?.length > 0 && (
                <ul style={{ paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {e.bullets.map((b: string, bi: number) => <li key={bi} style={{ fontSize: 12.5, color: '#333', lineHeight: 1.55 }}>{b}</li>)}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {mcs.education?.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'system-ui', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: primaryColor, marginBottom: 12 }}>Education</h2>
          {mcs.education.map((e: any, i: number) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong style={{ fontSize: 13, fontFamily: 'system-ui' }}>{e.institution}</strong>
                <span style={{ fontSize: 11, color: '#888', fontFamily: 'system-ui' }}>{e.startDate}{e.endDate ? ` – ${e.endDate}` : ''}</span>
              </div>
              <p style={{ fontSize: 12, color: '#555', fontFamily: 'system-ui' }}>{e.degree}{e.field ? ` in ${e.field}` : ''}{e.gpa ? ` · GPA ${e.gpa}` : ''}</p>
            </div>
          ))}
        </div>
      )}

      {mcs.skills?.length > 0 && (
        <div>
          <h2 style={{ fontFamily: 'system-ui', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: primaryColor, marginBottom: 8 }}>Skills</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {mcs.skills.map((s: any, i: number) => (
              <span key={i} style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', borderRadius: 4, padding: '2px 8px', fontSize: 11, fontFamily: 'system-ui' }}>{s.name}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Main page ─────────────────────────────────────────────── */
const TABS: { id: Tab; icon: string; label: string }[] = [
  { id: 'personal',   icon: '◉', label: 'Profile' },
  { id: 'experience', icon: '◈', label: 'Experience' },
  { id: 'education',  icon: '◇', label: 'Education' },
  { id: 'skills',     icon: '◆', label: 'Skills' },
  { id: 'raw',        icon: '</>', label: 'Raw' },
];

export default function EditorPage() {
  const [tab, setTab] = useState<Tab>('personal');
  const [activeView, setActiveView] = useState<'edit' | 'preview'>('edit');
  const { mcs } = useNexusStore();

  const tabContent: Record<Tab, React.ReactNode> = {
    personal:   <PersonalTab />,
    experience: <ExperienceTab />,
    education:  <EducationTab />,
    skills:     <SkillsTab />,
    raw:        <RawTab />,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* Topbar */}
      <div className="topbar">
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{ width: 28, height: 28, background: 'var(--gold)', borderRadius: 'var(--r)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: 'var(--text-inv)' }}>⬡</div>
          <span className="display" style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>Nexus</span>
        </Link>
        {mcs?.personal?.name && (
          <span className="pill-gold" style={{ fontSize: 11 }}>{mcs.personal.name}</span>
        )}
        <div style={{ flex: 1 }} />

        {/* Mobile tab toggle */}
        <div style={{ display: 'flex', gap: 4 }}>
          {(['edit', 'preview'] as const).map(v => (
            <button key={v} onClick={() => setActiveView(v)}
              className="btn" style={{ padding: '6px 14px', background: activeView === v ? 'var(--gold)' : 'var(--surface-2)', color: activeView === v ? 'var(--text-inv)' : 'var(--text-2)', border: '1px solid var(--border)', textTransform: 'capitalize' }}>
              {v}
            </button>
          ))}
        </div>

        <Link href="/export" className="btn btn-ghost" style={{ textDecoration: 'none', padding: '6px 14px' }}>Export ↗</Link>
        <Link href="/jd-targeting" className="btn btn-gold" style={{ textDecoration: 'none', padding: '6px 14px' }}>⚡ JD Target</Link>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '440px 1fr', overflow: 'hidden' }}>
        {/* Editor pane */}
        <div style={{ borderRight: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Tabs */}
          <div className="tab-strip" style={{ overflowX: 'auto' }}>
            {TABS.map(t => (
              <button key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
                <span style={{ marginRight: 4, fontSize: 10 }}>{t.icon}</span>{t.label}
              </button>
            ))}
          </div>
          {/* Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
            {mcs ? tabContent[tab] : (
              <div style={{ textAlign: 'center', paddingTop: 40 }}>
                <p style={{ color: 'var(--text-3)', fontSize: 13, marginBottom: 12 }}>No profile yet.</p>
                <Link href="/" className="btn btn-gold" style={{ textDecoration: 'none', display: 'inline-flex' }}>← Start with AI chat</Link>
              </div>
            )}
          </div>
        </div>

        {/* Preview pane */}
        <div style={{ background: 'var(--bg-2)', overflowY: 'auto' }}>
          <LivePreview />
        </div>
      </div>
    </div>
  );
}
