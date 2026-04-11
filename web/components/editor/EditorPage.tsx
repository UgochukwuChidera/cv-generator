'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { MCS } from '@nexus/schema';
import { useNexusStore } from '@/lib/store';
import { assessMCSQuality, normalizeMCS } from '@/lib/mcs';
import { useShell } from '@/components/layout/ShellContext';
import SectionSidebar, { type Section } from './SectionSidebar';
import LivePreview from './LivePreview';

const EMPTY_MCS: MCS = normalizeMCS({
  personal: { name: '', title: '', location: '', email: '', phone: '', website: '', linkedin: '', github: '', twitter: '' },
  summary: '',
  experience: [{ company: '', role: '', startDate: '', endDate: '', current: false, location: '', bullets: [''] }],
  education: [{ institution: '', degree: '', field: '', startDate: '', endDate: '', gpa: '', honors: '' }],
  skills: [{ name: '', category: '' }],
  projects: [{ name: '', description: '', url: '', tech: [], bullets: [] }],
  languages: [{ language: '', proficiency: '' }],
  coverLetters: {},
  meta: { version: 1, updated_at: new Date().toISOString() },
  history: [],
});
const PREVIEW_DEBOUNCE_MS = 90;
const PERSISTENCE_DEBOUNCE_MS = 220;

