import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MCS } from '@nexus/schema';

interface NexusStore {
  mcs: MCS | null;
  setMCS: (mcs: MCS) => void;
  updateMCS: (partial: Partial<MCS>) => void;
  clearMCS: () => void;
  aiProvider: 'claude' | 'openai' | 'gemini' | 'openrouter';
  aiKey: string;
  aiModel: string;
  setProvider: (provider: NexusStore['aiProvider'], key: string, model?: string) => void;
}

export const useNexusStore = create<NexusStore>()(
  persist(
    (set) => ({
      mcs: null,
      setMCS: (mcs) => set({ mcs }),
      updateMCS: (partial) =>
        set((state) => ({
          mcs: state.mcs ? { ...state.mcs, ...partial } : (partial as MCS),
        })),
      clearMCS: () => set({ mcs: null }),
      aiProvider: 'openai',
      aiKey: '',
      aiModel: '',
      setProvider: (provider, key, model = '') =>
        set({ aiProvider: provider, aiKey: key, aiModel: model }),
    }),
    {
      name: 'nexus-store',
      partialize: (state) => ({
        mcs: state.mcs,
        aiProvider: state.aiProvider,
        aiKey: state.aiKey,
        aiModel: state.aiModel,
      }),
    }
  )
);
