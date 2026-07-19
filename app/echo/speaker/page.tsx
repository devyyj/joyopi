'use client';

import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { Button } from '@/app/components/ui';
import Link from 'next/link';
import { formatTime, parseSeconds, calculateRemainingSeconds, calculateNewEndTime } from '@/app/echo/utils/echo-logic';
import { EchoLog } from '../components/echo-log';
import { useEchoSocket } from '../hooks/use-echo-socket';

import { createClient } from '@/utils/supabase/client';
import { redirect } from 'next/navigation';

const ALLOWED_EMAILS = ['devyyj@gmail.com', 'noticeably34@gmail.com'];

export default function SpeakerPage() {
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
  // 메아리 종료 절대시각 (Unix ms). Date.now() 기반이므로 카운트다운 누적 오차 없음
  const endTimeRef = useRef<number>(0);

  useEffect(() => {
    remainingTimeRef.current = remainingTime;
  }, [remainingTime]);

  const sendBroadcastRef = useRef<((event: string, payload: Record<string, unknown>) => boolean) | null>(null);
  const addLogRef = useRef<((message: string, eventType: string, userId?: string, payload?: unknown) => Promise<void>) | null>(null);

  // 소켓 브로드캐스트 핸들러
  const handleBroadcast = useCallback((event: string, payload: Record<string, unknown>) => {
    switch (event) {
      case 'ECHO_REQUEST': {
        // 자기 자신이 보낸 ECHO_REQUEST는 handleSendEcho에서 이미 반영했으므로 중복 가산 방지
        if (payload && payload.senderId === presenceId) {
          break;
        }

        const addedSeconds = parseSeconds(payload, 60);
        // 기기 간 시계 오차(Clock Skew) 수용: 샌더 시계와 무관하게 스피커 현재 시각 기준 상대 연장(+600초) 적용
        endTimeRef.current = calculateNewEndTime(endTimeRef.current, addedSeconds);

        const newRemainingSeconds = calculateRemainingSeconds(endTimeRef.current);
        remainingTimeRef.current = newRemainingSeconds;
        setRemainingTime(newRemainingSeconds);
        sendBroadcastRef.current?.('ECHO_SYNC', { remainingTime: newRemainingSeconds, endTime: endTimeRef.current });
        
        // 연장/재생 시 최신 남은 시간으로 메아리 재생 로그 새로 기록
        addLogRef.current?.(`메아리를 재생합니다. (남은 시간: ${formatTime(newRemainingSeconds)})`, 'sync');
        break;
      }
      case 'ECHO_SYNC':
        // 다른 스피커에서 더 큰 endTime이 오면 동기화
        if (typeof payload.endTime === 'number' && payload.endTime > endTimeRef.current) {
          endTimeRef.current = payload.endTime;
          const remaining = calculateRemainingSeconds(endTimeRef.current);
          remainingTimeRef.current = remaining;
          setRemainingTime(remaining);
        }
        break;
      case 'ECHO_STOP':
        endTimeRef.current = 0;
        setRemainingTime(0);
        audioRef.current?.pause();
        if (audioRef.current) audioRef.current.currentTime = 0;
        break;
      case 'ECHO_QUERY':
        if (remainingTimeRef.current > 0) {
          sendBroadcastRef.current?.('ECHO_SYNC', { remainingTime: remainingTimeRef.current, endTime: endTimeRef.current });
        }
        break;
    }
  }, [presenceId]);


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
    addLogRef.current = addLog;
  }, [addLog]);

  useEffect(() => {
    sendBroadcastRef.current = sendBroadcast as (event: string, payload: Record<string, unknown>) => boolean;
  }, [sendBroadcast]);

  const connectedUsers = speakerCount + senderCount;

  const isPlayingRef = useRef(isPlaying);
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  const lastAudioTimeRef = useRef<number>(-1);
  const audioStuckCountRef = useRef<number>(0);

  // 오디오 안전 재생 헬퍼 (paused 이거나 currentTime이 멈춰있으면 즉시 재재생 및 Watchdog 감시)
  const playAudio = useCallback(() => {
    if (!audioRef.current || !isPlayingRef.current) return;
    const audio = audioRef.current;

    if (audio.paused) {
      audio.play().catch((err) => {
        console.warn('Audio play attempt warning:', err.message);
      });
      return;
    }

    // 2초 이상 currentTime이 증가하지 않고 멈춰있을 경우 자동 강제 복구 (Audio Watchdog)
    if (audio.currentTime === lastAudioTimeRef.current && !audio.paused) {
      audioStuckCountRef.current++;
      if (audioStuckCountRef.current >= 2) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
        audioStuckCountRef.current = 0;
      }
    } else {
      audioStuckCountRef.current = 0;
      lastAudioTimeRef.current = audio.currentTime;
    }
  }, []);

  // 사운드 초기화, 이벤트 바인딩 및 클린업
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const audio = new Audio('/footsteps.mp3');
      audio.loop = true;

      // 오디오 트랙 종료/정지 시 즉시 루프 재생 보장
      const handleAudioStopped = () => {
        if (isPlayingRef.current) {
          audio.currentTime = 0;
          audio.play().catch(() => {});
        }
      };

      audio.addEventListener('ended', handleAudioStopped);
      audio.addEventListener('stalled', handleAudioStopped);
      audio.addEventListener('error', handleAudioStopped);

      audioRef.current = audio;

      // 탭 포그라운드 전환 시 오디오 복구
      const handleVisibility = () => {
        if (document.visibilityState === 'visible' && isPlayingRef.current) {
          if (audio.paused || audio.ended) {
            audio.currentTime = 0;
            audio.play().catch(() => {});
          }
        }
      };
      document.addEventListener('visibilitychange', handleVisibility);

      return () => {
        audio.removeEventListener('ended', handleAudioStopped);
        audio.removeEventListener('stalled', handleAudioStopped);
        audio.removeEventListener('error', handleAudioStopped);
        document.removeEventListener('visibilitychange', handleVisibility);
        audio.pause();
        audioRef.current = null;
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, []);

  // 오디오 재생 및 타이머 동기화 로직
  // endTimeRef 기반 절대시각 카운트다운: Date.now() 기준이므로 누적 오차 및 ref 불일치 완전 제거
  useEffect(() => {
    if (isPlaying) {
      playAudio();
    } else {
      audioRef.current?.pause();
      if (audioRef.current) audioRef.current.currentTime = 0;
    }

    if (isPlaying && !timerRef.current) {
      const currentRemaining = calculateRemainingSeconds(endTimeRef.current);
      remainingTimeRef.current = currentRemaining;
      addLog(`메아리를 재생합니다. (남은 시간: ${formatTime(currentRemaining)})`, 'sync');
      timerRef.current = setInterval(() => {
        const remaining = calculateRemainingSeconds(endTimeRef.current);

        remainingTimeRef.current = remaining;
        setRemainingTime(remaining);

        if (remaining > 0) {
          playAudio();
        }

        sendBroadcastRef.current?.('ECHO_SYNC', { remainingTime: remaining, endTime: endTimeRef.current });

        if (remaining === 0 && timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          endTimeRef.current = 0;
          audioRef.current?.pause();
          if (audioRef.current) audioRef.current.currentTime = 0;
          addLog('메아리 재생이 완료되었습니다.', 'info');
        }
      }, 1000);
    } else if (!isPlaying && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      endTimeRef.current = 0;
      audioRef.current?.pause();
      if (audioRef.current) audioRef.current.currentTime = 0;
      addLog('메아리 재생이 완료되었습니다.', 'info');
      sendBroadcastRef.current?.('ECHO_SYNC', { remainingTime: 0, endTime: 0 });
    }
  }, [isPlaying, addLog, playAudio]);

  // 유휴 상태 하트비트 (연결 유지 강화)
  useEffect(() => {
    if (isPlaying) return;

    const heartbeatInterval = setInterval(() => {
      sendBroadcast('ECHO_HEARTBEAT', { timestamp: new Date().toISOString() });
    }, 30000);

    return () => clearInterval(heartbeatInterval);
  }, [isPlaying, sendBroadcast]);

  const handleSendEcho = useCallback((seconds: unknown = 60) => {
    const validSeconds = parseSeconds(seconds, 60);
    endTimeRef.current = calculateNewEndTime(endTimeRef.current, validSeconds);

    const targetTime = calculateRemainingSeconds(endTimeRef.current);
    setRemainingTime(targetTime);
    remainingTimeRef.current = targetTime;

    sendBroadcast('ECHO_SYNC', { remainingTime: targetTime, endTime: endTimeRef.current });
    sendBroadcast('ECHO_REQUEST', { senderId: presenceId, seconds: validSeconds, endTime: endTimeRef.current });
    const minutes = Math.floor(validSeconds / 60);
    addLog(`스피커가 직접 메아리를 보냈습니다. (+${minutes}분)`, 'request', presenceId);
    addLog(`메아리를 재생합니다. (남은 시간: ${formatTime(targetTime)})`, 'sync');
  }, [presenceId, addLog, sendBroadcast]);


  const handleStopEcho = useCallback(() => {
    endTimeRef.current = 0;
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

        <div className="grid grid-cols-2 gap-4 w-full max-w-md">
          <Button 
            size="lg" 
            className="h-16 text-base sm:text-lg font-bold" 
            onClick={() => handleSendEcho(60)}
          >
            메아리 (+1분)
          </Button>

          <Button 
            size="lg" 
            className="h-16 text-base sm:text-lg font-bold" 
            onClick={() => handleSendEcho(600)}
          >
            메아리 (+10분)
          </Button>
          
          <Button 
            variant="outline" 
            size="lg" 
            className="col-span-2 h-16 text-destructive border-destructive/20 hover:bg-destructive/10"
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