function Label({ title }: { title: string }) {
  return <span style={{ display: 'block', marginBottom: 5, fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--t3)' }}>{title}</span>;
}

export default function EditorPage() {
  const { mcs, setMCS, aiKey, aiProvider, aiModel, quality } = useNexusStore();
  const { openApiKeyModal, setStatus } = useShell();
  const [section, setSection] = useState<Section>('profile');
  const [draftMcs, setDraftMcs] = useState<MCS>(mcs ? normalizeMCS(mcs) : EMPTY_MCS);
  const [previewMcs, setPreviewMcs] = useState<MCS>(draftMcs);
  const hasHydrated = useRef(false);
  const current = draftMcs;

  useEffect(() => {
    if (!mcs) {
      setMCS(EMPTY_MCS);
      return;
    }
    setDraftMcs(normalizeMCS(mcs));
  }, [mcs, setMCS]);

  useEffect(() => {
    const timer = window.setTimeout(() => setPreviewMcs(current), PREVIEW_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [current]);

  useEffect(() => {
    if (!hasHydrated.current) {
      hasHydrated.current = true;
      return;
    }
    const timer = window.setTimeout(() => setMCS(normalizeMCS(current)), PERSISTENCE_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [current, setMCS]);

  const sectionScores = useMemo(() => {
    const q = quality ?? assessMCSQuality(current);
    return {
      profile: Math.round(((q.sections.find((s) => s.section === 'personal')?.score ?? 0) + (q.sections.find((s) => s.section === 'summary')?.score ?? 0)) / 2),
      experience: q.sections.find((s) => s.section === 'experience')?.score ?? 0,
      education: q.sections.find((s) => s.section === 'education')?.score ?? 0,
      skills: q.sections.find((s) => s.section === 'skills')?.score ?? 0,
      projects: q.sections.find((s) => s.section === 'projects')?.score ?? 100,
      languages: q.sections.find((s) => s.section === 'languages')?.score ?? 0,
    };
  }, [quality, current]);

  function commit(next: MCS, message?: string) {
    setDraftMcs(normalizeMCS(next));
    if (message) setStatus(message);
  }

  async function improveBullet(expIndex: number, bulletIndex: number) {
    const bullet = current.experience[expIndex]?.bullets?.[bulletIndex] ?? '';
    if (!bullet.trim()) return;

    if (!aiKey) {
      openApiKeyModal();
      return;
    }

    try {
      const res = await fetch('/api/ai/improve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': aiKey,
          'x-provider': aiProvider,
        },
        body: JSON.stringify({ bullet, provider: aiProvider, model: aiModel }),
      });

      const data = (await res.json()) as { ok: boolean; variants?: string[]; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error || 'Improve failed');

      const variant = data.variants?.[0];
      if (!variant) return;
      const next = structuredClone(current);
      next.experience[expIndex].bullets[bulletIndex] = variant;
      commit(next, 'Bullet improved');
    } catch {
      setStatus('Bullet improve failed');
    }
  }

  return (
    <div className="ed-layout">
      <SectionSidebar active={section} onSelect={setSection} scores={sectionScores} />

      <div className="ed-form">
        <div className="ed-head">
          <h3>{section}</h3>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span className="status-text">Profile quality {quality?.overall ?? assessMCSQuality(current).overall}%</span>
            <button className="btn-primary" onClick={() => setStatus('Saved in local profile state')}>Save</button>
          </div>
        </div>

        {section === 'profile' && (
          <div className="card-lo on-hi">
            <div className="grid4">
              {(
                [
                  ['name', 'Full name'],
                  ['title', 'Title'],
                  ['email', 'Email'],
                  ['phone', 'Phone'],
                  ['location', 'Location'],
                  ['website', 'Website'],
                  ['linkedin', 'LinkedIn'],
                  ['github', 'GitHub'],
                ] as const
              ).map(([field, label]) => (
                <label key={field}>
                  <Label title={label} />
                  <input
                    className="field"
                    value={(current.personal[field] as string | undefined) ?? ''}
                    onChange={(e) => commit({ ...current, personal: { ...current.personal, [field]: e.target.value } })}
                  />
                </label>
              ))}
            </div>
            <label style={{ marginTop: 10, display: 'block' }}>
              <Label title="Summary" />
              <textarea
                className="field"
                rows={5}
                value={current.summary ?? ''}
                onChange={(e) => commit({ ...current, summary: e.target.value })}
              />
            </label>
          </div>
        )}

        {section === 'experience' && (
          <div className="card-lo on-hi">
            {current.experience.map((exp, expIndex) => (
              <div key={`exp-${expIndex}`} style={{ marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
                <div className="grid4">
                  {(
                    [
                      ['role', 'Role'],
                      ['company', 'Company'],
                      ['location', 'Location'],
                      ['startDate', 'Start date'],
                      ['endDate', 'End date'],
                    ] as const
                  ).map(([field, label]) => (
                    <label key={field}>
                      <Label title={label} />
                      <input
                        className="field"
                        value={(exp[field] as string | undefined) ?? ''}
                        onChange={(e) => {
                          const next = structuredClone(current);
                          next.experience[expIndex][field] = e.target.value;
                          commit(next);
                        }}
                      />
                    </label>
                  ))}
                  <label>
                    <Label title="Current" />
                    <input
                      type="checkbox"
                      checked={!!exp.current}
                      onChange={(e) => {
                        const next = structuredClone(current);
                        next.experience[expIndex].current = e.target.checked;
                        commit(next);
                      }}
                    />
                  </label>
                </div>

                <div className="bullets-container">
                  {(exp.bullets ?? []).map((bullet, bulletIndex) => (
                    <div className="bullet-row2" key={`exp-${expIndex}-bullet-${bulletIndex}`}>
                      <span className="bdot" />
                      <textarea
                        className="bullet-field"
                        rows={2}
                        value={bullet}
                        onChange={(e) => {
                          const next = structuredClone(current);
                          next.experience[expIndex].bullets[bulletIndex] = e.target.value;
                          commit(next);
                        }}
                      />
                      <button className="ai-btn" onClick={() => improveBullet(expIndex, bulletIndex)} title="AI improve">✦</button>
                    </div>
                  ))}
                  <button
                    className="soft-btn"
                    onClick={() => {
                      const next = structuredClone(current);
                      next.experience[expIndex].bullets.push('');
                      commit(next, 'Bullet added');
                    }}
                  >
                    + Add bullet
                  </button>
                </div>

                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button
                    className="btn-ghost"
                    onClick={() => {
                      const next = structuredClone(current);
                      if (expIndex > 0) {
                        [next.experience[expIndex - 1], next.experience[expIndex]] = [next.experience[expIndex], next.experience[expIndex - 1]];
                        commit(next, 'Experience reordered');
                      }
                    }}
                  >
                    Move up
                  </button>
                  <button
                    className="btn-ghost"
                    onClick={() => {
                      const next = structuredClone(current);
                      next.experience.splice(expIndex, 1);
                      if (next.experience.length === 0) next.experience.push({ company: '', role: '', startDate: '', endDate: '', current: false, location: '', bullets: [] });
                      commit(next, 'Experience removed');
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}

            <button
              className="add-exp"
              onClick={() => {
                const next = structuredClone(current);
                next.experience.push({ company: '', role: '', startDate: '', endDate: '', current: false, location: '', bullets: [''] });
                commit(next, 'Experience added');
              }}
            >
              + Add entry
            </button>
          </div>
        )}

        {section === 'education' && (
          <div className="card-lo on-hi">
            {current.education.map((edu, index) => (
              <div key={`edu-${index}`} style={{ marginBottom: 12, borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
                <div className="grid4">
                  {(
                    [
                      ['institution', 'Institution'],
                      ['degree', 'Degree'],
                      ['field', 'Field'],
                      ['startDate', 'Start date'],
                      ['endDate', 'End date'],
                      ['gpa', 'GPA'],
                    ] as const
                  ).map(([field, label]) => (
                    <label key={field}>
                      <Label title={label} />
                      <input
                        className="field"
                        value={(edu[field] as string | undefined) ?? ''}
                        onChange={(e) => {
                          const next = structuredClone(current);
                          next.education[index][field] = e.target.value;
                          commit(next);
                        }}
                      />
                    </label>
                  ))}
                </div>
                <button className="btn-ghost" onClick={() => {
                  const next = structuredClone(current);
                  next.education.splice(index, 1);
                  if (next.education.length === 0) next.education.push({ institution: '' });
                  commit(next, 'Education removed');
                }}>Remove</button>
              </div>
            ))}
            <button className="add-exp" onClick={() => {
              const next = structuredClone(current);
              next.education.push({ institution: '', degree: '', field: '', startDate: '', endDate: '', gpa: '', honors: '' });
              commit(next, 'Education added');
            }}>+ Add education</button>
          </div>
        )}

        {section === 'skills' && (
          <div className="card-lo on-hi">
            {current.skills.map((skill, index) => (
              <div key={`skill-${index}`} className="grid4" style={{ marginBottom: 10 }}>
                <label>
                  <Label title="Skill" />
                  <input className="field" value={skill.name} onChange={(e) => {
                    const next = structuredClone(current);
                    next.skills[index].name = e.target.value;
                    commit(next);
                  }} />
                </label>
                <label>
                  <Label title="Category" />
                  <input className="field" value={skill.category ?? ''} onChange={(e) => {
                    const next = structuredClone(current);
                    next.skills[index].category = e.target.value;
                    commit(next);
                  }} />
                </label>
                <button className="btn-ghost" onClick={() => {
                  const next = structuredClone(current);
                  next.skills.splice(index, 1);
                  if (next.skills.length === 0) next.skills.push({ name: '' });
                  commit(next, 'Skill removed');
                }}>Remove</button>
              </div>
            ))}
            <button className="add-exp" onClick={() => {
              const next = structuredClone(current);
              next.skills.push({ name: '', category: '' });
              commit(next, 'Skill added');
            }}>+ Add skill</button>
          </div>
        )}

        {section === 'projects' && (
          <div className="card-lo on-hi">
            {current.projects?.map((project, index) => (
              <div key={`project-${index}`} style={{ marginBottom: 12, borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
                <div className="grid4">
                  <label>
                    <Label title="Project name" />
                    <input className="field" value={project.name} onChange={(e) => {
                      const next = structuredClone(current);
                      next.projects ??= [];
                      next.projects[index].name = e.target.value;
                      commit(next);
                    }} />
                  </label>
                  <label>
                    <Label title="URL" />
                    <input className="field" value={project.url ?? ''} onChange={(e) => {
                      const next = structuredClone(current);
                      next.projects ??= [];
                      next.projects[index].url = e.target.value;
                      commit(next);
                    }} />
                  </label>
                </div>
                <label>
                  <Label title="Description" />
                  <textarea className="field" rows={3} value={project.description ?? ''} onChange={(e) => {
                    const next = structuredClone(current);
                    next.projects ??= [];
                    next.projects[index].description = e.target.value;
                    commit(next);
                  }} />
                </label>
                <label>
                  <Label title="Tech (comma separated)" />
                  <input className="field" value={(project.tech ?? []).join(', ')} onChange={(e) => {
                    const next = structuredClone(current);
                    next.projects ??= [];
                    next.projects[index].tech = e.target.value.split(',').map((x) => x.trim()).filter(Boolean);
                    commit(next);
                  }} />
                </label>
                <button className="btn-ghost" onClick={() => {
                  const next = structuredClone(current);
                  next.projects ??= [];
                  next.projects.splice(index, 1);
                  commit(next, 'Project removed');
                }}>Remove</button>
              </div>
            ))}
            <button className="add-exp" onClick={() => {
              const next = structuredClone(current);
              next.projects ??= [];
              next.projects.push({ name: '', description: '', url: '', tech: [], bullets: [] });
              commit(next, 'Project added');
            }}>+ Add project</button>
          </div>
        )}

        {section === 'languages' && (
          <div className="card-lo on-hi">
            {current.languages?.map((lang, index) => (
              <div key={`lang-${index}`} className="grid4" style={{ marginBottom: 10 }}>
                <label>
                  <Label title="Language" />
                  <input className="field" value={lang.language} onChange={(e) => {
                    const next = structuredClone(current);
                    next.languages ??= [];
                    next.languages[index].language = e.target.value;
                    commit(next);
                  }} />
                </label>
                <label>
                  <Label title="Proficiency" />
                  <input className="field" value={lang.proficiency ?? ''} onChange={(e) => {
                    const next = structuredClone(current);
                    next.languages ??= [];
                    next.languages[index].proficiency = e.target.value;
                    commit(next);
                  }} />
                </label>
                <button className="btn-ghost" onClick={() => {
                  const next = structuredClone(current);
                  next.languages ??= [];
                  next.languages.splice(index, 1);
                  commit(next, 'Language removed');
                }}>Remove</button>
              </div>
            ))}
            <button className="add-exp" onClick={() => {
              const next = structuredClone(current);
              next.languages ??= [];
              next.languages.push({ language: '', proficiency: '' });
              commit(next, 'Language added');
            }}>+ Add language</button>
          </div>
        )}
      </div>

      <LivePreview mcs={previewMcs} />
    </div>
  );
}
