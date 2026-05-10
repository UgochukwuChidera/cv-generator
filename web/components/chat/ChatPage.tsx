'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { MCS } from '@nexus/schema';
import { useNexusStore } from '@/lib/store';
import { assessMCSQuality, normalizeMCS, type MissingField } from '@/lib/mcs';
import { useShell } from '@/components/layout/ShellContext';
import InputBar from './InputBar';
import MessageBubble, { type ChatMessageModel } from './MessageBubble';

const CHIPS = [
  'Build my CV from scratch',
  'Extract my profile from this text',
  'What fields are still missing?',
  'Help me improve my latest experience bullets',
];

type ExtractResponse = {
  ok: boolean;
  error?: string;
  mcs: MCS;
  quality: { overall: number; missingFields: MissingField[] };
  clarificationQuestions: string[];
};

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

    const data = await res.json();
    if (!res.ok || !data.ok) throw new Error(data.error || 'Chat failed');

    if (data.mcs) {
      setMCS(data.mcs);
    }

    const quality = assessMCSQuality(data.mcs);
    pushAI(data.message, {
      quality: quality.overall,
      toEditor: true,
    });

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

      <InputBar
        value={input}
        onChange={setInput}
        onSend={() => send()}
      />
    </div>
  );
}
