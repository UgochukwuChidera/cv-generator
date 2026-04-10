'use client';
import { useState } from 'react';
import { FormEditor } from '@/components/FormEditor';
import { LivePreview } from '@/components/LivePreview';
import { ProviderSelector } from '@/components/ProviderSelector';
import Link from 'next/link';

export default function EditorPage() {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-blue-600 hover:underline text-sm">← Home</Link>
          <h1 className="font-semibold text-gray-800">Resume Editor</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('edit')}
            className={`px-3 py-1.5 rounded text-sm ${activeTab === 'edit' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            Edit
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1.5 rounded text-sm ${activeTab === 'preview' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            Preview
          </button>
        </div>
      </header>
      <div className="flex h-[calc(100vh-57px)]">
        <div className={`${activeTab === 'edit' ? 'flex' : 'hidden'} lg:flex flex-col w-full lg:w-1/2 border-r bg-white overflow-y-auto`}>
          <FormEditor />
        </div>
        <div className={`${activeTab === 'preview' ? 'flex' : 'hidden'} lg:flex flex-col w-full lg:w-1/2 overflow-y-auto bg-gray-100 p-6`}>
          <LivePreview />
        </div>
      </div>
    </div>
  );
}
