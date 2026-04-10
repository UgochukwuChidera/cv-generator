'use client';
import { useState } from 'react';
import { ThemePicker } from '@/components/ThemePicker';
import { LivePreview } from '@/components/LivePreview';
import Link from 'next/link';

export default function ThemesPage() {
  const [theme, setTheme] = useState('professional');

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-4 py-3 flex items-center gap-4">
        <Link href="/" className="text-blue-600 hover:underline text-sm">← Home</Link>
        <h1 className="font-semibold text-gray-800">Themes</h1>
      </header>
      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Choose a Theme</h2>
          <ThemePicker selected={theme} onSelect={setTheme} />
        </div>
        <div className="bg-white rounded-xl shadow-sm border overflow-y-auto p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Preview</h2>
          <LivePreview theme={theme} />
        </div>
      </div>
    </div>
  );
}
