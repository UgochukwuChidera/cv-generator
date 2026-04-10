'use client';
import { JDTargeting } from '@/components/JDTargeting';
import { ProviderSelector } from '@/components/ProviderSelector';
import Link from 'next/link';

export default function JDTargetingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-4 py-3 flex items-center gap-4">
        <Link href="/" className="text-blue-600 hover:underline text-sm">← Home</Link>
        <h1 className="font-semibold text-gray-800">JD Targeting</h1>
      </header>
      <div className="max-w-4xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border p-6">
          <JDTargeting />
        </div>
        <div>
          <ProviderSelector />
        </div>
      </div>
    </div>
  );
}
