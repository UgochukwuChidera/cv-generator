'use client';

import type { MCS } from '@nexus/schema';
import type { ExportTheme } from './ThemePicker';

type DocumentType = 'resume' | 'cv' | 'cover-letter';
export const NO_COVER_LETTER_MESSAGE = 'No cover letter generated yet. Use the Cover Letter Studio in Export to create one.';

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
        <p>{[mcs.personal?.email, mcs.personal?.phone, mcs.personal?.location].filter(Boolean).join(' · ')}</p>
        <hr />
        <pre className="cover-preview">{coverLetter || NO_COVER_LETTER_MESSAGE}</pre>
      </div>
    );
  }

  return (
    <div className="ex-cv" style={{ transform: `scale(${zoom / 100})`, fontFamily, ['--accent' as string]: accent }} data-theme={theme}>
      <h2>{mcs.personal?.name || 'Unnamed Candidate'}</h2>
      <p>{[mcs.personal?.title, mcs.personal?.email, mcs.personal?.phone, mcs.personal?.location].filter(Boolean).join(' · ')}</p>
      <hr />
      {mcs.summary && <p>{mcs.summary}</p>}
      <h5>{documentType === 'cv' ? 'Professional Experience' : 'Experience'}</h5>
      {(mcs.experience ?? []).slice(0, documentType === 'cv' ? 5 : 3).map((exp, i) => (
        <div key={`${exp.role}-${i}`}>
          <p><strong>{exp.role}</strong> — {exp.company}</p>
          <p className="meta-line">{[exp.location, exp.startDate, exp.current ? 'Present' : exp.endDate].filter(Boolean).join(' · ')}</p>
          <ul>{(exp.bullets ?? []).slice(0, 3).map((b, idx) => <li key={`${b}-${idx}`}>{b}</li>)}</ul>
        </div>
      ))}
      {(mcs.projects ?? []).length > 0 && (
        <>
          <h5>Projects</h5>
          {(mcs.projects ?? []).slice(0, 2).map((project, idx) => (
            <p key={`${project.name}-${idx}`}>
              <strong>{project.name}</strong>
              {project.description ? ` — ${project.description}` : ''}
            </p>
          ))}
        </>
      )}
      {(mcs.education ?? []).length > 0 && (
        <>
          <h5>Education</h5>
          {(mcs.education ?? []).slice(0, 2).map((education, idx) => (
            <p key={`${education.institution}-${idx}`}>
              <strong>{education.institution}</strong> · {[education.degree, education.field].filter(Boolean).join(' in ')}
            </p>
          ))}
        </>
      )}
      <h5>Skills</h5>
      <div className="x-tags">{(mcs.skills ?? []).slice(0, documentType === 'cv' ? 18 : 12).map((s) => <span key={s.name}>{s.name}</span>)}</div>
    </div>
  );
}
