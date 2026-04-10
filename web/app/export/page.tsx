'use client';
import { ExportPanel } from '@/components/ExportPanel';
import Link from 'next/link';

export default function ExportPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-4 py-3 flex items-center gap-4">
        <Link href="/" className="text-blue-600 hover:underline text-sm">← Home</Link>
        <h1 className="font-semibold text-gray-800">Export</h1>
      </header>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Export Your Resume</h2>
          <ExportPanel />
        </div>
      </div>
    </div>
  );
}
