'use client';

const THEMES = [
  { id: 'professional', label: 'Professional', description: 'Clean, ATS-safe format' },
  { id: 'modern', label: 'Modern', description: 'Visual hierarchy with sidebar' },
  { id: 'creative', label: 'Creative', description: 'Distinctive design' },
  { id: 'academic', label: 'Academic', description: 'CV-style for academia' },
  { id: 'minimal', label: 'Minimal', description: 'Simple and elegant' },
];

export function ThemePicker({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (theme: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {THEMES.map((theme) => (
        <button
          key={theme.id}
          onClick={() => onSelect(theme.id)}
          className={`border-2 rounded-xl p-4 text-left transition-all ${
            selected === theme.id
              ? 'border-blue-600 bg-blue-50'
              : 'border-gray-200 hover:border-gray-400'
          }`}
        >
          <div className="h-24 bg-gray-100 rounded-lg mb-3 flex items-center justify-center text-2xl">
            {theme.id === 'professional' ? '📄' : theme.id === 'modern' ? '🎨' : theme.id === 'creative' ? '✨' : theme.id === 'academic' ? '🎓' : '📝'}
          </div>
          <div className="font-medium text-sm text-gray-800">{theme.label}</div>
          <div className="text-xs text-gray-500 mt-1">{theme.description}</div>
        </button>
      ))}
    </div>
  );
}
