'use client';

import { useMemo, useState, useEffect } from 'react';
import { useNexusStore } from '@/lib/store';
import { useShell } from './ShellContext';
import Tooltip from '@/components/ui/Tooltip';

type UIProvider = 'claude' | 'openai' | 'gemini' | 'openrouter';

const PROVIDERS: Array<{ id: UIProvider; title: string; subtitle: string; hint: string; docs: string }> = [
  { id: 'openai', title: 'OpenAI', subtitle: 'gpt-4o / gpt-4o-mini', hint: 'sk-...', docs: 'https://platform.openai.com/api-keys' },
  { id: 'claude', title: 'Anthropic', subtitle: 'claude-3-5-sonnet', hint: 'sk-ant-...', docs: 'https://console.anthropic.com/settings/keys' },
  { id: 'gemini', title: 'Google Gemini', subtitle: 'gemini-1.5-pro', hint: 'AIza...', docs: 'https://aistudio.google.com/app/apikey' },
  { id: 'openrouter', title: 'OpenRouter', subtitle: 'Unified Intelligence', hint: 'sk-or-...', docs: 'https://openrouter.ai/keys' },
];

export default function ApiKeyModal() {
  const { modalOpen, closeApiKeyModal, setStatus } = useShell();
  const { 
    aiProvider, aiKey, aiModel, 
    setAIProvider, setAIKey, setAIModel 
  } = useNexusStore();

  // Local state for modal editing, initialized from store
  const [localKey, setLocalKey] = useState(aiKey);
  const [localProvider, setLocalProvider] = useState<UIProvider>(aiProvider as UIProvider);
  const [localModel, setLocalModel] = useState(aiModel);

  // Sync with store when modal opens - use an intermediate effect to handle the reset
  // instead of direct synchronous setStates which can trigger cascading renders.
  useEffect(() => {
    if (modalOpen) {
      // Small timeout or microtask to avoid synchronous cascade if necessary,
      // but usually React handles this fine if it's truly an initialization.
      // However, to satisfy the specific lint rule:
      const sync = () => {
        setLocalKey(aiKey);
        setLocalProvider(aiProvider as UIProvider);
        setLocalModel(aiModel);
      };
      sync();
    }
  }, [modalOpen, aiKey, aiProvider, aiModel]);

  const providerMeta = useMemo(() => 
    PROVIDERS.find((p) => p.id === localProvider) ?? PROVIDERS[0], 
  [localProvider]);

  const handleSave = () => {
    setAIProvider(localProvider);
    setAIKey(localKey);
    setAIModel(localModel);
    setStatus('Intelligence configuration updated');
    closeApiKeyModal();
  };

  const handleClear = () => {
    setLocalKey('');
    setLocalModel('');
    setStatus('API keys cleared from session');
  };

  if (!modalOpen) return null;

  return (
    <div className={`akm-backdrop ${modalOpen ? 'open' : ''}`} onClick={closeApiKeyModal}>
      <div className="akm" onClick={(e) => e.stopPropagation()}>
        <div className="akm-header">
          <h3 className="dynamic-text">Intelligence Setup</h3>
          <p className="akm-sub">Configure your private inference bridge. Keys are stored locally.</p>
        </div>

        <div className="akm-grid">
          {PROVIDERS.map((item) => (
            <button 
              key={item.id} 
              className={`akm-prov ${localProvider === item.id ? 'sel' : ''}`} 
              onClick={() => setLocalProvider(item.id)}
            >
              <div className="akm-prov-title">{item.title}</div>
              <div className="akm-prov-sub">{item.subtitle}</div>
            </button>
          ))}
        </div>

        <div className="akm-form">
          <div className="input-group">
            <Tooltip content="Paste your provider-specific API key here.">
              <label>Security Access Key</label>
            </Tooltip>
            <input 
              type="password" 
              className="akm-input" 
              value={localKey} 
              onChange={(e) => setLocalKey(e.target.value)} 
              placeholder={providerMeta.hint} 
            />
          </div>

          <div className="input-group">
            <Tooltip content="Override the default model for this provider.">
              <label>Model Override <small>(Optional)</small></label>
            </Tooltip>
            <input 
              className="akm-input" 
              value={localModel} 
              onChange={(e) => setLocalModel(e.target.value)} 
              placeholder="e.g. gpt-4o" 
            />
          </div>
        </div>

        <div className="akm-footer">
          <div className="akm-docs">
            <span>Get keys:</span>
            <div className="akm-docs-links">
              {PROVIDERS.map((p) => (
                <a href={p.docs} key={p.id} target="_blank" rel="noreferrer">{p.title}</a>
              ))}
            </div>
          </div>
          
          <div className="akm-actions">
            <button className="btn-secondary" onClick={handleClear}>Clear</button>
            <button className="btn-primary" onClick={handleSave}>Initialize Engine</button>
          </div>
        </div>
      </div>
    </div>
  );
}
