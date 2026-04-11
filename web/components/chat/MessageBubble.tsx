'use client';

import DataCard, { type DataRow } from './DataCard';

export type ChatMessageModel = {
  id: number;
  role: 'user' | 'ai';
  text: string;
  rows?: DataRow[];
};

export default function MessageBubble({ message }: { message: ChatMessageModel }) {
  return (
    <div className={`msg ${message.role === 'user' ? 'u' : ''}`}>
      <div className="av">{message.role === 'ai' ? '✦' : 'U'}</div>
      <div>
        <div className="bub">{message.text}</div>
        {message.rows && message.rows.length > 0 && <DataCard rows={message.rows} />}
      </div>
    </div>
  );
}
