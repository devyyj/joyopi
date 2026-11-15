'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { mapEventTypeToLogType } from '../utils/echo-logic';
import { joinEchoRoom, type EchoPresence, type EchoRoom } from '../utils/echo-room';
import { LogEntry } from '../components/echo-log';
import { createEchoLog, getEchoLogs } from '@/app/actions/echo';

export type EchoRole = 'speaker' | 'sender' | 'landing';

interface UseEchoSocketProps {
  role: EchoRole;
  presenceId: string;
  onBroadcast?: (event: string, payload: Record<string, unknown>) => void;
  /** false면 방에 접속하지 않는다 (스피커는 오디오를 켠 뒤에만 접속해 인원에 잡히도록) */
  enabled?: boolean;
}

const MAX_LOGS = 100;

function roleLabel(role: string | undefined) {
  if (role === 'speaker') return '스피커';
  if (role === 'sender') return '샌더';
  return '알 수 없음';
}

/**
 * 메아리 실시간 소켓. 접속자 집계(presence)와 이벤트 주고받기는 Firebase Realtime Database(echo-room.ts)가 맡는다.
 * 끊긴 연결은 Firebase SDK가 스스로 다시 잇고, 다시 이어지면 presence를 다시 기록한다.
 */
export function useEchoSocket({ role, presenceId, onBroadcast, enabled = true }: UseEchoSocketProps) {
  const [speakerCount, setSpeakerCount] = useState<number>(0);
  const [senderCount, setSenderCount] = useState<number>(0);
  const [speakerIds, setSpeakerIds] = useState<string[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [status, setStatus] = useState<'INITIAL' | 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'ERROR'>('INITIAL');
  const [isChannelJoined, setIsChannelJoined] = useState(false);

  const roomRef = useRef<EchoRoom | null>(null);

  const appendLog = useCallback((entry: LogEntry) => {
    setLogs((prev) => [...prev, entry].slice(-MAX_LOGS));
  }, []);

  // 내 화면에만 남기는 로그 (DB 저장·브로드캐스트 없음)
  const addLocalLog = useCallback((message: string, eventType: string, userId?: string) => {
    appendLog({
      id: crypto.randomUUID(),
      timestamp: new Date(),
      message,
      type: mapEventTypeToLogType(eventType),
      userId: userId || presenceId,
    } as LogEntry);
  }, [appendLog, presenceId]);

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
    roomRef.current?.send('LOG_EVENT', {
      id: logId,
      timestamp: timestamp.toISOString(),
      message,
      eventType,
      userId: uid,
    });

    // 3. 로컬 상태 업데이트
    appendLog({
      id: logId,
      timestamp,
      message,
      type: mapEventTypeToLogType(eventType),
      userId: uid,
    } as LogEntry);
  }, [appendLog, presenceId, role]);

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

  useEffect(() => {
    if (!enabled || !presenceId) return;

    // 접속 시작 상태는 방에 들어가는 이 effect에서만 정해진다
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStatus('CONNECTING');

    const room = joinEchoRoom({ presenceId, role }, {
      onConnectionChange(connected) {
        if (!connected) {
          setStatus('DISCONNECTED');
          setIsChannelJoined(false);
          addLocalLog('연결이 잠시 끊겼습니다. 자동으로 다시 연결합니다.', 'warning');
          return;
        }
        setStatus('CONNECTED');
        setIsChannelJoined(true);
        // 연결 상태 안내는 접속자마다 생기는 기록이라 DB에 쌓지 않고 내 화면에만 남긴다
        addLocalLog('서버 연결 성공', 'join');
        if (role !== 'landing') {
          room.send('ECHO_QUERY', { requesterId: presenceId });
        }
      },
      onPresence(members) {
        const ids = Object.keys(members);
        const hasRole = (id: string, r: string) => (members[id] as EchoPresence | undefined)?.role === r;
        const speakers = ids.filter((id) => hasRole(id, 'speaker'));
        setSpeakerIds(speakers);
        setSpeakerCount(speakers.length);
        setSenderCount(ids.filter((id) => hasRole(id, 'sender')).length);
      },
      onLeave(key, presence) {
        if (key === presenceId) return;
        // 퇴장을 본 모든 접속자가 저장·전파하면 같은 로그가 접속자 수만큼 중복되므로 로컬에만 남긴다
        addLocalLog(`사용자가 퇴장했습니다. (역할: ${roleLabel(presence?.role)}, 이유: 연결 종료)`, 'leave', key);
      },
      onEvent(event, payload) {
        if (event === 'LOG_EVENT') {
          appendLog({
            id: payload.id,
            timestamp: new Date(payload.timestamp as string),
            message: payload.message,
            type: mapEventTypeToLogType(payload.eventType as string),
            userId: payload.userId,
          } as LogEntry);
          return;
        }
        // 페이지별 특화 이벤트 콜백
        onBroadcastRef.current?.(event, payload);
      },
      onError(error) {
        setStatus('ERROR');
        setIsChannelJoined(false);
        addLog(`채널 오류 발생: ${error.message || '알 수 없는 오류'}`, 'error', undefined, { error: error.message, role });
      },
    });
    roomRef.current = room;

    return () => {
      room.leave();
      if (roomRef.current === room) roomRef.current = null;
    };
  }, [enabled, presenceId, role, addLog, addLocalLog, appendLog]);

  const sendBroadcast = useCallback((event: string, payload: Record<string, unknown>) => {
    return roomRef.current?.send(event, payload) ?? false;
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
