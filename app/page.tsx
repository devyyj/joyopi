import Link from 'next/link';
import { SectionHeader, Card, Button } from '@/app/components/ui/core';

const FEATURES = [
  {
    href: '/board',
    title: '자유게시판',
    label: 'Community',
    description: '구글 로그인을 통해 자유롭게 소통하는 공간입니다.',
    emoji: '💬',
  },
];

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-24">
      {/* Hero Section */}
      <div className="mb-16">
        <SectionHeader 
          title="Welcome to YOPI LAND"
          description="최신 기술을 탐구하고 서비스를 빌드하는 개인 개발 실험실입니다. 각 모듈은 독립적으로 작동하며 점진적으로 확장됩니다."
          label="Lab Home"
        />
      </div>

      {/* Repository-like Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEATURES.map((f) => (
          <Link key={f.href} href={f.href} className="group">
            <Card className="h-full p-6 transition-all hover:border-primary/50 flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{f.emoji}</span>
                <h2 className="text-lg font-semibold text-primary group-hover:underline">
                  {f.title}
                </h2>
                <span className="ml-auto text-[10px] font-medium border border-border px-1.5 py-0.5 rounded-full text-muted">
                  공개
                </span>
              </div>
              <p className="text-sm text-muted mb-6 flex-1">
                {f.description}
              </p>
              <div className="flex items-center gap-4 text-xs text-muted">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-indigo-500" />
                  TypeScript
                </div>
                <div>오늘 업데이트됨</div>
              </div>
            </Card>
          </Link>
        ))}

        {/* Placeholder Card */}
        <Card className="p-6 border-dashed flex flex-col items-center justify-center text-center bg-transparent opacity-60">
          <p className="text-sm font-medium text-muted mb-2">새로운 실험이 곧 시작됩니다</p>
          <Button variant="outline" size="sm" disabled>
            기능 제안하기
          </Button>
        </Card>
      </div>

      {/* Footer */}
      <footer className="mt-24 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-foreground">YOPI LAND</span>
          <span>© 2026 joyopi.com</span>
        </div>
        <div className="flex gap-6">
          <Link href="#" className="hover:text-primary">About</Link>
        </div>
      </footer>
    </div>
  );
}
