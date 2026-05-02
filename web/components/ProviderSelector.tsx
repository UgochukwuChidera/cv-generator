'use client';
import { useNexusStore } from '@/lib/store';

const PROVIDERS = [
  { id: 'openai', label: 'OpenAI', placeholder: 'sk-...' },
  { id: 'claude', label: 'Anthropic Claude', placeholder: 'sk-ant-...' },
  { id: 'gemini', label: 'Google Gemini', placeholder: 'AIza...' },
  { id: 'openrouter', label: 'OpenRouter', placeholder: 'sk-or-...' },
] as const;

export function ProviderSelector() {
  const { aiProvider, aiKey, aiModel, setProvider } = useNexusStore();

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <h3 className="font-semibold text-sm text-gray-700">AI Provider (BYOK)</h3>
      <p className="text-xs text-gray-500">Your key is stored in your browser only and sent directly to the provider.</p>
      <div className="grid grid-cols-2 gap-2">
        {PROVIDERS.map((p) => (
          <button
            key={p.id}
            onClick={() => setProvider(p.id, aiProvider === p.id ? aiKey : '', aiModel)}
            className={`text-xs px-3 py-2 rounded border transition-colors ${
              aiProvider === p.id
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      <input
        type="password"
        value={aiKey}
        onChange={(e) => setProvider(aiProvider, e.target.value, aiModel)}
        placeholder={PROVIDERS.find((p) => p.id === aiProvider)?.placeholder || 'API Key'}
        className="w-full text-sm border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input
        type="text"
        value={aiModel}
        onChange={(e) => setProvider(aiProvider, aiKey, e.target.value)}
        placeholder="Model (optional, e.g. gpt-4o)"
        className="w-full text-sm border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
