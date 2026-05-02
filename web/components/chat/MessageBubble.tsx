'use client';

import Link from 'next/link';

export type ChatMessageModel = {
  id: number;
  role: 'user' | 'ai';
  text: string;
  bullets?: string[];
  quality?: number;
  toEditor?: boolean;
};

export default function MessageBubble({ message }: { message: ChatMessageModel }) {
  return (
    <div className={`msg ${message.role === 'user' ? 'u' : ''}`}>
      <div className="av">{message.role === 'ai' ? '✦' : 'U'}</div>
      <div>
        <div className="bub">
          {message.text}
          {typeof message.quality === 'number' && (
            <div style={{ marginTop: 8, color: 'var(--accent)', fontSize: 11 }}>Profile completeness: {message.quality}%</div>
          )}
          {message.bullets && message.bullets.length > 0 && (
            <ul style={{ marginTop: 8, paddingLeft: 16 }}>
              {message.bullets.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          )}
          {message.toEditor && (
            <div style={{ marginTop: 10 }}>
              <Link href="/editor" className="btn-primary">
                Open Editor
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}