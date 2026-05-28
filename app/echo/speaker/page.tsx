'use client';

import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { Button } from '@/app/components/ui';
import Link from 'next/link';
import { formatTime } from '@/app/echo/utils/echo-logic';
import { EchoLog } from '../components/echo-log';
import { useEchoSocket } from '../hooks/use-echo-socket';

export default function SpeakerPage() {
  const [remainingTime, setRemainingTime] = useState(0);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  
  const presenceId = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const saved = sessionStorage.getItem('echo-presence-id');
    if (saved) return saved;
    const id = crypto.randomUUID();
    sessionStorage.setItem('echo-presence-id', id);
    return id;
  }, []);

  const isPlaying = remainingTime > 0;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const remainingTimeRef = useRef(remainingTime);

  useEffect(() => {
    remainingTimeRef.current = remainingTime;
  }, [remainingTime]);

  const sendBroadcastRef = useRef<((event: string, payload: Record<string, unknown>) => boolean) | null>(null);

  // 소켓 브로드캐스트 핸들러
  const handleBroadcast = useCallback((event: string, payload: Record<string, unknown>) => {
    switch (event) {
      case 'ECHO_REQUEST':
        setRemainingTime((prev) => prev + 60);
        break;
      case 'ECHO_SYNC':
        if (typeof payload.remainingTime === 'number' && payload.remainingTime > remainingTimeRef.current) {
          setRemainingTime(payload.remainingTime);
        }
        break;
      case 'ECHO_STOP':
        setRemainingTime(0);
        audioRef.current?.pause();
        if (audioRef.current) audioRef.current.currentTime = 0;
        break;
      case 'ECHO_QUERY':
        if (remainingTimeRef.current > 0) {
          sendBroadcastRef.current?.('ECHO_SYNC', { remainingTime: remainingTimeRef.current });
        }
        break;
    }
  }, []);

  const {
    speakerCount,
    senderCount,
    logs,
    addLog,
    sendBroadcast,
  } = useEchoSocket({
    role: 'speaker',
    presenceId,
    onBroadcast: handleBroadcast
  });

  useEffect(() => {
    sendBroadcastRef.current = sendBroadcast as (event: string, payload: Record<string, unknown>) => boolean;
  }, [sendBroadcast]);

  const connectedUsers = speakerCount + senderCount;

  // 사운드 초기화 및 클린업
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('/footsteps.mp3');
      audioRef.current.loop = true;
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // 오디오 재생 및 타이머 동기화 로직
  useEffect(() => {
    if (isPlaying) {
      audioRef.current?.play().catch((err) => {
        addLog(`오디오 재생 실패: ${err.message}`, 'error');
      });
    } else {
      audioRef.current?.pause();
      if (audioRef.current) audioRef.current.currentTime = 0;
    }

    if (isPlaying && !timerRef.current) {
      addLog(`메아리를 재생합니다. (남은 시간: ${formatTime(remainingTimeRef.current)})`, 'sync');
      timerRef.current = setInterval(() => {
        setRemainingTime((prev) => {
          const next = Math.max(0, prev - 1);
          // 1초마다 동기화 신호 전송
          sendBroadcast('ECHO_SYNC', { remainingTime: next });
          return next;
        });
      }, 1000);
    } else if (!isPlaying && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      addLog('메아리 재생이 완료되었습니다.', 'info');
      // 정지 시 즉시 동기화
      sendBroadcast('ECHO_SYNC', { remainingTime: 0 });
    }
  }, [isPlaying, addLog, sendBroadcast]);

  // 유휴 상태 하트비트 (연결 유지 강화)
  useEffect(() => {
    if (isPlaying) return;

    const heartbeatInterval = setInterval(() => {
      sendBroadcast('ECHO_HEARTBEAT', { timestamp: new Date().toISOString() });
    }, 30000);

    return () => clearInterval(heartbeatInterval);
  }, [isPlaying, sendBroadcast]);

  const handleSendEcho = useCallback(() => {
    setRemainingTime((prev) => prev + 60);
    sendBroadcast('ECHO_REQUEST', { senderId: presenceId });
    addLog('스피커가 직접 메아리를 보냈습니다. (+1분)', 'request', presenceId);
  }, [presenceId, addLog, sendBroadcast]);

  const handleStopEcho = useCallback(() => {
    sendBroadcast('ECHO_STOP', { triggeredBy: presenceId });
    setRemainingTime(0);
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.currentTime = 0;
    addLog('스피커가 모든 메아리를 중지시켰습니다.', 'stop', presenceId);
  }, [presenceId, addLog, sendBroadcast]);

  const handleManualExit = useCallback(() => {
    addLog('사용자가 퇴장했습니다. (이유: 사용자 요청)', 'leave');
  }, [addLog]);

  const handleEnableAudio = useCallback(() => {
    if (audioRef.current) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          audioRef.current?.pause();
          setIsAudioEnabled(true);
          addLog('오디오 출력이 활성화되었습니다.', 'info');
        }).catch(err => {
          addLog(`오디오 활성화 실패: ${err.message}`, 'error');
        });
      }
    }
  }, [addLog]);

  if (!isAudioEnabled) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] p-4 text-center">
        <div className="max-w-md space-y-6">
          <div className="text-4xl">📢</div>
          <h2 className="text-2xl font-bold">오디오 출력을 활성화해주세요</h2>
          <p className="text-muted-foreground">
            브라우저 정책에 따라 메아리 소리를 들으려면 <br />
            사용자의 직접적인 클릭이 한 번 필요합니다.
          </p>
          <Button size="lg" className="w-full h-16 text-lg font-bold" onClick={handleEnableAudio}>
            오디오 시작하기
          </Button>
          <div className="pt-4">
            <Link href="/echo">
              <Button variant="ghost">돌아가기</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] p-4">
      <div className="w-full max-w-2xl space-y-8 text-center flex flex-col items-center">
        <div className="space-y-2">
          <div className="inline-block px-3 py-1 rounded-full bg-secondary text-xs font-medium border border-border">
            📢 스피커 모드 (샌더 기능 포함)
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
          <Button 
            size="lg" 
            className="h-16 text-lg font-bold" 
            onClick={handleSendEcho}
          >
            메아리 보내기 (+1분)
          </Button>
          
          <Button 
            variant="outline" 
            size="lg" 
            className="h-16 text-destructive border-destructive/20 hover:bg-destructive/10"
            onClick={handleStopEcho}
            disabled={remainingTime === 0}
          >
            즉시 중지
          </Button>
        </div>

        <div className="pt-4">
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
