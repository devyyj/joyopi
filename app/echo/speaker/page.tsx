'use client';

import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/app/components/ui/core';
import { RealtimeChannel } from '@supabase/supabase-js';
import Link from 'next/link';
import { formatTime, mapEventTypeToLogType } from '@/app/echo/utils/echo-logic';
import { EchoLog, LogEntry } from '../components/echo-log';

import { createEchoLog, getEchoLogs } from '@/app/actions/echo';

export default function SpeakerPage() {
  const [remainingTime, setRemainingTime] = useState(0);
  const [speakerCount, setSpeakerCount] = useState<number>(0);
  const [senderCount, setSenderCount] = useState<number>(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  
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
    const logId = crypto.randomUUID();
    const timestamp = new Date();
    
    // 1. DB 저장 (영속성)
    await createEchoLog({
      role: 'speaker',
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
          // 1초마다 동기화 신호 전송 (사용자 요청: 1초 단위 업데이트)
          channelRef.current?.send({
            type: 'broadcast',
            event: 'ECHO_SYNC',
            payload: { remainingTime: next },
          });
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

  // 유휴 상태 하트비트 (연결 유지 강화)
  useEffect(() => {
    if (isPlaying) return;

    const heartbeatInterval = setInterval(() => {
      if (channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'ECHO_HEARTBEAT',
          payload: { timestamp: new Date().toISOString() },
        });
      }
    }, 30000); // 30초마다 핑

    return () => clearInterval(heartbeatInterval);
  }, [isPlaying]);

  // 실시간 채널 설정
  useEffect(() => {
    if (!presenceId) return;

    let mounted = true;
    let retryCount = 0;
    const MAX_RETRIES = 5;

    const setupChannel = async (reason?: string) => {
      if (!mounted) return;
      
      const debugInfo = {
        reason: reason || 'initial',
        online: navigator.onLine,
        visibility: document.visibilityState,
        retryCount
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
        .on('broadcast', { event: 'ECHO_REQUEST' }, () => {
          if (!mounted) return;
          setRemainingTime((prev) => prev + 60);
        })
        .on('broadcast', { event: 'ECHO_SYNC' }, ({ payload }) => {
          if (!mounted) return;
          if (payload.remainingTime > remainingTimeRef.current) {
            setRemainingTime(payload.remainingTime);
          }
        })
        .on('broadcast', { event: 'ECHO_STOP' }, () => {
          if (!mounted) return;
          setRemainingTime(0);
          audioRef.current?.pause();
          if (audioRef.current) audioRef.current.currentTime = 0;
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
        })
        .on('broadcast', { event: 'ECHO_QUERY' }, () => {
          if (!mounted) return;
          if (remainingTimeRef.current > 0) {
            channelRef.current?.send({
              type: 'broadcast',
              event: 'ECHO_SYNC',
              payload: { remainingTime: remainingTimeRef.current }
            });
          }
        });

      channelRef.current = channel;

      channel.subscribe(async (status, err) => {
        if (!mounted) return;

        const logPayload = { status, error: err?.message, ...debugInfo };

        if (status === 'SUBSCRIBED') {
          retryCount = 0;
          await addLogToDb(`서버 연결 성공 (사유: ${debugInfo.reason})`, 'join', undefined, logPayload);
          await channel.track({ 
            role: 'speaker', 
            joinedAt: new Date().toISOString() 
          });
          
          channel.send({
            type: 'broadcast',
            event: 'ECHO_QUERY',
            payload: { requesterId: presenceId }
          });
        }

        if (status === 'TIMED_OUT') {
          addLogToDb('서버 응답 시간 초과. 재연결을 시도합니다.', 'warning', undefined, logPayload);
          setupChannel('timeout');
        }

        if (status === 'CLOSED') {
          if (retryCount < MAX_RETRIES) {
            const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
            retryCount++;
            addLogToDb(`연결이 중단되었습니다. ${delay/1000}초 후 자동 재접속합니다.`, 'warning', undefined, logPayload);
            setTimeout(() => {
              if (mounted) setupChannel('closed_retry');
            }, delay);
          } else {
            addLogToDb('최대 재접속 시도 횟수를 초과했습니다. 페이지 새로고침이 필요합니다.', 'error', undefined, logPayload);
          }
        }

        if (status === 'CHANNEL_ERROR') {
          addLogToDb(`채널 오류 발생: ${err?.message || '알 수 없는 오류'}`, 'error', undefined, logPayload);
          // CHANNEL_ERROR 시에는 Supabase 내부의 재시도를 기다리거나 수동으로 짧은 뒤에 재시도
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

  const handleEnableAudio = useCallback(() => {
    if (audioRef.current) {
      // 브라우저 정책 대응: 사용자 인터랙션 시점에 무음 재생 시도로 오디오 컨텍스트 활성화
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          // 성공 시 즉시 일시정지 (실제 재생은 isPlaying 상태에 따라 제어됨)
          audioRef.current?.pause();
          setIsAudioEnabled(true);
          addLogToDb('오디오 출력이 활성화되었습니다.', 'info');
        }).catch(err => {
          addLogToDb(`오디오 활성화 실패: ${err.message}`, 'error');
        });
      }
    }
  }, [addLogToDb]);

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

