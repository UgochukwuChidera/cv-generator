'use client';

type Section = 'profile' | 'experience' | 'education' | 'skills' | 'projects' | 'cover';

const ITEMS: Array<{ id: Section; label: string; icon: string }> = [
  { id: 'profile', label: 'Profile', icon: '◉' },
  { id: 'experience', label: 'Experience', icon: '◆' },
  { id: 'education', label: 'Education', icon: '◇' },
  { id: 'skills', label: 'Skills', icon: '◈' },
  { id: 'projects', label: 'Projects', icon: '▣' },
  { id: 'cover', label: 'Cover Letter', icon: '✦' },
];

export type { Section };

export default function SectionSidebar({
  active,
  onSelect,
}: {
  active: Section;
  onSelect: (section: Section) => void;
}) {
  return (
    <aside className="sidebar">
      <div className="sl-wrap">
        {ITEMS.map((item) => (
          <button key={item.id} className={`sl ${active === item.id ? 'on' : ''}`} onClick={() => onSelect(item.id)}>
            <span>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>
    </aside>
  );
}
