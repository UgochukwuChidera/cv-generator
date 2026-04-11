'use client';

export default function BulletRow({
  value,
  onChange,
  onImprove,
}: {
  value: string;
  onChange: (v: string) => void;
  onImprove: () => void;
}) {
  return (
    <div className="bullet-row2">
      <span className="bdot" />
      <textarea className="bullet-field" rows={2} value={value} onChange={(e) => onChange(e.target.value)} />
      <button className="ai-btn" onClick={onImprove} title="AI improve">
        ✦
      </button>
    </div>
  );
}
