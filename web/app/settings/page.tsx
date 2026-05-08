'use client';

import { useNexusStore } from '@/lib/store';
import { useShell } from '@/components/layout/ShellContext';
import Select from '@/components/ui/Select';
import Tooltip from '@/components/ui/Tooltip';

const PROVIDER_OPTIONS = [
  { value: 'openai', label: 'OpenAI (GPT-4o/o1)' },
  { value: 'claude', label: 'Anthropic Claude 3.5' },
  { value: 'gemini', label: 'Google Gemini 1.5' },
  { value: 'openrouter', label: 'OpenRouter Intelligence' },
];

export default function SettingsPage() {
  const { 
    aiKey, setAIKey, 
    aiProvider, setAIProvider, 
    aiModel, setAIModel,
    graphVisible, graphMagnetism, graphRadius, dotSize, dotDensity, hueRotationSpeed, twinkleIntensity,
    setPreference, resetToDefaults
  } = useNexusStore();
  const { setStatus } = useShell();

  return (
    <div className="settings-container">
      <div className="settings-content">
        <header className="settings-header">
          <h1 className="brand-lg">System Preferences</h1>
          <p className="settings-subtitle">Calibrate intelligence parameters and environment aesthetics.</p>
        </header>
        
        <div className="settings-grid">
          {/* AI Configuration */}
          <section className="settings-section">
            <h2 className="section-title dynamic-text">Intelligence Engine</h2>
            <div className="settings-card">
              <div className="input-group">
                <Tooltip content="Select the AI infrastructure powering your CV generation.">
                  <label>Service Provider</label>
                </Tooltip>
                <Select 
                  value={aiProvider}
                  onChange={(val) => setAIProvider(val as any)}
                  options={PROVIDER_OPTIONS}
                />
              </div>

              <div className="input-group">
                <Tooltip content="Specific model identifier (e.g., gpt-4o, claude-3-5-sonnet).">
                  <label>Inference Model</label>
                </Tooltip>
                <input 
                  type="text"
                  value={aiModel}
                  onChange={(e) => setAIModel(e.target.value)}
                  placeholder="e.g. gpt-4o"
                />
              </div>

              <div className="input-group">
                <Tooltip content="Your private API key. Stored locally in your browser only.">
                  <label>Security Access Key</label>
                </Tooltip>
                <input 
                  type="password"
                  value={aiKey}
                  onChange={(e) => setAIKey(e.target.value)}
                  placeholder="Managed via browser encryption"
                />
              </div>
            </div>
          </section>

          {/* Visual Preferences */}
          <section className="settings-section">
            <h2 className="section-title dynamic-text">Atmospheric Controls</h2>
            <div className="settings-card">
              <div className="toggle-row mb-4">
                <div className="toggle-info">
                  <Tooltip content="Toggle the background particle field visibility.">
                    <label className="toggle-label block cursor-pointer">Ferromagnetic Visualization</label>
                  </Tooltip>
                  <div className="toggle-desc">Toggle the interactive particle graph background.</div>
                </div>
                <button 
                  onClick={() => setPreference('graphVisible', !graphVisible)}
                  className={`status-badge transition-all ${graphVisible ? 'active' : 'opacity-40'}`}
                >
                  {graphVisible ? 'Active' : 'Standby'}
                </button>
              </div>

              <div className="input-group">
                <Tooltip content="How strongly particles react to your cursor movement.">
                  <label>Kinetic Strength: {graphMagnetism.toFixed(1)}x</label>
                </Tooltip>
                <input 
                  type="range" 
                  min="0.1" 
                  max="5.0" 
                  step="0.1"
                  value={graphMagnetism}
                  onChange={(e) => setPreference('graphMagnetism', parseFloat(e.target.value))}
                  className="accent-dynamic"
                />
              </div>

              <div className="input-group">
                <Tooltip content="The range of influence your cursor has on particles.">
                  <label>Attraction Radius: {(graphRadius * 280).toFixed(0)}px</label>
                </Tooltip>
                <input 
                  type="range" 
                  min="0.2" 
                  max="4.0" 
                  step="0.1"
                  value={graphRadius}
                  onChange={(e) => setPreference('graphRadius', parseFloat(e.target.value))}
                  className="accent-dynamic"
                />
              </div>

              <div className="input-group">
                <Tooltip content="Size of the individual particles in the field.">
                  <label>Particle Scale: {dotSize.toFixed(1)}x</label>
                </Tooltip>
                <input 
                  type="range" 
                  min="0.5" 
                  max="4.0" 
                  step="0.1"
                  value={dotSize}
                  onChange={(e) => setPreference('dotSize', parseFloat(e.target.value))}
                  className="accent-dynamic"
                />
              </div>

              <div className="input-group">
                <Tooltip content="Grid spacing density. Lower values create more particles.">
                  <label>Field Resolution: {dotDensity} (Lower is denser)</label>
                </Tooltip>
                <input 
                  type="range" 
                  min="200" 
                  max="2000" 
                  step="100"
                  value={dotDensity}
                  onChange={(e) => setPreference('dotDensity', parseInt(e.target.value))}
                  className="accent-dynamic"
                />
              </div>

              <div className="input-group">
                <Tooltip content="Speed of the global color shift animation.">
                  <label>Chromatic Drift: {hueRotationSpeed.toFixed(1)}x</label>
                </Tooltip>
                <input 
                  type="range" 
                  min="0" 
                  max="5.0" 
                  step="0.5"
                  value={hueRotationSpeed}
                  onChange={(e) => setPreference('hueRotationSpeed', parseFloat(e.target.value))}
                  className="accent-dynamic"
                />
              </div>

              <div className="input-group">
                <Tooltip content="Intensity of the star-twinkle animation effect.">
                  <label>Luminescence Frequency: {twinkleIntensity.toFixed(1)}x</label>
                </Tooltip>
                <input 
                  type="range" 
                  min="0" 
                  max="5.0" 
                  step="0.2"
                  value={twinkleIntensity}
                  onChange={(e) => setPreference('twinkleIntensity', parseFloat(e.target.value))}
                  className="accent-dynamic"
                />
              </div>
            </div>
          </section>
        </div>

        <footer className="settings-footer">
          <Tooltip content="Restore all parameters to their original factory values.">
            <button 
              onClick={() => {
                resetToDefaults();
                setStatus('Preferences reset to factory defaults.');
              }}
              className="btn-secondary"
            >
              Reset to Defaults
            </button>
          </Tooltip>
        </footer>
      </div>
    </div>
  );
}
