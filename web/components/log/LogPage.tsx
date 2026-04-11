'use client';

import { useNexusStore } from '@/lib/store';

type LogEntry = {
  version: string;
  date: string;
  kind: 'feat' | 'fix' | 'stab';
  text: string;
};

const FALLBACK_LOG: LogEntry[] = [
  { version: 'v1.2.0', date: '2026-04-11', kind: 'feat', text: 'Nexus UI sync rollout with mono-first visual system.' },
  { version: 'v1.1.8', date: '2026-04-03', kind: 'fix', text: 'Stability and editor interaction fixes.' },
  { version: 'v1.1.2', date: '2026-03-18', kind: 'stab', text: 'Baseline alignment and reliability updates.' },
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
