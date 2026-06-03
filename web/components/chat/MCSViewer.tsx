'use client';

import { useState } from 'react';
import type { MCS } from '@nexus/schema';

type CollapsibleSectionProps = {
  title: string;
  count?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
};

function Section({ title, count, defaultOpen = false, children }: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mcsv-section">
      <button className="mcsv-header" onClick={() => setOpen(!open)}>
        <span className="mcsv-title">
          <span className={`mcsv-arrow ${open ? 'open' : ''}`}>▶</span>
          {title}
        </span>
        {count && <span className="mcsv-count">{count}</span>}
      </button>
      {open && <div className="mcsv-body">{children}</div>}
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="mcsv-field">
      <span className="mcsv-label">{label}</span>
      <span className="mcsv-value">{value}</span>
    </div>
  );
}

export default function MCSViewer({ mcs }: { mcs: MCS | null }) {
  const [collapsed, setCollapsed] = useState(false);
  if (!mcs) return null;

  const p = mcs.personal;
  const sections = [
    {
      key: 'Personal',
      count: p?.name ? '1 profile' : '0',
      content: (
        <>
          <Field label="Name" value={p?.name} />
          <Field label="Title" value={p?.title} />
          <Field label="Email" value={p?.email} />
          <Field label="Phone" value={p?.phone} />
          <Field label="Location" value={p?.location} />
          <Field label="Website" value={p?.website} />
          <Field label="LinkedIn" value={p?.linkedin} />
          <Field label="GitHub" value={p?.github} />
          <Field label="Twitter" value={p?.twitter} />
        </>
      ),
    },
    {
      key: 'Summary',
      count: mcs.summary ? `${mcs.summary.length} chars` : 'empty',
      content: mcs.summary ? <div className="mcsv-summary-text">{mcs.summary}</div> : <div className="mcsv-empty">No summary</div>,
    },
    {
      key: 'Experience',
      count: `${mcs.experience.length} entries`,
      content: mcs.experience.length === 0 ? <div className="mcsv-empty">No experience entries</div> : (
        <>
          {mcs.experience.map((exp, i) => (
            <div className="mcsv-entry" key={`exp-${i}`}>
              <div className="mcsv-entry-title">{exp.role || 'Untitled'} {exp.company ? `@ ${exp.company}` : ''}</div>
              <div className="mcsv-entry-meta">{exp.startDate || '?'} – {exp.current ? 'Present' : exp.endDate || '?'}{exp.location ? ` · ${exp.location}` : ''}</div>
              {(exp.bullets ?? []).length > 0 && (
                <ul className="mcsv-bullets">
                  {exp.bullets.filter(Boolean).map((b, j) => <li key={j}>{b}</li>)}
                </ul>
              )}
            </div>
          ))}
        </>
      ),
    },
    {
      key: 'Education',
      count: `${mcs.education.length} entries`,
      content: mcs.education.length === 0 ? <div className="mcsv-empty">No education entries</div> : (
        <>
          {mcs.education.map((edu, i) => (
            <div className="mcsv-entry" key={`edu-${i}`}>
              <div className="mcsv-entry-title">{edu.institution || 'Unknown'}</div>
              <div className="mcsv-entry-meta">{[edu.degree, edu.field].filter(Boolean).join(' in ')}{edu.gpa ? ` · GPA: ${edu.gpa}` : ''}{[edu.startDate, edu.endDate].filter(Boolean).join(' – ') ? ` · ${[edu.startDate, edu.endDate].filter(Boolean).join(' – ')}` : ''}</div>
            </div>
          ))}
        </>
      ),
    },
    {
      key: 'Skills',
      count: `${mcs.skills.length} skills`,
      content: mcs.skills.length === 0 ? <div className="mcsv-empty">No skills</div> : (
        <div className="mcsv-skills-grid">
          {mcs.skills.map((s, i) => (
            <span className="mcsv-skill-chip" key={`skill-${i}`}>{s.name}{s.category ? ` (${s.category})` : ''}</span>
          ))}
        </div>
      ),
    },
    {
      key: 'Projects',
      count: `${(mcs.projects ?? []).length} projects`,
      content: (mcs.projects ?? []).length === 0 ? <div className="mcsv-empty">No projects</div> : (
        <>
          {mcs.projects?.map((proj, i) => (
            <div className="mcsv-entry" key={`proj-${i}`}>
              <div className="mcsv-entry-title">{proj.name || 'Untitled'}{proj.url ? ` · ${proj.url}` : ''}</div>
              {proj.description && <div className="mcsv-entry-meta">{proj.description}</div>}
              {(proj.tech ?? []).length > 0 && (
                <div className="mcsv-skills-grid" style={{ marginTop: 6 }}>
                  {proj.tech.map((t, j) => <span className="mcsv-tech-chip" key={j}>{t}</span>)}
                </div>
              )}
            </div>
          ))}
        </>
      ),
    },
    {
      key: 'Languages',
      count: `${(mcs.languages ?? []).length} languages`,
      content: (mcs.languages ?? []).length === 0 ? <div className="mcsv-empty">No languages</div> : (
        <>
          {mcs.languages?.map((lang, i) => (
            <div className="mcsv-entry" key={`lang-${i}`} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <span className="mcsv-entry-title">{lang.language}</span>
              {lang.proficiency && <span className="mcsv-proficiency">{lang.proficiency}</span>}
            </div>
          ))}
        </>
      ),
    },
  ];

  return (
    <div className="mcsv-root">
      <button className="mcsv-toggle" onClick={() => setCollapsed(!collapsed)}>
        <span className={`mcsv-toggle-arrow ${collapsed ? '' : 'open'}`}>▼</span>
        CV Data
        <span className="mcsv-version">v{mcs.meta?.version ?? 1}</span>
      </button>
      {!collapsed && (
        <div className="mcsv-inner">
          {sections.map((s) => (
            <Section key={s.key} title={s.key} count={s.count}>
              {s.content}
            </Section>
          ))}
        </div>
      )}
    </div>
  );
}
