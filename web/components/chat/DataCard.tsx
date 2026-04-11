'use client';

import { useMemo, useState } from 'react';

export type DataRow = { label: string; value: string; multiline?: boolean };

export default function DataCard({ rows }: { rows: DataRow[] }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<DataRow[]>(rows);
  const [saved, setSaved] = useState(rows);

  const visible = useMemo(() => (editing ? draft : saved), [editing, draft, saved]);

  function cancel() {
    setDraft(saved);
    setEditing(false);
  }

  function save() {
    setSaved(draft);
    setEditing(false);
  }

  return (
    <div className="data-card">
      <div className="dc-h">
        <strong>Extracted Data — click to edit</strong>
        <div className="dc-actions">
          {!editing ? <button onClick={() => setEditing(true)}>Edit</button> : <button onClick={cancel}>Cancel</button>}
          {editing && <button onClick={save}>Save</button>}
        </div>
      </div>
      {visible.map((row, index) => (
        <div className="dc-row" key={`${row.label}-${index}`}>
          <label>{row.label}</label>
          {row.multiline ? (
            <textarea
              className={`dc-in ${editing ? 'editing' : ''}`}
              rows={3}
              readOnly={!editing}
              value={row.value}
              onChange={(e) => setDraft((prev) => prev.map((r, i) => (i === index ? { ...r, value: e.target.value } : r)))}
            />
          ) : (
            <input
              className={`dc-in ${editing ? 'editing' : ''}`}
              readOnly={!editing}
              value={row.value}
              onChange={(e) => setDraft((prev) => prev.map((r, i) => (i === index ? { ...r, value: e.target.value } : r)))}
            />
          )}
        </div>
      ))}
    </div>
  );
}
