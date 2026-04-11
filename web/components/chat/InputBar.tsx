'use client';

import { useRef } from 'react';

function autoResize(el: HTMLTextAreaElement) {
  el.style.height = 'auto';
  el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
}

export default function InputBar({
  value,
  disabled,
  onChange,
  onSend,
}: {
  value: string;
  disabled?: boolean;
  onChange: (v: string) => void;
  onSend: () => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  return (
    <div className="chat-input-wrap">
      <div className="input-bar">
        <textarea
          id="chat-ta"
          ref={ref}
          rows={1}
          value={value}
          placeholder="Tell Nexus about your profile, role target, or paste a JD..."
          onChange={(e) => {
            onChange(e.target.value);
            autoResize(e.target);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
        />
        <button className="send" onClick={onSend} disabled={disabled || !value.trim()}>
          ↑
        </button>
      </div>
      <div className="hint-row">
        <span>Enter to send · Shift+Enter for newline</span>
        <span>{value.length} chars</span>
      </div>
    </div>
  );
}
