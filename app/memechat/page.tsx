'use client';

import dynamic from 'next/dynamic';

const MemeChatClient = dynamic(() => import('./components/MemeChatClient'), {
  ssr: false,
  loading: () => (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100 flex flex-col p-4 md:p-8 items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-400 text-sm animate-pulse">밈챗 연구소 도구 로딩 중...</p>
      </div>
    </main>
  ),
});

export default function MemeChatLocalPage() {
  return <MemeChatClient />;
}
