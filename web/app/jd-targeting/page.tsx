'use client';
import { useState } from 'react';
import { useNexusStore } from '@/lib/store';
import Link from 'next/link';

type Tone = 'formal' | 'conversational' | 'technical' | 'storytelling';

interface JDResult {
  score: number;
  coverLetter: string;
  tailored?: any;
  missingSkills?: string[];
  implicitSkills?: string[];
}

const TONES: { id: Tone; label: string; desc: string }[] = [
  { id: 'formal',          label: 'Formal',       desc: 'Professional, structured' },
  { id: 'conversational',  label: 'Conversational',desc: 'Warm, direct' },
  { id: 'technical',       label: 'Technical',    desc: 'Credibility-first' },
  { id: 'storytelling',    label: 'Story',         desc: 'Narrative arc' },
];

function ScoreRing({ score }: { score: number }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 75 ? '#52B788' : score >= 50 ? '#E8B84B' : '#E05252';
  const label = score >= 75 ? 'Strong fit' : score >= 50 ? 'Moderate fit' : 'Weak fit';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <svg width={130} height={130} viewBox="0 0 130 130" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={65} cy={65} r={r} fill="none" stroke="var(--border-2)" strokeWidth={8} />
        <circle cx={65} cy={65} r={r} fill="none" stroke={color} strokeWidth={8} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.34,1.56,0.64,1)', filter: `drop-shadow(0 0 6px ${color}50)` }} />
        <text x={65} y={65} textAnchor="middle" dominantBaseline="middle"
          style={{ transform: 'rotate(90deg)', transformOrigin: '65px 65px', fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, fill: color }}>
          {score}
        </text>
      </svg>
      <span className="pill-gold" style={{ background: `${color}15`, borderColor: `${color}40`, color }}>{label}</span>
    </div>
  );
}

