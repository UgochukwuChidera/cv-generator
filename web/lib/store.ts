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
  setProvider: (provider: NexusStore['aiProvider'], key: string, model?: string) => void;
}

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
      setProvider: (provider, key, model = '') => set({ aiProvider: provider, aiKey: key, aiModel: model }),
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
