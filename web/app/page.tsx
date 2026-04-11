'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type PageId = 'chat' | 'editor' | 'jd' | 'export' | 'changelog';
type ProviderId = 'anthropic' | 'openai' | 'gemini' | 'openrouter';
type SectionId = 'profile' | 'experience' | 'education' | 'skills' | 'projects' | 'cover';
type Tone = 'Formal' | 'Technical' | 'Story';

type KeyConfig = { provider: ProviderId; key: string; model: string; baseUrl: string };
type DataCard = { title: string; rows: Array<{ label: string; value: string; multiline?: boolean }> };
type Msg = { id: number; role: 'user' | 'ai'; text: string; data?: DataCard };
type Particle = { x: number; y: number; w: number; h: number; vx: number; vy: number; r: number; vr: number; c: string };

const COLS = ['rgba(255,77,106,.45)', 'rgba(107,159,255,.35)', 'rgba(77,217,148,.35)', 'rgba(255,204,85,.35)'];
const CHIPS = [
  'Create a concise product designer profile',
  'Improve experience bullets for impact',
  'Target this CV for a PM job description',
  'Draft a technical cover letter opener',
];
const SECTIONS: Array<{ id: SectionId; label: string }> = [
  { id: 'profile', label: 'Profile' },
  { id: 'experience', label: 'Experience' },
  { id: 'education', label: 'Education' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'cover', label: 'Cover Letter' },
];
const THEMES = ['Professional (ATS Safe)', 'Modern (Dark Mode)', 'Academic', 'Minimal', 'Creative'] as const;
const FORMATS = ['PDF', 'DOCX', 'HTML', 'JSON', 'YAML'] as const;
// One particle per ~9000px² keeps the ambient background subtle without visual clutter.
const PARTICLE_DENSITY_AREA = 9000;

const BASE_KEY: KeyConfig = { provider: 'openai', key: '', model: '', baseUrl: '' };

function autoR(el: HTMLTextAreaElement, max = 140) {
  el.style.height = 'auto';
  el.style.height = `${Math.min(el.scrollHeight, max)}px`;
}

function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    localStorage.setItem('__nexus', '1');
    localStorage.removeItem('__nexus');
    return localStorage;
  } catch {
    try {
      sessionStorage.setItem('__nexus', '1');
      sessionStorage.removeItem('__nexus');
      return sessionStorage;
    } catch {
      return null;
    }
  }
}

function loadKey(): KeyConfig | null {
  const s = getStorage();
  if (!s) return null;
  const raw = s.getItem('nexus-key');
  if (!raw) return null;
  try {
    const x = JSON.parse(raw) as unknown;
    if (!x || typeof x !== 'object') return null;
    const o = x as Record<string, unknown>;
    if (typeof o.key !== 'string' || !o.key.trim()) return null;
    const provider: ProviderId =
      o.provider === 'anthropic' || o.provider === 'openai' || o.provider === 'gemini' || o.provider === 'openrouter'
        ? o.provider
        : 'openai';
    return {
      provider,
      key: o.key,
      model: typeof o.model === 'string' ? o.model : '',
      baseUrl: typeof o.baseUrl === 'string' ? o.baseUrl : '',
    };
  } catch {
    return null;
  }
}

function storeKey(config: KeyConfig) {
  const s = getStorage();
  if (!s) return;
  s.setItem('nexus-key', JSON.stringify(config));
}

function removeKey() {
  const s = getStorage();
  if (!s) return;
  s.removeItem('nexus-key');
}

