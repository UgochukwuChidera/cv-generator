'use client';
import { useNexusStore } from '@/lib/store';
import type { MCS, Personal, Experience } from '@nexus/schema';

export function FormEditor() {
  const { mcs, setMCS } = useNexusStore();

  const updatePersonal = (field: keyof Personal, value: string) => {
    if (!mcs) return;
    setMCS({ ...mcs, personal: { ...mcs.personal, [field]: value } });
  };

  const updateSummary = (value: string) => {
    if (!mcs) return;
    setMCS({ ...mcs, summary: value });
  };

  const updateExperience = (index: number, updated: Experience) => {
    if (!mcs) return;
    const exps = [...(mcs.experience || [])];
    exps[index] = updated;
    setMCS({ ...mcs, experience: exps });
  };

  const updateSkills = (csv: string) => {
    if (!mcs) return;
    setMCS({ ...mcs, skills: csv.split(',').map((s) => s.trim()).filter((s) => s).map((s) => ({ name: s })) });
  };

  if (!mcs) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>No resume data yet.</p>
        <p className="text-sm mt-2">Go to the <a href="/" className="text-blue-600 underline">home page</a> to get started with AI extraction.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Personal Info */}
      <section>
        <h2 className="text-base font-semibold text-gray-800 mb-3 border-b pb-2">Personal Information</h2>
        <div className="grid grid-cols-2 gap-3">
          {(['name', 'title', 'email', 'phone', 'location', 'website', 'linkedin', 'github', 'twitter'] as const).map((field) => (
            <div key={field}>
              <label className="block text-xs font-medium text-gray-600 mb-1 capitalize">{field}</label>
              <input
                type={field === 'email' ? 'email' : 'text'}
                value={mcs.personal?.[field] || ''}
                onChange={(e) => updatePersonal(field, e.target.value)}
                className="w-full border rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Summary */}
      <section>
        <h2 className="text-base font-semibold text-gray-800 mb-3 border-b pb-2">Summary</h2>
        <textarea
          value={mcs.summary || ''}
          onChange={(e) => updateSummary(e.target.value)}
          rows={4}
          className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </section>

      {/* Experience */}
      <section>
        <h2 className="text-base font-semibold text-gray-800 mb-3 border-b pb-2">Experience</h2>
        {mcs.experience?.map((exp, i) => (
          <div key={i} className="border rounded p-3 mb-3 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
                <input
                  value={exp.role || ''}
                  onChange={(e) => {
                    updateExperience(i, { ...exp, role: e.target.value });
                  }}
                  className="w-full border rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Company</label>
                <input
                  value={exp.company || ''}
                  onChange={(e) => {
                    updateExperience(i, { ...exp, company: e.target.value });
                  }}
                  className="w-full border rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Bullets (one per line)</label>
              <textarea
                value={exp.bullets?.join('\n') || ''}
                onChange={(e) => {
                  updateExperience(i, { ...exp, bullets: e.target.value.split('\n').filter((line) => line.trim()) });
                }}
                rows={3}
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        ))}
      </section>

      {/* Skills */}
      <section>
        <h2 className="text-base font-semibold text-gray-800 mb-3 border-b pb-2">Skills</h2>
        <input
          value={mcs.skills?.map((s) => s.name).join(', ') || ''}
          onChange={(e) => updateSkills(e.target.value)}
          placeholder="Python, TypeScript, React, AWS..."
          className="w-full border rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </section>
    </div>
  );
}
