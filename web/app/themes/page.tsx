'use client';
import { useState } from 'react';
import { useNexusStore } from '@/lib/store';
import Link from 'next/link';

const THEMES = [
  { id: 'professional', label: 'Professional', desc: 'Clean, ATS-optimised', accent: '#1a1a2e', bg: '#ffffff', tag: 'Most popular' },
  { id: 'gold-editorial', label: 'Editorial', desc: 'Warm amber, display type', accent: '#E8B84B', bg: '#0C0B09', dark: true },
  { id: 'modern-sidebar', label: 'Sidebar', desc: 'Visual hierarchy split', accent: '#5B8DEF', bg: '#f8faff' },
  { id: 'minimal-mono', label: 'Minimal', desc: 'Monochrome, pure focus', accent: '#111', bg: '#fafaf8' },
  { id: 'creative-bold', label: 'Creative', desc: 'Bold type, distinctive', accent: '#E05252', bg: '#fff5f5' },
  { id: 'academic-cv', label: 'Academic CV', desc: 'Scholarly, full-length', accent: '#2d4a7a', bg: '#fefefe' },
  { id: 'tech-dark', label: 'Tech Dark', desc: 'Dark mode, code aesthetic', accent: '#52B788', bg: '#0a0e0a', dark: true },
  { id: 'executive', label: 'Executive', desc: 'Premium, gold accents', accent: '#8B6914', bg: '#fdfaf5' },
];

