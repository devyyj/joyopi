'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Button } from '@/app/components/ui';
import Link from 'next/link';
import { formatTime, parseSeconds, calculateRemainingSeconds, calculateNewEndTime } from '@/app/echo/utils/echo-logic';
import {
  SYNC_INTERVAL_MS,
  isLogLeader,
  isWithinStopGrace,
  remainingMsOf,
  resolveSpeakerEndTime,
} from '@/app/echo/utils/echo-sync';
import { EchoLog } from '../components/echo-log';
import { useEchoSocket } from '../hooks/use-echo-socket';
import { usePresenceId } from '../hooks/use-presence-id';
import { useWakeLock } from '../hooks/use-wake-lock';

type SendBroadcast = (event: string, payload: Record<string, unknown>) => boolean;
type AddLog = (message: string, eventType: string, userId?: string, payload?: unknown) => Promise<void>;

export default function SpeakerPage() {
  const presenceId = usePresenceId();
  const [remainingTime, setRemainingTime] = useState(0);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);

  const isPlaying = remainingTime > 0;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  // 메아리 종료 절대시각 (이 기기 시계 기준 Unix ms)
  const endTimeRef = useRef<number>(0);
  const lastSyncSentAtRef = useRef<number>(0);
  const lastStopAtRef = useRef<number>(0);
  const speakerIdsRef = useRef<string[]>([]);
  const presenceIdRef = useRef(presenceId);
  const sendBroadcastRef = useRef<SendBroadcast | null>(null);
  const addLogRef = useRef<AddLog | null>(null);

  useEffect(() => {
    presenceIdRef.current = presenceId;
  }, [presenceId]);

  // 스피커가 여러 대여도 재생·완료 로그는 대표 한 대만 남긴다
  const isLeader = useCallback(() => isLogLeader(presenceIdRef.current, speakerIdsRef.current), []);

  const applyEndTime = useCallback((endTime: number) => {
    endTimeRef.current = endTime;
    setRemainingTime(calculateRemainingSeconds(endTime));
  }, []);

  // 다른 기기와 시계가 달라도 맞도록 종료 시각이 아니라 남은 시간(ms)을 보낸다
  const broadcastSync = useCallback(() => {
    lastSyncSentAtRef.current = Date.now();
    sendBroadcastRef.current?.('ECHO_SYNC', { remainingMs: remainingMsOf(endTimeRef.current) });
  }, []);

  const stopAudio = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
  }, []);

  const handleBroadcast = useCallback((event: string, payload: Record<string, unknown>) => {
    switch (event) {
      case 'ECHO_REQUEST': {
        // 내가 보낸 요청은 handleSendEcho에서 이미 반영했다
        if (payload?.senderId === presenceIdRef.current) break;

        // 스피커 자기 시계 기준으로 상대 연장하므로 보낸 기기와 시계가 달라도 정확하다
        applyEndTime(calculateNewEndTime(endTimeRef.current, parseSeconds(payload, 60)));
        if (isLeader()) {
          broadcastSync();
          addLogRef.current?.(`메아리를 재생합니다. (남은 시간: ${formatTime(calculateRemainingSeconds(endTimeRef.current))})`, 'sync');
        }
        break;
      }
      case 'ECHO_SYNC': {
        if (typeof payload.remainingMs !== 'number' || isWithinStopGrace(lastStopAtRef.current)) break;
        const next = resolveSpeakerEndTime({ localEndTime: endTimeRef.current, remainingMs: payload.remainingMs });
        if (next !== endTimeRef.current) applyEndTime(next);
        break;
      }
      case 'ECHO_STOP':
        lastStopAtRef.current = Date.now();
        applyEndTime(0);
        stopAudio();
        break;
      case 'ECHO_QUERY':
        if (remainingMsOf(endTimeRef.current) > 0) broadcastSync();
        break;
    }
  }, [applyEndTime, broadcastSync, isLeader, stopAudio]);

  // 오디오를 켠 뒤에만 접속해, 소리가 나지 않는 스피커가 인원에 잡히지 않게 한다
  const {
    speakerCount,
    senderCount,
    speakerIds,
    logs,
    addLog,
    sendBroadcast,
  } = useEchoSocket({
    role: 'speaker',
    presenceId,
    onBroadcast: handleBroadcast,
    enabled: isAudioEnabled,
  });

  useEffect(() => {
    addLogRef.current = addLog;
    sendBroadcastRef.current = sendBroadcast;
    speakerIdsRef.current = speakerIds;
  }, [addLog, sendBroadcast, speakerIds]);

  // 재생 중에는 화면이 꺼지지 않게 해 휴대폰 스피커가 멈추지 않도록 한다
  useWakeLock(isAudioEnabled && isPlaying);

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
    if (audio.currentTime === lastAudioTimeRef.current) {
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
    const audio = new Audio('/footsteps.mp3');
    audio.loop = true;

    // 트랙이 끝나거나 오류로 멈추면 처음부터 다시 재생한다.
    // 'stalled'는 네트워크가 잠깐 느려질 때도 발생해 소리가 끊기므로 쓰지 않고, 실제 멈춤은 Watchdog이 복구한다
    const handleAudioStopped = () => {
      if (isPlayingRef.current) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      }
    };

    audio.addEventListener('ended', handleAudioStopped);
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
      audio.removeEventListener('error', handleAudioStopped);
      document.removeEventListener('visibilitychange', handleVisibility);
      audio.pause();
      audioRef.current = null;
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  // 재생 타이머: 1초마다 화면을 갱신하고, 동기화는 SYNC_INTERVAL_MS 간격으로만 보낸다
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      stopAudio();
      return;
    }

    playAudio();
    if (timerRef.current) return;

    timerRef.current = setInterval(() => {
      const remaining = calculateRemainingSeconds(endTimeRef.current);
      setRemainingTime(remaining);

      if (remaining > 0) {
        playAudio();
        if (Date.now() - lastSyncSentAtRef.current >= SYNC_INTERVAL_MS) broadcastSync();
        return;
      }

      // 정해진 시간이 다 되어 끝난 경우에만 완료 로그를 남긴다 (즉시 중지는 중지 로그만)
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      endTimeRef.current = 0;
      stopAudio();
      broadcastSync();
      if (isLeader()) addLogRef.current?.('메아리 재생이 완료되었습니다.', 'info');
    }, 1000);
  }, [isPlaying, playAudio, stopAudio, broadcastSync, isLeader]);

  const handleSendEcho = useCallback((seconds: number) => {
    const validSeconds = parseSeconds(seconds, 60);
    applyEndTime(calculateNewEndTime(endTimeRef.current, validSeconds));

    // 요청을 먼저 보내야 다른 스피커가 요청을 반영한 뒤 동기화 값을 받아 이중으로 더하지 않는다
    sendBroadcast('ECHO_REQUEST', { senderId: presenceId, seconds: validSeconds });
    broadcastSync();
    addLog(`스피커가 직접 메아리를 보냈습니다. (+${Math.floor(validSeconds / 60)}분)`, 'request', presenceId);
    if (isLeader()) {
      addLog(`메아리를 재생합니다. (남은 시간: ${formatTime(calculateRemainingSeconds(endTimeRef.current))})`, 'sync');
    }
  }, [presenceId, addLog, sendBroadcast, applyEndTime, broadcastSync, isLeader]);

  const handleStopEcho = useCallback(() => {
    lastStopAtRef.current = Date.now();
    applyEndTime(0);
    sendBroadcast('ECHO_STOP', { triggeredBy: presenceId });
    stopAudio();
    addLog('스피커가 모든 메아리를 중지시켰습니다.', 'stop', presenceId);
  }, [presenceId, addLog, sendBroadcast, applyEndTime, stopAudio]);

  const handleManualExit = useCallback(() => {
    addLog('사용자가 퇴장했습니다. (이유: 사용자 요청)', 'leave');
  }, [addLog]);

  const handleEnableAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.play().then(() => {
      audio.pause();
      setIsAudioEnabled(true);
    }).catch(err => {
      console.warn('Audio enable failed:', err);
      alert(`오디오를 켜지 못했습니다: ${err.message}`);
    });
  }, []);

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
