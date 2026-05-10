import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MCS } from '@nexus/schema';
import { assessMCSQuality, normalizeMCS, type MCSQuality } from './mcs';

export type JDAnalysis = {
  score: number;
  subScores: { skills: number; experience: number; domain: number };
  missingSkills: string[];
  implicitSkills: string[];
  bulletSuggestions: string[];
  coverLetter: string;
  jdText?: string;
};

interface NexusStore {
  mcs: MCS | null;
  quality: MCSQuality | null;
  jdAnalysis: JDAnalysis | null;
  setMCS: (mcs: MCS) => void;
  updateMCS: (partial: Partial<MCS>) => void;
  clearMCS: () => void;
  setJDAnalysis: (analysis: JDAnalysis | null) => void;
  saveCoverLetter: (key: string, content: string) => void;
  aiProvider: 'claude' | 'openai' | 'gemini' | 'openrouter';
  aiKey: string;
  aiModel: string;
  tavilyKey: string;
  setTavilyKey: (key: string) => void;
  // Preferences
  graphVisible: boolean;
  graphMagnetism: number;
  graphRadius: number;
  dotSize: number;
  dotDensity: number;
  hueRotationSpeed: number;
  twinkleIntensity: number;
  setProvider: (provider: NexusStore['aiProvider'], key: string, model?: string) => void;
  setAIKey: (key: string) => void;
  setAIProvider: (provider: NexusStore['aiProvider']) => void;
  setAIModel: (model: string) => void;
  setPreference: (key: 'graphVisible' | 'graphMagnetism' | 'graphRadius' | 'dotSize' | 'dotDensity' | 'hueRotationSpeed' | 'twinkleIntensity', value: number | boolean) => void;
  resetToDefaults: () => void;
}

const DEFAULT_PREFERENCES = {
  graphVisible: true,
  graphMagnetism: 1.0,
  graphRadius: 1.0,
  dotSize: 1.0,
  dotDensity: 800,
  hueRotationSpeed: 1.0,
  twinkleIntensity: 1.0,
};

export const useNexusStore = create<NexusStore>()(
  persist(
    (set, get) => ({
      mcs: null,
      quality: null,
      jdAnalysis: null,
      setMCS: (mcs) => {
        const normalized = normalizeMCS(mcs);
        set({ mcs: normalized, quality: assessMCSQuality(normalized) });
      },
      updateMCS: (partial) => {
        const current = get().mcs;
        if (!current) {
          const normalized = normalizeMCS(partial as MCS);
          set({ mcs: normalized, quality: assessMCSQuality(normalized) });
          return;
        }
        const normalized = normalizeMCS({ ...current, ...partial });
        set({ mcs: normalized, quality: assessMCSQuality(normalized) });
      },
      clearMCS: () => set({ mcs: null, quality: null, jdAnalysis: null }),
      setJDAnalysis: (jdAnalysis) => set({ jdAnalysis }),
      saveCoverLetter: (key, content) => {
        const current = get().mcs;
        if (!current || !content.trim()) return;
        const next = normalizeMCS({
          ...current,
          coverLetters: {
            ...(current.coverLetters ?? {}),
            [key]: { content: content.trim(), created_at: new Date().toISOString() },
          },
          meta: {
            ...current.meta,
            updated_at: new Date().toISOString(),
          },
        });
        set({ mcs: next, quality: assessMCSQuality(next) });
      },
      aiProvider: 'openai',
      aiKey: '',
      aiModel: '',
      tavilyKey: '',
      ...DEFAULT_PREFERENCES,
      setProvider: (provider, key, model = '') => set({ aiProvider: provider, aiKey: key, aiModel: model }),
      setAIKey: (aiKey) => set({ aiKey }),
      setAIProvider: (aiProvider) => set({ aiProvider }),
      setAIModel: (aiModel) => set({ aiModel }),
      setTavilyKey: (tavilyKey) => set({ tavilyKey }),
      setPreference: (key, value) => set({ [key]: value }),
      resetToDefaults: () => set({ ...DEFAULT_PREFERENCES }),
    }),
    {
      name: 'nexus-store',
      partialize: (state) => ({
        mcs: state.mcs,
        quality: state.quality,
        jdAnalysis: state.jdAnalysis,
        aiProvider: state.aiProvider,
        aiKey: state.aiKey,
        aiModel: state.aiModel,
        tavilyKey: state.tavilyKey,
        graphVisible: state.graphVisible,
        graphMagnetism: state.graphMagnetism,
        graphRadius: state.graphRadius,
        dotSize: state.dotSize,
        dotDensity: state.dotDensity,
        hueRotationSpeed: state.hueRotationSpeed,
        twinkleIntensity: state.twinkleIntensity,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state?.mcs) return;
        const normalized = normalizeMCS(state.mcs);
        state.mcs = normalized;
        state.quality = assessMCSQuality(normalized);
      },
    }
  )
);
