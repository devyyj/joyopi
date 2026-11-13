'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Button } from '@/app/components/ui';
import Link from 'next/link';
import { formatTime, parseSeconds, calculateRemainingSeconds, calculateNewEndTime } from '../utils/echo-logic';
import { isWithinStopGrace, resolveSenderEndTime } from '../utils/echo-sync';
import { EchoLog } from '../components/echo-log';
import { useEchoSocket } from '../hooks/use-echo-socket';
import { usePresenceId } from '../hooks/use-presence-id';

export default function SenderPage() {
  const presenceId = usePresenceId();
  const [remainingTime, setRemainingTime] = useState(0);
  // 메아리 종료 절대시각 (이 기기 시계 기준 Unix ms). 스피커가 보낸 남은 시간으로 다시 계산한다
  const endTimeRef = useRef<number>(0);
  const lastRequestAtRef = useRef<number>(0);
  const lastStopAtRef = useRef<number>(0);
  const presenceIdRef = useRef(presenceId);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const isPlaying = remainingTime > 0;

  useEffect(() => {
    presenceIdRef.current = presenceId;
  }, [presenceId]);

  const applyEndTime = useCallback((endTime: number) => {
    endTimeRef.current = endTime;
    setRemainingTime(calculateRemainingSeconds(endTime));
  }, []);

  // 동기화 신호 사이에는 자기 종료 시각으로 직접 카운트다운한다
  useEffect(() => {
    if (!isPlaying) return;
    timerRef.current = setInterval(() => {
      setRemainingTime(calculateRemainingSeconds(endTimeRef.current));
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [isPlaying]);

  const handleBroadcast = useCallback((event: string, payload: Record<string, unknown>) => {
    switch (event) {
      case 'ECHO_SYNC': {
        if (typeof payload.remainingMs !== 'number' || isWithinStopGrace(lastStopAtRef.current)) break;
        // 스피커 값을 기준으로 삼아 기기 시계 차이로 생긴 오차를 바로잡는다
        applyEndTime(resolveSenderEndTime({
          localEndTime: endTimeRef.current,
          remainingMs: payload.remainingMs,
          lastRequestAt: lastRequestAtRef.current,
        }));
        break;
      }
      case 'ECHO_REQUEST':
        // 다른 사람의 연장 요청은 스피커 동기화가 오기 전까지 낙관적으로 반영해 둔다
        if (payload?.senderId === presenceIdRef.current) break;
        applyEndTime(calculateNewEndTime(endTimeRef.current, parseSeconds(payload, 60)));
        break;
      case 'ECHO_STOP':
        lastStopAtRef.current = Date.now();
        applyEndTime(0);
        break;
    }
  }, [applyEndTime]);

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

  const handleSendEcho = useCallback((seconds: number) => {
    if (!isReady) return;
    const validSeconds = parseSeconds(seconds, 60);
    lastRequestAtRef.current = Date.now();
    applyEndTime(calculateNewEndTime(endTimeRef.current, validSeconds));

    sendBroadcast('ECHO_REQUEST', { senderId: presenceId, seconds: validSeconds });
    addLog(`사용자가 메아리를 보냈습니다. (+${Math.floor(validSeconds / 60)}분)`, 'request', presenceId);
  }, [presenceId, addLog, sendBroadcast, isReady, applyEndTime]);

  const handleStopEcho = useCallback(() => {
    if (!isReady) return;
    lastStopAtRef.current = Date.now();
    applyEndTime(0);
    sendBroadcast('ECHO_STOP', { triggeredBy: presenceId });
    addLog('사용자가 모든 메아리를 중지시켰습니다.', 'stop', presenceId);
  }, [presenceId, addLog, sendBroadcast, isReady, applyEndTime]);

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
