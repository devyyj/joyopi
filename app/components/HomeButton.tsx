import Link from 'next/link';

/**
 * 모든 페이지에서 공통으로 사용하는 홈 이동 버튼.
 * 기본 기능 요구사항: 모든 페이지는 홈으로 돌아갈 수 있는 버튼이 존재해야 함.
 */
export default function HomeButton() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-colors"
      style={{
        color: '#6366F1',
        background: 'rgba(99,102,241,0.08)',
        border: '1.5px solid rgba(99,102,241,0.15)',
      }}
    >
      {/* 홈 아이콘 */}
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
      홈으로
    </Link>
  );
}
