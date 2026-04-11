'use client';

import type { MCS } from '@nexus/schema';

export default function CVPreview({ mcs, zoom }: { mcs: MCS | null; zoom: number }) {
  if (!mcs) {
    return (
      <div className="ex-cv" style={{ transform: `scale(${zoom / 100})` }}>
        <p>No profile data yet. Start in Chat or Editor.</p>
      </div>
    );
  }

  return (
    <div className="ex-cv" style={{ transform: `scale(${zoom / 100})` }}>
      <h2>{mcs.personal?.name || 'Unnamed Candidate'}</h2>
      <p>{[mcs.personal?.title, mcs.personal?.email, mcs.personal?.location].filter(Boolean).join(' · ')}</p>
      <hr />
      {mcs.summary && <p>{mcs.summary}</p>}
      <h5>Experience</h5>
      {(mcs.experience ?? []).slice(0, 3).map((exp, i) => (
        <div key={`${exp.role}-${i}`}>
          <p><strong>{exp.role}</strong> — {exp.company}</p>
          <ul>{(exp.bullets ?? []).slice(0, 3).map((b, idx) => <li key={`${b}-${idx}`}>{b}</li>)}</ul>
        </div>
      ))}
      <h5>Skills</h5>
      <div className="x-tags">{(mcs.skills ?? []).slice(0, 10).map((s) => <span key={s.name}>{s.name}</span>)}</div>
    </div>
  );
}
