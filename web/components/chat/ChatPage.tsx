'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { MCS } from '@nexus/schema';
import { useNexusStore } from '@/lib/store';
import type { MissingField } from '@/lib/mcs';
import { useShell } from '@/components/layout/ShellContext';
import InputBar, { type UploadedFilePayload } from './InputBar';
import MessageBubble, { type ChatMessageModel } from './MessageBubble';

const CHIPS = [
  'Extract my profile from this text',
  'What fields are still missing?',
  'Help me improve my latest experience bullets',
  'Prepare me for JD targeting',
];

type ExtractResponse = {
  ok: boolean;
  error?: string;
  mcs: MCS;
  quality: { overall: number; missingFields: MissingField[] };
  clarificationQuestions: string[];
};

export default function ChatPage() {
  const { aiKey, aiProvider, aiModel, setMCS } = useNexusStore();
  const { openApiKeyModal, setStatus } = useShell();

  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessageModel[]>([]);
  const [draft, setDraft] = useState<MCS | null>(null);
  const [missing, setMissing] = useState<MissingField[]>([]);
  const [upload, setUpload] = useState<UploadedFilePayload | null>(null);
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
  }

  async function runExtract(text: string, file: UploadedFilePayload | null) {
    const res = await fetch('/api/ai/extract', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': aiKey,
        'x-provider': aiProvider,
      },
      body: JSON.stringify({ text, file, provider: aiProvider, model: aiModel }),
    });

    const data = (await res.json()) as ExtractResponse;
    if (!res.ok || !data.ok) throw new Error(data.error || 'Extraction failed');

    setDraft(data.mcs);
    setMCS(data.mcs);
    setMissing(data.quality.missingFields ?? []);

    pushAI(
      data.quality.missingFields?.length
        ? 'I extracted a draft profile and found missing details. Answer the prompts below or continue in Editor.'
        : 'Your profile looks complete and ready for editing/export.',
      {
        quality: data.quality.overall,
        bullets: data.clarificationQuestions,
        toEditor: true,
      }
    );

    setStatus('Profile extracted');
  }

  async function runClarify(text: string) {
    if (!draft) return;

    const firstMissing = missing[0];
    const answers = firstMissing ? { [firstMissing.path]: text } : undefined;

    const res = await fetch('/api/ai/clarify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': aiKey,
        'x-provider': aiProvider,
      },
      body: JSON.stringify({
        mcs: draft,
        text,
        answers,
        provider: aiProvider,
        model: aiModel,
      }),
    });

    const data = (await res.json()) as ExtractResponse;
    if (!res.ok || !data.ok) throw new Error(data.error || 'Clarification failed');

    setDraft(data.mcs);
    setMCS(data.mcs);
    setMissing(data.quality.missingFields ?? []);

    pushAI(
      data.quality.missingFields?.length
        ? 'Thanks — updated. A few fields are still missing.'
        : 'Great — profile is now complete and ready for JD targeting/export.',
      {
        quality: data.quality.overall,
        bullets: data.clarificationQuestions,
        toEditor: true,
      }
    );

    setStatus('Clarification merged');
  }

  async function send(raw?: string) {
    const text = (raw ?? input).trim();
    if (!text && !upload) return;
    if (!aiKey) {
      openApiKeyModal();
      return;
    }

    const userId = nextId.current++;
    const fileLabel = upload ? `Uploaded file: ${upload.name}` : '';
    setMessages((prev) => [...prev, { id: userId, role: 'user', text: [text, fileLabel].filter(Boolean).join('\n') }]);
    setInput('');
    setTyping(true);

    try {
      if (!draft || upload) {
        await runExtract(text, upload);
      } else {
        await runClarify(text);
      }
      setUpload(null);
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
              <div className="brand-lg">NEXUS</div>
              <p className="chat-subtitle">guided profile extraction</p>
              <div className="chips">
                {CHIPS.map((chip) => (
                  <button key={chip} className="pc" onClick={() => send(chip)}>
                    {chip}
                  </button>
                ))}
              </div>
              <div className="chat-note">Upload resume files or paste text to start, then answer clarification prompts.</div>
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
        onUpload={(file) => {
          setUpload(file);
          setStatus(`Selected ${file.name}`);
        }}
      />
    </div>
  );
}
