'use client';

import {
  endAt,
  get,
  limitToFirst,
  onChildAdded,
  onChildRemoved,
  onDisconnect,
  onValue,
  orderByChild,
  push,
  query,
  ref,
  remove,
  serverTimestamp,
  set,
  startAt,
} from 'firebase/database';

import { getEchoDatabase } from '@/utils/firebase/client';

/**
 * 메아리 방(Firebase Realtime Database).
 *
 * - 접속자(presence): `echo/presence/{presenceId}` = { role, joinedAt }. 연결이 끊기면 서버가 onDisconnect로 지운다.
 * - 이벤트(브로드캐스트): `echo/events/{pushId}` = { event, from, payload(JSON 문자열), at(서버 시각) }.
 *   접속한 시각 이후의 이벤트만 듣고, 보낸 사람은 30초 뒤 지운다. 남은 찌꺼기는 다음 접속자가 5분 기준으로 지운다.
 * 보안 규칙은 저장소 루트의 database.rules.json에 있다.
 */

const PRESENCE_PATH = 'echo/presence';
const EVENTS_PATH = 'echo/events';
const EVENT_TTL_MS = 30_000;
const STALE_EVENT_MS = 5 * 60_000;
const STALE_PRUNE_LIMIT = 50;

export interface EchoPresence {
  role: string;
  joinedAt: string;
}

export interface EchoRoomHandlers {
  /** 서버 연결(+ 내 presence 기록)이 끝나면 true, 끊기면 false */
  onConnectionChange: (connected: boolean) => void;
  onPresence: (members: Record<string, EchoPresence>) => void;
  onLeave: (key: string, presence: EchoPresence | null) => void;
  /** 다른 접속자가 보낸 이벤트 (내가 보낸 것은 오지 않는다) */
  onEvent: (event: string, payload: Record<string, unknown>) => void;
  onError: (error: Error) => void;
}

export interface EchoRoom {
  /** 연결돼 있으면 보내고 true, 아니면 보내지 않고 false */
  send: (event: string, payload: Record<string, unknown>) => boolean;
  leave: () => void;
}

interface EventRecord {
  event?: unknown;
  from?: unknown;
  payload?: unknown;
}

function parsePayload(raw: unknown): Record<string, unknown> | null {
  if (typeof raw !== 'string') return null;
  try {
    const value = JSON.parse(raw);
    return value && typeof value === 'object' ? (value as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export function joinEchoRoom(
  { presenceId, role }: { presenceId: string; role: string },
  handlers: EchoRoomHandlers,
): EchoRoom {
  const db = getEchoDatabase();
  // 같은 탭에서 방을 다시 들어와도 이전 방에서 보낸 이벤트와 구분되도록 방마다 새로 만든다
  const clientId = crypto.randomUUID();
  const presenceRef = ref(db, `${PRESENCE_PATH}/${presenceId}`);
  const eventsRef = ref(db, EVENTS_PATH);

  let left = false;
  let connected = false;
  let serverOffset = 0;
  let connectSeq = 0;
  let stopEvents: (() => void) | null = null;
  const unsubscribes: Array<() => void> = [];

  const fail = (error: Error) => {
    if (!left) handlers.onError(error);
  };

  const pruneStaleEvents = async (serverNow: number) => {
    try {
      const stale = await get(query(eventsRef, orderByChild('at'), endAt(serverNow - STALE_EVENT_MS), limitToFirst(STALE_PRUNE_LIMIT)));
      const removals: Promise<void>[] = [];
      stale.forEach((child) => {
        removals.push(remove(child.ref));
      });
      await Promise.all(removals);
    } catch {
      // 정리는 다음 접속자가 다시 시도한다
    }
  };

  const handleConnected = async (seq: number) => {
    const isCurrent = () => !left && seq === connectSeq;
    try {
      // 끊김 예약을 먼저 걸어야, 기록 직후 끊겨도 유령 접속자가 남지 않는다
      await onDisconnect(presenceRef).remove();
      if (!isCurrent()) return;
      await set(presenceRef, { role, joinedAt: new Date().toISOString() });
    } catch (error) {
      if (isCurrent()) fail(error as Error);
      return;
    }
    if (!isCurrent()) return;

    const serverNow = Date.now() + serverOffset;
    stopEvents?.();
    stopEvents = onChildAdded(
      query(eventsRef, orderByChild('at'), startAt(serverNow)),
      (snapshot) => {
        const record = snapshot.val() as EventRecord | null;
        if (!record || record.from === clientId || typeof record.event !== 'string') return;
        const payload = parsePayload(record.payload);
        if (!payload) return;
        handlers.onEvent(record.event, payload);
      },
      fail,
    );
    connected = true;
    handlers.onConnectionChange(true);
    void pruneStaleEvents(serverNow);
  };

  unsubscribes.push(
    onValue(ref(db, '.info/serverTimeOffset'), (snapshot) => {
      serverOffset = Number(snapshot.val()) || 0;
    }),
  );

  unsubscribes.push(
    onValue(ref(db, '.info/connected'), (snapshot) => {
      if (left) return;
      const seq = ++connectSeq;
      if (snapshot.val() === true) {
        void handleConnected(seq);
        return;
      }
      if (!connected) return;
      connected = false;
      stopEvents?.();
      stopEvents = null;
      handlers.onConnectionChange(false);
    }),
  );

  unsubscribes.push(
    onValue(
      ref(db, PRESENCE_PATH),
      (snapshot) => handlers.onPresence((snapshot.val() as Record<string, EchoPresence> | null) ?? {}),
      fail,
    ),
  );

  unsubscribes.push(
    onChildRemoved(
      ref(db, PRESENCE_PATH),
      (snapshot) => handlers.onLeave(snapshot.key ?? '', snapshot.val() as EchoPresence | null),
      fail,
    ),
  );

  return {
    send(event, payload) {
      if (left || !connected) return false;
      const eventRef = push(eventsRef);
      set(eventRef, { event, from: clientId, payload: JSON.stringify(payload), at: serverTimestamp() }).catch(fail);
      setTimeout(() => {
        remove(eventRef).catch(() => {});
      }, EVENT_TTL_MS);
      return true;
    },
    leave() {
      if (left) return;
      left = true;
      connected = false;
      unsubscribes.forEach((unsubscribe) => unsubscribe());
      stopEvents?.();
      stopEvents = null;
      onDisconnect(presenceRef).cancel().catch(() => {});
      remove(presenceRef).catch(() => {});
    },
  };
}
