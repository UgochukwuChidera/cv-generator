'use client';
import { useNexusStore } from '@/lib/store';

export function LivePreview({ theme = 'professional' }: { theme?: string }) {
  const { mcs } = useNexusStore();

  if (!mcs) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
        No resume data yet. Add information in the editor.
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm p-8 text-sm font-serif max-w-2xl mx-auto">
      {/* Header */}
      <div className="border-b-2 border-gray-800 pb-4 mb-4">
        <h1 className="text-2xl font-bold text-gray-900">{mcs.personal?.name}</h1>
        {mcs.personal?.title && <p className="text-gray-600 mt-1">{mcs.personal.title}</p>}
        <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
          {mcs.personal?.email && <span>{mcs.personal.email}</span>}
          {mcs.personal?.phone && <span>{mcs.personal.phone}</span>}
          {mcs.personal?.location && <span>{mcs.personal.location}</span>}
          {mcs.personal?.linkedin && <span>{mcs.personal.linkedin}</span>}
          {mcs.personal?.github && <span>{mcs.personal.github}</span>}
        </div>
      </div>

      {/* Summary */}
      {mcs.summary && (
        <div className="mb-4">
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-2">Summary</h2>
          <p className="text-gray-700 leading-relaxed">{mcs.summary}</p>
        </div>
      )}

      {/* Experience */}
      {mcs.experience && mcs.experience.length > 0 && (
        <div className="mb-4">
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-2">Experience</h2>
          {mcs.experience.map((exp, i) => (
            <div key={i} className="mb-3">
              <div className="flex justify-between">
                <span className="font-semibold">{exp.role}</span>
                <span className="text-gray-500 text-xs">{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</span>
              </div>
              <div className="text-gray-600">{exp.company}{exp.location ? `, ${exp.location}` : ''}</div>
              {exp.bullets && exp.bullets.length > 0 && (
                <ul className="list-disc list-inside mt-1 space-y-1 text-gray-700">
                  {exp.bullets.map((b, j) => <li key={j}>{b}</li>)}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {mcs.education && mcs.education.length > 0 && (
        <div className="mb-4">
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-2">Education</h2>
          {mcs.education.map((edu, i) => (
            <div key={i} className="mb-2">
              <div className="flex justify-between">
                <span className="font-semibold">{edu.institution}</span>
                <span className="text-gray-500 text-xs">{edu.startDate} – {edu.endDate}</span>
              </div>
              <div className="text-gray-600">{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</div>
              {edu.gpa && <div className="text-gray-500 text-xs">GPA: {edu.gpa}</div>}
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {mcs.skills && mcs.skills.length > 0 && (
        <div className="mb-4">
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-2">Skills</h2>
          <p className="text-gray-700">{mcs.skills.map((s) => s.name).join(' · ')}</p>
        </div>
      )}

      {/* Projects */}
      {mcs.projects && mcs.projects.length > 0 && (
        <div className="mb-4">
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-2">Projects</h2>
          {mcs.projects.map((proj, i) => (
            <div key={i} className="mb-2">
              <span className="font-semibold">{proj.name}</span>
              {proj.tech && proj.tech.length > 0 && (
                <span className="text-gray-500 text-xs ml-2">{proj.tech.join(', ')}</span>
              )}
              <p className="text-gray-700">{proj.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
