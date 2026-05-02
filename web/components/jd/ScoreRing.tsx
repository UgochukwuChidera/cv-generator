'use client';

import { useEffect, useMemo, useState } from 'react';

export default function ScoreRing({ score }: { score: number }) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const r = 55;
  const circumference = 2 * Math.PI * r;
  const targetOffset = useMemo(() => circumference - (clamped / 100) * circumference, [clamped, circumference]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = window.requestAnimationFrame(() => setMounted(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  return (
    <div className="score-ring-wrap">
      <svg width="130" height="130" viewBox="0 0 130 130">
        <circle cx="65" cy="65" r={r} fill="none" stroke="rgba(44,50,64,0.8)" strokeWidth="10" />
        <circle
          cx="65"
          cy="65"
          r={r}
          fill="none"
          stroke="var(--red)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={mounted ? targetOffset : circumference}
          transform="rotate(-90 65 65)"
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)', filter: 'drop-shadow(0 0 5px rgba(255,77,106,0.4))' }}
        />
      </svg>
      <div className="fit">{clamped}%</div>
    </div>
  );
}
