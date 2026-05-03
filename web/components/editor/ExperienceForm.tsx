'use client';

import type { MCS } from '@nexus/schema';
import BulletRow from './BulletRow';

export default function ExperienceForm({
  mcs,
  onChange,
  onImproveBullet,
  onAddEntry,
}: {
  mcs: MCS;
  onChange: (next: MCS) => void;
  onImproveBullet: (bullet: string, index: number) => void;
  onAddEntry: () => void;
}) {
  const active = mcs.experience[0];
  const older = mcs.experience.slice(1);

  function updateField(field: 'role' | 'company' | 'location' | 'startDate' | 'endDate', value: string) {
    const next = [...mcs.experience];
    next[0] = { ...next[0], [field]: value };
    onChange({ ...mcs, experience: next });
  }

  function updateBullet(index: number, value: string) {
    const next = [...mcs.experience];
    const bullets = [...(next[0].bullets ?? [])];
    bullets[index] = value;
    next[0] = { ...next[0], bullets };
    onChange({ ...mcs, experience: next });
  }

  function addBullet() {
    const next = [...mcs.experience];
    next[0] = { ...next[0], bullets: [...(next[0].bullets ?? []), ''] };
    onChange({ ...mcs, experience: next });
  }

  return (
    <>
      <div className="card-lo on-hi">
        <div className="grid4">
          <label>
            <span>Role</span>
            <input className="field" value={active.role} onChange={(e) => updateField('role', e.target.value)} />
          </label>
          <label>
            <span>Company</span>
            <input className="field" value={active.company} onChange={(e) => updateField('company', e.target.value)} />
          </label>
          <label>
            <span>Location</span>
            <input className="field" value={active.location ?? ''} onChange={(e) => updateField('location', e.target.value)} />
          </label>
          <label>
            <span>Start date</span>
            <input
              className="field"
              placeholder="e.g. Jan 2020"
              value={active.startDate ?? ''}
              onChange={(e) => updateField('startDate', e.target.value)}
            />
          </label>
          <label>
            <span>End date</span>
            <input
              className="field"
              placeholder="e.g. Dec 2021 or Present"
              value={active.current ? 'Present' : (active.endDate ?? '')}
              disabled={active.current}
              onChange={(e) => updateField('endDate', e.target.value)}
            />
          </label>
        </div>

        <div className="bullets-container">
          {(active.bullets ?? []).map((bullet, index) => (
            <BulletRow key={`${index}-${bullet}`} value={bullet} onChange={(value) => updateBullet(index, value)} onImprove={() => onImproveBullet(bullet, index)} />
          ))}
        </div>

        <button className="soft-btn" onClick={addBullet}>+ Add bullet</button>
      </div>

      <button className="add-exp" onClick={onAddEntry}>+ Add Entry</button>

      {older.map((entry, index) => (
        <div className="card-lo old" key={`${entry.role}-${index}`}>
          {entry.role || 'Untitled role'} · {entry.company || 'Company'}
        </div>
      ))}
    </>
  );
}
