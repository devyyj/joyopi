'use client';

import { Card } from '@/app/components/ui/core';
import Link from 'next/link';

export default function EchoLandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] p-4">
      <h1 className="text-2xl font-bold mb-8">메아리에 참여하세요</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
        <Link href="/echo/speaker" className="contents">
          <Card className="p-8 flex flex-col items-center gap-4 cursor-pointer hover:border-primary transition-colors">
            <div className="text-4xl">🔊</div>
            <h2 className="text-xl font-semibold">스피커로 참여</h2>
            <p className="text-sm text-center text-muted">
              샌더들의 요청을 받아<br />소리를 재생합니다.
            </p>
          </Card>
        </Link>
        <Link href="/echo/sender" className="contents">
          <Card className="p-8 flex flex-col items-center gap-4 cursor-pointer hover:border-primary transition-colors">
            <div className="text-4xl">🔘</div>
            <h2 className="text-xl font-semibold">샌더로 참여</h2>
            <p className="text-sm text-center text-muted">
              스피커에게 신호를 보내<br />시간을 연장시킵니다.
            </p>
          </Card>
        </Link>
      </div>
    </div>
  );
}
