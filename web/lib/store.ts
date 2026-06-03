import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MCS, Snapshot, Annotation, FABMessage, AIAction } from '@nexus/schema';
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
  // Core CV
  mcs: MCS | null;
  quality: MCSQuality | null;
  jdAnalysis: JDAnalysis | null;
  setMCS: (mcs: MCS) => void;
  updateMCS: (partial: Partial<MCS>) => void;
  clearMCS: () => void;
  setJDAnalysis: (analysis: JDAnalysis | null) => void;
  saveCoverLetter: (key: string, content: string) => void;

  // AI config
  aiProvider: 'claude' | 'openai' | 'gemini' | 'openrouter' | 'groq';
  aiKey: string;
  aiModel: string;
  tavilyKey: string;
  setTavilyKey: (key: string) => void;
  setProvider: (provider: NexusStore['aiProvider'], key: string, model?: string) => void;
  setAIKey: (key: string) => void;
  setAIProvider: (provider: NexusStore['aiProvider']) => void;
  setAIModel: (model: string) => void;

  // Preferences
  graphVisible: boolean;
  graphMagnetism: number;
  graphRadius: number;
  dotSize: number;
  dotDensity: number;
  hueRotationSpeed: number;
  twinkleIntensity: number;
  setPreference: (key: 'graphVisible' | 'graphMagnetism' | 'graphRadius' | 'dotSize' | 'dotDensity' | 'hueRotationSpeed' | 'twinkleIntensity', value: number | boolean) => void;
  resetToDefaults: () => void;

  // Voice
  voiceEnabled: boolean;
  voiceRecording: boolean;
  voiceProcessing: boolean;
  voiceSpeaking: boolean;
  canvasInteractionLocked: boolean;
  setVoiceEnabled: (enabled: boolean) => void;
  setVoiceRecording: (recording: boolean) => void;
  setVoiceProcessing: (processing: boolean) => void;
  setVoiceSpeaking: (speaking: boolean) => void;
  setCanvasInteractionLocked: (locked: boolean) => void;

  // ─── Snapshots ──────────────────────────────────────────────
  snapshots: Snapshot[];
  snapshotMode: boolean;
  activeSnapshotId: string | null;
  addSnapshot: (snapshot: Snapshot) => void;
  removeSnapshot: (id: string) => void;
  setSnapshotMode: (active: boolean) => void;
  setActiveSnapshot: (id: string | null) => void;
  resolveSnapshot: (id: string) => void;

  // ─── Annotations ────────────────────────────────────────────
  annotations: Annotation[];
  addAnnotation: (annotation: Annotation) => void;
  updateAnnotation: (id: string, partial: Partial<Annotation>) => void;
  removeAnnotation: (id: string) => void;

  // ─── FAB Chat ───────────────────────────────────────────────
  fabOpen: boolean;
  fabProcessing: boolean;
  fabMessages: FABMessage[];
  toggleFab: () => void;
  setFabOpen: (open: boolean) => void;
  addFabMessage: (msg: FABMessage) => void;
  setFabProcessing: (processing: boolean) => void;
  clearFabMessages: () => void;
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
      voiceEnabled: true,
      voiceRecording: false,
      voiceProcessing: false,
      voiceSpeaking: false,
      canvasInteractionLocked: false,
      ...DEFAULT_PREFERENCES,

      // ─── Snapshot state ──────────────────────────────────────
      snapshots: [],
      snapshotMode: false,
      activeSnapshotId: null,
      addSnapshot: (snapshot) =>
        set((s) => ({ snapshots: [...s.snapshots, snapshot] })),
      removeSnapshot: (id) =>
        set((s) => ({
          snapshots: s.snapshots.filter((x) => x.id !== id),
          annotations: s.annotations.filter((a) => a.snapshotId !== id),
          activeSnapshotId: s.activeSnapshotId === id ? null : s.activeSnapshotId,
        })),
      setSnapshotMode: (snapshotMode) => set({ snapshotMode, canvasInteractionLocked: snapshotMode }),
      setActiveSnapshot: (activeSnapshotId) => set({ activeSnapshotId }),
      resolveSnapshot: (id) =>
        set((s) => ({
          snapshots: s.snapshots.map((x) => (x.id === id ? { ...x, resolved: true } : x)),
        })),

      // ─── Annotation state ────────────────────────────────────
      annotations: [],
      addAnnotation: (annotation) =>
        set((s) => ({ annotations: [...s.annotations, annotation] })),
      updateAnnotation: (id, partial) =>
        set((s) => ({
          annotations: s.annotations.map((a) => (a.id === id ? { ...a, ...partial } : a)),
        })),
      removeAnnotation: (id) =>
        set((s) => ({ annotations: s.annotations.filter((a) => a.id !== id) })),

      // ─── FAB Chat state ──────────────────────────────────────
      fabOpen: false,
      fabProcessing: false,
      fabMessages: [],
      toggleFab: () => set((s) => ({ fabOpen: !s.fabOpen })),
      setFabOpen: (fabOpen) => set({ fabOpen }),
      addFabMessage: (msg) =>
        set((s) => ({ fabMessages: [...s.fabMessages, msg] })),
      setFabProcessing: (fabProcessing) => set({ fabProcessing }),
      clearFabMessages: () => set({ fabMessages: [] }),

      // ─── Setters ─────────────────────────────────────────────
      setProvider: (provider, key, model = '') => set({ aiProvider: provider, aiKey: key, aiModel: model }),
      setAIKey: (aiKey) => set({ aiKey }),
      setAIProvider: (aiProvider) => set({ aiProvider }),
      setAIModel: (aiModel) => set({ aiModel }),
      setTavilyKey: (tavilyKey) => set({ tavilyKey }),
      setPreference: (key, value) => set({ [key]: value }),
      resetToDefaults: () => set({ ...DEFAULT_PREFERENCES }),
      setVoiceEnabled: (voiceEnabled) => set({ voiceEnabled }),
      setVoiceRecording: (voiceRecording) => set({ voiceRecording }),
      setVoiceProcessing: (voiceProcessing) => set({ voiceProcessing }),
      setVoiceSpeaking: (voiceSpeaking) => set({ voiceSpeaking }),
      setCanvasInteractionLocked: (canvasInteractionLocked) => set({ canvasInteractionLocked }),
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
        voiceEnabled: state.voiceEnabled,
        voiceRecording: state.voiceRecording,
        voiceProcessing: state.voiceProcessing,
        voiceSpeaking: state.voiceSpeaking,
        canvasInteractionLocked: state.canvasInteractionLocked,
        graphVisible: state.graphVisible,
        graphMagnetism: state.graphMagnetism,
        graphRadius: state.graphRadius,
        dotSize: state.dotSize,
        dotDensity: state.dotDensity,
        hueRotationSpeed: state.hueRotationSpeed,
        twinkleIntensity: state.twinkleIntensity,
        snapshots: state.snapshots,
        annotations: state.annotations,
        fabMessages: state.fabMessages,
        fabOpen: state.fabOpen,
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
