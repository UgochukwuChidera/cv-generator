'use client';

import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

type ShellContextValue = {
  status: string;
  setStatus: (msg: string) => void;
  openApiKeyModal: () => void;
  closeApiKeyModal: () => void;
  modalOpen: boolean;
};

const ShellContext = createContext<ShellContextValue | null>(null);

export function ShellProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatusState] = useState('Ready');
  const [modalOpen, setModalOpen] = useState(false);
  const timer = useRef<number | null>(null);

  const setStatus = useCallback((msg: string) => {
    setStatusState(msg);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setStatusState('Ready'), 3000);
  }, []);

  const value = useMemo<ShellContextValue>(
    () => ({
      status,
      setStatus,
      modalOpen,
      openApiKeyModal: () => setModalOpen(true),
      closeApiKeyModal: () => setModalOpen(false),
    }),
    [status, setStatus, modalOpen]
  );

  return <ShellContext.Provider value={value}>{children}</ShellContext.Provider>;
}

export function useShell() {
  const ctx = useContext(ShellContext);
  if (!ctx) throw new Error('useShell must be used within ShellProvider');
  return ctx;
}
