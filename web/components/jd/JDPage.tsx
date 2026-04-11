'use client';

import { useMemo, useState } from 'react';
import { useNexusStore } from '@/lib/store';
import { useShell } from '@/components/layout/ShellContext';
import ScoreRing from './ScoreRing';
import BulletSuggestion from './BulletSuggestion';

type Tone = 'formal' | 'technical' | 'story';

type JDResult = {
  score: number;
  coverLetter: string;
  tailored?: unknown;
  missingSkills?: string[];
  implicitSkills?: string[];
};

export default function JDPage() {
  const { mcs, aiKey, aiProvider, aiModel, setMCS } = useNexusStore();
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
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as JDResult;
      if (data.tailored && typeof data.tailored === 'object') setMCS(data.tailored as typeof mcs);
      setResult(data);
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
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as { coverLetter?: string };
      setResult((prev) => ({ ...(prev ?? { score: 85, coverLetter: '' }), coverLetter: data.coverLetter ?? '' }));
      setStatus('Cover letter generated');
    } catch {
      setStatus('Cover generation failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="jd-layout">
      <div className="jd-left">
        <h3>JD Targeting</h3>
        <p className="sub">Paste a job description for fit analysis, keyword gaps, and bullet suggestions.</p>

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
              {(result?.missingSkills ?? ['Roadmapping', 'A/B Testing', 'Enterprise SaaS']).map((item) => <span key={item} className="tag miss">{item}</span>)}
            </div>
          </div>
          <div className="card-lo">
            <h4>Strong Matches</h4>
            <div className="tags">
              {(result?.implicitSkills ?? ['Design Systems', 'Cross-functional', 'Accessibility']).map((item) => <span key={item} className="tag ok">{item}</span>)}
            </div>
          </div>
        </div>

        <div className="card-lo">
          <h4>Suggested Bullet Improvements</h4>
          <BulletSuggestion text="Improved workflow completion by 31% via enterprise IA redesign." />
          <BulletSuggestion text="Reduced release review cycle time by 19% with stakeholder alignment rituals." />
          <BulletSuggestion text="Led design system governance across 4 product squads and 2 platforms." />
          <button className="btn-ghost" onClick={() => setStatus('Generated more suggestions (mock)')}>Generate More</button>
        </div>
      </div>

      <aside className="jd-right">
        <div className="card-lo center">
          <ScoreRing score={result?.score ?? 85} />
          <div className="sub">Fit Score</div>
          <div className="stats3">
            <div><strong>92%</strong><span>Skills</span></div>
            <div><strong>74%</strong><span>Exp</span></div>
            <div><strong>100%</strong><span>Location</span></div>
          </div>
        </div>

        <div className="card-lo">
          <h4>Competency Radar</h4>
          <div className="radar-row"><span>Visual Precision</span><i style={{ width: '95%' }} /></div>
          <div className="radar-row gap"><span>Project Mgmt</span><i style={{ width: '58%' }} /></div>
          <div className="radar-row gap"><span>Enterprise UX</span><i style={{ width: '42%' }} /></div>
        </div>

        <div className="card-lo">
          <h4>Cover Letter</h4>
          <div className="tone-row">
            {(['formal', 'technical', 'story'] as Tone[]).map((item) => (
              <button key={item} className={`tone ${tone === item ? 'on' : ''}`} onClick={() => setTone(item)}>
                {item}
              </button>
            ))}
          </div>
          <button className="btn-primary pill" onClick={generateCover} disabled={loading}>{loading ? 'Generating...' : 'Generate'}</button>
          {result?.coverLetter && <pre className="cover-out">{result.coverLetter}</pre>}
        </div>
      </aside>
    </div>
  );
}
