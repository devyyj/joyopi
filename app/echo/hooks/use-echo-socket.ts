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
  /** false면 채널에 접속하지 않는다 (스피커는 오디오를 켠 뒤에만 접속해 인원에 잡히도록) */
  enabled?: boolean;
}

const SOCKET_CLOSE_WAIT_MS = 3000;

/** 이전 웹소켓이 닫히는 중이면 다 닫힐 때까지(최대 3초) 기다린다. */
async function waitForSocketClosed(client: { realtime?: { isDisconnecting?: () => boolean } }) {
  const deadline = Date.now() + SOCKET_CLOSE_WAIT_MS;
  while (client.realtime?.isDisconnecting?.() && Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
}

export function useEchoSocket({ role, presenceId, onBroadcast, enabled = true }: UseEchoSocketProps) {
  const [speakerCount, setSpeakerCount] = useState<number>(0);
  const [senderCount, setSenderCount] = useState<number>(0);
  const [speakerIds, setSpeakerIds] = useState<string[]>([]);
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

  // 내 화면에만 남기는 로그 (DB 저장·브로드캐스트 없음)
  const addLocalLog = useCallback((message: string, eventType: string, userId?: string) => {
    setLogs((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        message,
        type: mapEventTypeToLogType(eventType),
        userId: userId || presenceId,
      } as LogEntry
    ].slice(-100));
  }, [presenceId]);

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

  // 초기 로그 로드 (첫 화면은 인원 수만 보여 주므로 불러오지 않는다)
  useEffect(() => {
    if (role === 'landing') return;
    getEchoLogs().then(res => {
      if (res.success && res.data) {
        setLogs(res.data as LogEntry[]);
      }
    });
  }, [role]);

  const onBroadcastRef = useRef(onBroadcast);
  useEffect(() => {
    onBroadcastRef.current = onBroadcast;
  }, [onBroadcast]);

  const setupSequenceRef = useRef(0);

  const setupChannel = useCallback(async (reason: string) => {
    if (!isMountedRef.current || !presenceId) return;

    const currentSequence = ++setupSequenceRef.current;

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

    // 싱글톤 Supabase 클라이언트에 남아있는 동일 토픽 채널 제거하여 재구독 오류 방지
    try {
      const existingChannels = supabase.getChannels().filter(
        ch => ch.topic === 'realtime:echo-room' || ch.topic === 'echo-room'
      );
      for (const ch of existingChannels) {
        await supabase.removeChannel(ch);
      }
    } catch (e) {
      console.warn('Failed to cleanup existing channels:', e);
    }

    // removeChannel은 마지막 채널이 지워지면 웹소켓을 끊기 시작하지만 다 끊길 때까지 기다리지 않는다.
    // 닫히는 중에 새 채널을 구독하면 재연결이 건너뛰어지고, 닫히는 순간 오류 정보 없는 CHANNEL_ERROR가 난다.
    await waitForSocketClosed(supabase);

    // 비동기 작업 도중 새로운 setupChannel이 호출되었거나 unmount 되었으면 중단
    if (currentSequence !== setupSequenceRef.current || !isMountedRef.current) {
      return;
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
        const hasRole = (id: string, r: string) =>
          (state[id] as unknown as EchoPresence[]).some(p => p.role === r);

        const speakers = userIds.filter(id => hasRole(id, 'speaker'));
        setSpeakerIds(speakers);
        setSpeakerCount(speakers.length);
        setSenderCount(userIds.filter(id => hasRole(id, 'sender')).length);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        if (!isMountedRef.current || key === presenceId) return;
        const p = (leftPresences as unknown as EchoPresence[])[0];
        const roleName = p?.role === 'speaker' ? '스피커' : p?.role === 'sender' ? '샌더' : '알 수 없음';
        // 퇴장을 본 모든 접속자가 저장·전파하면 같은 로그가 접속자 수만큼 중복되므로 로컬에만 남긴다
        addLocalLog(`사용자가 퇴장했습니다. (역할: ${roleName}, 이유: 연결 종료)`, 'leave', key);
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
      if (!isMountedRef.current || channelRef.current !== channel || currentSequence !== setupSequenceRef.current) return;

      const logPayload = { status: subStatus, error: err?.message, ...debugInfo };

      if (subStatus === 'SUBSCRIBED') {
        retryCountRef.current = 0;
        setStatus('CONNECTED');
        setIsChannelJoined(true);
        // 연결 상태 안내는 접속자마다 생기는 기록이라 DB에 쌓지 않고 내 화면에만 남긴다
        addLocalLog(`서버 연결 성공 (사유: ${reason})`, 'join');
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
        addLocalLog('서버 응답 시간 초과. 3초 후 재연결을 시도합니다.', 'warning');
        reconnectTimeoutRef.current = setTimeout(() => setupChannelRef.current('timeout'), 3000);
      }

      if (subStatus === 'CLOSED') {
        setStatus('DISCONNECTED');
        setIsChannelJoined(false);
        if (retryCountRef.current < MAX_RETRIES) {
          const delay = Math.min(1000 * Math.pow(2, retryCountRef.current), 10000);
          retryCountRef.current++;
          addLocalLog(`연결이 중단되었습니다. ${delay/1000}초 후 자동 재접속합니다.`, 'warning');
          reconnectTimeoutRef.current = setTimeout(() => setupChannelRef.current('closed_retry'), delay);
        } else {
          setStatus('ERROR');
          addLog('최대 재접속 시도 횟수를 초과했습니다. 페이지 새로고침이 필요합니다.', 'error', undefined, logPayload);
        }
      }

      if (subStatus === 'CHANNEL_ERROR') {
        setIsChannelJoined(false);
        const errMsg = err?.message || '';

        // 오류 정보가 없으면 서버 거절이 아니라 웹소켓 연결이 끊긴 것이다. 오류로 저장하지 않고 재접속한다
        if (!errMsg) {
          setStatus('DISCONNECTED');
          if (retryCountRef.current < MAX_RETRIES) {
            const delay = Math.min(1000 * Math.pow(2, retryCountRef.current), 10000);
            retryCountRef.current++;
            addLocalLog(`연결이 잠시 끊겼습니다. ${delay / 1000}초 후 다시 연결합니다.`, 'warning');
            reconnectTimeoutRef.current = setTimeout(() => setupChannelRef.current('socket_error_retry'), delay);
          } else {
            setStatus('ERROR');
            addLog('연결이 계속 끊겨 재접속을 멈췄습니다. 페이지 새로고침이 필요합니다.', 'error', undefined, logPayload);
          }
          return;
        }

        setStatus('ERROR');
        addLog(`채널 오류 발생: ${errMsg || '알 수 없는 오류'}`, 'error', undefined, logPayload);

        // 로그인이 없어 갱신할 세션도 없다. 잠시 뒤 다시 접속만 한다
        reconnectTimeoutRef.current = setTimeout(() => {
          if (isMountedRef.current && (!channelRef.current || channelRef.current.state !== 'joined')) {
            setupChannelRef.current('channel_error_retry');
          }
        }, 5000);
      }
    });
  }, [presenceId, role, supabase, addLog, addLocalLog]);

  useEffect(() => {
    setupChannelRef.current = setupChannel;
  }, [setupChannel]);

  useEffect(() => {
    if (!enabled) return;
    isMountedRef.current = true;
    // 연결 유지 신호는 Supabase 클라이언트가 25초마다 자체 전송하므로 따로 보내지 않는다
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
        channelRef.current = null;
      }
    };
  }, [supabase, role, presenceId, enabled]);


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
    speakerIds,
    logs,
    status,
    isChannelJoined,
    addLog,
    sendBroadcast
  };
}
