'use client';

import Link from 'next/link';
import type { MCS } from '@nexus/schema';

export default function LivePreview({ mcs }: { mcs: MCS }) {
  const p = mcs.personal;

  return (
    <aside className="ed-prev">
      <div className="ed-prev-h">
        <span>Live Preview</span>
        <Link href="/export" className="btn-ghost">
          Export →
        </Link>
      </div>
      <div className="cv-wrap">
        <article className="cv-page">
          <h1>{p.name || 'Unnamed Candidate'}</h1>
          <h2>{[p.title, p.email, p.phone, p.location].filter(Boolean).join(' · ')}</h2>

          {mcs.summary && (
            <section>
              <h3>Summary</h3>
              <p>{mcs.summary}</p>
            </section>
          )}

          {mcs.experience.length > 0 && (
            <section>
              <h3>Experience</h3>
              {mcs.experience.map((exp, idx) => (
                <div key={`${exp.company}-${idx}`} style={{ marginBottom: 8 }}>
                  <div className="cv-role">
                    <strong>{[exp.role, exp.company].filter(Boolean).join(' — ')}</strong>
                    <span>{[exp.startDate, exp.current ? 'Present' : exp.endDate].filter(Boolean).join(' — ')}</span>
                  </div>
                  {exp.location && <div className="cv-meta">{exp.location}</div>}
                  {(exp.bullets ?? []).length > 0 && (
                    <ul>
                      {(exp.bullets ?? []).map((b, i) => (
                        <li key={`${b}-${i}`}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </section>
          )}

          {mcs.education.length > 0 && (
            <section>
              <h3>Education</h3>
              {mcs.education.map((e, idx) => (
                <p key={`${e.institution}-${idx}`}>
                  {[e.institution, [e.degree, e.field].filter(Boolean).join(' in ')].filter(Boolean).join(' · ')}
                </p>
              ))}
            </section>
          )}

          {mcs.skills.length > 0 && (
            <section>
              <h3>Skills</h3>
              <p>{mcs.skills.map((s) => s.name).join(' · ')}</p>
            </section>
          )}

          {(mcs.projects ?? []).length > 0 && (
            <section>
              <h3>Projects</h3>
              {(mcs.projects ?? []).map((project, idx) => (
                <p key={`${project.name}-${idx}`}>
                  {[project.name, project.url].filter(Boolean).join(' · ')}
                </p>
              ))}
            </section>
          )}

          {(mcs.languages ?? []).length > 0 && (
            <section>
              <h3>Languages</h3>
              <p>{(mcs.languages ?? []).map((l) => [l.language, l.proficiency].filter(Boolean).join(' ')).join(' · ')}</p>
            </section>
          )}
        </article>
      </div>
    </aside>
  );
}
