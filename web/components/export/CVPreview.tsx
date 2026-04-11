'use client';

import type { MCS } from '@nexus/schema';

export default function CVPreview({ mcs, zoom }: { mcs: MCS | null; zoom: number }) {
  return (
    <div className="ex-cv" style={{ transform: `scale(${zoom / 100})` }}>
      <h2>{mcs?.personal?.name || 'Alex Rivera'}</h2>
      <p>{mcs?.personal?.title || 'Senior Product Designer'} · {mcs?.personal?.email || 'alex@rivera.dev'} · {mcs?.personal?.location || 'Remote'}</p>
      <hr />
      <h5>Experience</h5>
      {(mcs?.experience ?? []).slice(0, 2).map((exp, i) => (
        <div key={`${exp.role}-${i}`}>
          <p><strong>{exp.role}</strong> — {exp.company}</p>
          <ul>{(exp.bullets ?? []).slice(0, 2).map((b) => <li key={b}>{b}</li>)}</ul>
        </div>
      ))}
      <h5>Expertise</h5>
      <div className="x-tags">{(mcs?.skills ?? []).slice(0, 6).map((s) => <span key={s.name}>{s.name}</span>)}</div>
    </div>
  );
}
