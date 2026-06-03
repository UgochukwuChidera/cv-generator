'use client';

import { useState } from 'react';
import { useNexusStore } from '@/lib/store';
import type { Annotation } from '@nexus/schema';

export default function SnapshotViewer() {
  const {
    snapshots,
    annotations,
    removeSnapshot,
    setActiveSnapshot,
    activeSnapshotId,
    addAnnotation,
    updateAnnotation,
    resolveSnapshot,
    fabOpen,
    setFabOpen,
    setFabProcessing,
    addFabMessage,
    aiKey,
    aiProvider,
    aiModel,
    mcs,
  } = useNexusStore();

  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({});

  if (snapshots.length === 0) return null;

  const active = snapshots.find((s) => s.id === activeSnapshotId);
  const activeAnnotations = annotations.filter((a) => a.snapshotId === activeSnapshotId);

  const handleAnnotate = async (snapshotId: string) => {
    const content = noteInputs[snapshotId]?.trim();
    if (!content) return;

    const annotation: Annotation = {
      id: `ann_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      snapshotId,
      type: 'suggestion',
      content,
      applied: false,
      timestamp: new Date().toISOString(),
    };

    addAnnotation(annotation);
    setNoteInputs((prev) => ({ ...prev, [snapshotId]: '' }));

    // Send to AI via FAB chat
    const snap = snapshots.find((s) => s.id === snapshotId);
    const msgText = `Regarding this section of my CV:\n\n"${snap?.textContent?.slice(0, 500)}"\n\n${content}`;

    setFabOpen(true);
    setFabProcessing(true);
    addFabMessage({
      id: `fab_${Date.now()}`,
      role: 'user',
      content: msgText,
      timestamp: new Date().toISOString(),
    });

    try {
      const res = await fetch('/api/ai/annotate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(aiKey ? { 'x-api-key': aiKey } : {}),
        },
        body: JSON.stringify({ snapshot: snap, annotation, mcs, provider: aiProvider, model: aiModel }),
      });
      const data = await res.json();

      if (data.ok) {
        addFabMessage({
          id: `fab_resp_${Date.now()}`,
          role: 'assistant',
          content: data.response,
          action: data.action,
          timestamp: new Date().toISOString(),
        });
        updateAnnotation(annotation.id, { aiResponse: data.response });

        if (data.mcsPatch) {
          const { updateMCS } = useNexusStore.getState();
          updateMCS(data.mcsPatch);
        }
        if (data.resolved) {
          resolveSnapshot(snapshotId);
        }
      } else {
        addFabMessage({
          id: `fab_err_${Date.now()}`,
          role: 'assistant',
          content: `Error: ${data.error || 'Failed to process annotation'}`,
          timestamp: new Date().toISOString(),
        });
      }
    } catch {
      addFabMessage({
        id: `fab_err_${Date.now()}`,
        role: 'assistant',
        content: 'Network error processing annotation.',
        timestamp: new Date().toISOString(),
      });
    }
    setFabProcessing(false);
  };

  return (
    <div className="snapshot-viewer">
      <div className="snapshot-viewer-header">
        <h4>Captured Snapshots ({snapshots.length})</h4>
        <span className="sub">Click to inspect &amp; annotate</span>
      </div>

      <div className="snapshot-list">
        {snapshots.map((snap) => (
          <button
            key={snap.id}
            className={`snapshot-thumb ${active?.id === snap.id ? 'on' : ''} ${snap.resolved ? 'resolved' : ''}`}
            onClick={() => setActiveSnapshot(snap.id === activeSnapshotId ? null : snap.id)}
          >
            <span className="snapshot-thumb-title">{snap.title.slice(0, 50)}</span>
            <span className="snapshot-thumb-meta">
              {snap.pageLabel} &middot; {new Date(snap.timestamp).toLocaleTimeString()}
            </span>
            {snap.resolved && <span className="snapshot-resolved-badge">Resolved</span>}
          </button>
        ))}
      </div>

      {active && (
        <div className="snapshot-detail">
          <div className="snapshot-detail-header">
            <h5>{active.title}</h5>
            <div className="snapshot-detail-actions">
              <button className="btn-ghost" onClick={() => resolveSnapshot(active.id)}>
                Mark Resolved
              </button>
              <button className="btn-ghost" onClick={() => removeSnapshot(active.id)}>
                Delete
              </button>
            </div>
          </div>

          <div className="snapshot-detail-content">
            <p className="snapshot-text-preview">
              {active.textContent.slice(0, 600)}
              {active.textContent.length > 600 ? '...' : ''}
            </p>
            {active.selector && (
              <p className="snapshot-selector-info">
                Selector: <code>{active.selector}</code>
              </p>
            )}
            {active.dataPath && (
              <p className="snapshot-selector-info">
                Section: <code>{active.dataPath}</code>
              </p>
            )}
          </div>

          <div className="snapshot-annotations">
            <h6>Annotations ({activeAnnotations.length})</h6>
            {activeAnnotations.map((ann) => (
              <div key={ann.id} className="annotation-card">
                <div className="annotation-meta">
                  <span className={`annotation-type ${ann.type}`}>{ann.type}</span>
                  <span className="annotation-status">
                    {ann.applied ? 'Applied' : ann.aiResponse ? 'Processed' : 'Pending'}
                  </span>
                </div>
                <p className="annotation-content">{ann.content}</p>
                {ann.aiResponse && (
                  <details className="annotation-ai-response">
                    <summary>AI Response</summary>
                    <p>{ann.aiResponse}</p>
                  </details>
                )}
                {ann.aiResponse && !ann.applied && (
                  <button
                    className="btn-primary btn-sm"
                    onClick={() => updateAnnotation(ann.id, { applied: true })}
                  >
                    Apply
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="snapshot-note-input">
            <textarea
              className="field"
              rows={2}
              placeholder="Ask AI to edit, improve, or analyze this section..."
              value={noteInputs[active.id] || ''}
              onChange={(e) =>
                setNoteInputs((prev) => ({ ...prev, [active.id]: e.target.value }))
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAnnotate(active.id);
                }
              }}
            />
            <button
              className="btn-primary"
              onClick={() => handleAnnotate(active.id)}
              disabled={!noteInputs[active.id]?.trim()}
            >
              Send to AI
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
