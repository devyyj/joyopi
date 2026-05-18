'use client';

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';
import { mapEventTypeToLogType } from '../utils/echo-logic';
import { LogEntry } from '../components/echo-log';
import { createEchoLog, getEchoLogs } from '@/app/actions/echo';

export type EchoRole = 'speaker' | 'sender' | 'landing';

interface EchoPresence {
  role: string;
  joinedAt: string;
}

interface UseEchoSocketProps {
  role: EchoRole;
  presenceId: string;
  onBroadcast?: (event: string, payload: Record<string, unknown>) => void;
}

export function useEchoSocket({ role, presenceId, onBroadcast }: UseEchoSocketProps) {
  const [speakerCount, setSpeakerCount] = useState<number>(0);
  const [senderCount, setSenderCount] = useState<number>(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [status, setStatus] = useState<'INITIAL' | 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'ERROR'>('INITIAL');
  const [isChannelJoined, setIsChannelJoined] = useState(false);

  const supabase = useMemo(() => createClient(), []);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const retryCountRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);
  const setupChannelRef = useRef<(reason: string) => Promise<void>>(() => Promise.resolve());
  const MAX_RETRIES = 5;

  // 로그 추가 함수 (DB 저장 + 브로드캐스트 + 로컬 상태)
  const addLog = useCallback(async (message: string, eventType: string, userId?: string, payload?: unknown) => {
    const logId = crypto.randomUUID();
    const timestamp = new Date();
    const uid = userId || presenceId;

    // 1. DB 저장 (영속성) - 실패해도 UI는 업데이트함
    createEchoLog({
      role,
      eventType,
      message,
      userId: uid,
      payload
    }).catch(err => console.error('Log save failed:', err));

    // 2. 실시간 브로드캐스트 (타인용)
    if (channelRef.current && channelRef.current.state === 'joined') {
      channelRef.current.send({
        type: 'broadcast',
        event: 'LOG_EVENT',
        payload: {
          id: logId,
          timestamp: timestamp.toISOString(),
          message,
          eventType,
          userId: uid,
        },
      });
    }

    // 3. 로컬 상태 업데이트
    setLogs((prev) => [
      ...prev,
      {
        id: logId,
        timestamp,
        message,
        type: mapEventTypeToLogType(eventType),
        userId: uid,
      } as LogEntry
    ].slice(-100));
  }, [presenceId, role]);

  // 초기 로그 로드
  useEffect(() => {
    getEchoLogs().then(res => {
      if (res.success && res.data) {
        setLogs(res.data as LogEntry[]);
      }
    });
  }, []);

  const onBroadcastRef = useRef(onBroadcast);
  useEffect(() => {
    onBroadcastRef.current = onBroadcast;
  }, [onBroadcast]);

  const setupChannel = useCallback(async (reason: string) => {
    if (!isMountedRef.current || !presenceId) return;

    // 기존 타이머 및 채널 정리
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (channelRef.current) {
      const oldChannel = channelRef.current;
      channelRef.current = null; // 즉시 참조 제거
      setIsChannelJoined(false);
      await supabase.removeChannel(oldChannel);
    }

    const debugInfo = {
      reason,
      online: typeof navigator !== 'undefined' ? navigator.onLine : true,
      visibility: typeof document !== 'undefined' ? document.visibilityState : 'visible',
      retryCount: retryCountRef.current
    };

    setStatus('CONNECTING');

    const channel = supabase.channel('echo-room', {
      config: {
        presence: {
          key: presenceId,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        if (!isMountedRef.current) return;
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
        if (!isMountedRef.current || key === presenceId) return;
        const p = (leftPresences as unknown as EchoPresence[])[0];
        const roleName = p?.role === 'speaker' ? '스피커' : p?.role === 'sender' ? '샌더' : '알 수 없음';
        addLog(`사용자가 퇴장했습니다. (역할: ${roleName}, 이유: 연결 종료)`, 'leave', key);
      })
      .on('broadcast', { event: '*' }, ({ event, payload }) => {
        if (!isMountedRef.current) return;
        
        // 공통 이벤트 처리
        if (event === 'LOG_EVENT') {
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
          return;
        }

        // 페이지별 특화 이벤트 콜백
        if (onBroadcastRef.current) {
          onBroadcastRef.current(event, payload);
        }
      });

    channelRef.current = channel;

    channel.subscribe(async (subStatus, err) => {
      if (!isMountedRef.current || channelRef.current !== channel) return;

      const logPayload = { status: subStatus, error: err?.message, ...debugInfo };

      if (subStatus === 'SUBSCRIBED') {
        retryCountRef.current = 0;
        setStatus('CONNECTED');
        setIsChannelJoined(true);
        await addLog(`서버 연결 성공 (사유: ${reason})`, 'join', undefined, logPayload);
        await channel.track({ 
          role, 
          joinedAt: new Date().toISOString() 
        });
        
        if (role !== 'landing') {
          channel.send({
            type: 'broadcast',
            event: 'ECHO_QUERY',
            payload: { requesterId: presenceId }
          });
        }
      }

      if (subStatus === 'TIMED_OUT') {
        setStatus('DISCONNECTED');
        setIsChannelJoined(false);
        addLog('서버 응답 시간 초과. 3초 후 재연결을 시도합니다.', 'warning', undefined, logPayload);
        reconnectTimeoutRef.current = setTimeout(() => setupChannelRef.current('timeout'), 3000);
      }

      if (subStatus === 'CLOSED') {
        setStatus('DISCONNECTED');
        setIsChannelJoined(false);
        if (retryCountRef.current < MAX_RETRIES) {
          const delay = Math.min(1000 * Math.pow(2, retryCountRef.current), 10000);
          retryCountRef.current++;
          addLog(`연결이 중단되었습니다. ${delay/1000}초 후 자동 재접속합니다.`, 'warning', undefined, logPayload);
          reconnectTimeoutRef.current = setTimeout(() => setupChannelRef.current('closed_retry'), delay);
        } else {
          setStatus('ERROR');
          addLog('최대 재접속 시도 횟수를 초과했습니다. 페이지 새로고침이 필요합니다.', 'error', undefined, logPayload);
        }
      }

      if (subStatus === 'CHANNEL_ERROR') {
        setStatus('ERROR');
        setIsChannelJoined(false);
        addLog(`채널 오류 발생: ${err?.message || '알 수 없는 오류'}`, 'error', undefined, logPayload);
        reconnectTimeoutRef.current = setTimeout(() => {
          if (isMountedRef.current && (!channelRef.current || channelRef.current.state !== 'joined')) {
            setupChannelRef.current('channel_error_retry');
          }
        }, 5000);
      }
    });
  }, [presenceId, role, supabase, addLog]);

  useEffect(() => {
    setupChannelRef.current = setupChannel;
  }, [setupChannel]);

  useEffect(() => {
    isMountedRef.current = true;
    setupChannelRef.current('init');

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && (!channelRef.current || channelRef.current.state !== 'joined')) {
        setupChannelRef.current('visibility_change');
      }
    };

    const handleOnline = () => {
      setupChannelRef.current('online');
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);

    return () => {
      isMountedRef.current = false;
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [supabase]);

  const sendBroadcast = useCallback((event: string, payload: Record<string, unknown>) => {
    if (channelRef.current && channelRef.current.state === 'joined') {
      channelRef.current.send({
        type: 'broadcast',
        event,
        payload
      });
      return true;
    }
    return false;
  }, []);

  return {
    speakerCount,
    senderCount,
    logs,
    status,
    isChannelJoined,
    addLog,
    sendBroadcast
  };
}