function mockReply(input: string): { text: string; data?: DataCard } {
  const q = input.toLowerCase();
  if (q.includes('cover')) {
    return {
      text: 'I drafted a concise cover letter structure with clear impact proof points.',
      data: {
        title: 'Extracted Data — click to edit',
        rows: [
          { label: 'Opening', value: 'I am excited to contribute product-led strategy and execution to your team.' },
          { label: 'Proof', value: 'Led roadmap execution that increased activation by 24% in two quarters.' },
          { label: 'Close', value: 'I would welcome the chance to discuss how I can drive similar impact.' },
        ],
      },
    };
  }
  if (q.includes('bullet') || q.includes('jd')) {
    return {
      text: 'Here are stronger, keyword-aligned bullet options focused on outcomes.',
      data: {
        title: 'Extracted Data — click to edit',
        rows: [
          { label: 'Bullet 1', value: 'Redesigned onboarding, improving week-1 activation from 42% to 58%.' },
          { label: 'Bullet 2', value: 'Partnered with engineering to ship instrumentation in 3 sprints.' },
          { label: 'Keyword', value: 'Cross-functional leadership, experimentation, KPI ownership' },
        ],
      },
    };
  }
  return {
    text: 'I parsed your profile and generated an editable data card to refine before moving to Editor.',
    data: {
      title: 'Extracted Data — click to edit',
      rows: [
        { label: 'Name', value: 'Alex Rivera' },
        { label: 'Title', value: 'Senior Product Designer' },
        { label: 'Company', value: 'Nexus Systems' },
        { label: 'Location', value: 'Remote, US' },
        { label: 'Period', value: '2022 — Present' },
        { label: 'Summary', multiline: true, value: 'Design leader focused on enterprise UX and measurable product outcomes.' },
      ],
    },
  };
}

