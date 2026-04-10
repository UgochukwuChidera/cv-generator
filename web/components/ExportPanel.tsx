'use client';
import { useState } from 'react';
import { useNexusStore } from '@/lib/store';

const FORMATS = [
  { id: 'json', label: 'JSON', ext: '.json', mime: 'application/json' },
  { id: 'yaml', label: 'YAML', ext: '.yaml', mime: 'application/x-yaml' },
  { id: 'html', label: 'HTML', ext: '.html', mime: 'text/html' },
];

export function ExportPanel() {
  const { mcs } = useNexusStore();
  const [loading, setLoading] = useState<string | null>(null);

  async function exportAs(format: string, ext: string, mime: string) {
    if (!mcs) return;
    setLoading(format);
    try {
      let content = '';
      if (format === 'json') {
        content = JSON.stringify(mcs, null, 2);
      } else if (format === 'yaml') {
        const jsyaml = await import('js-yaml');
        content = jsyaml.dump(mcs);
      } else if (format === 'html') {
        content = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>${mcs.personal?.name || 'Resume'}</title>
<style>body{font-family:Georgia,serif;max-width:800px;margin:40px auto;padding:0 20px;color:#333}
h1{font-size:2em;margin-bottom:0.2em}h2{border-bottom:1px solid #ccc;margin-top:1.5em}
ul{padding-left:1.5em}</style></head>
<body>
<h1>${mcs.personal?.name || ''}</h1>
<p>${mcs.personal?.title || ''} | ${mcs.personal?.email || ''} | ${mcs.personal?.location || ''}</p>
${mcs.summary ? `<h2>Summary</h2><p>${mcs.summary}</p>` : ''}
${mcs.experience?.length ? `<h2>Experience</h2>${mcs.experience.map((e) => `<h3>${e.role} at ${e.company}</h3><ul>${(e.bullets || []).map((b) => `<li>${b}</li>`).join('')}</ul>`).join('')}` : ''}
${mcs.skills?.length ? `<h2>Skills</h2><p>${mcs.skills.map((s) => s.name).join(', ')}</p>` : ''}
</body></html>`;
      }
      const blob = new Blob([content], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `resume${ext}`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">Download your resume in various formats.</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {FORMATS.map((f) => (
          <button
            key={f.id}
            onClick={() => exportAs(f.id, f.ext, f.mime)}
            disabled={!mcs || loading === f.id}
            className="border-2 rounded-xl p-4 text-center hover:border-blue-500 hover:bg-blue-50 transition-all disabled:opacity-50"
          >
            <div className="text-2xl mb-2">
              {f.id === 'json' ? '{}' : f.id === 'yaml' ? '≡' : '🌐'}
            </div>
            <div className="font-medium text-sm">{f.label}</div>
            {loading === f.id && <div className="text-xs text-blue-600 mt-1">Preparing...</div>}
          </button>
        ))}
      </div>
    </div>
  );
}