export default function JDTargetingPage() {
  const { mcs, aiProvider, aiKey, aiModel, setMCS } = useNexusStore();
  const [jd, setJd] = useState('');
  const [tone, setTone] = useState<Tone>('formal');
  const [loading, setLoading] = useState(false);
  const [loadingCover, setLoadingCover] = useState(false);
  const [result, setResult] = useState<JDResult | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [copied, setCopied] = useState(false);

  async function handleAnalyse() {
    if (!jd.trim() || !mcs || !aiKey) return;
    setLoading(true); setResult(null);
    try {
      const res = await fetch('/api/ai/target', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': aiKey },
        body: JSON.stringify({ mcs, jd, provider: aiProvider, model: aiModel }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      if (data.tailored) setMCS(data.tailored);
      setResult({ score: data.score, coverLetter: data.coverLetter, missingSkills: data.missingSkills, implicitSkills: data.implicitSkills });
      setCoverLetter(data.coverLetter ?? '');
    } catch (e) { alert('Analysis failed: ' + String(e)); }
    finally { setLoading(false); }
  }

  async function handleGenerateCover() {
    if (!jd.trim() || !mcs || !aiKey) return;
    setLoadingCover(true); setCoverLetter('');
    try {
      const res = await fetch('/api/ai/generate-cover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': aiKey },
        body: JSON.stringify({ mcs, jd, tone, provider: aiProvider, model: aiModel }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setCoverLetter(data.coverLetter ?? '');
    } catch (e) { alert('Generation failed: ' + String(e)); }
    finally { setLoadingCover(false); }
  }

  function downloadCoverLetter(fmt: 'txt' | 'html') {
    if (!coverLetter) return;
    const name = (mcs?.personal?.name ?? 'cover-letter').toLowerCase().replace(/\s+/g, '-');
    if (fmt === 'txt') {
      const blob = new Blob([coverLetter], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `${name}-cover-letter.txt`;
      a.click(); URL.revokeObjectURL(url);
    }
    if (fmt === 'html') {
      const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Cover Letter — ${mcs?.personal?.name ?? ''}</title><link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Plus+Jakarta+Sans&display=swap" rel="stylesheet"><style>body{font-family:'Plus Jakarta Sans',sans-serif;max-width:680px;margin:60px auto;padding:0 32px;color:#111;line-height:1.75;font-size:15px}h1{font-family:'Playfair Display';font-size:24px;margin-bottom:24px}p{margin-bottom:16px}</style></head><body><h1>Cover Letter — ${mcs?.personal?.name ?? ''}</h1>${coverLetter.split('\n\n').map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('')}</body></html>`;
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `${name}-cover-letter.html`;
      a.click(); URL.revokeObjectURL(url);
    }
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const noKey = !aiKey;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Topbar */}
      <div className="topbar">
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{ width: 28, height: 28, background: 'var(--gold)', borderRadius: 'var(--r)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: 'var(--text-inv)' }}>⬡</div>
          <span className="display" style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>Nexus</span>
        </Link>
        <span style={{ color: 'var(--text-3)', fontSize: 13 }}>/ JD Targeting</span>
        <div style={{ flex: 1 }} />
        <Link href="/editor" className="btn btn-ghost" style={{ textDecoration: 'none', fontSize: 13 }}>← Editor</Link>
        <Link href="/export" className="btn btn-gold" style={{ textDecoration: 'none', fontSize: 13 }}>Export ↗</Link>
      </div>

      {/* Body */}
      <div style={{ flex: 1, maxWidth: 1000, width: '100%', margin: '0 auto', padding: '40px 24px', display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>

        {/* Left — JD input + cover letter */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <h1 className="display" style={{ fontSize: 26, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>JD Targeting</h1>
            <p style={{ fontSize: 13, color: 'var(--text-2)' }}>
              Paste a job description — Nexus scores your fit, identifies gaps, and generates a tailored cover letter. Non-destructive: your master profile is not overwritten.
            </p>
          </div>

          {noKey && (
            <div style={{ padding: '10px 14px', background: 'rgba(255,77,109,0.10)', border: '1px solid rgba(255,77,109,0.24)', borderRadius: 'var(--r)', fontSize: 13, color: 'var(--gold)' }}>
              ⚡ Set your AI key on the <Link href="/" style={{ color: 'var(--gold)', fontWeight: 600 }}>home page</Link> first.
            </div>
          )}

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Job description</span>
              <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{jd.length} chars</span>
            </div>
            <textarea
              value={jd} onChange={e => setJd(e.target.value)}
              placeholder="Paste the full job description here…"
              rows={12}
              style={{ width: '100%', background: 'transparent', border: 'none', padding: '14px 16px', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text)', outline: 'none', resize: 'none', lineHeight: 1.65 }}
            />
            <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
              <button className="btn btn-gold" onClick={handleAnalyse} disabled={!jd.trim() || !mcs || loading || noKey} style={{ flex: 1, justifyContent: 'center' }}>
                {loading ? <><span className="spinner spinner-sm" /> Analysing…</> : '⚡ Analyse fit'}
              </button>
            </div>
          </div>

          {/* Cover letter section */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Cover letter</span>
              {coverLetter && (
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-ghost" onClick={copyToClipboard} style={{ padding: '4px 10px', fontSize: 11 }}>{copied ? '✓ Copied' : 'Copy'}</button>
                  <button className="btn btn-ghost" onClick={() => downloadCoverLetter('html')} style={{ padding: '4px 10px', fontSize: 11 }}>↓ HTML</button>
                  <button className="btn btn-ghost" onClick={() => downloadCoverLetter('txt')} style={{ padding: '4px 10px', fontSize: 11 }}>↓ TXT</button>
                </div>
              )}
            </div>

            {/* Tone picker */}
            <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 6 }}>
              {TONES.map(t => (
                <button key={t.id} onClick={() => setTone(t.id)}
                  style={{ flex: 1, padding: '6px 0', borderRadius: 'var(--r)', background: tone === t.id ? 'var(--gold-dim)' : 'var(--surface-2)', border: `1px solid ${tone === t.id ? 'rgba(255,77,109,0.38)' : 'var(--border)'}`, color: tone === t.id ? 'var(--gold)' : 'var(--text-3)', fontSize: 11, cursor: 'pointer', fontWeight: tone === t.id ? 600 : 400 }}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Output */}
            <div style={{ padding: '14px 16px', minHeight: 140, position: 'relative' }}>
              {loadingCover ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[1, 0.7, 0.85, 0.5].map((w, i) => <div key={i} className="shimmer-bar" style={{ height: 12, width: `${w * 100}%` }} />)}
                </div>
              ) : coverLetter ? (
                <textarea value={coverLetter} onChange={e => setCoverLetter(e.target.value)} rows={12}
                  style={{ width: '100%', background: 'transparent', border: 'none', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text)', outline: 'none', resize: 'none', lineHeight: 1.7 }} />
              ) : (
                <p style={{ color: 'var(--text-3)', fontSize: 13, textAlign: 'center', paddingTop: 24 }}>
                  {jd.trim() ? 'Generate a cover letter below' : 'Paste a job description first'}
                </p>
              )}
            </div>

            <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
              <button className="btn btn-ghost" onClick={handleGenerateCover} disabled={!jd.trim() || !mcs || loadingCover || noKey} style={{ width: '100%', justifyContent: 'center' }}>
                {loadingCover ? <><span className="spinner spinner-sm" /> Writing…</> : '✦ Generate cover letter'}
              </button>
            </div>
          </div>
        </div>

        {/* Right — score + gaps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, position: 'sticky', top: 24 }}>
          {result ? (
            <>
              <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                <ScoreRing score={result.score} />
              </div>

              {result.missingSkills && result.missingSkills.length > 0 && (
                <div className="card" style={{ padding: 16 }}>
                  <p className="label" style={{ marginBottom: 10 }}>⚠ Missing from your profile</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {result.missingSkills.map((s, i) => (
                      <span key={i} style={{ background: 'var(--red-dim)', border: '1px solid rgba(224,82,82,0.2)', borderRadius: 99, padding: '3px 10px', fontSize: 12, color: 'var(--red)' }}>{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {result.implicitSkills && result.implicitSkills.length > 0 && (
                <div className="card" style={{ padding: 16 }}>
                  <p className="label" style={{ marginBottom: 10 }}>✦ You have but haven't mentioned</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {result.implicitSkills.map((s, i) => (
                      <span key={i} className="pill-gold" style={{ fontSize: 11 }}>{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="card" style={{ padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 36 }}>⚡</div>
              <p style={{ fontWeight: 600, color: 'var(--text)', fontSize: 14 }}>Fit score</p>
              <p style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.5 }}>Paste a job description and click Analyse to see how well your profile matches the role.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
