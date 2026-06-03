'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useNexusStore } from '@/lib/store';
import type { Snapshot, SnapshotRegion } from '@nexus/schema';

export default function SnapshotCanvas() {
  const { snapshotMode, setSnapshotMode, addSnapshot } = useNexusStore();

  const canvasRef = useRef<HTMLDivElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [start, setStart] = useState({ x: 0, y: 0 });
  const [rect, setRect] = useState<SnapshotRegion | null>(null);

  const getPageLabel = useCallback(() => {
    const path = window.location.pathname;
    const map: Record<string, string> = {
      '/': 'Chat',
      '/editor': 'Editor',
      '/jd-targeting': 'JD Target',
      '/export': 'Export',
      '/settings': 'Settings',
    };
    return map[path] || path.replace('/', '').replace(/-/g, ' ') || 'Home';
  }, []);

  const captureSnapshot = useCallback(
    (region: SnapshotRegion) => {
      const elements = document.elementsFromPoint(
        region.x + region.width / 2,
        region.y + region.height / 2
      );
      const target = elements.find(
        (el) =>
          el instanceof HTMLElement &&
          el.closest('[data-cv-section], .editor-form, .chat-messages, .jd-panel, .export-panel')
      ) as HTMLElement | null;
      const sectionEl = target?.closest('[data-cv-section]') as HTMLElement | null;
      const dataPath = sectionEl?.dataset?.cvSection || null;
      const label = sectionEl?.dataset?.cvLabel || null;

      const textEl = sectionEl || target;
      const textContent = textEl?.textContent?.trim().slice(0, 3000) || '';

      const selector = (() => {
        if (sectionEl?.id) return `#${sectionEl.id}`;
        if (dataPath) return `[data-cv-section="${dataPath}"]`;
        if (target?.id) return `#${target.id}`;
        if (target?.className && typeof target.className === 'string')
          return `.${target.className.split(' ').filter(Boolean).join('.')}`;
        return undefined;
      })();

      const snapshot: Snapshot = {
        id: `snap_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        type: 'region',
        region,
        selector,
        page: window.location.pathname,
        pageLabel: getPageLabel(),
        title: `Snapshot — ${label || textContent.slice(0, 60)}`,
        textContent,
        htmlSnapshot: sectionEl?.innerHTML?.slice(0, 5000),
        dataPath: dataPath || undefined,
        timestamp: new Date().toISOString(),
        resolved: false,
      };

      addSnapshot(snapshot);
      setSnapshotMode(false);
    },
    [addSnapshot, getPageLabel, setSnapshotMode]
  );

  useEffect(() => {
    if (!snapshotMode) return;

    const el = canvasRef.current;
    if (!el) return;

    const onMouseDown = (e: MouseEvent) => {
      if (!snapshotMode) return;
      setDrawing(true);
      setStart({ x: e.clientX, y: e.clientY });
      setRect({ x: e.clientX, y: e.clientY, width: 0, height: 0 });
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!drawing) return;
      const x = Math.min(start.x, e.clientX);
      const y = Math.min(start.y, e.clientY);
      const width = Math.abs(e.clientX - start.x);
      const height = Math.abs(e.clientY - start.y);
      setRect({ x, y, width, height });
    };

    const onMouseUp = (e: MouseEvent) => {
      if (!drawing) return;
      setDrawing(false);
      const w = Math.abs(e.clientX - start.x);
      const h = Math.abs(e.clientY - start.y);
      if (w < 20 || h < 20) {
        setRect(null);
        return;
      }
      captureSnapshot({
        x: Math.min(start.x, e.clientX),
        y: Math.min(start.y, e.clientY),
        width: w,
        height: h,
      });
      setRect(null);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSnapshotMode(false);
        setRect(null);
        setDrawing(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    el.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      el.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [snapshotMode, drawing, start, captureSnapshot, setSnapshotMode]);

  if (!snapshotMode) return null;

  return (
    <div ref={canvasRef} className="snapshot-overlay">
      {rect && (
        <div
          className="snapshot-selector"
          style={{
            left: rect.x,
            top: rect.y,
            width: rect.width,
            height: rect.height,
          }}
        >
          <span className="snapshot-hint">
            {drawing ? 'Release to capture' : 'Drag to select a region'}
          </span>
        </div>
      )}
      <div className="snapshot-toolbar">
        <span className="snapshot-toolbar-label">Snapshot Mode — drag to capture any CV region</span>
        <button className="btn-ghost" onClick={() => setSnapshotMode(false)}>
          Cancel (Esc)
        </button>
      </div>
    </div>
  );
}
