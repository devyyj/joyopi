import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// firebase/database 대역. 경로별 리스너를 모아 두고 테스트에서 직접 이벤트를 흘려 보낸다.
type Listener = { path: string; kind: 'value' | 'child_added' | 'child_removed'; cb: (snap: unknown) => void; cancel?: (e: Error) => void; q?: QueryDesc };
type QueryDesc = { path: string; startAt?: number; endAt?: number };

const listeners: Listener[] = [];
const writes: Array<{ op: string; path: string; value?: unknown }> = [];
let pushCount = 0;
let getResult: Array<{ key: string; path: string }> = [];

const snap = (key: string | null, value: unknown) => ({ key, val: () => value, forEach: () => false });

function pathOf(target: { path: string } | QueryDesc): string {
  return target.path;
}

vi.mock('@/utils/firebase/client', () => ({ getEchoDatabase: () => ({}) }));

vi.mock('firebase/database', () => ({
  ref: (_db: unknown, path: string) => ({ path, key: path.split('/').pop() }),
  push: (parent: { path: string }) => {
    pushCount += 1;
    const key = `ev${pushCount}`;
    return { path: `${parent.path}/${key}`, key };
  },
  set: vi.fn((r: { path: string }, value: unknown) => {
    writes.push({ op: 'set', path: r.path, value });
    return Promise.resolve();
  }),
  remove: vi.fn((r: { path: string }) => {
    writes.push({ op: 'remove', path: r.path });
    return Promise.resolve();
  }),
  onDisconnect: (r: { path: string }) => ({
    remove: () => { writes.push({ op: 'onDisconnect.remove', path: r.path }); return Promise.resolve(); },
    cancel: () => { writes.push({ op: 'onDisconnect.cancel', path: r.path }); return Promise.resolve(); },
  }),
  serverTimestamp: () => 'SERVER_TS',
  query: (r: { path: string }, ...constraints: Array<Partial<QueryDesc>>) => Object.assign({ path: r.path }, ...constraints),
  orderByChild: () => ({}),
  startAt: (v: number) => ({ startAt: v }),
  endAt: (v: number) => ({ endAt: v }),
  limitToFirst: () => ({}),
  get: vi.fn((q: QueryDesc) => Promise.resolve({
    forEach: (fn: (child: { key: string; ref: { path: string } }) => void) => {
      getResult.forEach((c) => fn({ key: c.key, ref: { path: c.path } }));
      return false;
    },
    q,
  })),
  onValue: (target: { path: string }, cb: (s: unknown) => void, cancel?: (e: Error) => void) => {
    const l: Listener = { path: pathOf(target), kind: 'value', cb, cancel };
    listeners.push(l);
    return () => listeners.splice(listeners.indexOf(l), 1);
  },
  onChildAdded: (target: QueryDesc, cb: (s: unknown) => void, cancel?: (e: Error) => void) => {
    const l: Listener = { path: pathOf(target), kind: 'child_added', cb, cancel, q: target };
    listeners.push(l);
    return () => listeners.splice(listeners.indexOf(l), 1);
  },
  onChildRemoved: (target: { path: string }, cb: (s: unknown) => void, cancel?: (e: Error) => void) => {
    const l: Listener = { path: pathOf(target), kind: 'child_removed', cb, cancel };
    listeners.push(l);
    return () => listeners.splice(listeners.indexOf(l), 1);
  },
}));

import { joinEchoRoom } from './echo-room';

function emit(path: string, kind: Listener['kind'], key: string | null, value: unknown) {
  listeners.filter((l) => l.path === path && l.kind === kind).forEach((l) => l.cb(snap(key, value)));
}

function handlers() {
  return {
    onConnectionChange: vi.fn(),
    onPresence: vi.fn(),
    onLeave: vi.fn(),
    onEvent: vi.fn(),
    onError: vi.fn(),
  };
}

async function connect(offset = 0) {
  emit('.info/serverTimeOffset', 'value', null, offset);
  emit('.info/connected', 'value', null, true);
  // 접속 처리(onDisconnect 예약 → presence 기록)는 비동기다
  await vi.waitFor(() => expect(listeners.some((l) => l.path === 'echo/events' && l.kind === 'child_added')).toBe(true));
}

