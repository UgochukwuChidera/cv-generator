'use client';

import { useEffect, useMemo, useState } from 'react';
import type { MCS } from '@nexus/schema';
import { useNexusStore } from '@/lib/store';
import { useShell } from '@/components/layout/ShellContext';
import SectionSidebar, { type Section } from './SectionSidebar';
import ExperienceForm from './ExperienceForm';
import LivePreview from './LivePreview';

const EMPTY_MCS: MCS = {
  personal: { name: '', title: '', location: '', email: '', phone: '', website: '', linkedin: '', github: '', twitter: '' },
  summary: '',
  experience: [{ company: '', role: '', startDate: '', endDate: '', current: false, location: '', bullets: [''] }],
  education: [{ institution: '', degree: '', field: '', startDate: '', endDate: '', gpa: '' }],
  skills: [],
  projects: [],
  languages: [],
  headshotPath: '',
  coverLetters: {},
  meta: { version: 1, updated_at: new Date().toISOString() },
  history: [],
};

export default function EditorPage() {
  const { mcs, setMCS, aiKey, aiProvider, aiModel } = useNexusStore();
  const { openApiKeyModal, setStatus } = useShell();
  const [section, setSection] = useState<Section>('experience');
  const [previewMcs, setPreviewMcs] = useState<MCS>(mcs ?? EMPTY_MCS);

  const current = useMemo(() => mcs ?? EMPTY_MCS, [mcs]);

  useEffect(() => {
    if (!mcs) setMCS(EMPTY_MCS);
  }, [mcs, setMCS]);

  useEffect(() => {
    const timer = window.setTimeout(() => setPreviewMcs(current), 150);
    return () => window.clearTimeout(timer);
  }, [current]);

  async function improveBullet(bullet: string, index: number) {
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
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as { variants?: string[] };
      const candidate = data.variants?.[0];
      if (!candidate || !current.experience[0]) return;
      const next = [...current.experience];
      const bullets = [...(next[0].bullets ?? [])];
      bullets[index] = candidate;
      next[0] = { ...next[0], bullets };
      setMCS({ ...current, experience: next });
      setStatus('Bullet improved');
    } catch {
      setStatus('Bullet improve failed');
    }
  }

  function addEntry() {
    const next = [...current.experience, { company: '', role: '', startDate: '', endDate: '', current: false, location: '', bullets: [''] }];
    setMCS({ ...current, experience: next });
    setStatus('Added entry');
  }

  return (
    <div className="ed-layout">
      <SectionSidebar active={section} onSelect={setSection} />

      <div className="ed-form">
        <div className="ed-head">
          <h3>{section}</h3>
          <button className="btn-primary" onClick={() => (aiKey ? setStatus('AI improve ready') : openApiKeyModal())}>AI Improve</button>
        </div>

        {section === 'experience' ? (
          <ExperienceForm mcs={current} onChange={setMCS} onImproveBullet={improveBullet} onAddEntry={addEntry} />
        ) : (
          <div className="card-lo">Section editor placeholder for {section}</div>
        )}
      </div>

      <LivePreview mcs={previewMcs} />
    </div>
  );
}
