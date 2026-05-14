'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

const PRIORITY_VOICE_HINTS = [
  'Google UK English Female',
  'Google US English',
  'Samantha',
  'Ava',
  'Allison',
  'Serena',
  'Moira',
  'Karen',
  'Aria',
  'Jenny',
  'Guy',
  'Zira',
  'Natural',
];

function voiceScore(voice: SpeechSynthesisVoice): number {
  const name = voice.name.toLowerCase();
  let score = 0;

  PRIORITY_VOICE_HINTS.forEach((hint, index) => {
    if (name.includes(hint.toLowerCase())) {
      score += (PRIORITY_VOICE_HINTS.length - index) * 10;
    }
  });

  if (/en(-|_)?(us|gb|au|ca)?/i.test(voice.lang)) score += 20;
  if (/natural|neural|premium|enhanced/i.test(name)) score += 25;
  if (/google|microsoft|apple/i.test(name)) score += 10;
  if (/compact|espeak|festival|robot/i.test(name)) score -= 40;

  return score;
}

function pickBestVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (voices.length === 0) return null;
  return [...voices].sort((a, b) => voiceScore(b) - voiceScore(a))[0] ?? null;
}

export function usePremiumTTS() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const hydrateVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      setSelectedVoice(pickBestVoice(availableVoices));
    };

    hydrateVoices();
    window.speechSynthesis.addEventListener('voiceschanged', hydrateVoices);

    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', hydrateVoices);
      window.speechSynthesis.cancel();
    };
  }, []);

  const supportsTTS = useMemo(
    () => typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window,
    []
  );

  const cancel = useCallback(() => {
    if (!supportsTTS) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [supportsTTS]);

  const speak = useCallback(
    (text: string, opts?: { rate?: number; pitch?: number; volume?: number }) => {
      const message = text.trim();
      if (!message || !supportsTTS) return;

      const utterance = new SpeechSynthesisUtterance(message);
      utterance.voice = selectedVoice;
      utterance.rate = opts?.rate ?? 1;
      utterance.pitch = opts?.pitch ?? 1;
      utterance.volume = opts?.volume ?? 1;
      utterance.lang = selectedVoice?.lang || 'en-US';

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    },
    [selectedVoice, supportsTTS]
  );

  return {
    voices,
    selectedVoice,
    isSpeaking,
    speak,
    cancel,
    supportsTTS,
  };
}