describe('joinEchoRoom (Firebase Realtime Database)', () => {
  beforeEach(() => {
    listeners.length = 0;
    writes.length = 0;
    pushCount = 0;
    getResult = [];
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('연결되면 끊길 때 지울 예약을 먼저 걸고 내 presence를 기록한 뒤 연결됨을 알린다', async () => {
    const h = handlers();
    joinEchoRoom({ presenceId: 'p1', role: 'speaker' }, h);

    await connect();

    const ops = writes.filter((w) => w.path === 'echo/presence/p1').map((w) => w.op);
    expect(ops).toEqual(['onDisconnect.remove', 'set']);
    expect(writes.find((w) => w.op === 'set')!.value).toEqual({ role: 'speaker', joinedAt: expect.any(String) });
    expect(h.onConnectionChange).toHaveBeenCalledWith(true);
  });

  it('연결 전에는 보내지 않고(false), 연결 뒤에는 이벤트를 서버 시각과 함께 기록한다', async () => {
    const room = joinEchoRoom({ presenceId: 'p1', role: 'sender' }, handlers());
    expect(room.send('ECHO_REQUEST', { seconds: 60 })).toBe(false);

    await connect();
    expect(room.send('ECHO_REQUEST', { seconds: 60 })).toBe(true);

    const ev = writes.find((w) => w.path.startsWith('echo/events/'));
    expect(ev!.value).toEqual({ event: 'ECHO_REQUEST', from: expect.any(String), payload: JSON.stringify({ seconds: 60 }), at: 'SERVER_TS' });
  });

  it('보낸 이벤트는 30초 뒤 지운다', async () => {
    const room = joinEchoRoom({ presenceId: 'p1', role: 'sender' }, handlers());
    await connect();
    room.send('ECHO_STOP', {});

    expect(writes.some((w) => w.op === 'remove' && w.path === 'echo/events/ev1')).toBe(false);
    await vi.advanceTimersByTimeAsync(30_000);
    expect(writes.some((w) => w.op === 'remove' && w.path === 'echo/events/ev1')).toBe(true);
  });

  it('접속한 시각(서버 시각 기준) 이후 이벤트만 듣고, 내가 보낸 이벤트는 무시한다', async () => {
    const h = handlers();
    const room = joinEchoRoom({ presenceId: 'p1', role: 'speaker' }, h);
    const before = Date.now();
    await connect(5_000);

    const evListener = listeners.find((l) => l.path === 'echo/events' && l.kind === 'child_added')!;
    expect(evListener.q!.startAt).toBeGreaterThanOrEqual(before + 5_000);

    room.send('ECHO_SYNC', { remainingMs: 1 });
    const mine = writes.find((w) => w.path === 'echo/events/ev1')!.value as { from: string };
    emit('echo/events', 'child_added', 'ev1', { event: 'ECHO_SYNC', from: mine.from, payload: '{"remainingMs":1}', at: 1 });
    emit('echo/events', 'child_added', 'x1', { event: 'ECHO_REQUEST', from: 'other', payload: '{"seconds":600}', at: 1 });

    expect(h.onEvent).toHaveBeenCalledTimes(1);
    expect(h.onEvent).toHaveBeenCalledWith('ECHO_REQUEST', { seconds: 600 });
  });

  it('형식이 깨진 이벤트는 무시한다', async () => {
    const h = handlers();
    joinEchoRoom({ presenceId: 'p1', role: 'speaker' }, h);
    await connect();

    emit('echo/events', 'child_added', 'x1', { event: 'ECHO_REQUEST', from: 'other', payload: '{not json', at: 1 });
    emit('echo/events', 'child_added', 'x2', { from: 'other', payload: '{}', at: 1 });

    expect(h.onEvent).not.toHaveBeenCalled();
  });

  it('접속할 때 5분 넘게 남은 이벤트를 지운다', async () => {
    getResult = [{ key: 'old1', path: 'echo/events/old1' }];
    joinEchoRoom({ presenceId: 'p1', role: 'speaker' }, handlers());
    await connect();

    await vi.waitFor(() => expect(writes.some((w) => w.op === 'remove' && w.path === 'echo/events/old1')).toBe(true));
  });

  it('presence 목록과 퇴장을 알려 준다', async () => {
    const h = handlers();
    joinEchoRoom({ presenceId: 'p1', role: 'speaker' }, h);

    emit('echo/presence', 'value', 'presence', { a: { role: 'speaker', joinedAt: 't' } });
    emit('echo/presence', 'value', 'presence', null);
    emit('echo/presence', 'child_removed', 'a', { role: 'sender', joinedAt: 't' });

    expect(h.onPresence).toHaveBeenNthCalledWith(1, { a: { role: 'speaker', joinedAt: 't' } });
    expect(h.onPresence).toHaveBeenNthCalledWith(2, {});
    expect(h.onLeave).toHaveBeenCalledWith('a', { role: 'sender', joinedAt: 't' });
  });

  it('연결이 끊기면 끊김을 알리고 보내기를 막는다. 다시 연결되면 presence를 다시 기록한다', async () => {
    const h = handlers();
    const room = joinEchoRoom({ presenceId: 'p1', role: 'speaker' }, h);
    await connect();

    emit('.info/connected', 'value', null, false);
    expect(h.onConnectionChange).toHaveBeenLastCalledWith(false);
    expect(room.send('ECHO_SYNC', {})).toBe(false);

    writes.length = 0;
    emit('.info/connected', 'value', null, true);
    await vi.waitFor(() => expect(h.onConnectionChange).toHaveBeenLastCalledWith(true));
    expect(writes.filter((w) => w.path === 'echo/presence/p1').map((w) => w.op)).toEqual(['onDisconnect.remove', 'set']);
  });

  it('처음 연결 전의 연결 안 됨 신호는 알리지 않는다', () => {
    const h = handlers();
    joinEchoRoom({ presenceId: 'p1', role: 'speaker' }, h);

    emit('.info/connected', 'value', null, false);

    expect(h.onConnectionChange).not.toHaveBeenCalled();
  });

  it('presence 기록이 거절되면 오류를 알리고 연결됨으로 처리하지 않는다', async () => {
    const { set } = await import('firebase/database');
    vi.mocked(set).mockRejectedValueOnce(new Error('PERMISSION_DENIED'));
    const h = handlers();
    joinEchoRoom({ presenceId: 'p1', role: 'speaker' }, h);

    emit('.info/connected', 'value', null, true);

    await vi.waitFor(() => expect(h.onError).toHaveBeenCalledWith(expect.objectContaining({ message: 'PERMISSION_DENIED' })));
    expect(h.onConnectionChange).not.toHaveBeenCalled();
  });

  it('리스너가 거절되면(cancel) 오류를 알린다', () => {
    const h = handlers();
    joinEchoRoom({ presenceId: 'p1', role: 'speaker' }, h);

    listeners.find((l) => l.path === 'echo/presence' && l.kind === 'value')!.cancel!(new Error('permission_denied'));

    expect(h.onError).toHaveBeenCalledWith(expect.objectContaining({ message: 'permission_denied' }));
  });

  it('leave는 리스너를 모두 끊고, 끊김 예약을 취소한 뒤 내 presence를 지운다', async () => {
    const h = handlers();
    const room = joinEchoRoom({ presenceId: 'p1', role: 'speaker' }, h);
    await connect();
    writes.length = 0;

    room.leave();

    expect(listeners).toHaveLength(0);
    expect(writes.map((w) => `${w.op} ${w.path}`)).toEqual(['onDisconnect.cancel echo/presence/p1', 'remove echo/presence/p1']);
    expect(room.send('ECHO_SYNC', {})).toBe(false);
  });

  it('leave 뒤에 늦게 끝난 접속 처리는 무시한다', async () => {
    const h = handlers();
    const room = joinEchoRoom({ presenceId: 'p1', role: 'speaker' }, h);
    emit('.info/connected', 'value', null, true);
    room.leave();

    await vi.advanceTimersByTimeAsync(10);

    expect(h.onConnectionChange).not.toHaveBeenCalled();
    expect(listeners).toHaveLength(0);
    // 지운 뒤에 presence를 다시 쓰면 끊김 예약도 없는 유령 접속자가 남는다
    expect(writes.some((w) => w.op === 'set' && w.path === 'echo/presence/p1')).toBe(false);
  });
});
