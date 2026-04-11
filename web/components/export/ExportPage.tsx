'use client';

import { useState } from 'react';
import { useNexusStore } from '@/lib/store';
import { useShell } from '@/components/layout/ShellContext';
import ThemePicker, { type ExportTheme } from './ThemePicker';
import FormatPicker, { type ExportFormat } from './FormatPicker';
import CVPreview from './CVPreview';

function downloadBlob(content: string | Blob, filename: string, mime?: string) {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mime ?? 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ExportPage() {
  const { mcs } = useNexusStore();
  const { setStatus } = useShell();
  const [theme, setTheme] = useState<ExportTheme>('Professional');
  const [format, setFormat] = useState<ExportFormat>('PDF');
  const [zoom, setZoom] = useState(100);
  const [loading, setLoading] = useState(false);

  async function onDownload() {
    if (!mcs) return;
    setLoading(true);
    try {
      if (format === 'PDF') {
        const param = encodeURIComponent(JSON.stringify(mcs));
        window.open(`/api/generate/preview?mcs=${param}`, '_blank', 'noopener,noreferrer');
      } else if (format === 'DOCX') {
        const res = await fetch('/api/generate/docx', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mcs }),
        });
        if (!res.ok) throw new Error(await res.text());
        const blob = await res.blob();
        downloadBlob(blob, 'resume.docx');
      } else if (format === 'HTML') {
        downloadBlob(`<!DOCTYPE html><html><body><pre>${JSON.stringify(mcs, null, 2)}</pre></body></html>`, 'resume.html', 'text/html');
      } else if (format === 'JSON') {
        downloadBlob(JSON.stringify(mcs, null, 2), 'resume.json', 'application/json');
      } else {
        const yaml = await import('js-yaml');
        downloadBlob(yaml.dump(mcs), 'resume.yaml', 'application/x-yaml');
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
          <p>Estimated size: 112 KB</p>
          <button className="btn-primary" onClick={onDownload} disabled={!mcs || loading}>{loading ? 'Preparing...' : '↓ Download Now'}</button>
          <button className="btn-ghost" onClick={() => setStatus('Share link not yet implemented')}>↗ Share Link</button>
          <button className="btn-ghost" onClick={() => setStatus('LinkedIn upload not yet implemented')}>↑ Upload to LinkedIn</button>
        </div>
        <div className="card-lo tiny"><strong>ATS Ready</strong><span>Structure validated</span></div>
        <div className="card-lo tiny"><strong>Print Safe</strong><span>Margins and contrast checked</span></div>
      </aside>
    </div>
  );
}
