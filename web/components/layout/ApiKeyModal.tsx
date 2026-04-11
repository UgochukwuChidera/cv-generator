'use client';

import { useEffect, useMemo, useState } from 'react';
import { useNexusStore } from '@/lib/store';
import { useShell } from './ShellContext';

type UIProvider = 'anthropic' | 'openai' | 'gemini' | 'openrouter';

type APIConfig = {
  provider: UIProvider;
  key: string;
  model: string | null;
  baseUrl: string | null;
};

const PROVIDERS: Array<{ id: UIProvider; title: string; subtitle: string; hint: string; docs: string }> = [
  { id: 'anthropic', title: 'Anthropic', subtitle: 'claude-3-5-sonnet', hint: 'starts with sk-ant-...', docs: 'https://console.anthropic.com/settings/keys' },
  { id: 'openai', title: 'OpenAI', subtitle: 'gpt-4o-mini', hint: 'starts with sk-...', docs: 'https://platform.openai.com/api-keys' },
  { id: 'gemini', title: 'Google Gemini', subtitle: 'gemini-1.5-flash', hint: 'starts with AIza...', docs: 'https://aistudio.google.com/app/apikey' },
  { id: 'openrouter', title: 'OpenRouter', subtitle: 'openai/gpt-4o-mini', hint: 'starts with sk-or-...', docs: 'https://openrouter.ai/keys' },
];

function toStoreProvider(provider: UIProvider): 'claude' | 'openai' | 'gemini' | 'openrouter' {
  if (provider === 'anthropic') return 'claude';
  return provider;
}

function fromStoreProvider(provider: 'claude' | 'openai' | 'gemini' | 'openrouter'): UIProvider {
  if (provider === 'claude') return 'anthropic';
  return provider;
}

function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    localStorage.setItem('__nexus_storage__', '1');
    localStorage.removeItem('__nexus_storage__');
    return localStorage;
  } catch {
    try {
      sessionStorage.setItem('__nexus_storage__', '1');
      sessionStorage.removeItem('__nexus_storage__');
      return sessionStorage;
    } catch {
      return null;
    }
  }
}

function saveCfg(cfg: APIConfig) {
  const storage = getStorage();
  if (!storage) return;
  storage.setItem('nexus_api_cfg', JSON.stringify(cfg));
}

function clearCfg() {
  const storage = getStorage();
  if (!storage) return;
  storage.removeItem('nexus_api_cfg');
}

function loadCfg(): APIConfig | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('nexus_api_cfg') || sessionStorage.getItem('nexus_api_cfg');
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<APIConfig>;
    if (!parsed || typeof parsed.key !== 'string') return null;
    if (!parsed.provider || !['anthropic', 'openai', 'gemini', 'openrouter'].includes(parsed.provider)) return null;
    return {
      provider: parsed.provider,
      key: parsed.key,
      model: typeof parsed.model === 'string' ? parsed.model : null,
      baseUrl: typeof parsed.baseUrl === 'string' ? parsed.baseUrl : null,
    };
  } catch {
    return null;
  }
}

export default function ApiKeyModal() {
  const { modalOpen, closeApiKeyModal, setStatus } = useShell();
  const { aiProvider, aiKey, aiModel, setProvider } = useNexusStore();

  const [provider, setUIProvider] = useState<UIProvider>('openai');
  const [key, setKey] = useState('');
  const [model, setModel] = useState('');
  const [baseUrl, setBaseUrl] = useState('https://openrouter.ai/api/v1');

  useEffect(() => {
    if (!aiKey) {
      const cfg = loadCfg();
      if (cfg?.key) {
        setProvider(toStoreProvider(cfg.provider), cfg.key, cfg.model ?? '');
      }
    }
  }, [aiKey, setProvider]);

  useEffect(() => {
    if (!modalOpen) return;
    const fromStore = fromStoreProvider(aiProvider);
    const cfg = loadCfg();
    const id = window.requestAnimationFrame(() => {
      setUIProvider(cfg?.provider ?? fromStore);
      setKey(cfg?.key ?? aiKey ?? '');
      setModel(cfg?.model ?? aiModel ?? '');
      setBaseUrl(cfg?.baseUrl ?? 'https://openrouter.ai/api/v1');
    });
    return () => window.cancelAnimationFrame(id);
  }, [modalOpen, aiProvider, aiKey, aiModel]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeApiKeyModal();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [closeApiKeyModal]);

  const providerMeta = useMemo(() => PROVIDERS.find((p) => p.id === provider) ?? PROVIDERS[0], [provider]);

  function save() {
    setProvider(toStoreProvider(provider), key, model);
    saveCfg({ provider, key, model: model || null, baseUrl: provider === 'openrouter' ? baseUrl || null : null });
    setStatus('API key saved');
    closeApiKeyModal();
  }

  function clear() {
    setProvider('openai', '', '');
    clearCfg();
    setKey('');
    setModel('');
    setBaseUrl('https://openrouter.ai/api/v1');
    setStatus('API key cleared');
    closeApiKeyModal();
  }

  return (
    <div className={`akm-backdrop ${modalOpen ? 'open' : ''}`} onClick={closeApiKeyModal}>
      <div className="akm" onClick={(e) => e.stopPropagation()}>
        <h3>⚿ API Provider</h3>
        <p className="akm-sub">Stored locally in your browser and used only for direct provider calls.</p>

        <div className="akm-grid">
          {PROVIDERS.map((item) => (
            <button key={item.id} className={`akm-prov ${provider === item.id ? 'sel' : ''}`} onClick={() => setUIProvider(item.id)}>
              <strong>{item.title}</strong>
              <span>{item.subtitle}</span>
            </button>
          ))}
        </div>

        <label className="akm-lab">
          <span>API Key</span>
          <input type="password" className="akm-input" value={key} onChange={(e) => setKey(e.target.value)} placeholder={providerMeta.hint} />
        </label>

        <label className="akm-lab">
          <span>Model Override (optional)</span>
          <input className="akm-input" value={model} onChange={(e) => setModel(e.target.value)} placeholder={providerMeta.subtitle} />
        </label>

        {provider === 'openrouter' && (
          <label className="akm-lab">
            <span>Base URL</span>
            <input className="akm-input" value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} placeholder="https://openrouter.ai/api/v1" />
          </label>
        )}

        <div className="akm-note">
          <span>Provider key pages:</span>
          {PROVIDERS.map((p) => (
            <a href={p.docs} key={p.id} target="_blank" rel="noreferrer">
              {p.title}
            </a>
          ))}
        </div>

        <div className="akm-actions">
          <button className="btn-ghost" onClick={clear}>Clear Key</button>
          <div className="spacer" />
          <button className="btn-ghost" onClick={closeApiKeyModal}>Cancel</button>
          <button className="btn-primary" onClick={save}>Save &amp; Close</button>
        </div>
      </div>
    </div>
  );
}
