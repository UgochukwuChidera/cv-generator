'use client';
import { useState } from 'react';
import { useNexusStore } from '@/lib/store';

export function JDTargeting() {
  const { mcs, aiProvider, aiKey, aiModel, setMCS } = useNexusStore();
  const [jd, setJD] = useState('');
  const [result, setResult] = useState<{ score: number; coverLetter: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function analyze() {
    if (!mcs || !jd.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/ai/target', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': aiKey },
        body: JSON.stringify({ mcs, jd, provider: aiProvider, model: aiModel }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      if (data.tailored) setMCS(data.tailored);
      setResult({ score: data.score, coverLetter: data.coverLetter });
    } catch (e) {
      alert(`Error: ${String(e)}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Paste Job Description</label>
        <textarea
          value={jd}
          onChange={(e) => setJD(e.target.value)}
          rows={8}
          placeholder="Paste the full job description here..."
          className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <button
        onClick={analyze}
        disabled={loading || !jd.trim() || !mcs}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Analyzing...' : 'Analyze & Tailor'}
      </button>
      {result && (
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className={`text-3xl font-bold ${result.score >= 70 ? 'text-green-600' : result.score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                {result.score}%
              </div>
              <div>
                <div className="font-medium text-gray-800">Fit Score</div>
                <div className="text-sm text-gray-500">Resume has been tailored for this JD</div>
              </div>
            </div>
          </div>
          {result.coverLetter && (
            <div>
              <h3 className="font-medium text-gray-800 mb-2">Generated Cover Letter</h3>
              <div className="border rounded-lg p-4 bg-gray-50 text-sm text-gray-700 whitespace-pre-wrap">
                {result.coverLetter}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
