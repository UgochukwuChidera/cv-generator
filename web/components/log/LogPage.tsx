'use client';

import { useNexusStore } from '@/lib/store';

type LogEntry = {
  version: string;
  date: string;
  kind: 'feat' | 'fix' | 'stab';
  text: string;
};

const FALLBACK_LOG: LogEntry[] = [
  { version: 'v1.0.0', date: '2026-04-11', kind: 'feat', text: 'Initial release: chat extraction + clarification, structured editor, JD targeting, cover-letter generation, and exports (PDF/DOCX/HTML/JSON/YAML).' },
  { version: 'v1.0.0', date: '2026-04-11', kind: 'feat', text: 'Added profile quality scoring with section completeness and actionable missing-field prompts.' },
  { version: 'v1.0.0', date: '2026-04-11', kind: 'fix', text: 'Validated upload parsing and schema-normalized persistence for repeatable CV/resume workflows.' },
];

export default function LogPage() {
  const { mcs } = useNexusStore();

  const entries: LogEntry[] =
    !mcs?.history || mcs.history.length === 0
      ? FALLBACK_LOG
      : mcs.history.map((item, index) => {
          const base = typeof item === 'object' && item ? (item as Record<string, unknown>) : {};
          const kindRaw = typeof base.kind === 'string' ? base.kind : 'stab';
          const kind: LogEntry['kind'] = kindRaw === 'feat' || kindRaw === 'fix' ? kindRaw : 'stab';
          return {
            version: typeof base.version === 'string' ? base.version : `v${index + 1}.0.0`,
            date: typeof base.date === 'string' ? base.date : new Date().toISOString().slice(0, 10),
            kind,
            text: typeof base.text === 'string' ? base.text : JSON.stringify(item),
          };
        });

  return (
    <div className="cl-wrap">
      {entries.map((entry, index) => (
        <div className="tl" key={`${entry.version}-${entry.date}-${index}`}>
          <div className="tl-l">
            <strong>{entry.version}</strong>
            <span>{entry.date}</span>
          </div>
          <div className={`tl-b ${index === 0 ? 'major' : ''}`}>
            <div className="badges">
              <span className={entry.kind}>{entry.kind}</span>
            </div>
            <p className="cl-step">{entry.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
