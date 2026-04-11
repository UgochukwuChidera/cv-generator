'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useNexusStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';

type Msg = { role: 'user' | 'ai'; text: string; id: number };

const STARTERS = [
  { icon: '⚡', text: 'Software engineer, 6 yrs React & Node' },
  { icon: '🎨', text: 'Product designer, B2B SaaS focus' },
  { icon: '📊', text: 'Data analyst, Python & SQL specialist' },
  { icon: '☁️', text: 'DevOps/cloud engineer, AWS certified' },
];

const PROVIDERS = [
  { id: 'claude',      label: 'Claude',    prefix: 'sk-ant-' },
  { id: 'openai',      label: 'OpenAI',    prefix: 'sk-' },
  { id: 'gemini',      label: 'Gemini',    prefix: 'AIza' },
  { id: 'openrouter',  label: 'OpenRouter', prefix: 'sk-or-' },
] as const;

export default function Home() {
  const { aiProvider, aiKey, aiModel, setMCS, setProvider } = useNexusStore();
  const router = useRouter();
  const [msgs, setMsgs] = useState<Msg[]>([{
    role: 'ai', id: 0,
    text: "Hi — I'm Nexus.\n\nTell me about your career: your experience, skills, and the roles you're targeting. Paste a resume, drop a file, or just describe yourself.\n\nI'll build your professional profile from there.",
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showProvider, setShowProvider] = useState(false);
  const [localKey, setLocalKey] = useState(aiKey);
  const [localModel, setLocalModel] = useState(aiModel);
  const [localProvider, setLocalProvider] = useState(aiProvider);
  const msgCount = useRef(1);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, loading]);

  const onDrop = useCallback((files: File[]) => {
    const f = files[0]; if (!f) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      sendMessage(text, `📎 ${f.name} uploaded`);
    };
    reader.readAsText(f);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, noClick: true,
    accept: { 'text/*': ['.txt', '.md'], 'application/json': ['.json'], 'application/yaml': ['.yaml', '.yml'] },
  });

  function saveProvider() {
    setProvider(localProvider, localKey, localModel);
    setShowProvider(false);
  }

  async function sendMessage(rawText?: string, displayText?: string) {
    const text = rawText ?? input.trim();
    if (!text) return;
    if (!aiKey) { setShowProvider(true); return; }

    const id = msgCount.current++;
    setMsgs(m => [...m, { role: 'user', id, text: displayText ?? text }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': aiKey },
        body: JSON.stringify({ text, provider: aiProvider, model: aiModel }),
      });
      if (!res.ok) throw new Error(await res.text());
      const mcs = await res.json();
      setMCS(mcs);
      const name = mcs.personal?.name;
      const expCount = mcs.experience?.length ?? 0;
      const skillCount = mcs.skills?.length ?? 0;
      setMsgs(m => [...m, {
        role: 'ai', id: msgCount.current++,
        text: `Profile built${name ? ` for ${name}` : ''}.\n\n${expCount} experience ${expCount === 1 ? 'entry' : 'entries'} · ${skillCount} skills extracted · ready to refine.\n\nOpening your studio…`,
      }]);
      setTimeout(() => router.push('/editor'), 1600);
    } catch (e) {
      setMsgs(m => [...m, { role: 'ai', id: msgCount.current++, text: `Something went wrong. ${String(e)}\n\nCheck your API key is valid for the selected provider.` }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  function autosize(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    const ta = e.target;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 200) + 'px';
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }} {...getRootProps()}>
      <input {...getInputProps()} />

      {/* Ambient orbs */}
      <div className="orb" style={{ width: 500, height: 500, top: '-15%', left: '25%' }} />
      <div className="orb" style={{ width: 300, height: 300, bottom: '-10%', right: '30%', opacity: 0.10 }} />

      {/* Drag overlay */}
      {isDragActive && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(12,11,9,0.92)', backdropFilter: 'blur(12px)', gap: 12 }}>
          <div style={{ fontSize: 48 }}>📄</div>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--text)' }}>Drop to extract</p>
          <p className="caption">YAML · JSON · TXT · MD</p>
        </div>
      )}

      {/* Logo */}
      <div className="fade-up" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40 }}>
        <div style={{ width: 34, height: 34, background: 'var(--gold)', borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>⬡</div>
        <span className="display" style={{ fontSize: 22, fontWeight: 600, color: 'var(--text)' }}>Nexus</span>
      </div>

      {/* Chat window */}
      <div className="fade-up fade-up-d1" style={{ width: '100%', maxWidth: 620, display: 'flex', flexDirection: 'column' }}>

        {/* Messages */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 8, minHeight: 180, maxHeight: '46vh', overflowY: 'auto' }}>
          {msgs.map(msg => (
            <div key={msg.id} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              {msg.role === 'ai' && (
                <div style={{ width: 26, height: 26, borderRadius: 'var(--r)', background: 'var(--gold-dim)', border: '1px solid var(--border-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, marginRight: 8, marginTop: 2, flexShrink: 0 }}>⬡</div>
              )}
              <div className={msg.role === 'user' ? 'bubble-user' : 'bubble-ai'} style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 26, height: 26, borderRadius: 'var(--r)', background: 'var(--gold-dim)', border: '1px solid var(--border-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>⬡</div>
              <div className="bubble-ai" style={{ display: 'flex', gap: 5, alignItems: 'center', padding: '12px 16px' }}>
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="card" style={{ marginTop: 12, padding: '10px 10px 10px 16px', display: 'flex', alignItems: 'flex-end', gap: 8 }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={autosize}
            onKeyDown={handleKey}
            placeholder="Describe your career or paste resume text…"
            rows={1}
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', resize: 'none', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text)', lineHeight: 1.6, overflowY: 'hidden', maxHeight: 200 }}
          />
          <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
            className="btn btn-gold" style={{ padding: '8px 14px', borderRadius: 'var(--r)', fontSize: 13, flexShrink: 0 }}>
            {loading ? <span className="spinner spinner-sm" /> : '↑'}
          </button>
        </div>

        {/* Starters */}
        <div className="fade-up fade-up-d2" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12, justifyContent: 'center' }}>
          {STARTERS.map((s, i) => (
            <button key={i} onClick={() => setInput(s.text)}
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 99, padding: '5px 12px', fontSize: 12, color: 'var(--text-2)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, transition: 'all 0.12s' }}
              onMouseEnter={e => { (e.target as HTMLElement).closest('button')!.style.borderColor = 'var(--border-2)'; (e.target as HTMLElement).closest('button')!.style.color = 'var(--text)'; }}
              onMouseLeave={e => { (e.target as HTMLElement).closest('button')!.style.borderColor = 'var(--border)'; (e.target as HTMLElement).closest('button')!.style.color = 'var(--text-2)'; }}>
              <span>{s.icon}</span> {s.text}
            </button>
          ))}
          <button onClick={() => setShowProvider(true)}
            style={{ background: 'var(--gold-dim)', border: '1px solid rgba(255,77,109,0.28)', borderRadius: 99, padding: '5px 12px', fontSize: 12, color: 'var(--gold)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
            🔑 {aiKey ? `${aiProvider} key set` : 'Set API key'}
          </button>
        </div>
      </div>

      {/* Provider modal */}
      {showProvider && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(12,11,9,0.85)', backdropFilter: 'blur(8px)' }} onClick={() => setShowProvider(false)}>
          <div className="card" style={{ width: 420, padding: 28 }} onClick={e => e.stopPropagation()}>
            <p className="display" style={{ fontSize: 18, fontWeight: 600, marginBottom: 6, color: 'var(--text)' }}>AI provider</p>
            <p className="caption" style={{ marginBottom: 20 }}>Your key lives in your browser only — never sent to our servers.</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
              {PROVIDERS.map(p => (
                <button key={p.id} onClick={() => setLocalProvider(p.id)}
                  className="btn" style={{ justifyContent: 'center', background: localProvider === p.id ? 'var(--gold-dim)' : 'var(--surface-2)', border: `1px solid ${localProvider === p.id ? 'rgba(255,77,109,0.38)' : 'var(--border)'}`, color: localProvider === p.id ? 'var(--gold)' : 'var(--text-2)' }}>
                  {p.label}
                </button>
              ))}
            </div>

            <input className="nx-input" value={localKey} onChange={e => setLocalKey(e.target.value)}
              placeholder={`API key (${PROVIDERS.find(p => p.id === localProvider)?.prefix}…)`}
              type="password" style={{ marginBottom: 10 }} />
            <input className="nx-input" value={localModel} onChange={e => setLocalModel(e.target.value)}
              placeholder="Model override (optional, e.g. gpt-4o)" style={{ marginBottom: 16 }} />

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setShowProvider(false)}>Cancel</button>
              <button className="btn btn-gold" onClick={saveProvider}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Skip */}
      <div className="fade-up fade-up-d3" style={{ marginTop: 32 }}>
        <button onClick={() => router.push('/editor')} style={{ background: 'none', border: 'none', color: 'var(--text-3)', fontSize: 12, cursor: 'pointer' }}>
          Skip — go straight to editor →
        </button>
      </div>
    </div>
  );
}
