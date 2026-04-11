'use client';

import { useState } from 'react';

export default function BulletSuggestion({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      className="bc"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1200);
      }}
    >
      <span className="badge">Suggestion</span>
      {text}
      <span className="copy-h">{copied ? 'copied' : 'click to copy'}</span>
    </button>
  );
}
