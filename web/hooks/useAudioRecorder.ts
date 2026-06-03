'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { VoiceApiResponseSchema, type VoiceApiResponse } from '@/lib/voice';

type RecorderState = {
  mediaRecorder: MediaRecorder | null;
  stream: MediaStream | null;
  chunks: Blob[];
};

const MIME_CANDIDATES = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/mp4',
  '',
];

function resolveMimeType(): string {
  if (typeof window === 'undefined' || typeof MediaRecorder === 'undefined') return '';
  return MIME_CANDIDATES.find((type) => !type || MediaRecorder.isTypeSupported(type)) ?? '';
}

function cleanup(state: RecorderState) {
  state.mediaRecorder = null;
  if (state.stream) {
    for (const track of state.stream.getTracks()) track.stop();
  }
  state.stream = null;
  state.chunks = [];
}

export function useAudioRecorder(endpoint = '/api/cv-voice', apiKey = '') {
  const recorderRef = useRef<RecorderState>({
    mediaRecorder: null,
    stream: null,
    chunks: [],
  });
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const recorderState = recorderRef.current;
    return () => cleanup(recorderState);
  }, []);

  const startRecording = useCallback(async (): Promise<boolean> => {
    if (isRecording || recorderRef.current.mediaRecorder) return false;
    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError('Audio recording is not supported in this browser.');
      return false;
    }

    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = resolveMimeType();
      const mediaRecorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);

      recorderRef.current.stream = stream;
      recorderRef.current.mediaRecorder = mediaRecorder;
      recorderRef.current.chunks = [];

      mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) recorderRef.current.chunks.push(event.data);
      };

      mediaRecorder.onerror = () => {
        setError('Recording failed. Please try again.');
      };

      mediaRecorder.start();
      setIsRecording(true);
      return true;
    } catch (cause) {
      const message =
        cause instanceof DOMException && cause.name === 'NotAllowedError'
          ? 'Microphone access was denied.'
          : 'Unable to start recording.';
      setError(message);
      cleanup(recorderRef.current);
      setIsRecording(false);
      return false;
    }
  }, [isRecording]);

  const stopRecording = useCallback(
    async (extraFields?: Record<string, string>, provider?: string): Promise<VoiceApiResponse> => {
      const active = recorderRef.current.mediaRecorder;
      if (!active || !isRecording) {
        return { ok: false, error: 'Recorder is not active.' };
      }

      setIsRecording(false);
      setIsUploading(true);
      setError(null);

      try {
        await new Promise<void>((resolve) => {
          active.onstop = () => resolve();
          active.stop();
        });

        const mimeType = active.mimeType || 'audio/webm';
        const extension = mimeType.includes('mp4') ? 'mp4' : 'webm';
        const blob = new Blob(recorderRef.current.chunks, { type: mimeType || 'audio/webm' });
        const file = new File([blob], `voice-input.${extension}`, { type: blob.type || 'audio/webm' });

        const formData = new FormData();
        formData.set('audio', file);
        if (extraFields) {
          for (const [key, value] of Object.entries(extraFields)) {
            formData.set(key, value);
          }
        }

        const headers: Record<string, string> = {};
        if (apiKey) headers['x-api-key'] = apiKey;
        if (provider) headers['x-provider'] = provider;

        const response = await fetch(endpoint, {
          method: 'POST',
          body: formData,
          headers,
        });

        const payload = await response.json();
        const parsed = VoiceApiResponseSchema.safeParse(payload);
        if (!parsed.success) {
          return { ok: false, error: 'Invalid voice API response.' };
        }
        return parsed.data;
      } catch (cause) {
        const message = cause instanceof Error ? cause.message : 'Audio upload failed.';
        setError(message);
        return { ok: false, error: message };
      } finally {
        cleanup(recorderRef.current);
        setIsUploading(false);
      }
    },
    [apiKey, endpoint, isRecording]
  );

  return {
    isRecording,
    isUploading,
    error,
    startRecording,
    stopRecording,
  };
}
