'use client';

import ParticleCanvas from './ParticleCanvas';
import TopBar from './TopBar';
import ApiKeyModal from './ApiKeyModal';
import { ShellProvider } from './ShellContext';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ShellProvider>
      <ParticleCanvas />
      <div className="app-shell">
        <TopBar />
        <div className="app-body">{children}</div>
      </div>
      <ApiKeyModal />
    </ShellProvider>
  );
}
