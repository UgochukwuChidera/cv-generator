'use client';

import { useEffect } from 'react';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { usePremiumTTS } from '@/hooks/usePremiumTTS';
import { useNexusStore } from '@/lib/store';
import { applyVoiceAction } from '@/lib/voice';
import { useShell } from '@/components/layout/ShellContext';

export default function VoiceMicButton() {
  const {
    aiKey,
    aiProvider,
    mcs,
    setMCS,
    voiceEnabled,
    voiceRecording,
    voiceProcessing,
    setVoiceRecording,
    setVoiceProcessing,
    setVoiceSpeaking,
  } = useNexusStore();
  const { openApiKeyModal, setStatus } = useShell();
  const { isRecording, isUploading, error, startRecording, stopRecording } = useAudioRecorder('/api/cv-voice', aiKey);
  const { speak, isSpeaking, supportsTTS } = usePremiumTTS();

  useEffect(() => { setVoiceRecording(isRecording); }, [isRecording, setVoiceRecording]);
  useEffect(() => { setVoiceSpeaking(isSpeaking); }, [isSpeaking, setVoiceSpeaking]);
  useEffect(() => { if (error) setStatus(error); }, [error, setStatus]);

  const recording = isRecording || voiceRecording;
  const busy = isUploading || voiceProcessing || isSpeaking;

  async function toggleRecording() {
    if (!voiceEnabled || busy) return;
    if (!aiKey) { openApiKeyModal(); return; }

    if (!recording) {
      const started = await startRecording();
      setVoiceRecording(started);
      if (started) setStatus('Voice recording started');
      return;
    }

    setVoiceRecording(false);
    setVoiceProcessing(true);
    setStatus('Processing voice input...');

    const result = await stopRecording({
      mcs: JSON.stringify(mcs ?? {}),
    }, aiProvider);

    if (!result.ok) {
      setStatus(result.error);
      setVoiceProcessing(false);
      return;
    }

    const updated = applyVoiceAction(mcs, result.action);
    setMCS(updated);
    setStatus(result.transcript ? `Heard: "${result.transcript}"` : 'Voice update applied');

    if (supportsTTS) speak(result.assistantResponse);
    setVoiceProcessing(false);
  }

  return (
    <button
      type="button"
      className={`voice-mic-btn ${recording ? 'recording dynamic-accent' : ''}`}
      onClick={toggleRecording}
      aria-label={recording ? 'Stop recording' : 'Start voice recording'}
      title={recording ? 'Stop recording' : 'Start voice recording'}
    >
      {busy ? '…' : recording ? '■' : '🎙'}
    </button>
  );
}
