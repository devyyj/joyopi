import Link from 'next/link';
import type { Metadata } from 'next';
import { SectionHeader } from '@/app/components/ui/core';

export const metadata: Metadata = {
  title: 'YOPI LAND',
  description: '개발자 요피의 실험실이자 다양한 서비스 놀이터',
};

const FEATURES = [
  {
    href: '/board',
    title: '자유게시판',
    label: 'Community',
    description: '구글 로그인으로 자유롭게 소통하는 공간입니다.',
    emoji: '✨',
  },
];

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background selection:bg-indigo-50">
      <div className="w-full max-w-5xl px-8 py-24">
        
        {/* 서비스 헤더 */}
        <SectionHeader 
          label="Playground"
          title="YOPI LAND"
          description="아이디어가 서비스가 되는 요피의 실험실입니다. 가볍고 즐겁게 둘러보세요."
          className="mb-16 animate-in fade-in slide-in-from-bottom-4 duration-1000"
        />

        {/* 기능 카드 목록 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FEATURES.map((f) => (
            <Link
              key={f.href}
              href={f.href}
              className="group relative block p-8 bg-card border border-slate-200 rounded-2xl shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-300 transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-10">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-xl group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
                  {f.emoji}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300 group-hover:text-indigo-400 transition-colors">
                  {f.label}
                </span>
              </div>
              
              <div className="space-y-2">
                <h2 className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {f.title}
                </h2>
                <p className="text-sm text-slate-400 font-medium leading-relaxed">
                  {f.description}
                </p>
              </div>

              <div className="mt-8 flex items-center gap-2 text-xs font-bold text-indigo-500 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                <span>자세히 보기</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        {/* 푸터 안내 */}
        <footer className="mt-32 border-t border-slate-50 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">
            joyopi.com &copy; 2026
          </p>
          <div className="flex gap-8">
            <a href="#" className="text-xs font-bold text-slate-300 hover:text-indigo-500 uppercase tracking-widest transition-colors">
              About
            </a>
            <a href="#" className="text-xs font-bold text-slate-300 hover:text-indigo-500 uppercase tracking-widest transition-colors">
              Contact
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
}
