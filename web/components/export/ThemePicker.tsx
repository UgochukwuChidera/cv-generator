'use client';

const THEMES = [
  { name: 'Professional', hint: 'Balanced corporate' },
  { name: 'Modern', hint: 'Clean and sleek' },
  { name: 'Academic', hint: 'Research-forward' },
  { name: 'Minimal', hint: 'Reduced visual noise' },
  { name: 'Creative', hint: 'Expressive highlight' },
] as const;

export type ExportTheme = (typeof THEMES)[number]['name'];

export default function ThemePicker({
  value,
  onChange,
}: {
  value: ExportTheme;
  onChange: (theme: ExportTheme) => void;
}) {
  return (
    <div className="theme-list">
      {THEMES.map((theme) => (
        <button key={theme.name} className={`tb ${value === theme.name ? 'sel' : ''}`} onClick={() => onChange(theme.name)}>
          <span className="ts">
            <i />
            <i />
            <i />
          </span>
          <span className="tb-meta">
            <strong>{theme.name}</strong>
            <small>{theme.hint}</small>
          </span>
        </button>
      ))}
    </div>
  );
}
