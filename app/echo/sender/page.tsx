'use client';

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/app/components/ui/core';
import { RealtimeChannel } from '@supabase/supabase-js';
import Link from 'next/link';
import { formatTime, mapEventTypeToLogType } from '@/app/echo/utils/echo-logic';
import { EchoLog, LogEntry } from '../components/echo-log';

import { createEchoLog, getEchoLogs } from '@/app/actions/echo';

export default function SenderPage() {
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

  // 초기 로그 로드
  useEffect(() => {
    getEchoLogs().then(res => {
      if (res.success && res.data) {
        setLogs(res.data as LogEntry[]);
      }
    });
  }, []);

  const addLogToDb = useCallback(async (message: string, eventType: string, userId?: string, payload?: unknown) => {
    const logId = crypto.randomUUID();
    const timestamp = new Date();

    // 1. DB 저장 (영속성)
    await createEchoLog({
      role: 'sender',
      eventType,
      message,
      userId: userId || presenceId,
      payload
    });

    // 2. 실시간 브로드캐스트 (즉각적인 UI 업데이트 - 타인용)
    channelRef.current?.send({
      type: 'broadcast',
      event: 'LOG_EVENT',
      payload: {
        id: logId,
        timestamp: timestamp.toISOString(),
        message,
        eventType,
        userId: userId || presenceId,
      },
    });

    // 3. 로컬 상태 업데이트 (즉각적인 UI 업데이트 - 본인용)
    setLogs((prev) => [
      ...prev,
      {
        id: logId,
        timestamp,
        message,
        type: mapEventTypeToLogType(eventType),
        userId: userId || presenceId,
      } as LogEntry
    ].slice(-100));
  }, [presenceId]);

  // 실시간 채널 설정
  useEffect(() => {
    if (!presenceId) return;

    let mounted = true;

    const setupChannel = async (reason?: string) => {
      if (!mounted) return;

      const debugInfo = {
        reason: reason || 'initial',
        online: navigator.onLine,
        visibility: document.visibilityState
      };

      // 기존 채널이 있다면 명시적으로 제거하여 리스너 누수 방지
      if (channelRef.current) {
        await supabase.removeChannel(channelRef.current);
      }

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
          if (!mounted) return;
          const state = channel.presenceState();
          const userIds = Object.keys(state);

          setSpeakerCount(userIds.filter(id => 
            (state[id] as unknown as EchoPresence[]).some(p => p.role === 'speaker')
          ).length);
          setSenderCount(userIds.filter(id => 
            (state[id] as unknown as EchoPresence[]).some(p => p.role === 'sender')
          ).length);
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          if (!mounted || key === presenceId) return;

          const state = channel.presenceState();
          const currentIds = Object.keys(state).sort();
          if (currentIds[0] !== presenceId) return;

          const p = (leftPresences as unknown as EchoPresence[])[0];
          const roleName = p?.role === 'speaker' ? '스피커' : p?.role === 'sender' ? '샌더' : '알 수 없음';
          addLogToDb(`사용자가 퇴장했습니다. (역할: ${roleName}, 이유: 연결 종료)`, 'leave', key);
        })
        .on('broadcast', { event: 'ECHO_SYNC' }, ({ payload }) => {
          if (!mounted) return;
          setRemainingTime(payload.remainingTime);
        })
        .on('broadcast', { event: 'ECHO_STOP' }, () => {
          if (!mounted) return;
          setRemainingTime(0);
        })
        .on('broadcast', { event: 'LOG_EVENT' }, ({ payload }) => {
          if (!mounted) return;
          setLogs((prev) => [
            ...prev,
            {
              id: payload.id,
              timestamp: new Date(payload.timestamp),
              message: payload.message,
              type: mapEventTypeToLogType(payload.eventType),
              userId: payload.userId,
            } as LogEntry
          ].slice(-100));
        });

      channelRef.current = channel;

      channel.subscribe(async (status, err) => {
        if (!mounted) return;

        const logPayload = { status, error: err?.message, ...debugInfo };

        if (status === 'SUBSCRIBED') {
          await addLogToDb(`서버 연결 성공 (사유: ${debugInfo.reason})`, 'join', undefined, logPayload);
          await channel.track({ 
            role: 'sender', 
            joinedAt: new Date().toISOString() 
          });
        }

        if (status === 'TIMED_OUT') {
          addLogToDb('서버 응답 시간 초과. 재연결을 시도합니다.', 'warning', undefined, logPayload);
          setupChannel('timeout');
        }

        if (status === 'CHANNEL_ERROR') {
          addLogToDb(`채널 오류 발생: ${err?.message || '알 수 없는 오류'}`, 'error', undefined, logPayload);
          setTimeout(() => {
            if (mounted && channelRef.current?.state !== 'joined') {
              setupChannel('channel_error_retry');
            }
          }, 3000);
        }
      });
    };

    setupChannel('init');

    // 자동 복구: 페이지 가시성 변화 및 온라인 상태 복구 대응
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && (!channelRef.current || channelRef.current.state !== 'joined')) {
        addLogToDb('페이지가 활성화되어 소켓 연결을 재점검합니다.', 'info');
        setupChannel('visibility_change');
      }
    };

    const handleOnline = () => {
      addLogToDb('네트워크가 복구되었습니다. 소켓 재연결을 시도합니다.', 'info');
      setupChannel('online');
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);

    return () => {
      mounted = false;
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [supabase, presenceId, addLogToDb]);
  const handleSendEcho = useCallback(() => {
    // 1. 낙관적 업데이트: 로컬 타이머를 즉시 연장
    setRemainingTime((prev) => prev + 60);

    // 2. 스피커에게 신호 전송
    channelRef.current?.send({
      type: 'broadcast',
      event: 'ECHO_REQUEST',
      payload: { senderId: presenceId },
    });
    addLogToDb('사용자가 메아리를 보냈습니다. (+1분)', 'request', presenceId);
  }, [presenceId, addLogToDb]);

  const handleStopEcho = useCallback(() => {
    channelRef.current?.send({
      type: 'broadcast',
      event: 'ECHO_STOP',
      payload: { triggeredBy: presenceId },
    });
    setRemainingTime(0);
    addLogToDb('사용자가 모든 메아리를 중지시켰습니다.', 'stop', presenceId);
  }, [presenceId, addLogToDb]);

  const handleManualExit = useCallback(() => {
    addLogToDb('사용자가 퇴장했습니다. (이유: 사용자 요청)', 'leave');
  }, [addLogToDb]);

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

