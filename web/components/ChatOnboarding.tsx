'use client';
import { useState, useRef, useEffect } from 'react';
import { useNexusStore } from '@/lib/store';
import { useRouter } from 'next/navigation';

interface Message { role: 'user' | 'assistant'; content: string; }

export function ChatOnboarding() {
  const { aiProvider, aiKey, aiModel, setMCS } = useNexusStore();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hi! I'm Nexus. Tell me about yourself — paste your resume, LinkedIn bio, or just describe your career history. I'll extract and structure everything for you." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function send() {
    if (!input.trim()) return;
    const userMsg: Message = { role: 'user', content: input };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/ai/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': aiKey },
        body: JSON.stringify({ text: input, provider: aiProvider, model: aiModel }),
      });
      if (!res.ok) throw new Error(await res.text());
      const mcs = await res.json();
      setMCS(mcs);
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: `Great! I've extracted your career profile for ${mcs.personal?.name || 'you'}. Taking you to the editor...` },
      ]);
      setTimeout(() => router.push('/editor'), 1500);
    } catch (e) {
      setMessages((m) => [...m, { role: 'assistant', content: `Error: ${String(e)}. Make sure your API key is configured.` }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="chat-page" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="chat-scroll" style={{ flex: 1, overflowY: 'auto' }}>
        <div className="chat-inner" style={{ padding: 'var(--space-4)' }}>
          {messages.map((m, i) => (
            <div className={`msg ${m.role === 'user' ? 'u' : ''}`} key={i}>
              <div className="av">{m.role === 'user' ? 'U' : '✦'}</div>
              <div className="bub">{m.content}</div>
            </div>
          ))}
          {loading && (
            <div className="msg">
              <div className="av">✦</div>
              <div className="bub" style={{ color: 'var(--text-tertiary)' }}>Extracting...</div>
            </div>
          )}
          <div ref={endRef} />
        </div>
      </div>
      <div className="chat-input-wrap">
        <div className="input-bar">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Paste your resume or describe your career..."
            rows={1}
          />
          <button
            onClick={send}
            disabled={loading || !input.trim()}
            className="send dynamic-accent"
          >
            ↑
          </button>
        </div>
      </div>
    </div>
  );
}
