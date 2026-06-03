'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useNexusStore } from '@/lib/store';
import { assessMCSQuality, normalizeMCS } from '@/lib/mcs';
import { useShell } from '@/components/layout/ShellContext';
import InputBar from './InputBar';
import MessageBubble, { type ChatMessageModel } from './MessageBubble';
import MCSViewer from './MCSViewer';

const CHIPS = [
  'Build my CV from scratch',
  'Extract my profile from this text',
  'What fields are still missing?',
  'Help me improve my latest experience bullets',
];

export default function ChatPage() {
  const { aiKey, aiProvider, aiModel, tavilyKey, mcs: storeMcs, setMCS } = useNexusStore();
  const { openApiKeyModal, setStatus } = useShell();

  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessageModel[]>([]);
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, typing]);

  const noMessages = useMemo(() => messages.length === 0, [messages.length]);

  function pushAI(text: string, extra?: Partial<ChatMessageModel>) {
    const id = nextId.current++;
    setMessages((prev) => [...prev, { id, role: 'ai', text, ...extra }]);
    setChatHistory((prev) => [...prev, { role: 'assistant', content: text }]);
  }

  async function runChat(text: string) {
    const newHistory = [...chatHistory, { role: 'user' as const, content: text }];
    setChatHistory(newHistory);

    const aiId = nextId.current++;
    setMessages((prev) => [...prev, { id: aiId, role: 'ai', text: '' }]);
    setTyping(false);

    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': aiKey,
        'x-tavily-key': tavilyKey,
      },
      body: JSON.stringify({
        messages: newHistory,
        mcs: storeMcs,
        provider: aiProvider,
        model: aiModel,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Chat failed' }));
      throw new Error(err.error || 'Chat failed');
    }

    const reader = res.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let fullText = '';
    let done = false;

    while (!done) {
      const { value, done: streamDone } = await reader.read();
      done = streamDone;
      if (!value) continue;

      const chunk = decoder.decode(value, { stream: !done });
      for (const line of chunk.split('\n')) {
        if (!line.startsWith('data: ')) continue;
        try {
          const event = JSON.parse(line.slice(6));
          if (event.type === 'token') {
            fullText += event.text;
            setMessages((prev) => prev.map((m) => (m.id === aiId ? { ...m, text: fullText } : m)));
          } else if (event.type === 'done' && event.mcs) {
            setMCS(event.mcs);
            const quality = assessMCSQuality(event.mcs);
            setMessages((prev) =>
              prev.map((m) => (m.id === aiId ? { ...m, quality: quality.overall, toEditor: true } : m))
            );
          } else if (event.type === 'error') {
            throw new Error(event.error);
          }
        } catch { /* skip malformed events */ }
      }
    }

    setChatHistory((prev) => [...prev, { role: 'assistant', content: fullText }]);
    setStatus('Conversation updated');
  }

  function startScratch() {
    const emptyMcs = normalizeMCS({});
    setMCS(emptyMcs);
    pushAI(
      "Let's build your CV! I'm Nexus. What's your full name to get us started?",
      { bullets: [], toEditor: false }
    );
    setStatus('Starting fresh CV');
  }

  async function send(raw?: string) {
    const text = (raw ?? input).trim();
    if (!text) return;
    if (!aiKey) {
      openApiKeyModal();
      return;
    }

    if (text === 'Build my CV from scratch') {
      startScratch();
      return;
    }

    const userId = nextId.current++;
    setMessages((prev) => [...prev, { id: userId, role: 'user', text }]);
    setInput('');
    setTyping(true);

    try {
      await runChat(text);
    } catch (error) {
      pushAI(`I could not process that yet: ${String(error)}`);
      setStatus('AI request failed');
    } finally {
      setTyping(false);
    }
  }


  return (
    <div className="chat-page">
      <div className="chat-scroll" ref={scrollRef}>
        <div className="chat-inner">
          {noMessages && (
            <div className="chat-empty">
              <div className="brand-lg">Nexus</div>
              <p className="chat-subtitle">AI-Powered Career Intelligence</p>
              <div className="chips">
                {CHIPS.map((chip) => (
                  <button key={chip} className="pc" onClick={() => send(chip)}>
                    {chip}
                  </button>
                ))}
              </div>
              <div className="chat-note">Upload resume files or paste text to begin profile extraction.</div>
            </div>
          )}

          {messages.map((message) => (
            <MessageBubble 
              key={message.id} 
              message={message}
              onRetry={(text) => {
                setInput(text);
                send(text);
              }}
              onCopy={() => setStatus('Copied to clipboard')}
            />
          ))}

          {typing && (
            <div className="msg">
              <div className="av">✦</div>
              <div className="typing bub">
                <span className="td" />
                <span className="td" />
                <span className="td" />
              </div>
            </div>
          )}
        </div>
        <MCSViewer mcs={storeMcs} />
      </div>

      <InputBar
        value={input}
        onChange={setInput}
        onSend={() => send()}
      />
    </div>
  );
}