function MiniPreview({ theme, mcs }: { theme: typeof THEMES[0]; mcs: any }) {
  const p = mcs?.personal ?? {};
  return (
    <div style={{ background: theme.bg, width: '100%', aspectRatio: '0.72', borderRadius: 'var(--r-md)', overflow: 'hidden', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
      {/* Header strip */}
      <div style={{ borderBottom: `2px solid ${theme.accent}`, paddingBottom: 6, marginBottom: 2 }}>
        <div style={{ height: 8, borderRadius: 2, background: theme.dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.75)', width: '55%', marginBottom: 4 }} />
        <div style={{ height: 5, borderRadius: 2, background: theme.accent, width: '35%', marginBottom: 3 }} />
        <div style={{ display: 'flex', gap: 4 }}>
          {[40, 30, 35].map((w, i) => <div key={i} style={{ height: 3.5, borderRadius: 2, background: theme.dark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)', width: `${w}%` }} />)}
        </div>
      </div>
      {/* Section */}
      <div style={{ height: 4, borderRadius: 1, background: theme.accent, width: '25%', marginBottom: 2 }} />
      {[80, 65, 90, 55].map((w, i) => <div key={i} style={{ height: 3.5, borderRadius: 2, background: theme.dark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.13)', width: `${w}%` }} />)}
      <div style={{ height: 4, borderRadius: 1, background: theme.accent, width: '20%', marginTop: 4, marginBottom: 2 }} />
      {[70, 50].map((w, i) => <div key={i} style={{ height: 3.5, borderRadius: 2, background: theme.dark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.13)', width: `${w}%` }} />)}
    </div>
  );
}

function FullPreview({ theme, mcs }: { theme: typeof THEMES[0]; mcs: any }) {
  const p = mcs?.personal ?? {};
  const esc = (s: any) => String(s ?? '');

  if (!mcs) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, color: 'var(--text-3)' }}>
      <div style={{ fontSize: 32 }}>📄</div>
      <p style={{ fontSize: 13 }}>Build your profile to preview templates</p>
      <Link href="/" className="btn btn-gold" style={{ textDecoration: 'none', display: 'inline-flex', marginTop: 4 }}>Start with AI →</Link>
    </div>
  );

  return (
    <div style={{ background: theme.bg, color: theme.dark ? '#F0E8D6' : '#111', fontFamily: "'Plus Jakarta Sans', sans-serif", padding: '36px 40px', height: '100%', overflowY: 'auto', fontSize: 13, lineHeight: 1.6 }}>
      <div style={{ borderBottom: `2px solid ${theme.accent}`, paddingBottom: 14, marginBottom: 18 }}>
        <h1 style={{ fontFamily: "'Playfair Display', Georgia", fontSize: 26, fontWeight: 700, marginBottom: 3, color: theme.dark ? '#F0E8D6' : '#0a0a0a' }}>{p.name || 'Your Name'}</h1>
        {p.title && <p style={{ fontSize: 13, color: theme.accent }}>{p.title}</p>}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px 12px', marginTop: 6, fontSize: 11, color: theme.dark ? '#A89880' : '#777' }}>
          {p.email    && <span>{p.email}</span>}
          {p.location && <span>{p.location}</span>}
          {p.linkedin && <span>/{p.linkedin}</span>}
        </div>
      </div>

      {mcs.summary && <p style={{ fontSize: 12.5, lineHeight: 1.7, marginBottom: 18, color: theme.dark ? '#C8BEAD' : '#333' }}>{mcs.summary}</p>}

      {mcs.experience?.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <h2 style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: theme.accent, marginBottom: 10 }}>Experience</h2>
          {mcs.experience.slice(0, 2).map((e: any, i: number) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong style={{ fontSize: 12 }}>{e.role}</strong>
                <span style={{ fontSize: 10, color: theme.dark ? '#A89880' : '#888' }}>{e.startDate}{e.current ? ' – Now' : e.endDate ? ` – ${e.endDate}` : ''}</span>
              </div>
              <p style={{ fontSize: 11, color: theme.dark ? '#8A7F6A' : '#666', marginBottom: 4 }}>{e.company}</p>
              {e.bullets?.slice(0, 2).map((b: string, bi: number) => <p key={bi} style={{ fontSize: 11, paddingLeft: 10, borderLeft: `2px solid ${theme.accent}`, marginBottom: 2, color: theme.dark ? '#C8BEAD' : '#444' }}>· {b}</p>)}
            </div>
          ))}
        </div>
      )}

      {mcs.skills?.length > 0 && (
        <div>
          <h2 style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: theme.accent, marginBottom: 8 }}>Skills</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {mcs.skills.slice(0, 12).map((s: any, i: number) => (
              <span key={i} style={{ background: `${theme.accent}18`, border: `1px solid ${theme.accent}35`, borderRadius: 4, padding: '2px 7px', fontSize: 10, color: theme.accent }}>{s.name}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ThemesPage() {
  const { mcs } = useNexusStore();
  const [selected, setSelected] = useState('professional');
  const activeTheme = THEMES.find(t => t.id === selected) ?? THEMES[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* Topbar */}
      <div className="topbar">
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{ width: 28, height: 28, background: 'var(--gold)', borderRadius: 'var(--r)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: 'var(--text-inv)' }}>⬡</div>
          <span className="display" style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>Nexus</span>
        </Link>
        <span style={{ color: 'var(--text-3)', fontSize: 13 }}>/ Themes</span>
        <div style={{ flex: 1 }} />
        <Link href="/editor" className="btn btn-ghost" style={{ textDecoration: 'none', fontSize: 13 }}>← Editor</Link>
        <Link href="/export" className="btn btn-gold" style={{ textDecoration: 'none', fontSize: 13 }}>Export →</Link>
      </div>

      {/* Body — grid + preview */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '340px 1fr', overflow: 'hidden' }}>

        {/* Left — theme grid */}
        <div style={{ borderRight: '1px solid var(--border)', background: 'var(--surface)', overflowY: 'auto', padding: 16 }}>
          <p className="label" style={{ marginBottom: 14, paddingLeft: 4 }}>Choose theme</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {THEMES.map(t => (
              <button key={t.id} onClick={() => setSelected(t.id)}
                className={`theme-card ${selected === t.id ? 'selected' : ''}`}
                style={{ padding: 0, border: 'none', cursor: 'pointer', textAlign: 'left', background: 'none' }}>
                <div style={{ padding: 8 }}>
                  <MiniPreview theme={t} mcs={mcs} />
                </div>
                <div style={{ padding: '0 10px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: selected === t.id ? 'var(--gold)' : 'var(--text)' }}>{t.label}</p>
                    {t.tag && <span style={{ fontSize: 9, background: 'var(--gold-dim)', color: 'var(--gold)', border: '1px solid rgba(255,77,109,0.28)', borderRadius: 99, padding: '1px 5px', fontWeight: 600 }}>{t.tag}</span>}
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--text-3)' }}>{t.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right — live preview */}
        <div style={{ background: 'var(--bg-2)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: activeTheme.accent }} />
            <p style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 500 }}>{activeTheme.label}</p>
            <span style={{ fontSize: 11, color: 'var(--text-3)' }}>—</span>
            <p style={{ fontSize: 11, color: 'var(--text-3)' }}>{activeTheme.desc}</p>
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <FullPreview theme={activeTheme} mcs={mcs} />
          </div>
        </div>
      </div>
    </div>
  );
}
