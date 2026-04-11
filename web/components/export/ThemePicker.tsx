'use client';

const THEMES = ['Professional', 'Modern', 'Academic', 'Minimal', 'Creative'] as const;

export type ExportTheme = typeof THEMES[number];

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
        <button key={theme} className={`tb ${value === theme ? 'sel' : ''}`} onClick={() => onChange(theme)}>
          <span className="ts" />
          <span>{theme}</span>
        </button>
      ))}
    </div>
  );
}
