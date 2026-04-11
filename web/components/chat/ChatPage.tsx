'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { MCS } from '@nexus/schema';
import { useNexusStore } from '@/lib/store';
import { useShell } from '@/components/layout/ShellContext';
import InputBar from './InputBar';
import MessageBubble, { type ChatMessageModel } from './MessageBubble';
import type { DataRow } from './DataCard';

const CHIPS = [
  'Summarize my resume into a sharp profile',
  'Improve my experience bullets',
  'Extract skills and missing keywords',
  'Draft a short technical cover letter',
  'Target my CV for a product role',
];

function rowsFromMcs(mcs: MCS): DataRow[] {
  return [
    { label: 'Name', value: mcs.personal?.name ?? '' },
    { label: 'Title', value: mcs.personal?.title ?? '' },
    { label: 'Location', value: mcs.personal?.location ?? '' },
    { label: 'Email', value: mcs.personal?.email ?? '' },
    { label: 'Experience', value: `${mcs.experience?.length ?? 0} entries` },
    { label: 'Summary', value: mcs.summary ?? '', multiline: true },
  ];
}

export default function ChatPage() {
  const { aiKey, aiProvider, aiModel, setMCS } = useNexusStore();
  const { openApiKeyModal, setStatus } = useShell();

  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessageModel[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, typing]);

  const noMessages = useMemo(() => messages.length === 0, [messages.length]);

  async function send(raw?: string) {
    const text = (raw ?? input).trim();
    if (!text) return;
    if (!aiKey) {
      openApiKeyModal();
      return;
    }

    const userId = nextId.current++;
    setMessages((prev) => [...prev, { id: userId, role: 'user', text }]);
    setInput('');
    setTyping(true);

    try {
      const res = await fetch('/api/ai/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': aiKey,
          'x-provider': aiProvider,
        },
        body: JSON.stringify({ text, provider: aiProvider, model: aiModel }),
      });

      if (!res.ok) throw new Error(await res.text());
      const mcs = (await res.json()) as MCS;
      setMCS(mcs);
      const aiId = nextId.current++;
      setMessages((prev) => [
        ...prev,
        {
          id: aiId,
          role: 'ai',
          text: `Profile extracted${mcs.personal?.name ? ` for ${mcs.personal.name}` : ''}. You can edit the structured fields below.`,
          rows: rowsFromMcs(mcs),
        },
      ]);
      setStatus('Extraction complete');
    } catch (e) {
      const aiId = nextId.current++;
      setMessages((prev) => [
        ...prev,
        { id: aiId, role: 'ai', text: `Unable to extract profile right now. ${String(e)}` },
      ]);
      setStatus('Extraction failed');
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
              <div className="brand-lg">NEXUS</div>
              <p className="chat-subtitle">career intelligence</p>
              <div className="chips">
                {CHIPS.map((chip) => (
                  <button key={chip} className="pc" onClick={() => send(chip)}>
                    {chip}
                  </button>
                ))}
              </div>
              <div className="chat-note">Your API key is stored locally and sent directly to the provider</div>
            </div>
          )}

          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
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
      </div>

      <InputBar value={input} onChange={setInput} onSend={() => send()} />
    </div>
  );
}
