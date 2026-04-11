'use client';

import { useMemo, useState } from 'react';
import { useNexusStore } from '@/lib/store';
import { useShell } from '@/components/layout/ShellContext';
import ScoreRing from './ScoreRing';
import BulletSuggestion from './BulletSuggestion';

type Tone = 'formal' | 'technical' | 'storytelling';

type JDResult = {
  score: number;
  subScores: { skills: number; experience: number; domain: number };
  coverLetter: string;
  tailored?: unknown;
  missingSkills?: string[];
  implicitSkills?: string[];
  bulletSuggestions?: string[];
};

export default function JDPage() {
  const { mcs, aiKey, aiProvider, aiModel, setMCS, setJDAnalysis, jdAnalysis, saveCoverLetter } = useNexusStore();
  const { openApiKeyModal, setStatus } = useShell();
  const [jd, setJd] = useState('');
  const [tone, setTone] = useState<Tone>('formal');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<JDResult | null>(null);

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

  async function generateCover() {
    if (!mcs || !jd.trim()) return;
    if (!aiKey) {
      openApiKeyModal();
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/ai/generate-cover', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': aiKey,
          'x-provider': aiProvider,
        },
        body: JSON.stringify({ mcs, jd, tone, provider: aiProvider, model: aiModel }),
      });

      const data = (await res.json()) as { ok: boolean; error?: string; coverLetter?: string };
      if (!res.ok || !data.ok) throw new Error(data.error || 'Cover generation failed');

      const cover = data.coverLetter ?? '';
      setResult((prev) => ({ ...(prev ?? { score: 0, subScores: { skills: 0, experience: 0, domain: 0 }, coverLetter: '' }), coverLetter: cover }));
      setJDAnalysis({
        score: result?.score ?? jdAnalysis?.score ?? 0,
        subScores: result?.subScores ?? jdAnalysis?.subScores ?? { skills: 0, experience: 0, domain: 0 },
        missingSkills: result?.missingSkills ?? jdAnalysis?.missingSkills ?? [],
        implicitSkills: result?.implicitSkills ?? jdAnalysis?.implicitSkills ?? [],
        bulletSuggestions: result?.bulletSuggestions ?? jdAnalysis?.bulletSuggestions ?? [],
        coverLetter: cover,
      });
      if (cover) saveCoverLetter(`cover-${Date.now()}`, cover);
      setStatus('Cover letter generated');
    } catch {
      setStatus('Cover generation failed');
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
        <p className="sub">Paste a job description for fit analysis, keyword gaps, tailored bullets, and deliverable cover letter.</p>

        <textarea className="field jd-field" rows={9} value={jd} onChange={(e) => setJd(e.target.value)} />
        <div className="hint-row"><span>{words} words</span></div>

        <div className="row-btns">
          <button className="btn-ghost" onClick={() => setJd('')}>Clear</button>
          <button className="btn-primary pill" onClick={analyze} disabled={loading}>{loading ? 'Analyzing...' : 'Analyze Alignment'}</button>
        </div>

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
          <h4>Cover Letter (Deliverable)</h4>
          <div className="tone-row">
            {(['formal', 'technical', 'storytelling'] as Tone[]).map((item) => (
              <button key={item} className={`tone ${tone === item ? 'on' : ''}`} onClick={() => setTone(item)}>
                {item}
              </button>
            ))}
          </div>
          <button className="btn-primary pill" onClick={generateCover} disabled={loading || !jd.trim()}>{loading ? 'Generating...' : 'Generate'}</button>
          {cover && <pre className="cover-out">{cover}</pre>}
        </div>
      </aside>
    </div>
  );
}
