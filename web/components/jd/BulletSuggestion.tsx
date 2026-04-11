'use client';

export default function BulletSuggestion({ text }: { text: string }) {
  return (
    <div className="bc">
      <span className="badge">High Impact</span>
      {text}
      <span className="copy-h">click to copy</span>
    </div>
  );
}
