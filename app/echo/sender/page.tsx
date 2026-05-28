'use client';

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { Button } from '@/app/components/ui';
import Link from 'next/link';
import { formatTime } from '@/app/echo/utils/echo-logic';
import { EchoLog } from '../components/echo-log';
import { useEchoSocket } from '../hooks/use-echo-socket';

export default function SenderPage() {
  const [remainingTime, setRemainingTime] = useState(0);
  
  const presenceId = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const saved = sessionStorage.getItem('echo-presence-id');
    if (saved) return saved;
    const id = crypto.randomUUID();
    sessionStorage.setItem('echo-presence-id', id);
    return id;
  }, []);

  const isPlaying = remainingTime > 0;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 로컬 타이머 (동기화 신호 사이의 공백을 메움)
  useEffect(() => {
    if (isPlaying && !timerRef.current) {
      timerRef.current = setInterval(() => {
        setRemainingTime((prev) => Math.max(0, prev - 1));
      }, 1000);
    } else if (!isPlaying && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying]);

  const handleBroadcast = useCallback((event: string, payload: Record<string, unknown>) => {
    switch (event) {
      case 'ECHO_SYNC':
        if (typeof payload.remainingTime === 'number') {
          setRemainingTime(payload.remainingTime);
        }
        break;
      case 'ECHO_STOP':
        setRemainingTime(0);
        break;
    }
  }, []);

  const {
    speakerCount,
    senderCount,
    logs,
    addLog,
    sendBroadcast
  } = useEchoSocket({
    role: 'sender',
    presenceId,
    onBroadcast: handleBroadcast
  });

  const connectedUsers = speakerCount + senderCount;

  const handleSendEcho = useCallback(() => {
    // 1. 낙관적 업데이트: 로컬 타이머를 즉시 연장
    setRemainingTime((prev) => prev + 60);

    // 2. 스피커에게 신호 전송
    sendBroadcast('ECHO_REQUEST', { senderId: presenceId });
    addLog('사용자가 메아리를 보냈습니다. (+1분)', 'request', presenceId);
  }, [presenceId, addLog, sendBroadcast]);

  const handleStopEcho = useCallback(() => {
    sendBroadcast('ECHO_STOP', { triggeredBy: presenceId });
    setRemainingTime(0);
    addLog('사용자가 모든 메아리를 중지시켰습니다.', 'stop', presenceId);
  }, [presenceId, addLog, sendBroadcast]);

  const handleManualExit = useCallback(() => {
    addLog('사용자가 퇴장했습니다. (이유: 사용자 요청)', 'leave');
  }, [addLog]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] p-4">
      <div className="w-full max-w-2xl space-y-8 text-center flex flex-col items-center">
        <div className="space-y-2">
          <div className="inline-block px-3 py-1 rounded-full bg-secondary text-xs font-medium border border-border">
            🔘 샌더 모드
          </div>
          <div className="text-sm text-muted">
            접속 중인 사용자: {connectedUsers}명 (스피커: {speakerCount}명, 샌더: {senderCount}명)
          </div>
        </div>

        <div className="relative py-12">
          <div className={`text-7xl font-mono font-bold tracking-tighter ${isPlaying ? 'text-primary animate-pulse' : 'text-muted'}`}>
            {formatTime(remainingTime)}
          </div>
          {isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center -z-10">
              <div className="w-48 h-48 bg-primary/10 rounded-full animate-ping" />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 w-full max-w-md">
          <Button 
            size="lg" 
            className="h-20 text-xl font-bold" 
            onClick={handleSendEcho}
            disabled={speakerCount === 0}
          >
            {speakerCount > 0 ? '메아리 보내기 (+1분)' : '스피커가 없습니다'}
          </Button>
          
          <Button 
            variant="outline" 
            size="lg" 
            className="h-14 text-destructive border-destructive/20 hover:bg-destructive/10"
            onClick={handleStopEcho}
            disabled={remainingTime === 0}
          >
            즉시 중지
          </Button>
        </div>

        <div className="pt-8">
          <Link href="/echo" onClick={handleManualExit}>
            <Button variant="ghost" size="sm">
              나가기
            </Button>
          </Link>
        </div>

        <EchoLog logs={logs} currentUserId={presenceId} />
      </div>
    </div>
  );
}
