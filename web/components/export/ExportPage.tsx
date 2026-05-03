'use client';

import { useMemo, useState } from 'react';
import { useNexusStore } from '@/lib/store';
import { useShell } from '@/components/layout/ShellContext';
import ThemePicker, { type ExportTheme } from './ThemePicker';
import FormatPicker, { type ExportFormat } from './FormatPicker';
import CVPreview, { NO_COVER_LETTER_MESSAGE } from './CVPreview';
type Tone = 'formal' | 'technical' | 'storytelling';

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
  const { mcs, jdAnalysis, saveCoverLetter, aiKey, aiProvider, aiModel } = useNexusStore();
  const { setStatus, openApiKeyModal } = useShell();
  const [theme, setTheme] = useState<ExportTheme>('Professional');
  const [format, setFormat] = useState<ExportFormat>('PDF');
  const [documentType, setDocumentType] = useState<'resume' | 'cv' | 'cover-letter'>('resume');
  const [tone, setTone] = useState<Tone>('formal');
  const [accent, setAccent] = useState('#ff4d6a');
  const [fontFamily, setFontFamily] = useState(`'JetBrains Mono', Consolas, monospace`);
  const [zoom, setZoom] = useState(100);
  const [loading, setLoading] = useState(false);
  const [coverLoading, setCoverLoading] = useState(false);

  const coverLetterCount = useMemo(() => Object.keys(mcs?.coverLetters ?? {}).length, [mcs?.coverLetters]);
  const latestCoverLetter = useMemo(() => {
    const values = Object.values(mcs?.coverLetters ?? {});
    return values.length > 0 ? (values[values.length - 1]?.content ?? '') : (jdAnalysis?.coverLetter ?? '');
  }, [jdAnalysis?.coverLetter, mcs?.coverLetters]);

  async function onGenerateCover() {
    if (!mcs || !jdAnalysis?.jdText?.trim()) {
      setStatus('Analyze a job description in JD Targeting first to generate cover letters.');
      return;
    }
    if (!aiKey) {
      openApiKeyModal();
      return;
    }
    setCoverLoading(true);
    try {
      const res = await fetch('/api/ai/generate-cover', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': aiKey,
          'x-provider': aiProvider,
        },
        body: JSON.stringify({ mcs, jd: jdAnalysis.jdText, tone, provider: aiProvider, model: aiModel }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string; coverLetter?: string };
      if (!res.ok || !data.ok) throw new Error(data.error || 'Cover generation failed');

      const generatedCover = data.coverLetter?.trim() ?? '';
      if (!generatedCover) throw new Error('Model returned an empty cover letter');
      saveCoverLetter(`cover-${Date.now()}`, generatedCover);
      setStatus('Cover letter generated in Export');
    } catch {
      setStatus('Cover generation failed');
    } finally {
      setCoverLoading(false);
    }
  }

  async function onDownload() {
    if (!mcs) return;
    setLoading(true);
    try {
      if (documentType === 'cover-letter') {
        if (!latestCoverLetter.trim()) {
          setStatus(NO_COVER_LETTER_MESSAGE);
          return;
        }
        const ext = format.toLowerCase();
        downloadBlob(new Blob([latestCoverLetter], { type: 'text/plain' }), `cover-letter.${ext === 'docx' ? 'txt' : ext}`);
        setStatus('Prepared cover letter export');
        return;
      }
      if (format === 'PDF') {
        await fetchAndDownload('/api/generate/pdf', { mcs, theme, documentType, accent, fontFamily }, 'resume.pdf');
      } else if (format === 'DOCX') {
        await fetchAndDownload('/api/generate/docx', { mcs, theme, documentType, accent, fontFamily }, 'resume.docx');
      } else {
        const ext = format.toLowerCase();
        await fetchAndDownload('/api/generate/export', { mcs, theme, format, documentType, accent, fontFamily }, `resume.${ext}`);
      }
      setStatus(`Prepared ${documentType.toUpperCase()} ${format} export`);
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
        <h4>Document Type</h4>
        <div className="fmt-list">
          {(['resume', 'cv', 'cover-letter'] as const).map((type) => (
            <label key={type} className="fmt-label">
              <input type="radio" name="doctype" checked={documentType === type} onChange={() => setDocumentType(type)} />
              <span>{type}</span>
            </label>
          ))}
        </div>
        <h4>Font</h4>
        <div className="fmt-list">
          {[
            { label: 'Mono', value: `'JetBrains Mono', Consolas, monospace` },
            { label: 'Sans', value: `Inter, 'Segoe UI', Arial, sans-serif` },
            { label: 'Serif', value: `'Times New Roman', Georgia, serif` },
          ].map((font) => (
            <label key={font.label} className="fmt-label">
              <input type="radio" name="font-family" checked={fontFamily === font.value} onChange={() => setFontFamily(font.value)} />
              <span>{font.label}</span>
            </label>
          ))}
        </div>
        <h4>Accent</h4>
        <div className="accent-row">
          {['#ff4d6a', '#4dd994', '#6b9fff', '#ffcc55', '#b58cff'].map((color) => (
            <button key={color} className={`accent-dot ${accent === color ? 'on' : ''}`} style={{ background: color }} onClick={() => setAccent(color)} />
          ))}
          <input
            type="color"
            value={accent}
            onChange={(e) => setAccent(e.target.value)}
            title="Custom accent colour"
            style={{ width: 22, height: 22, padding: 1, border: '1px solid var(--border)', borderRadius: '50%', cursor: 'pointer', background: 'none' }}
          />
        </div>
        <h4>Format</h4>
        <FormatPicker value={format} onChange={setFormat} />
        <div className="card-lo">
          <h4>Cover Letter Studio</h4>
          <div className="tone-row">
            {(['formal', 'technical', 'storytelling'] as Tone[]).map((item) => (
              <button key={item} className={`tone ${tone === item ? 'on' : ''}`} onClick={() => setTone(item)}>
                {item}
              </button>
            ))}
          </div>
          <button className="btn-primary" onClick={onGenerateCover} disabled={coverLoading || !mcs}>
            {coverLoading ? 'Generating...' : 'Generate Cover Letter'}
          </button>
        </div>
      </aside>

      <div className="ex-mid">
        <div className="doc-head">
          <h3>Document Preview · {documentType}</h3>
          <span className="ats-badge">● ATS Ready</span>
        </div>
        <CVPreview mcs={mcs} zoom={zoom} theme={theme} accent={accent} fontFamily={fontFamily} documentType={documentType} coverLetter={latestCoverLetter} />
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
          <p>Document: {documentType}</p>
          <p>Format: {format}</p>
          <p>Generated cover letters: {coverLetterCount}</p>
          <p>Latest fit score: {jdAnalysis?.score ?? 0}%</p>
          <button className="btn-primary full-width" onClick={onDownload} disabled={!mcs || loading}>{loading ? 'Preparing...' : '↓ Download Now'}</button>
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
