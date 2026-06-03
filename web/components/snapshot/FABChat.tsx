'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useNexusStore } from '@/lib/store';
import { useShell } from '@/components/layout/ShellContext';
import SnapshotViewer from './SnapshotViewer';

const PAGE_MAP: Record<string, { label: string; context: string }> = {
  '/': { label: 'Chat', context: 'Main AI chat for CV building' },
  '/editor': { label: 'Editor', context: 'CV structured editor with section forms and live preview' },
  '/jd-targeting': { label: 'JD Target', context: 'Job description targeting analysis with fit scores' },
  '/export': { label: 'Export', context: 'Export CV as PDF/DOCX/HTML/JSON, cover letter studio' },
  '/settings': { label: 'Settings', context: 'System preferences and AI provider configuration' },
};

export default function FABChat() {
  const {
    fabOpen,
    fabProcessing,
    fabMessages,
    toggleFab,
    setFabOpen,
    addFabMessage,
    setFabProcessing,
    clearFabMessages,
    snapshotMode,
    setSnapshotMode,
    mcs,
    updateMCS,
    snapshots,
    aiProvider,
    aiKey,
    aiModel,
  } = useNexusStore();

  const { openApiKeyModal } = useShell();
  const pathname = usePathname();
  const [input, setInput] = useState('');
  const [showSnapshots, setShowSnapshots] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const page = PAGE_MAP[pathname] || { label: 'Unknown', context: 'Nexus CV Generator' };

  useEffect(() => {
    if (fabOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [fabMessages, fabOpen]);

  useEffect(() => {
    if (fabOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [fabOpen]);

  const handleQuickAction = useCallback(async (cmd: string, args: string) => {
    if (cmd === 'snap') {
      setSnapshotMode(!snapshotMode);
      addFabMessage({
        id: `fab_sys_${Date.now()}`,
        role: 'assistant',
        content: snapshotMode ? 'Snapshot mode deactivated.' : 'Snapshot mode activated! Drag to select any region on the page.',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (cmd === 'help') {
      addFabMessage({
        id: `fab_sys_${Date.now()}`,
        role: 'assistant',
        content: `Available commands:\n- /snap — Toggle snapshot capture mode\n- /compare <JD text> — Compare resume against a job description\n- /score — Score your resume completeness\n- /edit <section> <change> — Edit a CV section\n- /help — Show this help`,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (cmd === 'compare' && args) {
      addFabMessage({
        id: `fab_usr_${Date.now()}`,
        role: 'assistant',
        content: `Running JD comparison...`,
        timestamp: new Date().toISOString(),
      });
      const { setJDAnalysis } = useNexusStore.getState();
      setFabProcessing(true);
      try {
        const res = await fetch('/api/ai/target', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-key': aiKey },
          body: JSON.stringify({ mcs, jd: args, provider: aiProvider, model: aiModel }),
        });
        const data = await res.json();
        if (data.ok) {
          setJDAnalysis(data);
          addFabMessage({
            id: `fab_ai_${Date.now()}`,
            role: 'assistant',
            content: `**JD Comparison Complete**\n- Overall Score: **${data.score}%**\n- Skills: ${data.subScores.skills}% | Experience: ${data.subScores.experience}% | Domain: ${data.subScores.domain}%\n- Missing Skills: ${(data.missingSkills || []).join(', ') || 'None'}\n- Suggestions: ${(data.bulletSuggestions || []).length} bullet rewrites`,
            timestamp: new Date().toISOString(),
          });
        }
      } catch {
        // handled above
      }
      setFabProcessing(false);
      return;
    }
  }, [snapshotMode, setSnapshotMode, addFabMessage, setFabProcessing, aiKey, mcs, aiProvider, aiModel]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || fabProcessing || !aiKey) {
      if (!aiKey) openApiKeyModal();
      return;
    }

    setInput('');

    addFabMessage({
      id: `fab_usr_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    });

    setFabProcessing(true);

    const actionMatch = text.match(/^\/(\w+)\s*(.*)/);
    if (actionMatch) {
      const [, cmd, args] = actionMatch;
      await handleQuickAction(cmd, args);
      setFabProcessing(false);
      return;
    }

    try {
      const res = await fetch('/api/ai/execute-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': aiKey,
        },
        body: JSON.stringify({
          messages: [
            ...fabMessages.slice(-20).map((m) => ({ role: m.role, content: m.content })),
            { role: 'user', content: text },
          ],
          mcs,
          page: page.label,
          pageContext: page.context,
          provider: aiProvider,
          model: aiModel,
        }),
      });
      const data = await res.json();

      if (data.ok) {
        addFabMessage({
          id: `fab_ai_${Date.now()}`,
          role: 'assistant',
          content: data.response,
          action: data.action,
          timestamp: new Date().toISOString(),
        });

        if (data.mcsPatch) {
          updateMCS(data.mcsPatch);
        }

        if (data.jdAnalysis) {
          useNexusStore.getState().setJDAnalysis(data.jdAnalysis);
        }
      } else {
        addFabMessage({
          id: `fab_err_${Date.now()}`,
          role: 'assistant',
          content: `Error: ${data.error || 'Request failed'}`,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (err) {
      addFabMessage({
        id: `fab_err_${Date.now()}`,
        role: 'assistant',
        content: `Network error: ${err instanceof Error ? err.message : 'Connection failed'}`,
        timestamp: new Date().toISOString(),
      });
    }
    setFabProcessing(false);
  }, [input, fabProcessing, aiKey, openApiKeyModal, addFabMessage, setFabProcessing, fabMessages, mcs, aiProvider, aiModel, updateMCS, handleQuickAction, page.label, page.context]);

  return (
    <>
      <button
        className={`fab-button ${fabOpen ? 'on' : ''}`}
        onClick={toggleFab}
        aria-label={fabOpen ? 'Close chat' : 'Open assistant chat'}
        title={`AI Assistant — ${page.label}`}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {fabOpen ? (
            <path d="M18 6L6 18M6 6l12 12" />
          ) : (
            <>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              <path d="M12 8v4M12 16h.01" />
            </>
          )}
        </svg>
        <span className="fab-badge">{snapshots.length}</span>
      </button>

      {fabOpen && (
        <>
          <div className="fab-backdrop" onClick={() => setFabOpen(false)} />
          <div className="fab-panel">
            <div className="fab-panel-header">
              <div className="fab-panel-header-left">
                <h4>AI Assistant</h4>
                <span className="fab-page-context">{page.label}</span>
              </div>
              <div className="fab-panel-header-right">
                <button
                  className={`btn-icon ${showSnapshots ? 'on' : ''}`}
                  onClick={() => setShowSnapshots(!showSnapshots)}
                  title="Toggle snapshots"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                </button>
                <button className="btn-icon" onClick={() => clearFabMessages()} title="Clear chat">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 4V3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v1" />
                  </svg>
                </button>
                <button className="btn-icon" onClick={() => setFabOpen(false)} title="Close">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="fab-panel-body">
              {showSnapshots ? (
                <SnapshotViewer />
              ) : (
                <div className="fab-messages">
                  {fabMessages.length === 0 && (
                    <div className="fab-empty">
                      <h5>How can I help you?</h5>
                      <p className="sub">Ask me anything about your CV, or use /commands:</p>
                      <div className="fab-chips">
                        <button className="chip" onClick={() => { setInput('/snap'); inputRef.current?.focus(); }}>
                          /snap
                        </button>
                        <button className="chip" onClick={() => { setInput('/help'); inputRef.current?.focus(); }}>
                          /help
                        </button>
                        <button className="chip" onClick={() => { setInput('Show me my CV score'); inputRef.current?.focus(); }}>
                          Score my CV
                        </button>
                        <button className="chip" onClick={() => { setInput('Improve my summary section'); inputRef.current?.focus(); }}>
                          Improve summary
                        </button>
                      </div>
                    </div>
                  )}
                  {fabMessages.map((msg) => (
                    <div key={msg.id} className={`fab-msg ${msg.role}`}>
                      <div className="fab-msg-content">{msg.content}</div>
                      {msg.action && (
                        <div className="fab-msg-action">
                          <span className={`action-badge ${msg.action.status}`}>
                            {msg.action.type.replace(/-/g, ' ')}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                  {fabProcessing && (
                    <div className="fab-msg assistant">
                      <div className="fab-msg-content">
                        <span className="thinking-dots">Thinking</span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            <div className="fab-panel-footer">
              <textarea
                ref={inputRef}
                className="field fab-input"
                rows={1}
                placeholder={`Ask about ${page.label}...`}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
              <button
                className="btn-primary fab-send"
                onClick={sendMessage}
                disabled={!input.trim() || fabProcessing}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
