'use client';
import { ChatOnboarding } from '@/components/ChatOnboarding';
import { ProviderSelector } from '@/components/ProviderSelector';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Nexus</h1>
          <p className="text-lg text-gray-600">Your personal career document platform</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border h-[600px] flex flex-col overflow-hidden">
            <ChatOnboarding />
          </div>
          <div className="space-y-4">
            <ProviderSelector />
            <div className="border rounded-lg p-4 space-y-2">
              <h3 className="font-semibold text-sm text-gray-700">Quick Links</h3>
              {[
                { href: '/editor', label: '✏️ Resume Editor' },
                { href: '/jd-targeting', label: '🎯 JD Targeting' },
                { href: '/themes', label: '🎨 Themes' },
                { href: '/export', label: '📥 Export' },
              ].map((link) => (
                <a key={link.href} href={link.href} className="block text-sm text-blue-600 hover:underline">
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