export default function Home() {
  const [page, setPage] = useState<PageId>('chat');
  const [status, setStatus] = useState('Ready');
  const [showModal, setShowModal] = useState(false);
  const [keyConfig, setKeyConfig] = useState<KeyConfig>(() => loadKey() ?? BASE_KEY);
  const [draftKey, setDraftKey] = useState<KeyConfig>(() => loadKey() ?? BASE_KEY);

  const [chatInput, setChatInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [nextId, setNextId] = useState(1);
  const [editingCardId, setEditingCardId] = useState<number | null>(null);

  const [section, setSection] = useState<SectionId>('experience');
  const [title, setTitle] = useState('Senior Product Designer');
  const [company, setCompany] = useState('Nexus Systems');
  const [location, setLocation] = useState('Remote, US');
  const [period, setPeriod] = useState('Jan 2022 — Present');
  const [bullets, setBullets] = useState([
    'Led redesign of admin workflows, reducing task completion time by 31%.',
    'Built and governed a cross-product design system with engineering partnership.',
  ]);

  const [jd, setJd] = useState('');
  const [tone, setTone] = useState<Tone>('Formal');
  const [theme, setTheme] = useState<typeof THEMES[number]>('Professional (ATS Safe)');
  const [fmt, setFmt] = useState<typeof FORMATS[number]>('PDF');
  const [zoom, setZoom] = useState(100);

  const statusTimer = useRef<number | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLCanvasElement>(null);
  const hasKey = keyConfig.key.trim().length > 0;
  const jdWords = useMemo(() => jd.trim().split(/\s+/).filter(Boolean).length, [jd]);

  const setStatusTimed = useCallback((m: string) => {
    setStatus(m);
    if (statusTimer.current) window.clearTimeout(statusTimer.current);
    statusTimer.current = window.setTimeout(() => setStatus('Ready'), 3000);
  }, []);

  useEffect(() => {
    if (!chatRef.current) return;
    chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [msgs, typing]);

  useEffect(() => {
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowModal(false);
    };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, []);

  useEffect(() => {
    const canvas = bgRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let raf = 0;
    let parts: Particle[] = [];

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.max(36, Math.floor((window.innerWidth * window.innerHeight) / PARTICLE_DENSITY_AREA));
      parts = Array.from({ length: count }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        w: 3 + Math.random() * 11,
        h: 2 + Math.random() * 7,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.01,
        c: COLS[Math.floor(Math.random() * COLS.length)],
      }));
    };

    const frame = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (const p of parts) {
        p.x += p.vx;
        p.y += p.vy;
        p.r += p.vr;
        if (p.x > window.innerWidth + 20) p.x = -20;
        if (p.x < -20) p.x = window.innerWidth + 20;
        if (p.y > window.innerHeight + 20) p.y = -20;
        if (p.y < -20) p.y = window.innerHeight + 20;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.r);
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      raf = window.requestAnimationFrame(frame);
    };
    resize();
    frame();
    window.addEventListener('resize', resize);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  function send(raw?: string) {
    const text = (raw ?? chatInput).trim();
    if (!text) return;
    if (!hasKey) {
      setDraftKey(keyConfig);
      setShowModal(true);
      return;
    }
    const id = nextId;
    setNextId((v) => v + 2);
    setMsgs((p) => [...p, { id, role: 'user', text }]);
    setChatInput('');
    setTyping(true);
    window.setTimeout(() => {
      const r = mockReply(text);
      setMsgs((p) => [...p, { id: id + 1, role: 'ai', text: r.text, data: r.data }]);
      setTyping(false);
      setStatusTimed('Response ready');
    }, 850);
  }

  function saveModal() {
    const next = {
      ...draftKey,
      baseUrl:
        draftKey.provider === 'openrouter'
          ? draftKey.baseUrl || 'https://openrouter.ai/api/v1'
          : draftKey.baseUrl,
    };
    setKeyConfig(next);
    storeKey(next);
    setStatusTimed('API key saved');
    setShowModal(false);
  }

  function updateCardValue(msgId: number, rowIndex: number, value: string) {
    setMsgs((prev) =>
      prev.map((m) =>
        m.id === msgId && m.data
          ? {
              ...m,
              data: {
                ...m.data,
                rows: m.data.rows.map((row, i) => (i === rowIndex ? { ...row, value } : row)),
              },
            }
          : m
      )
    );
  }

  return (
    <>
      <canvas id="bg" ref={bgRef} />
      <div className="app-shell">
        <header className="nav">
          <div className="brand"><span>NEXUS</span><i className="dot" /></div>
          <div className="nav-tabs">
            {(['chat', 'editor', 'jd', 'export', 'changelog'] as PageId[]).map((id) => (
              <button key={id} className={`nb ${page === id ? 'on' : ''}`} onClick={() => setPage(id)}>{id}</button>
            ))}
          </div>
          <div className="nav-right">
            <span className="status-text">{status}</span>
            <button className="key-btn" onClick={() => { setDraftKey(keyConfig); setShowModal(true); }}>
              <span className={`kdot ${hasKey ? 'ok' : 'bad'}`} />Set API Key
            </button>
          </div>
        </header>

        <main className="pages">
          <section className={`pg ${page === 'chat' ? 'on' : ''}`}>
            <div className="chat-scroll" ref={chatRef}><div className="chat-inner">
              {msgs.length === 0 && <div className="chat-empty"><div className="brand-lg">NEXUS</div><p>Career intelligence for faster, sharper applications.</p><div className="chips">{CHIPS.map((c) => <button key={c} className="pc" onClick={() => send(c)}>{c}</button>)}</div></div>}
              {msgs.map((m) => (
                <div className={`msg ${m.role === 'user' ? 'u' : ''}`} key={m.id}>
                  <div className="av">{m.role === 'user' ? 'U' : '✦'}</div>
                  <div>
                    <div className="bub">{m.text}</div>
                    {m.data && (
                      <div className="data-card">
                        <div className="dc-h"><strong>{m.data.title}</strong><div className="dc-actions"><button onClick={() => setEditingCardId(editingCardId === m.id ? null : m.id)}>{editingCardId === m.id ? 'Cancel' : 'Edit'}</button>{editingCardId === m.id && <button onClick={() => { setEditingCardId(null); setStatusTimed('Card saved'); }}>Save</button>}</div></div>
                        {m.data.rows.map((r, i) => (
                          <div className="dc-row" key={`${m.id}-${r.label}`}>
                            <label>{r.label}</label>
                            {r.multiline ? (
                              <textarea
                                className={`dc-in ${editingCardId === m.id ? 'editing' : ''}`}
                                value={r.value}
                                rows={3}
                                readOnly={editingCardId !== m.id}
                                onChange={(e) => updateCardValue(m.id, i, e.target.value)}
                              />
                            ) : (
                              <input
                                className={`dc-in ${editingCardId === m.id ? 'editing' : ''}`}
                                value={r.value}
                                readOnly={editingCardId !== m.id}
                                onChange={(e) => updateCardValue(m.id, i, e.target.value)}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {typing && <div className="msg"><div className="av">✦</div><div className="typing bub"><span className="td" /><span className="td" /><span className="td" /></div></div>}
            </div></div>
            <div className="chat-input-wrap"><div className="input-bar"><textarea id="chat-ta" value={chatInput} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }} onChange={(e) => { setChatInput(e.target.value); autoR(e.target); }} rows={1} placeholder="Tell Nexus about your profile, role target, or paste a JD..." /><button className="send" onClick={() => send()}>↑</button></div><div className="hint-row"><span>Enter to send · Shift+Enter for newline</span><span>{chatInput.length} chars</span></div></div>
          </section>

          <section className={`pg ${page === 'editor' ? 'on' : ''}`}>
            <div className="ed-layout">
              <aside className="sidebar"><div className="sl-wrap">{SECTIONS.map((s) => <button key={s.id} className={`sl ${section === s.id ? 'on' : ''}`} onClick={() => setSection(s.id)}>{s.label}</button>)}</div></aside>
              <div className="ed-form">
                <div className="ed-head"><h3>{SECTIONS.find((s) => s.id === section)?.label}</h3><button className="pill-btn" onClick={() => hasKey ? setStatusTimed('AI Improve requested') : setShowModal(true)}>AI Improve</button></div>
                <div className="card-lo on-hi"><div className="grid4"><label><span>Job Title</span><input className="field" value={title} onChange={(e) => setTitle(e.target.value)} /></label><label><span>Company</span><input className="field" value={company} onChange={(e) => setCompany(e.target.value)} /></label><label><span>Location</span><input className="field" value={location} onChange={(e) => setLocation(e.target.value)} /></label><label><span>Dates</span><input className="field" value={period} onChange={(e) => setPeriod(e.target.value)} /></label></div>
                  <div className="bullets-container">{bullets.map((b, i) => <div className="bullet-row2" key={i}><span className="bdot" /><textarea className="bullet-field" value={b} rows={2} onChange={(e) => setBullets((p) => p.map((x, xi) => xi === i ? e.target.value : x))} /><button className="ai-btn" onClick={() => hasKey ? setStatusTimed('AI bullet improve requested') : setShowModal(true)}>✦</button></div>)}</div>
                  <button className="soft-btn" onClick={() => setBullets((p) => [...p, ''])}>+ Add bullet</button></div>
                <button className="add-exp" onClick={() => setStatusTimed('Add experience entry is placeholder')}>+ Add experience entry</button>
                <div className="card-lo old">Older entry (collapsed) — click to expand</div>
              </div>
              <aside className="ed-prev"><div className="ed-prev-h"><span>Live Preview</span><button className="soft-btn" onClick={() => setPage('export')}>Export</button></div><div className="cv-wrap"><article className="cv-page"><h1>Alex Rivera</h1><h2>{title}</h2><p>alex@rivera.dev · +1 555 123 0089 · {location}</p><section><h3>Experience</h3><div className="cv-role"><strong>{title}</strong><span>{period}</span></div><div className="cv-meta">{company} · {location}</div><ul><li>{bullets[0] || 'Add your first bullet.'}</li><li>Coached product squads on evidence-driven design decisions.</li></ul></section><section><h3>Education</h3><p>B.Sc. Human-Computer Interaction — University of Toronto</p></section><section><h3>Skills</h3><p>Design Systems · UX Research · Product Strategy · Figma · Analytics</p></section></article></div></aside>
            </div>
          </section>

          <section className={`pg ${page === 'jd' ? 'on' : ''}`}>
            <div className="jd-layout">
              <div className="jd-left"><h3>JD Targeting</h3><p className="sub">Paste a role description to compare alignment and generate ATS-focused suggestions.</p><textarea className="field jd-field" rows={9} value={jd} onChange={(e) => setJd(e.target.value)} /><div className="hint-row"><span>{jdWords} words</span></div><div className="row-btns"><button className="soft-btn" onClick={() => { setJd(''); setStatusTimed('JD input cleared'); }}>Clear</button><button className="pill-btn" onClick={() => setStatusTimed('Alignment analysis complete (mock)')}>Analyze Alignment</button></div>
                <div className="card-lo"><h4>Missing Keywords</h4><div className="tags">{['Roadmapping', 'B2B SaaS', 'A/B Testing'].map((t) => <span key={t} className="tag miss">{t}</span>)}</div></div>
                <div className="card-lo"><h4>Strong Matches</h4><div className="tags">{['Design Systems', 'Cross-functional', 'Accessibility'].map((t) => <span key={t} className="tag ok">{t}</span>)}</div></div>
                <div className="card-lo"><h4>Suggested Bullets</h4><div className="bc"><span className="badge">High Impact</span>Launched enterprise IA refresh, reducing support tickets by 27%.<span className="copy-h">click to copy</span></div><div className="bc"><span className="badge">High Impact</span>Drove workshops that shortened release review cycles by 19%.<span className="copy-h">click to copy</span></div><button className="soft-btn" onClick={() => setStatusTimed('Generated more suggestions (mock)')}>Generate More</button></div>
              </div>
              <aside className="jd-right"><div className="card-lo center"><svg width="140" height="140" viewBox="0 0 140 140" className="donut"><circle cx="70" cy="70" r="55" stroke="var(--t4)" strokeWidth="10" fill="none" /><circle cx="70" cy="70" r="55" stroke="var(--red)" strokeWidth="10" fill="none" strokeLinecap="round" strokeDasharray={345} strokeDashoffset={52} transform="rotate(-90 70 70)" /></svg><div className="fit">85%</div><div className="sub">Fit score</div><div className="stats3"><div><strong>92%</strong><span>Skills</span></div><div><strong>74%</strong><span>Exp</span></div><div><strong>100%</strong><span>Location</span></div></div></div><div className="card-lo"><h4>Competency Radar</h4><div className="radar-row"><span>Visual Precision</span><i style={{ width: '95%' }} /></div><div className="radar-row gap"><span>Project Mgmt</span><i style={{ width: '58%' }} /></div><div className="radar-row gap"><span>Enterprise UX</span><i style={{ width: '42%' }} /></div></div><div className="card-lo"><h4>Cover Letter</h4><div className="tone-row">{(['Formal', 'Technical', 'Story'] as Tone[]).map((t) => <button key={t} className={`tone ${tone === t ? 'on' : ''}`} onClick={() => setTone(t)}>{t}</button>)}</div><button className="pill-btn" onClick={() => setStatusTimed(`Generate ${tone} letter (mock)`)}>Generate</button></div></aside>
            </div>
          </section>

          <section className={`pg ${page === 'export' ? 'on' : ''}`}>
            <div className="ex-layout">
              <aside className="ex-left"><h4>Visual Theme</h4><div className="theme-list">{THEMES.map((t) => <button key={t} className={`tb ${theme === t ? 'sel' : ''}`} onClick={() => setTheme(t)}><span className="ts" /><span>{t}</span></button>)}</div><h4>Format</h4><div className="fmt-list">{FORMATS.map((f) => <label key={f} className="fmt-label"><input type="radio" name="fmt" checked={fmt === f} onChange={() => setFmt(f)} /><span>{f}</span></label>)}</div></aside>
              <div className="ex-mid"><div className="ex-cv" style={{ transform: `scale(${zoom / 100})` }}><h2>Alex Rivera</h2><p>Senior Product Designer · alex@rivera.dev · Remote</p><hr /><h5>Experience</h5><p><strong>Senior Product Designer</strong> — Nexus Systems</p><ul><li>Increased workflow completion by 31% through UX architecture improvements.</li><li>Scaled design operations across 4 squads with a unified token system.</li></ul><h5>Expertise</h5><div className="x-tags"><span>Design Systems</span><span>Enterprise UX</span><span>Product Strategy</span></div></div><div className="zoom-row"><button onClick={() => setZoom((z) => Math.max(70, z - 10))}>-</button><span>1 / 1</span><button onClick={() => setZoom((z) => Math.min(130, z + 10))}>+</button></div></div>
              <aside className="ex-right"><div className="card-lo"><h4>Export</h4><p>Theme: {theme}</p><p>Format: {fmt}</p><p>Estimated size: 112 KB</p><button className="pill-btn" onClick={() => setStatusTimed('Download is mock-only')}>Download Now</button><button className="soft-btn" onClick={() => setStatusTimed('Share is mock-only')}>Share Link</button><button className="soft-btn" onClick={() => setStatusTimed('LinkedIn upload is mock-only')}>Upload to LinkedIn</button></div><div className="card-lo tiny"><strong>ATS Ready</strong><span>Structure validated</span></div><div className="card-lo tiny"><strong>Print Safe</strong><span>Margins and contrast good</span></div><p className="sub">API key is only used for AI calls. Export runs locally.</p></aside>
            </div>
          </section>

          <section className={`pg ${page === 'changelog' ? 'on' : ''}`}>
            <div className="cl-wrap">
              {[{ v: 'v1.2.0', d: '2026-04-10', m: true, i: ['Unified shell with chat/editor/jd/export/changelog views.', 'Added key modal and provider switching.', 'Added animated particle background and interaction polish.'] }, { v: 'v1.1.4', d: '2026-03-28', m: false, i: ['Improved JD suggestion cards.', 'Refined export theme selector.'] }, { v: 'v1.1.0', d: '2026-03-10', m: false, i: ['State stability updates.', 'Minor UI consistency fixes.'] }].map((e) => <div className="tl" key={e.v}><div className="tl-l"><strong>{e.v}</strong><span>{e.d}</span></div><div className={`tl-b ${e.m ? 'major' : ''}`}><div className="badges"><span>Feature</span><span>Fix</span><span>Stability</span></div><ol>{e.i.map((x) => <li className="cl-step" key={x}>{x}</li>)}</ol></div></div>)}
            </div>
          </section>
        </main>
      </div>

      <div className={`modal-bg ${showModal ? 'open' : ''}`} onClick={() => setShowModal(false)}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <button className="modal-x" onClick={() => setShowModal(false)}>×</button>
          <h3>Set API Key</h3>
          <p className="sub">Key stays local in browser storage.</p>
          <div className="prov-grid">{([['anthropic', 'Anthropic', 'Claude models'], ['openai', 'OpenAI', 'GPT models'], ['gemini', 'Gemini', 'Google Gemini'], ['openrouter', 'OpenRouter', 'Multi-provider gateway']] as Array<[ProviderId, string, string]>).map(([id, label, desc]) => <button key={id} className={`prov ${draftKey.provider === id ? 'sel' : ''}`} onClick={() => setDraftKey((p) => ({ ...p, provider: id }))}><strong>{label}</strong><span>{desc}</span></button>)}</div>
          <label><span>API Key</span><input className="field" type="password" value={draftKey.key} onChange={(e) => setDraftKey((p) => ({ ...p, key: e.target.value }))} /></label>
          <label><span>Model Override</span><input className="field" value={draftKey.model} onChange={(e) => setDraftKey((p) => ({ ...p, model: e.target.value }))} /></label>
          {draftKey.provider === 'openrouter' && <label><span>Base URL</span><input className="field" value={draftKey.baseUrl} placeholder="https://openrouter.ai/api/v1" onChange={(e) => setDraftKey((p) => ({ ...p, baseUrl: e.target.value }))} /></label>}
          <div className="modal-actions"><button className="soft-btn" onClick={() => { removeKey(); setKeyConfig(BASE_KEY); setDraftKey(BASE_KEY); setStatusTimed('API key cleared'); }}>Clear Key</button><div className="sp" /><button className="soft-btn" onClick={() => setShowModal(false)}>Cancel</button><button className="pill-btn" onClick={saveModal}>Save &amp; Close</button></div>
        </div>
      </div>
    </>
  );
}
