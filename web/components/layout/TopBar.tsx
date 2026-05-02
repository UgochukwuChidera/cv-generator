'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useNexusStore } from '@/lib/store';
import { useShell } from './ShellContext';

const TABS = [
  { href: '/', label: 'Chat' },
  { href: '/editor', label: 'Editor' },
  { href: '/jd-targeting', label: 'JD Target' },
  { href: '/export', label: 'Export' },
  { href: '/log', label: 'Log' },
] as const;

const APP_VERSION = 'v1.0.0';

export default function TopBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { aiKey, aiProvider } = useNexusStore();
  const { status, openApiKeyModal } = useShell();
  const [showHelp, setShowHelp] = useState(false);
  const [showPalette, setShowPalette] = useState(false);

  const commands = useMemo(
    () => [
      ...TABS.map((tab) => ({ id: tab.href, label: `Go to ${tab.label}`, run: () => router.push(tab.href) })),
      { id: 'help', label: 'Show keyboard shortcuts', run: () => setShowHelp(true) },
      { id: 'key', label: aiKey ? 'Open API key settings' : 'Set API key', run: openApiKeyModal },
    ],
    [aiKey, openApiKeyModal, router]
  );

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setShowPalette((prev) => !prev);
        return;
      }

      if (event.shiftKey && event.code === 'Slash') {
        event.preventDefault();
        setShowHelp((prev) => !prev);
        return;
      }

      if (event.key === 'Escape') {
        setShowHelp(false);
        setShowPalette(false);
        return;
      }

      if (event.altKey) {
        const navMap: Record<string, string> = {
          '1': '/',
          '2': '/editor',
          '3': '/jd-targeting',
          '4': '/export',
          '5': '/log',
        };
        const href = navMap[event.key];
        if (href) {
          event.preventDefault();
          router.push(href);
        }
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [router]);

  function closeOverlays() {
    setShowHelp(false);
    setShowPalette(false);
  }

  return (
    <>
      <header className="nav">
        <div className="nav-left">
          <Link href="/" className="brand">
            <span>Nexus</span>
          </Link>
          <span className="ver">{APP_VERSION}</span>
        </div>

        <nav className="nav-tabs nav-center" aria-label="Primary navigation">
          {TABS.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link key={tab.href} href={tab.href} className={`nb ${active ? 'on' : ''}`}>
                {tab.label}
              </Link>
            );
          })}
        </nav>

        <div className="nav-right">
          <span className="status-text">{status}</span>
          <span 
            className={`key-indicator ${aiKey ? 'set' : 'unset'}`} 
            data-set={!!aiKey} 
            aria-hidden 
          />
          <button className="key-btn" onClick={openApiKeyModal}>
            {aiKey ? `${aiProvider} key set` : 'Set API Key'}
          </button>
        </div>
      </header>

      {(showPalette || showHelp) && <div className="overlay-backdrop" onClick={closeOverlays} />}

      {showPalette && (
        <div className="overlay-panel cmd-palette" role="dialog" aria-modal aria-label="Command palette">
          <h4>Command Palette</h4>
          <p className="sub">Press Cmd/Ctrl + K to toggle.</p>
          <div className="cmd-list">
            {commands.map((command) => (
              <button 
                key={command.id} 
                onClick={() => {
                  command.run();
                  setShowPalette(false);
                }}
              >
                {command.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {showHelp && (
        <div className="overlay-panel help-menu" role="dialog" aria-modal aria-label="Keyboard shortcuts">
          <h4>Keyboard Shortcuts</h4>
          <ul>
            <li><kbd>Shift + /</kbd><span>Open help menu</span></li>
            <li><kbd>Cmd/Ctrl + K</kbd><span>Open command palette</span></li>
            <li><kbd>Alt + 1..5</kbd><span>Switch tabs (Chat, Editor, JD, Export, Log)</span></li>
            <li><kbd>Esc</kbd><span>Close active modal</span></li>
          </ul>
        </div>
      )}
    </>
  );
}