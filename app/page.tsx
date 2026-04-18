import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'YOPI LAND',
  description: '개발자 요피의 실험실이자 다양한 서비스 놀이터',
};

/** 서비스 목록 - 새로운 기능 추가 시 이 배열에 항목을 추가 */
const FEATURES = [
  {
    href: '/board',
    title: '자유게시판',
    description: '구글 로그인으로 자유롭게 소통하세요.',
    emoji: '📝',
    color: '#4F46E5',
    bg: '#EEF2FF',
    border: '#E0E7FF',
  },
  // 향후 추가될 서비스 예시
  // {
  //   href: '/games',
  //   title: '웹 게임',
  //   description: '직접 만든 간단한 게임을 즐겨보세요.',
  //   emoji: '🎮',
  //   color: '#059669',
  //   bg: '#ECFDF5',
  //   border: '#D1FAE5',
  // },
];

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16">

      {/* 서비스 헤더 */}
      <div className="text-center mb-14 animate-in fade-in slide-in-from-top-4 duration-1000">
        <h1 className="text-6xl font-black tracking-tighter mb-3 italic">
          YOPI LAND
        </h1>
        <p className="text-base font-medium text-slate-400">
          실험과 개발이 공존하는 요피의 개인 놀이터
        </p>
      </div>

      {/* 기능 카드 목록 */}
      <div className="w-full max-w-sm flex flex-col gap-4">
        {FEATURES.map((f) => (
          <Link
            key={f.href}
            href={f.href}
            className="flex items-center gap-5 p-5 rounded-3xl transition-all active:scale-95 hover:scale-[1.02] hover:shadow-xl group"
            style={{
              background: '#FFFFFF',
              border: `1.5px solid ${f.border}`,
            }}
          >
            {/* 아이콘 영역 */}
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 transition-transform group-hover:rotate-12"
              style={{ background: f.bg, border: `1.5px solid ${f.border}` }}
            >
              {f.emoji}
            </div>

            {/* 텍스트 영역 */}
            <div className="flex-1 min-w-0">
              <p className="text-lg font-black tracking-tight text-[#1E1B4B]">
                {f.title}
              </p>
              <p className="text-sm font-medium mt-0.5 truncate text-slate-400">
                {f.description}
              </p>
            </div>

            {/* 화살표 */}
            <svg
              width="18" height="18" viewBox="0 0 24 24"
              fill="none" stroke={f.color} strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round"
              className="flex-shrink-0 transition-transform group-hover:translate-x-1"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </Link>
        ))}
      </div>

      {/* 하단 푸터 느낌의 안내 */}
      <p className="mt-12 text-xs font-bold text-slate-300 uppercase tracking-widest">
        joyopi.com &copy; 2026
      </p>
    </main>
  );
}
