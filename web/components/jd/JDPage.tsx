'use client';

import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';
import { useNexusStore } from '@/lib/store';
import { useShell } from '@/components/layout/ShellContext';
import ScoreRing from './ScoreRing';
import BulletSuggestion from './BulletSuggestion';

type JDResult = {
  score: number;
  subScores: { skills: number; experience: number; domain: number };
  coverLetter: string;
  tailored?: unknown;
  missingSkills?: string[];
  implicitSkills?: string[];
  bulletSuggestions?: string[];
};

type UploadedFilePayload = {
  name: string;
  mimeType?: string;
  base64: string;
};

async function toPayload(file: File): Promise<UploadedFilePayload> {
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? '');
      const [, encoded = ''] = result.split(',');
      resolve(encoded);
    };
    reader.onerror = () => reject(new Error('Failed to read upload'));
    reader.readAsDataURL(file);
  });
  return { name: file.name, mimeType: file.type, base64 };
}

export default function JDPage() {
  const { mcs, aiKey, aiProvider, aiModel, setMCS, setJDAnalysis, jdAnalysis, saveCoverLetter } = useNexusStore();
  const { openApiKeyModal, setStatus } = useShell();
  const [jd, setJd] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<JDResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const words = useMemo(() => jd.trim().split(/\s+/).filter(Boolean).length, [jd]);

  async function analyze() {
    if (!mcs || !jd.trim()) return;
    if (!aiKey) {
      openApiKeyModal();
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/ai/target', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': aiKey,
          'x-provider': aiProvider,
        },
        body: JSON.stringify({ mcs, jd, provider: aiProvider, model: aiModel }),
      });

      const payload = (await res.json()) as { ok: boolean; error?: string } & JDResult;
      if (!res.ok || !payload.ok) throw new Error(payload.error || 'Alignment failed');

      const next: JDResult = {
        score: payload.score,
        subScores: payload.subScores,
        coverLetter: payload.coverLetter,
        tailored: payload.tailored,
        missingSkills: payload.missingSkills ?? [],
        implicitSkills: payload.implicitSkills ?? [],
        bulletSuggestions: payload.bulletSuggestions ?? [],
      };

      if (next.tailored && typeof next.tailored === 'object') setMCS(next.tailored as typeof mcs);
      setResult(next);
      setJDAnalysis({
        score: next.score,
        subScores: next.subScores,
        missingSkills: next.missingSkills ?? [],
        implicitSkills: next.implicitSkills ?? [],
        bulletSuggestions: next.bulletSuggestions ?? [],
        coverLetter: next.coverLetter,
        jdText: jd.trim(),
      });
      if (next.coverLetter) {
        saveCoverLetter(`jd-${Date.now()}`, next.coverLetter);
      }
      setStatus('Alignment analyzed');
    } catch {
      setStatus('Alignment failed');
    } finally {
      setLoading(false);
    }
  }

  async function uploadJDFile(file: File) {
    if (!file) return;
    setLoading(true);
    try {
      const payload = await toPayload(file);
      const res = await fetch('/api/upload/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file: payload }),
      });
      const data = (await res.json()) as { ok: boolean; text?: string; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error || 'File extraction failed');
      const text = (data.text ?? '').trim();
      if (!text) throw new Error('No readable text found in file');
      setJd(text);
      setStatus(`Loaded JD from ${file.name}`);
    } catch (error) {
      setStatus(`JD file upload failed: ${error instanceof Error ? error.message : 'unknown error'}`);
    } finally {
      setLoading(false);
    }
  }

  const scores = result?.subScores ?? jdAnalysis?.subScores ?? { skills: 0, experience: 0, domain: 0 };
  const fit = result?.score ?? jdAnalysis?.score ?? 0;
  const missingSkills = result?.missingSkills ?? jdAnalysis?.missingSkills ?? [];
  const strongSkills = result?.implicitSkills ?? jdAnalysis?.implicitSkills ?? [];
  const bulletSuggestions = result?.bulletSuggestions ?? jdAnalysis?.bulletSuggestions ?? [];
  const cover = result?.coverLetter ?? jdAnalysis?.coverLetter ?? '';

  return (
    <div className="jd-layout">
      <div className="jd-left">
        <h3>JD Targeting</h3>
        <p className="sub">Paste a job description for fit analysis, keyword gaps, and tailored bullet improvements. Cover letters now live in Export.</p>

        <textarea className="field jd-field" rows={9} value={jd} onChange={(e) => setJd(e.target.value)} />
        <div className="hint-row"><span>{words} words</span></div>

        <div className="row-btns">
          <button className="btn-ghost" onClick={() => fileRef.current?.click()}>📎 JD File</button>
          <button className="btn-ghost" onClick={() => setJd('')}>Clear</button>
          <button className="btn-primary pill" onClick={analyze} disabled={loading}>{loading ? 'Analyzing...' : 'Analyze Alignment'}</button>
        </div>
        <input
          ref={fileRef}
          hidden
          type="file"
          accept=".txt,.pdf,.docx,.json,.yaml,.yml"
          onChange={async (event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            await uploadJDFile(file);
            event.currentTarget.value = '';
          }}
        />

        <div className="jd-tag-grid">
          <div className="card-lo">
            <h4>Missing Keywords</h4>
            <div className="tags">
              {missingSkills.length > 0 ? missingSkills.map((item) => <span key={item} className="tag miss">{item}</span>) : <span className="sub">No gaps detected yet.</span>}
            </div>
          </div>
          <div className="card-lo">
            <h4>Strong Matches</h4>
            <div className="tags">
              {strongSkills.length > 0 ? strongSkills.map((item) => <span key={item} className="tag ok">{item}</span>) : <span className="sub">No matches detected yet.</span>}
            </div>
          </div>
        </div>

        <div className="card-lo">
          <h4>Suggested Bullet Improvements</h4>
          {bulletSuggestions.length > 0 ? bulletSuggestions.map((text) => <BulletSuggestion key={text} text={text} />) : <p className="sub">Run alignment to get tailored suggestions.</p>}
        </div>
      </div>

      <aside className="jd-right">
        <div className="card-lo center">
          <ScoreRing score={fit} />
          <div className="sub">Fit Score</div>
          <div className="stats3">
            <div><strong>{scores.skills}%</strong><span>Skills</span></div>
            <div><strong>{scores.experience}%</strong><span>Exp</span></div>
            <div><strong>{scores.domain}%</strong><span>Domain</span></div>
          </div>
        </div>

        <div className="card-lo">
          <h4>Competency Breakdown</h4>
          <div className="radar-row"><span>Skills Match</span><i style={{ width: `${scores.skills}%` }} /></div>
          <div className="radar-row"><span>Experience</span><i style={{ width: `${scores.experience}%` }} /></div>
          <div className="radar-row"><span>Domain</span><i style={{ width: `${scores.domain}%` }} /></div>
        </div>

        <div className="card-lo">
          <h4>Ready to Generate Deliverables?</h4>
          <p className="sub">Switch to Export to generate polished resume/CV outputs and cover letters from this analysis.</p>
          <Link className="btn-primary pill inline-link-btn" href="/export">
            Go to Export
          </Link>
          {cover && <p className="sub">A draft cover letter has already been prepared from your latest alignment run.</p>}
        </div>
      </aside>
    </div>
  );
}
