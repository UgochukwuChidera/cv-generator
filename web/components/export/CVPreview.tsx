'use client';

import type { MCS } from '@nexus/schema';
import type { ExportTheme } from './ThemePicker';

type DocumentType = 'resume' | 'cv' | 'cover-letter';
export const NO_COVER_LETTER_MESSAGE =
  'No cover letter generated yet. Use the Cover Letter Studio in Export to create one.';

/* ─────────────────────────────────────────────
   Shared helpers
───────────────────────────────────────────── */
function esc(s?: string | null) {
  return s ?? '';
}

function Pill({ text, accent }: { text: string; accent: string }) {
  return (
    <span
      style={{
        display: 'inline-block',
        border: `1px solid ${accent}55`,
        borderRadius: 999,
        padding: '2px 9px',
        fontSize: 10,
        color: accent,
        marginRight: 5,
        marginBottom: 4,
        letterSpacing: '0.04em',
      }}
    >
      {text}
    </span>
  );
}

/* ─────────────────────────────────────────────
   PROFESSIONAL — burgundy top bar, serif name,
   ruled section headers, tight ATS layout
───────────────────────────────────────────── */
function ProfessionalTemplate({ mcs, maxExp, maxProj, accent, fontFamily }: { mcs: MCS; maxExp: number; maxProj: number; accent: string; fontFamily: string }) {
  const p = mcs.personal;
  return (
    <div
      style={{
        fontFamily,
        background: '#fff',
        color: '#1a1a1a',
        lineHeight: 1.55,
      }}
    >
      {/* Top accent bar */}
      <div style={{ height: 5, background: accent }} />
      <div style={{ padding: '20px 24px 0' }}>
        {/* Header */}
        <div style={{ borderBottom: `2px solid ${accent}`, paddingBottom: 12, marginBottom: 12 }}>
          <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px', color: '#111' }}>
            {esc(p.name) || 'Your Name'}
          </div>
          <div style={{ fontSize: 12, color: '#555', marginTop: 3, fontFamily: 'Arial, sans-serif' }}>
            {[p.title, p.email, p.phone, p.location].filter(Boolean).join('  ·  ')}
          </div>
          {(p.linkedin || p.github) && (
            <div style={{ fontSize: 11, color: accent, marginTop: 2, fontFamily: 'Arial, sans-serif' }}>
              {[p.linkedin, p.github].filter(Boolean).join('  ·  ')}
            </div>
          )}
        </div>

        {/* Summary */}
        {mcs.summary && (
          <Section label="Professional Summary" accent={accent}>
            <p style={{ margin: 0, fontSize: 11.5, lineHeight: 1.65, color: '#333' }}>{mcs.summary}</p>
          </Section>
        )}

        {/* Experience */}
        {mcs.experience.length > 0 && (
          <Section label="Experience" accent={accent}>
            {mcs.experience.slice(0, maxExp).map((e, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>{esc(e.role)}</span>
                  <span style={{ fontSize: 10, color: '#666', fontFamily: 'Arial, sans-serif', whiteSpace: 'nowrap', marginLeft: 8 }}>
                    {[e.startDate, e.current ? 'Present' : e.endDate].filter(Boolean).join(' – ')}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: '#555', fontStyle: 'italic', marginBottom: 3, fontFamily: 'Arial, sans-serif' }}>
                  {esc(e.company)}{e.location ? `, ${e.location}` : ''}
                </div>
                {(e.bullets ?? []).length > 0 && (
                  <ul style={{ margin: '3px 0 0 14px', padding: 0, fontSize: 11 }}>
                    {(e.bullets ?? []).map((b, j) => (
                      <li key={j} style={{ marginBottom: 2, color: '#333' }}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </Section>
        )}

        {/* Education */}
        {mcs.education.length > 0 && (
          <Section label="Education" accent={accent}>
            {mcs.education.map((e, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <div>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>{esc(e.institution)}</span>
                  <span style={{ fontSize: 11, color: '#555', fontStyle: 'italic', marginLeft: 6, fontFamily: 'Arial, sans-serif' }}>
                    {[e.degree, e.field ? `in ${e.field}` : ''].filter(Boolean).join(' ')}
                  </span>
                </div>
                <span style={{ fontSize: 10, color: '#666', fontFamily: 'Arial, sans-serif', whiteSpace: 'nowrap' }}>
                  {[e.startDate, e.endDate].filter(Boolean).join(' – ')}
                </span>
              </div>
            ))}
          </Section>
        )}

        {/* Skills */}
        {mcs.skills.length > 0 && (
          <Section label="Skills" accent={accent}>
            <div style={{ fontSize: 11.5, color: '#333', lineHeight: 1.8 }}>
              {mcs.skills.map((s) => s.name).join('  ·  ')}
            </div>
          </Section>
        )}

        {/* Projects */}
        {(mcs.projects ?? []).length > 0 && (
          <Section label="Projects" accent={accent}>
            {(mcs.projects ?? []).slice(0, maxProj).map((proj, i) => (
              <div key={i} style={{ marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 700 }}>{esc(proj.name)}</span>
                {proj.description && (
                  <span style={{ fontSize: 11, color: '#555', marginLeft: 6, fontFamily: 'Arial, sans-serif' }}>
                    — {proj.description}
                  </span>
                )}
              </div>
            ))}
          </Section>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MODERN — dark left sidebar with initials +
   contact, white right content area, blue accents
───────────────────────────────────────────── */
function ModernTemplate({ mcs, maxExp, maxProj, accent, fontFamily }: { mcs: MCS; maxExp: number; maxProj: number; accent: string; fontFamily: string }) {
  const p = mcs.personal;
  const sidebar = '#0f172a';
  const initials = (p.name ?? '')
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase() || 'YN';

  return (
    <div
      style={{
        fontFamily,
        display: 'flex',
        background: '#fff',
        color: '#1e293b',
        lineHeight: 1.55,
        minHeight: 400,
      }}
    >
      {/* Sidebar */}
      <div style={{ width: 130, background: sidebar, padding: '20px 14px', flexShrink: 0 }}>
        {/* Avatar */}
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            background: accent,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            fontWeight: 700,
            color: '#fff',
            margin: '0 auto 14px',
            letterSpacing: '-1px',
          }}
        >
          {initials}
        </div>

        {/* Contact */}
        <SidebarSection label="Contact" light>
          {p.email && <SidebarItem text={p.email} accent={accent} />}
          {p.phone && <SidebarItem text={p.phone} accent={accent} />}
          {p.location && <SidebarItem text={p.location} accent={accent} />}
          {p.linkedin && <SidebarItem text="LinkedIn" accent={accent} />}
          {p.github && <SidebarItem text="GitHub" accent={accent} />}
        </SidebarSection>

        {/* Skills */}
        {mcs.skills.length > 0 && (
          <SidebarSection label="Skills" light>
            {mcs.skills.slice(0, 10).map((s, i) => (
              <div
                key={i}
                style={{
                  fontSize: 9.5,
                  color: '#94a3b8',
                  marginBottom: 4,
                  paddingBottom: 4,
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                {s.name}
              </div>
            ))}
          </SidebarSection>
        )}

        {/* Languages */}
        {(mcs.languages ?? []).length > 0 && (
          <SidebarSection label="Languages" light>
            {(mcs.languages ?? []).map((l, i) => (
              <div key={i} style={{ fontSize: 9.5, color: '#94a3b8', marginBottom: 3 }}>
                {l.language}
                {l.proficiency && (
                  <span style={{ color: '#475569', marginLeft: 4 }}>{l.proficiency}</span>
                )}
              </div>
            ))}
          </SidebarSection>
        )}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: '20px 18px' }}>
        {/* Name + title */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px', color: '#0f172a' }}>
            {esc(p.name) || 'Your Name'}
          </div>
          {p.title && (
            <div style={{ fontSize: 12, color: accent, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>
              {p.title}
            </div>
          )}
        </div>

        {mcs.summary && (
          <p style={{ fontSize: 11, color: '#475569', lineHeight: 1.7, margin: '0 0 14px', borderLeft: `3px solid ${accent}`, paddingLeft: 10 }}>
            {mcs.summary}
          </p>
        )}

        {mcs.experience.length > 0 && (
          <ModernSection label="Experience" accent={accent}>
            {mcs.experience.slice(0, maxExp).map((e, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>{esc(e.role)}</span>
                  <span style={{ fontSize: 10, color: '#94a3b8', whiteSpace: 'nowrap', marginLeft: 8 }}>
                    {[e.startDate, e.current ? 'Present' : e.endDate].filter(Boolean).join(' – ')}
                  </span>
                </div>
                <div style={{ fontSize: 10.5, color: accent, marginBottom: 3 }}>
                  {esc(e.company)}{e.location ? ` · ${e.location}` : ''}
                </div>
                {(e.bullets ?? []).length > 0 && (
                  <ul style={{ margin: '3px 0 0 12px', padding: 0, fontSize: 10.5 }}>
                    {(e.bullets ?? []).map((b, j) => (
                      <li key={j} style={{ marginBottom: 2, color: '#334155' }}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </ModernSection>
        )}

        {mcs.education.length > 0 && (
          <ModernSection label="Education" accent={accent}>
            {mcs.education.map((e, i) => (
              <div key={i} style={{ marginBottom: 6 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>{esc(e.institution)}</div>
                <div style={{ fontSize: 10.5, color: '#64748b' }}>
                  {[e.degree, e.field ? `in ${e.field}` : ''].filter(Boolean).join(' ')}
                  {e.endDate ? ` · ${e.endDate}` : ''}
                </div>
              </div>
            ))}
          </ModernSection>
        )}

        {(mcs.projects ?? []).length > 0 && (
          <ModernSection label="Projects" accent={accent}>
            {(mcs.projects ?? []).slice(0, maxProj).map((proj, i) => (
              <div key={i} style={{ marginBottom: 6 }}>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: '#0f172a' }}>{esc(proj.name)}</span>
                {proj.description && (
                  <span style={{ fontSize: 10.5, color: '#64748b', marginLeft: 6 }}>— {proj.description}</span>
                )}
                {(proj.tech ?? []).length > 0 && (
                  <div style={{ marginTop: 3 }}>
                    {(proj.tech ?? []).map((t) => <Pill key={t} text={t} accent={accent} />)}
                  </div>
                )}
              </div>
            ))}
          </ModernSection>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   ACADEMIC — dense CV-style, serif throughout,
   institution-first layout, ruled sections
───────────────────────────────────────────── */
function AcademicTemplate({ mcs, maxExp, maxProj, accent, fontFamily }: { mcs: MCS; maxExp: number; maxProj: number; accent: string; fontFamily: string }) {
  const p = mcs.personal;
  return (
    <div
      style={{
        fontFamily,
        background: '#fffef9',
        color: '#111',
        lineHeight: 1.6,
        padding: '20px 26px',
      }}
    >
      {/* Header — centered */}
      <div style={{ textAlign: 'center', marginBottom: 16, borderBottom: `2px solid ${accent}`, paddingBottom: 12 }}>
        <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '0.03em', color: accent }}>
          {esc(p.name) || 'Your Name'}
        </div>
        {p.title && <div style={{ fontSize: 12, color: '#444', marginTop: 2, fontStyle: 'italic' }}>{p.title}</div>}
        <div style={{ fontSize: 11, color: '#555', marginTop: 5 }}>
          {[p.email, p.phone, p.location].filter(Boolean).join('  ·  ')}
        </div>
        {(p.linkedin || p.github || p.website) && (
          <div style={{ fontSize: 10.5, color: '#666', marginTop: 3 }}>
            {[p.website, p.linkedin, p.github].filter(Boolean).join('  ·  ')}
          </div>
        )}
      </div>

      {mcs.summary && (
        <AcademicSection label="Research Interests / Summary" accent={accent}>
          <p style={{ margin: 0, fontSize: 11.5 }}>{mcs.summary}</p>
        </AcademicSection>
      )}

      {mcs.education.length > 0 && (
        <AcademicSection label="Education" accent={accent}>
          {mcs.education.map((e, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, fontWeight: 700 }}>{esc(e.institution)}</span>
                <span style={{ fontSize: 11, color: '#555' }}>
                  {[e.startDate, e.endDate].filter(Boolean).join(' – ')}
                </span>
              </div>
              <div style={{ fontSize: 11.5, fontStyle: 'italic', color: '#333' }}>
                {[e.degree, e.field ? `in ${e.field}` : ''].filter(Boolean).join(' ')}
                {e.gpa ? ` — GPA: ${e.gpa}` : ''}
              </div>
              {e.honors && <div style={{ fontSize: 11, color: '#555' }}>{e.honors}</div>}
            </div>
          ))}
        </AcademicSection>
      )}

      {mcs.experience.length > 0 && (
        <AcademicSection label="Professional Experience" accent={accent}>
          {mcs.experience.slice(0, maxExp).map((e, i) => (
            <div key={i} style={{ marginBottom: 9 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, fontWeight: 700 }}>{esc(e.company)}</span>
                <span style={{ fontSize: 11, color: '#555' }}>
                  {[e.startDate, e.current ? 'Present' : e.endDate].filter(Boolean).join(' – ')}
                </span>
              </div>
              <div style={{ fontSize: 11.5, fontStyle: 'italic', color: '#333' }}>
                {esc(e.role)}{e.location ? `, ${e.location}` : ''}
              </div>
              {(e.bullets ?? []).length > 0 && (
                <ul style={{ margin: '4px 0 0 16px', padding: 0, fontSize: 11 }}>
                  {(e.bullets ?? []).map((b, j) => (
                    <li key={j} style={{ marginBottom: 2 }}>{b}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </AcademicSection>
      )}

      {mcs.skills.length > 0 && (
        <AcademicSection label="Skills &amp; Expertise" accent={accent}>
          <div style={{ fontSize: 11.5, lineHeight: 1.8 }}>
            {mcs.skills.map((s) => s.name).join(' · ')}
          </div>
        </AcademicSection>
      )}

      {(mcs.projects ?? []).length > 0 && (
        <AcademicSection label="Selected Projects / Publications" accent={accent}>
          {(mcs.projects ?? []).slice(0, maxProj).map((proj, i) => (
            <div key={i} style={{ marginBottom: 7 }}>
              <span style={{ fontSize: 12, fontWeight: 700 }}>{esc(proj.name)}</span>
              {proj.url && <span style={{ fontSize: 11, color: '#555', marginLeft: 6 }}>— {proj.url}</span>}
              {proj.description && (
                <div style={{ fontSize: 11, color: '#444', marginTop: 1 }}>{proj.description}</div>
              )}
            </div>
          ))}
        </AcademicSection>
      )}

      {(mcs.languages ?? []).length > 0 && (
        <AcademicSection label="Languages" accent={accent}>
          <div style={{ fontSize: 11.5 }}>
            {(mcs.languages ?? []).map((l) => [l.language, l.proficiency].filter(Boolean).join(' (')).join(')  ·  ')}
          </div>
        </AcademicSection>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   MINIMAL — pure whitespace grid, thin rules,
   no ornamentation, everything in proportion
───────────────────────────────────────────── */
function MinimalTemplate({ mcs, maxExp, maxProj, accent, fontFamily }: { mcs: MCS; maxExp: number; maxProj: number; accent: string; fontFamily: string }) {
  const p = mcs.personal;
  return (
    <div
      style={{
        fontFamily,
        background: '#fff',
        color: '#111',
        padding: '22px 24px',
        lineHeight: 1.6,
      }}
    >
      {/* Name block */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 24, fontWeight: 300, letterSpacing: '-0.3px', color: '#000' }}>
          {esc(p.name) || 'Your Name'}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px', marginTop: 5 }}>
          {[p.title, p.email, p.phone, p.location].filter(Boolean).map((item, i) => (
            <span key={i} style={{ fontSize: 10.5, color: i === 0 ? accent : '#888' }}>
              {item}
            </span>
          ))}
        </div>
      </div>

      {mcs.summary && (
        <div style={{ borderTop: `1px solid ${accent}33`, paddingTop: 12, marginBottom: 14 }}>
          <p style={{ margin: 0, fontSize: 11, color: '#555', lineHeight: 1.75 }}>{mcs.summary}</p>
        </div>
      )}

      {mcs.experience.length > 0 && (
        <MinimalSection label="Experience" accent={accent}>
          {mcs.experience.slice(0, maxExp).map((e, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: '0 14px', marginBottom: 10 }}>
              <div style={{ fontSize: 10, color: '#999', paddingTop: 1, lineHeight: 1.5 }}>
                {e.startDate && <div>{e.startDate}</div>}
                <div>{e.current ? 'Present' : e.endDate}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#000' }}>{esc(e.role)}</div>
                <div style={{ fontSize: 10.5, color: '#666', marginBottom: 3 }}>
                  {esc(e.company)}{e.location ? ` — ${e.location}` : ''}
                </div>
                {(e.bullets ?? []).length > 0 && (
                  <ul style={{ margin: 0, padding: '0 0 0 12px', fontSize: 10.5, color: '#444' }}>
                    {(e.bullets ?? []).map((b, j) => (
                      <li key={j} style={{ marginBottom: 2 }}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </MinimalSection>
      )}

      {mcs.education.length > 0 && (
        <MinimalSection label="Education" accent={accent}>
          {mcs.education.map((e, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: '0 14px', marginBottom: 6 }}>
              <div style={{ fontSize: 10, color: '#999' }}>{e.endDate || e.startDate}</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{esc(e.institution)}</div>
                <div style={{ fontSize: 10.5, color: '#666' }}>
                  {[e.degree, e.field ? `in ${e.field}` : ''].filter(Boolean).join(' ')}
                </div>
              </div>
            </div>
          ))}
        </MinimalSection>
      )}

      {mcs.skills.length > 0 && (
        <MinimalSection label="Skills" accent={accent}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px 0' }}>
            {mcs.skills.map((s, i) => (
              <span key={i} style={{ fontSize: 11, color: '#333', marginRight: 14 }}>{s.name}</span>
            ))}
          </div>
        </MinimalSection>
      )}

      {(mcs.projects ?? []).length > 0 && (
        <MinimalSection label="Projects" accent={accent}>
          {(mcs.projects ?? []).slice(0, maxProj).map((proj, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: '0 14px', marginBottom: 6 }}>
              <div />
              <div>
                <span style={{ fontSize: 12, fontWeight: 600 }}>{esc(proj.name)}</span>
                {proj.description && (
                  <span style={{ fontSize: 10.5, color: '#666', marginLeft: 6 }}>— {proj.description}</span>
                )}
              </div>
            </div>
          ))}
        </MinimalSection>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   CREATIVE — bold violet left bar, oversized
   name, asymmetric layout, tag-pill skills
───────────────────────────────────────────── */
function CreativeTemplate({ mcs, maxExp, maxProj, accent, fontFamily }: { mcs: MCS; maxExp: number; maxProj: number; accent: string; fontFamily: string }) {
  const p = mcs.personal;
  const light = `${accent}22`;

  return (
    <div
      style={{
        fontFamily,
        background: '#fff',
        color: '#111',
        lineHeight: 1.55,
        borderLeft: `6px solid ${accent}`,
      }}
    >
      {/* Hero header */}
      <div style={{ background: light, padding: '20px 20px 16px 20px' }}>
        <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#111', lineHeight: 1.1 }}>
          {esc(p.name) || 'Your Name'}
        </div>
        {p.title && (
          <div
            style={{
              display: 'inline-block',
              background: accent,
              color: '#fff',
              fontSize: 9.5,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              padding: '3px 10px',
              borderRadius: 999,
              marginTop: 6,
            }}
          >
            {p.title}
          </div>
        )}
        <div style={{ fontSize: 10.5, color: accent, marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: '3px 12px' }}>
          {[p.email, p.phone, p.location, p.linkedin, p.github].filter(Boolean).map((item, i) => (
            <span key={i}>{item}</span>
          ))}
        </div>
      </div>

      <div style={{ padding: '14px 20px' }}>
        {mcs.summary && (
          <p
            style={{
              margin: '0 0 14px',
              fontSize: 11,
              color: '#333',
              lineHeight: 1.75,
              background: light,
              padding: '8px 12px',
              borderRadius: 6,
              borderLeft: `3px solid ${accent}`,
            }}
          >
            {mcs.summary}
          </p>
        )}

        {mcs.experience.length > 0 && (
          <CreativeSection label="Experience" accent={accent}>
            {mcs.experience.slice(0, maxExp).map((e, i) => (
              <div key={i} style={{ marginBottom: 11, paddingBottom: 11, borderBottom: i < mcs.experience.slice(0, maxExp).length - 1 ? `1px dashed ${accent}44` : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#111' }}>{esc(e.role)}</span>
                    <span
                      style={{
                        fontSize: 9.5,
                        background: light,
                        color: accent,
                        borderRadius: 999,
                        padding: '1px 8px',
                        marginLeft: 8,
                        fontWeight: 600,
                      }}
                    >
                      {esc(e.company)}
                    </span>
                  </div>
                  <span style={{ fontSize: 9.5, color: accent, opacity: 0.7, whiteSpace: 'nowrap', marginLeft: 8 }}>
                    {[e.startDate, e.current ? 'Now' : e.endDate].filter(Boolean).join(' → ')}
                  </span>
                </div>
                {(e.bullets ?? []).length > 0 && (
                  <ul style={{ margin: '5px 0 0 12px', padding: 0, fontSize: 10.5, color: '#374151' }}>
                    {(e.bullets ?? []).map((b, j) => (
                      <li key={j} style={{ marginBottom: 2 }}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </CreativeSection>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {mcs.education.length > 0 && (
            <CreativeSection label="Education" accent={accent}>
              {mcs.education.map((e, i) => (
                <div key={i} style={{ marginBottom: 6 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#111' }}>{esc(e.institution)}</div>
                  <div style={{ fontSize: 10, color: accent }}>
                    {[e.degree, e.field].filter(Boolean).join(' in ')}
                    {e.endDate ? ` · ${e.endDate}` : ''}
                  </div>
                </div>
              ))}
            </CreativeSection>
          )}

          {mcs.skills.length > 0 && (
            <CreativeSection label="Skills" accent={accent}>
              <div>
                {mcs.skills.map((s, i) => (
                  <span
                    key={i}
                    style={{
                      display: 'inline-block',
                      background: i % 3 === 0 ? accent : i % 3 === 1 ? light : '#f5f5f5',
                      color: i % 3 === 0 ? '#fff' : accent,
                      borderRadius: 4,
                      padding: '2px 8px',
                      fontSize: 9.5,
                      fontWeight: 600,
                      marginRight: 5,
                      marginBottom: 5,
                    }}
                  >
                    {s.name}
                  </span>
                ))}
              </div>
            </CreativeSection>
          )}
        </div>

        {(mcs.projects ?? []).length > 0 && (
          <CreativeSection label="Projects" accent={accent}>
            {(mcs.projects ?? []).slice(0, maxProj).map((proj, i) => (
              <div
                key={i}
                style={{
                  marginBottom: 8,
                  padding: '7px 10px',
                  background: light,
                  borderRadius: 6,
                  borderLeft: `3px solid ${accent}`,
                }}
              >
                <div style={{ fontSize: 11.5, fontWeight: 700, color: '#111' }}>{esc(proj.name)}</div>
                {proj.description && (
                  <div style={{ fontSize: 10.5, color: accent, marginTop: 1 }}>{proj.description}</div>
                )}
                {(proj.tech ?? []).length > 0 && (
                  <div style={{ marginTop: 4 }}>
                    {(proj.tech ?? []).map((t) => <Pill key={t} text={t} accent={accent} />)}
                  </div>
                )}
              </div>
            ))}
          </CreativeSection>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Small helper section components
───────────────────────────────────────────── */
function Section({ label, accent, children }: { label: string; accent: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          color: accent,
          borderBottom: `1px solid ${accent}44`,
          paddingBottom: 3,
          marginBottom: 6,
          fontFamily: 'Arial, sans-serif',
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

function ModernSection({ label, accent, children }: { label: string; accent: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div
        style={{
          fontSize: 9.5,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.14em',
          color: accent,
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

function AcademicSection({ label, accent, children }: { label: string; accent: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 13 }}>
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: accent,
          borderBottom: `1.5px solid ${accent}`,
          paddingBottom: 3,
          marginBottom: 7,
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

function MinimalSection({ label, accent, children }: { label: string; accent: string; children: React.ReactNode }) {
  return (
    <div style={{ borderTop: `1px solid ${accent}33`, paddingTop: 12, marginBottom: 12 }}>
      <div
        style={{
          fontSize: 9,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.16em',
          color: accent,
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

function CreativeSection({ label, accent, children }: { label: string; accent: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 13 }}>
      <div
        style={{
          fontSize: 9.5,
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.14em',
          color: accent,
          marginBottom: 7,
          display: 'flex',
          alignItems: 'center',
          gap: 7,
        }}
      >
        <span
          style={{
            display: 'inline-block',
            width: 16,
            height: 2,
            background: accent,
            borderRadius: 1,
          }}
        />
        {label}
      </div>
      {children}
    </div>
  );
}

function SidebarSection({ label, children, light }: { label: string; children: React.ReactNode; light?: boolean }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div
        style={{
          fontSize: 8.5,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.14em',
          color: light ? '#475569' : '#94a3b8',
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

function SidebarItem({ text, accent }: { text: string; accent: string }) {
  return (
    <div style={{ fontSize: 9.5, color: '#94a3b8', marginBottom: 4, wordBreak: 'break-all', lineHeight: 1.4, borderBottom: `1px solid ${accent}22`, paddingBottom: 3 }}>
      {text}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Cover Letter view (shared across themes)
───────────────────────────────────────────── */
function CoverLetterView({ mcs, accent, coverLetter, fontFamily }: { mcs: MCS; accent: string; coverLetter: string; fontFamily: string }) {
  const p = mcs.personal;
  return (
    <div style={{ fontFamily, background: '#fff', color: '#111', padding: '20px 24px', lineHeight: 1.7 }}>
      <div style={{ borderBottom: `3px solid ${accent}`, paddingBottom: 10, marginBottom: 16 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#111' }}>{esc(p.name) || 'Your Name'}</div>
        <div style={{ fontSize: 11, color: '#666', marginTop: 3 }}>
          {[p.email, p.phone, p.location].filter(Boolean).join('  ·  ')}
        </div>
      </div>
      <pre
        style={{
          fontFamily: 'inherit',
          fontSize: 11.5,
          lineHeight: 1.8,
          whiteSpace: 'pre-wrap',
          color: '#222',
          margin: 0,
        }}
      >
        {coverLetter || NO_COVER_LETTER_MESSAGE}
      </pre>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main export
───────────────────────────────────────────── */
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
      <div
        className="ex-cv"
        style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center', padding: 24 }}
      >
        <p style={{ color: '#888', fontSize: 12 }}>No profile data yet. Start in Chat or Editor.</p>
      </div>
    );
  }

  const maxExp = documentType === 'cv' ? 8 : 4;
  const maxProj = documentType === 'cv' ? 5 : 2;

  const containerStyle: React.CSSProperties = {
    transform: `scale(${zoom / 100})`,
    transformOrigin: 'top center',
    width: '100%',
    maxWidth: 580,
    borderRadius: 4,
    overflow: 'hidden',
    boxShadow: '0 8px 32px rgba(0,0,0,0.22)',
    background: '#fff',
  };

  if (documentType === 'cover-letter') {
    const themeAccents: Record<ExportTheme, string> = {
      Professional: '#b91c1c',
      Modern: '#2563eb',
      Academic: '#3a3a3a',
      Minimal: '#111',
      Creative: '#7c3aed',
    };
    return (
      <div style={containerStyle}>
        <CoverLetterView mcs={mcs} accent={themeAccents[theme]} coverLetter={coverLetter} fontFamily={fontFamily} />
      </div>
    );
  }

  const template = () => {
    switch (theme) {
      case 'Modern':    return <ModernTemplate mcs={mcs} maxExp={maxExp} maxProj={maxProj} accent={accent} fontFamily={fontFamily} />;
      case 'Academic':  return <AcademicTemplate mcs={mcs} maxExp={maxExp} maxProj={maxProj} accent={accent} fontFamily={fontFamily} />;
      case 'Minimal':   return <MinimalTemplate mcs={mcs} maxExp={maxExp} maxProj={maxProj} accent={accent} fontFamily={fontFamily} />;
      case 'Creative':  return <CreativeTemplate mcs={mcs} maxExp={maxExp} maxProj={maxProj} accent={accent} fontFamily={fontFamily} />;
      default:          return <ProfessionalTemplate mcs={mcs} maxExp={maxExp} maxProj={maxProj} accent={accent} fontFamily={fontFamily} />;
    }
  };

  return <div style={containerStyle}>{template()}</div>;
}