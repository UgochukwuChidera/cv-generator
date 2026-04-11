'use client';

import { useRef } from 'react';

function autoResize(el: HTMLTextAreaElement) {
  el.style.height = 'auto';
  el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
}

export type UploadedFilePayload = {
  name: string;
  mimeType?: string;
  base64: string;
};

async function toPayload(file: File): Promise<UploadedFilePayload> {
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? '');
      const [, encoded = ''] = result.split(',');
      resolve(encoded);
    };
    reader.onerror = () => reject(new Error('Failed to read upload'));
    reader.readAsDataURL(file);
  });

  return {
    name: file.name,
    mimeType: file.type,
    base64,
  };
}

export default function InputBar({
  value,
  disabled,
  onChange,
  onSend,
  onUpload,
}: {
  value: string;
  disabled?: boolean;
  onChange: (v: string) => void;
  onSend: () => void;
  onUpload?: (file: UploadedFilePayload) => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="chat-input-wrap">
      <div className="input-bar">
        <button
          className="btn-ghost"
          type="button"
          onClick={() => fileRef.current?.click()}
          title="Attach file"
          aria-label="Attach file"
        >
          📎
        </button>

        <input
          ref={fileRef}
          hidden
          type="file"
          accept=".txt,.pdf,.docx,.json,.yaml,.yml"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file || !onUpload) return;
            onUpload(await toPayload(file));
            e.currentTarget.value = '';
          }}
        />

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
        <span>Upload TXT/PDF/DOCX/JSON/YAML · Enter to send · Shift+Enter newline</span>
        <span>{value.length} chars</span>
      </div>
    </div>
  );
}
