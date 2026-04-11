'use client';

import { useMemo, useState } from 'react';
import { useNexusStore } from '@/lib/store';
import { useShell } from '@/components/layout/ShellContext';
import ThemePicker, { type ExportTheme } from './ThemePicker';
import FormatPicker, { type ExportFormat } from './FormatPicker';
import CVPreview from './CVPreview';

function downloadBlob(content: Blob, filename: string) {
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

async function fetchAndDownload(url: string, body: unknown, filename: string) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  downloadBlob(await res.blob(), filename);
}

export default function ExportPage() {
  const { mcs, jdAnalysis } = useNexusStore();
  const { setStatus } = useShell();
  const [theme, setTheme] = useState<ExportTheme>('Professional');
  const [format, setFormat] = useState<ExportFormat>('PDF');
  const [zoom, setZoom] = useState(100);
  const [loading, setLoading] = useState(false);

  const coverLetterCount = useMemo(() => Object.keys(mcs?.coverLetters ?? {}).length, [mcs?.coverLetters]);

  async function onDownload() {
    if (!mcs) return;
    setLoading(true);
    try {
      if (format === 'PDF') {
        await fetchAndDownload('/api/generate/pdf', { mcs, theme }, 'resume.pdf');
      } else if (format === 'DOCX') {
        await fetchAndDownload('/api/generate/docx', { mcs, theme }, 'resume.docx');
      } else {
        const ext = format.toLowerCase();
        await fetchAndDownload('/api/generate/export', { mcs, theme, format }, `resume.${ext}`);
      }
      setStatus(`Prepared ${format} export`);
    } catch {
      setStatus('Export failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ex-layout">
      <aside className="ex-left">
        <h4>Visual Theme</h4>
        <ThemePicker value={theme} onChange={setTheme} />
        <h4>Format</h4>
        <FormatPicker value={format} onChange={setFormat} />
      </aside>

      <div className="ex-mid">
        <div className="doc-head">
          <h3>Document Preview</h3>
          <span className="ats-badge">● ATS Ready</span>
        </div>
        <CVPreview mcs={mcs} zoom={zoom} />
        <div className="zoom-row">
          <button onClick={() => setZoom((z) => Math.max(70, z - 10))}>-</button>
          <span>1 / 1</span>
          <button onClick={() => setZoom((z) => Math.min(130, z + 10))}>+</button>
        </div>
      </div>

      <aside className="ex-right">
        <div className="card-lo">
          <h4>Export Summary</h4>
          <p>Theme: {theme}</p>
          <p>Format: {format}</p>
          <p>Generated cover letters: {coverLetterCount}</p>
          <p>Latest fit score: {jdAnalysis?.score ?? 0}%</p>
          <button className="btn-primary" onClick={onDownload} disabled={!mcs || loading}>{loading ? 'Preparing...' : '↓ Download Now'}</button>
          <button
            className="btn-ghost"
            onClick={() => setStatus(coverLetterCount ? 'Cover letters are stored in profile and included in JSON/YAML.' : 'Generate a cover letter in JD Targeting first.')}
          >
            Cover Letters
          </button>
        </div>
        <div className="card-lo tiny"><strong>ATS Ready</strong><span>Schema-validated export payload</span></div>
        <div className="card-lo tiny"><strong>Deliverables</strong><span>CV + cover letters are persisted in profile history</span></div>
      </aside>
    </div>
  );
}
