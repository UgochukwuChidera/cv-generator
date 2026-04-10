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
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-4 p-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
              m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl px-4 py-3 text-sm text-gray-500 animate-pulse">Extracting...</div>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div className="border-t p-4 flex gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Paste your resume or describe your career..."
          rows={3}
          className="flex-1 border rounded-xl px-4 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );
}
