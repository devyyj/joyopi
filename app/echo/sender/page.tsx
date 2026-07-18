'use client';

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { Button } from '@/app/components/ui';
import Link from 'next/link';
import { formatTime, resolveSyncTime } from '@/app/echo/utils/echo-logic';
import { EchoLog } from '../components/echo-log';
import { useEchoSocket } from '../hooks/use-echo-socket';

import { createClient } from '@/utils/supabase/client';
import { redirect } from 'next/navigation';

const ALLOWED_EMAILS = ['devyyj@gmail.com', 'noticeably34@gmail.com'];

export default function SenderPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && ALLOWED_EMAILS.includes(user.email || '')) {
          setIsAuthorized(true);
        } else {
          redirect('/');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        redirect('/');
      } finally {
        setIsLoading(false);
      }
    }
    checkAuth();
  }, [supabase]);
  const [remainingTime, setRemainingTime] = useState(0);
  const lastRequestTimeRef = useRef<number>(0);
  const senderTimeRef = useRef<number>(0); // remainingTime을 ref로 추적 (stale closure 방지)
  
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

  // senderTimeRef를 remainingTime과 항상 동기화
  useEffect(() => {
    senderTimeRef.current = remainingTime;
  }, [remainingTime]);

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
          const syncVal = payload.remainingTime;
          setRemainingTime((prev) => resolveSyncTime(prev, syncVal, lastRequestTimeRef.current));
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
    status,
    addLog,
    sendBroadcast
  } = useEchoSocket({
    role: 'sender',
    presenceId,
    onBroadcast: handleBroadcast
  });

  const connectedUsers = speakerCount + senderCount;
  const isReady = status === 'CONNECTED';

  // 소켓이 다시 연결되었을 때 스피커에게 시간 동기화(ECHO_QUERY) 요청 전송
  useEffect(() => {
    if (isReady) {
      sendBroadcast('ECHO_QUERY', { requesterId: presenceId });
    }
  }, [isReady, presenceId, sendBroadcast]);

  const handleSendEcho = useCallback((seconds: unknown = 60) => {
    if (!isReady) return;
    lastRequestTimeRef.current = Date.now();

    const validSeconds = typeof seconds === 'number' && !isNaN(seconds) && seconds > 0
      ? seconds
      : typeof seconds === 'string'
        ? parseInt(seconds, 10) || 60
        : 60;

    // senderTimeRef 기반으로 낙관적 업데이트 (stale closure 없이 정확한 현재값 사용)
    const targetTime = senderTimeRef.current + validSeconds;

    // 낙관적 업데이트: 절대값으로 직접 설정 (delta 누적 오차 방지)
    setRemainingTime(targetTime);
    senderTimeRef.current = targetTime;

    // 오직 ECHO_REQUEST 1개만 전송 (ECHO_SYNC 중복 발송을 제거하여 11분/이중 가산 버그 예방)
    sendBroadcast('ECHO_REQUEST', { senderId: presenceId, seconds: validSeconds });
    const minutes = Math.floor(validSeconds / 60);
    addLog(`사용자가 메아리를 보냈습니다. (+${minutes}분)`, 'request', presenceId);
  }, [presenceId, addLog, sendBroadcast, isReady]);

  const handleStopEcho = useCallback(() => {
    if (!isReady) return;
    sendBroadcast('ECHO_STOP', { triggeredBy: presenceId });
    setRemainingTime(0);
    addLog('사용자가 모든 메아리를 중지시켰습니다.', 'stop', presenceId);
  }, [presenceId, addLog, sendBroadcast, isReady]);

  const handleManualExit = useCallback(() => {
    addLog('사용자가 퇴장했습니다. (이유: 사용자 요청)', 'leave');
  }, [addLog]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
        <p className="text-muted text-sm font-semibold">사용자 권한 확인 중...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

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
          {!isReady ? (
            <div className="text-4xl font-bold tracking-wider text-muted animate-pulse">
              준비중...
            </div>
          ) : (
            <div className={`text-7xl font-mono font-bold tracking-tighter ${isPlaying ? 'text-primary animate-pulse' : 'text-muted'}`}>
              {formatTime(remainingTime)}
            </div>
          )}
          {isReady && isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center -z-10">
              <div className="w-48 h-48 bg-primary/10 rounded-full animate-ping" />
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 w-full max-w-md">
          <Button 
            size="lg" 
            className="h-20 text-base sm:text-lg font-bold" 
            onClick={() => handleSendEcho(60)}
            disabled={!isReady || speakerCount === 0}
          >
            {!isReady ? '준비중...' : speakerCount > 0 ? '+1분 보내기' : '스피커 없음'}
          </Button>
          
          <Button 
            size="lg" 
            className="h-20 text-base sm:text-lg font-bold" 
            onClick={() => handleSendEcho(600)}
            disabled={!isReady || speakerCount === 0}
          >
            {!isReady ? '준비중...' : speakerCount > 0 ? '+10분 보내기' : '스피커 없음'}
          </Button>

          <Button 
            variant="outline" 
            size="lg" 
            className="col-span-2 h-14 text-destructive border-destructive/20 hover:bg-destructive/10"
            onClick={handleStopEcho}
            disabled={!isReady || remainingTime === 0}
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
