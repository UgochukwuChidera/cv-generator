'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useNexusStore } from '@/lib/store';
import { useShell } from './ShellContext';

const TABS = [
  { href: '/', label: 'Chat' },
  { href: '/editor', label: 'Editor' },
  { href: '/jd-targeting', label: 'JD Target' },
  { href: '/export', label: 'Export' },
  { href: '/log', label: 'Log' },
] as const;

export default function TopBar() {
  const pathname = usePathname();
  const { aiKey, aiProvider } = useNexusStore();
  const { status, openApiKeyModal } = useShell();

  return (
    <header className="nav">
      <div className="brand">
        <span>NEXUS</span>
        <i className="dot" aria-hidden />
      </div>

      <nav className="nav-tabs" aria-label="Primary navigation">
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
        <span className={`key-indicator ${aiKey ? 'set' : 'unset'}`} data-set={!!aiKey} aria-hidden />
        <button className="key-btn" onClick={openApiKeyModal}>
          {aiKey ? `${aiProvider} key set` : 'Set API Key'}
        </button>
      </div>
    </header>
  );
}
