'use client';

const THEMES = [
  { name: 'Professional', hint: 'Balanced corporate', accent: '#ff4d6a', top: true, left: false },
  { name: 'Modern',       hint: 'Clean and sleek',    accent: '#2d6cdf', top: false, left: false },
  { name: 'Academic',     hint: 'Research-forward',   accent: '#3a3a3a', top: false, left: false },
  { name: 'Minimal',      hint: 'Reduced visual noise',accent: '#111111', top: false, left: false },
  { name: 'Creative',     hint: 'Expressive highlight',accent: '#8a3ffc', top: false, left: true },
] as const;

export type ExportTheme = (typeof THEMES)[number]['name'];

// Tiny SVG document thumbnail — ~36×46px canvas showing the theme's visual signature
function ThumbSVG({ accent, top, left }: { accent: string; top: boolean; left: boolean }) {
  return (
    <svg
      width="36"
      height="46"
      viewBox="0 0 36 46"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ borderRadius: 3, flexShrink: 0 }}
    >
      {/* Page background */}
      <rect width="36" height="46" fill="#ffffff" />

      {/* Top accent bar (Professional) */}
      {top && <rect x="0" y="0" width="36" height="4" fill={accent} />}

      {/* Left accent bar (Creative) */}
      {left && <rect x="0" y="0" width="4" height="46" fill={accent} />}

      {/* Name line */}
      <rect x={left ? 8 : 4} y={top ? 8 : 5} width="18" height="3" rx="1" fill={accent} />

      {/* Sub-title line */}
      <rect x={left ? 8 : 4} y={top ? 13 : 10} width="12" height="2" rx="1" fill="#c0c4ce" />

      {/* Divider */}
      <line
        x1={left ? 8 : 4}
        y1={top ? 17 : 14}
        x2={left ? 32 : 32}
        y2={top ? 17 : 14}
        stroke="#e2e4ea"
        strokeWidth="1"
      />

      {/* Section label */}
      <rect x={left ? 8 : 4} y={top ? 20 : 17} width="9" height="2" rx="1" fill={accent} />

      {/* Body lines */}
      {[0, 1, 2].map((i) => (
        <rect
          key={i}
          x={left ? 8 : 4}
          y={(top ? 25 : 22) + i * 4}
          width={i === 2 ? 14 : 24}
          height="2"
          rx="1"
          fill="#d4d7e0"
        />
      ))}

      {/* Second section label */}
      <rect x={left ? 8 : 4} y={top ? 37 : 34} width="9" height="2" rx="1" fill={accent} />

      {/* Skill pills (Creative/Modern get circles) */}
      {[0, 1, 2].map((i) => (
        <rect
          key={i}
          x={(left ? 8 : 4) + i * 10}
          y={top ? 41 : 38}
          width="8"
          height="3"
          rx="1.5"
          fill={i === 0 ? `${accent}33` : '#eaecf2'}
        />
      ))}
    </svg>
  );
}

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
        <button
          key={theme.name}
          className={`tb ${value === theme.name ? 'sel' : ''}`}
          onClick={() => onChange(theme.name)}
          style={
            value === theme.name
              ? { borderColor: `${theme.accent}55`, background: `${theme.accent}0d` }
              : undefined
          }
        >
          <ThumbSVG accent={theme.accent} top={theme.top} left={theme.left} />
          <span className="tb-meta">
            <strong style={value === theme.name ? { color: theme.accent } : undefined}>
              {theme.name}
            </strong>
            <small>{theme.hint}</small>
          </span>
        </button>
      ))}
    </div>
  );
}