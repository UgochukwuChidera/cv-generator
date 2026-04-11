'use client';

import Link from 'next/link';
import type { MCS } from '@nexus/schema';

export default function LivePreview({ mcs }: { mcs: MCS }) {
  const p = mcs.personal;
  const first = mcs.experience[0];

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
          <h1>{p.name || 'Your Name'}</h1>
          <h2>{p.title || 'Role Title'}</h2>
          <p>{p.email || 'email@domain.com'} · {p.phone || '+1 000 000 0000'} · {p.location || 'Location'}</p>

          <section>
            <h3>Experience</h3>
            <div className="cv-role">
              <strong>{first.role || 'Role'}</strong>
              <span>{first.startDate || ''}{first.current ? ' — Present' : first.endDate ? ` — ${first.endDate}` : ''}</span>
            </div>
            <div className="cv-meta">{first.company || 'Company'}{first.location ? ` · ${first.location}` : ''}</div>
            <ul>
              {(first.bullets ?? []).slice(0, 3).map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </section>

          <section>
            <h3>Education</h3>
            {mcs.education.map((e, idx) => (
              <p key={`${e.institution}-${idx}`}>{e.institution} · {e.degree}</p>
            ))}
          </section>

          <section>
            <h3>Skills</h3>
            <p>{mcs.skills.map((s) => s.name).join(' · ')}</p>
          </section>
        </article>
      </div>
    </aside>
  );
}
