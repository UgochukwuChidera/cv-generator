'use client';

import type { MCS } from '@nexus/schema';
import type { ExportTheme } from './ThemePicker';

type DocumentType = 'resume' | 'cv' | 'cover-letter';

export default function CVPreview({
  mcs,
  zoom,
  theme,
  accent,
  fontFamily,
  documentType,
  coverLetter,
}: {
  mcs: MCS | null;
  zoom: number;
  theme: ExportTheme;
  accent: string;
  fontFamily: string;
  documentType: DocumentType;
  coverLetter: string;
}) {
  if (!mcs) {
    return (
      <div className="ex-cv" style={{ transform: `scale(${zoom / 100})` }}>
        <p>No profile data yet. Start in Chat or Editor.</p>
      </div>
    );
  }

  if (documentType === 'cover-letter') {
    return (
      <div
        className="ex-cv"
        style={{ transform: `scale(${zoom / 100})`, fontFamily }}
        data-theme={theme}
      >
        <h2 style={{ color: accent }}>Cover Letter</h2>
        <p>{mcs.personal?.name || 'Candidate'}</p>
        <hr />
        <pre className="cover-preview">{coverLetter || 'No cover letter generated yet. Use JD Targeting to generate one.'}</pre>
      </div>
    );
  }

  return (
    <div className="ex-cv" style={{ transform: `scale(${zoom / 100})`, fontFamily }} data-theme={theme}>
      <h2 style={{ color: accent }}>{mcs.personal?.name || 'Unnamed Candidate'}</h2>
      <p>{[mcs.personal?.title, mcs.personal?.email, mcs.personal?.location].filter(Boolean).join(' · ')}</p>
      <hr />
      {mcs.summary && <p>{mcs.summary}</p>}
      <h5>{documentType === 'cv' ? 'Professional Experience' : 'Experience'}</h5>
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
