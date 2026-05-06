'use client';

import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/app/components/ui/core';
import { RealtimeChannel } from '@supabase/supabase-js';
import Link from 'next/link';
import { formatTime } from '@/app/echo/utils/echo-logic';
import { EchoLog, LogEntry } from '../components/echo-log';

import { createEchoLog, getEchoLogs } from '@/app/actions/echo';

export default function SpeakerPage() {
  const [remainingTime, setRemainingTime] = useState(0);
  const [speakerCount, setSpeakerCount] = useState<number>(0);
  const [senderCount, setSenderCount] = useState<number>(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  
  const connectedUsers = speakerCount + senderCount;
  
  const presenceId = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const saved = sessionStorage.getItem('echo-presence-id');
    if (saved) return saved;
    const id = crypto.randomUUID();
    sessionStorage.setItem('echo-presence-id', id);
    return id;
  }, []);

  const isPlaying = remainingTime > 0;
  
  const supabase = useMemo(() => createClient(), []);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 초기 로그 로드
  useEffect(() => {
    getEchoLogs().then(res => {
      if (res.success && res.data) {
        setLogs(res.data as LogEntry[]);
      }
    });
  }, []);

  const addLogToDb = useCallback(async (message: string, eventType: string, userId?: string, payload?: unknown) => {
    // 1. DB 저장 (영속성)
    await createEchoLog({
      role: 'speaker',
      eventType,
      message,
      userId: userId || presenceId,
      payload
    });

    // 2. 실시간 브로드캐스트 (즉각적인 UI 업데이트)
    channelRef.current?.send({
      type: 'broadcast',
      event: 'LOG_EVENT',
      payload: {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        message,
        eventType,
        userId: userId || presenceId,
      },
    });
  }, [presenceId]);

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

  // 린트 경고 해결을 위한 Ref
  const remainingTimeRef = useRef(remainingTime);
  useEffect(() => {
    remainingTimeRef.current = remainingTime;
  }, [remainingTime]);

  // 오디오 재생 및 타이머 동기화 로직
  useEffect(() => {
    if (isPlaying) {
      audioRef.current?.play().catch((err) => {
        addLogToDb(`오디오 재생 실패: ${err.message}`, 'error');
      });
    } else {
      audioRef.current?.pause();
      if (audioRef.current) audioRef.current.currentTime = 0;
    }

    if (isPlaying && !timerRef.current) {
      addLogToDb(`메아리를 재생합니다. (남은 시간: ${formatTime(remainingTimeRef.current)})`, 'sync');
      timerRef.current = setInterval(() => {
        setRemainingTime((prev) => {
          const next = Math.max(0, prev - 1);
          // 5초마다 또는 마지막에 동기화 신호 전송 (네트워크 부하 감소)
          if (next % 5 === 0 || next === 0) {
            channelRef.current?.send({
              type: 'broadcast',
              event: 'ECHO_SYNC',
              payload: { remainingTime: next },
            });
          }
          return next;
        });
      }, 1000);
    } else if (!isPlaying && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      addLogToDb('메아리 재생이 완료되었습니다.', 'info');
      // 정지 시 즉시 동기화
      channelRef.current?.send({
        type: 'broadcast',
        event: 'ECHO_SYNC',
        payload: { remainingTime: 0 },
      });
    }
  }, [isPlaying, addLogToDb]);

  // 실시간 채널 설정
  useEffect(() => {
    if (!presenceId) return;

    // 1. 실시간 브로드캐스트/프레즌스 채널
    const channel = supabase.channel('echo-room', {
      config: {
        presence: {
          key: presenceId,
        },
      },
    });

    interface EchoPresence {
      role: string;
      joinedAt: string;
    }

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const userIds = Object.keys(state);
        
        setSpeakerCount(userIds.filter(id => 
          (state[id] as unknown as EchoPresence[]).some(p => p.role === 'speaker')
        ).length);
        setSenderCount(userIds.filter(id => 
          (state[id] as unknown as EchoPresence[]).some(p => p.role === 'sender')
        ).length);
      })
      .on('presence', { event: 'join' }, () => {
        // 본인의 입장은 subscribe에서 처리
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        const p = (leftPresences as unknown as EchoPresence[])[0];
        const roleName = p?.role === 'speaker' ? '스피커' : p?.role === 'sender' ? '샌더' : '알 수 없음';
        addLogToDb(`사용자가 퇴장했습니다. (역할: ${roleName}, 이유: 연결 종료)`, 'leave', key);
      })
      .on('broadcast', { event: 'ECHO_REQUEST' }, () => {
        setRemainingTime((prev) => prev + 60);
      })
      .on('broadcast', { event: 'ECHO_STOP' }, () => {
        setRemainingTime(0);
        audioRef.current?.pause();
        if (audioRef.current) audioRef.current.currentTime = 0;
      })
      .on('broadcast', { event: 'LOG_EVENT' }, ({ payload }) => {
        setLogs((prev) => [
          ...prev,
          {
            id: payload.id,
            timestamp: new Date(payload.timestamp),
            message: payload.message,
            type: (payload.eventType === 'request' || payload.eventType === 'sync') ? 'success' :
                  (payload.eventType === 'leave' || payload.eventType === 'stop') ? 'warning' :
                  payload.eventType === 'error' ? 'error' : 'info' as const,
            userId: payload.userId,
          } as LogEntry
        ].slice(-100));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await addLogToDb('사용자가 입장했습니다. (역할: 스피커)', 'join');
          await channel.track({ 
            role: 'speaker', 
            joinedAt: new Date().toISOString() 
          });
        }
      });

    channelRef.current = channel;

    // 브라우저 종료 시 사유 전송 시도
    const handleBeforeUnload = () => {
      addLogToDb('사용자가 퇴장했습니다. (이유: 브라우저 종료)', 'leave');
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      channel.unsubscribe();
    };
  }, [supabase, presenceId, addLogToDb]);

  const handleSendEcho = useCallback(() => {
    setRemainingTime((prev) => prev + 60);
    channelRef.current?.send({
      type: 'broadcast',
      event: 'ECHO_REQUEST',
      payload: { senderId: presenceId },
    });
    addLogToDb('스피커가 직접 메아리를 보냈습니다. (+1분)', 'request', presenceId);
  }, [presenceId, addLogToDb]);

  const handleStopEcho = useCallback(() => {
    channelRef.current?.send({
      type: 'broadcast',
      event: 'ECHO_STOP',
      payload: { triggeredBy: presenceId },
    });
    setRemainingTime(0);
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.currentTime = 0;
    addLogToDb('스피커가 모든 메아리를 중지시켰습니다.', 'stop', presenceId);
  }, [presenceId, addLogToDb]);

  const handleManualExit = useCallback(() => {
    addLogToDb('사용자가 퇴장했습니다. (이유: 사용자 요청)', 'leave');
  }, [addLogToDb]);

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

