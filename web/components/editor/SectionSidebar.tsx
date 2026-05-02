'use client';

type Section = 'profile' | 'experience' | 'education' | 'skills' | 'projects' | 'languages';

const ITEMS: Array<{ id: Section; label: string; icon: string }> = [
  { id: 'profile', label: 'Profile', icon: '◉' },
  { id: 'experience', label: 'Experience', icon: '◆' },
  { id: 'education', label: 'Education', icon: '◇' },
  { id: 'skills', label: 'Skills', icon: '◈' },
  { id: 'projects', label: 'Projects', icon: '▣' },
  { id: 'languages', label: 'Languages', icon: '◍' },
];

export type { Section };

export default function SectionSidebar({
  active,
  onSelect,
  scores,
}: {
  active: Section;
  onSelect: (section: Section) => void;
  scores?: Partial<Record<Section, number>>;
}) {
  return (
    <aside className="sidebar">
      <div className="sl-wrap">
        {ITEMS.map((item) => (
          <button key={item.id} className={`sl ${active === item.id ? 'on' : ''}`} onClick={() => onSelect(item.id)}>
            <span>{item.icon}</span>
            <span>{item.label}</span>
            {typeof scores?.[item.id] === 'number' && <em className="sl-score">{scores[item.id]}%</em>}
          </button>
        ))}
      </div>
    </aside>
  );
}
