import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'JOYOPI',
  description: '즐겁고 재미있는 웹 서비스 모음',
};

/** 서비스 목록 - 새로운 기능 추가 시 이 배열에 항목을 추가 */
const FEATURES = [
  {
    href: '/game',
    title: '리듬 캣',
    description: '고양이와 함께하는 60초 리듬 게임',
    emoji: '🐱',
    color: '#6366F1',
    bg: 'rgba(99,102,241,0.07)',
    border: 'rgba(99,102,241,0.15)',
  },
] as const;

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16" style={{ background: '#F4F6FF' }}>

      {/* 서비스 헤더 */}
      <div className="text-center mb-14">
        <h1 className="text-6xl font-black tracking-tighter mb-3" style={{ color: '#1E1B4B' }}>
          JOYOPI
        </h1>
        <p className="text-base font-medium" style={{ color: '#94A3B8' }}>
          즐겁고 재미있는 웹 서비스 모음
        </p>
      </div>

      {/* 기능 카드 목록 */}
      <div className="w-full max-w-sm flex flex-col gap-4">
        {FEATURES.map((f) => (
          <Link
            key={f.href}
            href={f.href}
            className="flex items-center gap-5 p-5 rounded-3xl transition-transform active:scale-95 hover:scale-[1.02]"
            style={{
              background: '#FFFFFF',
              border: `1.5px solid ${f.border}`,
              boxShadow: `0 4px 20px ${f.bg}`,
            }}
          >
            {/* 아이콘 영역 */}
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: f.bg, border: `1.5px solid ${f.border}` }}
            >
              {f.emoji}
            </div>

            {/* 텍스트 영역 */}
            <div className="flex-1 min-w-0">
              <p className="text-lg font-black tracking-tight" style={{ color: '#1E1B4B' }}>
                {f.title}
              </p>
              <p className="text-sm font-medium mt-0.5 truncate" style={{ color: '#94A3B8' }}>
                {f.description}
              </p>
            </div>

            {/* 화살표 */}
            <svg
              width="18" height="18" viewBox="0 0 24 24"
              fill="none" stroke={f.color} strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round"
              className="flex-shrink-0"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </Link>
        ))}
      </div>
    </main>
  );
}
