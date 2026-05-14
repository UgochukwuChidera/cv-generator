'use client';

import { useEffect } from 'react';
import type { MCS } from '@nexus/schema';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { usePremiumTTS } from '@/hooks/usePremiumTTS';
import { normalizeMCS } from '@/lib/mcs';
import { useNexusStore } from '@/lib/store';
import type { VoiceAction } from '@/lib/voice';
import { useShell } from '@/components/layout/ShellContext';

const DEFAULT_EXPERIENCE = {
  company: '',
  role: '',
  startDate: '',
  endDate: '',
  current: false,
  location: '',
  bullets: [] as string[],
};

function applyVoiceAction(current: MCS | null, action: VoiceAction): MCS {
  const next = normalizeMCS(current ?? {});

  switch (action.type) {
    case 'addSkill': {
      const name = action.skill.name.trim();
      if (!name) return next;
      const exists = next.skills.some((skill) => skill.name.toLowerCase() === name.toLowerCase());
      if (!exists) {
        next.skills.push({
          name,
          category: action.skill.category?.trim() || '',
        });
      }
      return normalizeMCS(next);
    }
    case 'generateSummary': {
      next.summary = action.summary.trim();
      return normalizeMCS(next);
    }
    case 'updatePersonal': {
      next.personal = {
        ...next.personal,
        ...Object.fromEntries(
          Object.entries(action.personal).map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value])
        ),
      };
      return normalizeMCS(next);
    }
    case 'updateExperience': {
      const index = action.index ?? 0;
      while (next.experience.length <= index) {
        next.experience.push({ ...DEFAULT_EXPERIENCE });
      }
      next.experience[index] = {
        ...next.experience[index],
        ...action.experience,
        bullets:
          action.experience.bullets?.map((bullet) => bullet.trim()).filter(Boolean) ??
          next.experience[index].bullets,
      };
      return normalizeMCS(next);
    }
    case 'noop':
    default:
      return next;
  }
}

export default function VoiceAssistantInterface() {
  const {
    aiKey,
    mcs,
    setMCS,
    voiceEnabled,
    voiceRecording,
    voiceProcessing,
    setVoiceRecording,
    setVoiceProcessing,
    setVoiceSpeaking,
    canvasInteractionLocked,
    setCanvasInteractionLocked,
  } = useNexusStore();
  const { openApiKeyModal, setStatus } = useShell();
  const { isRecording, isUploading, error, startRecording, stopRecording } = useAudioRecorder('/api/cv-voice', aiKey);
  const { speak, isSpeaking, supportsTTS } = usePremiumTTS();

  useEffect(() => {
    if (voiceRecording !== isRecording) {
      setVoiceRecording(isRecording);
    }
  }, [isRecording, setVoiceRecording, voiceRecording]);

  useEffect(() => {
    setVoiceSpeaking(isSpeaking);
  }, [isSpeaking, setVoiceSpeaking]);

  useEffect(() => {
    const shouldLock = voiceRecording || voiceProcessing || isSpeaking || isUploading;
    if (canvasInteractionLocked !== shouldLock) {
      setCanvasInteractionLocked(shouldLock);
    }
  }, [canvasInteractionLocked, isSpeaking, isUploading, setCanvasInteractionLocked, voiceProcessing, voiceRecording]);

  useEffect(() => {
    if (!error) return;
    setStatus(error);
  }, [error, setStatus]);

  const recording = isRecording || voiceRecording;
  const busy = isUploading || voiceProcessing;

  async function toggleRecording() {
    if (!voiceEnabled || busy) return;
    if (!aiKey) {
      openApiKeyModal();
      return;
    }

    if (!recording) {
      const started = await startRecording();
      setVoiceRecording(started);
      if (started) setStatus('Voice recording started');
      return;
    }

    setVoiceRecording(false);
    setVoiceProcessing(true);
    setStatus('Processing voice input...');

    const result = await stopRecording({ mcs: JSON.stringify(mcs ?? {}) });
    if (!result.ok) {
      setStatus(result.error);
      setVoiceProcessing(false);
      return;
    }

    const updated = applyVoiceAction(mcs, result.action);
    setMCS(updated);
    setStatus(result.transcript ? `Heard: "${result.transcript}"` : 'Voice update applied');

    if (supportsTTS) {
      speak(result.assistantResponse);
    }

    setVoiceProcessing(false);
  }

  return (
    <div className="voice-assistant">
      <button
        type="button"
        className={`voice-mic-btn dynamic-border ${recording ? 'recording dynamic-accent' : ''}`}
        onClick={toggleRecording}
        aria-label={recording ? 'Stop recording' : 'Start voice recording'}
        title={recording ? 'Stop recording' : 'Start voice recording'}
      >
        {busy ? '…' : recording ? '■' : '🎙'}
      </button>
    </div>
  );
}
