'use client';

import { Card } from '@/app/components/ui';
import Link from 'next/link';
import { useEchoSocket } from './hooks/use-echo-socket';
import { usePresenceId } from './hooks/use-presence-id';

export default function EchoLandingPage() {
  const presenceId = usePresenceId();
  // 첫 화면은 접속 인원만 보여 준다 (채널 접속·재연결은 스피커·샌더와 같은 훅을 쓴다)
  const { speakerCount, senderCount } = useEchoSocket({ role: 'landing', presenceId });
  const total = speakerCount + senderCount;

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] p-4">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">메아리에 참여하세요</h1>
        <p className="text-sm text-muted">
          현재 {total}명이 접속 중입니다.
          {total > 0 && ` (스피커: ${speakerCount}명, 샌더: ${senderCount}명)`}
        </p>
      </div>
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
