import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useEchoSocket } from './use-echo-socket';
import { createEchoLog, getEchoLogs } from '@/app/actions/echo';
import type { EchoRoomHandlers } from '../utils/echo-room';

vi.mock('@/app/actions/echo', () => ({
  createEchoLog: vi.fn().mockResolvedValue({ success: true }),
  getEchoLogs: vi.fn().mockResolvedValue({ success: true, data: [] }),
}));

// 메아리 방(Realtime Database 어댑터) 대역: 접속할 때마다 handlers와 send/leave 기록을 남긴다
interface FakeRoom {
  presenceId: string;
  role: string;
  handlers: EchoRoomHandlers;
  send: ReturnType<typeof vi.fn>;
  leave: ReturnType<typeof vi.fn>;
}
const rooms: FakeRoom[] = [];

vi.mock('../utils/echo-room', () => ({
  joinEchoRoom: vi.fn((opts: { presenceId: string; role: string }, handlers: EchoRoomHandlers) => {
    const room: FakeRoom = { ...opts, handlers, send: vi.fn(() => true), leave: vi.fn() };
    rooms.push(room);
    return room;
  }),
}));

const lastRoom = () => rooms[rooms.length - 1];

async function connected(role: 'sender' | 'speaker' | 'landing' = 'sender', presenceId = 'user-1') {
  const hook = renderHook(() => useEchoSocket({ role, presenceId }));
  await waitFor(() => expect(rooms).toHaveLength(1));
  act(() => lastRoom().handlers.onConnectionChange(true));
  return hook;
}

describe('useEchoSocket (Firebase Realtime Database)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    rooms.length = 0;
  });

  it('접속하면 메아리 방에 들어가고 연결되면 CONNECTED가 된다', async () => {
    const { result } = renderHook(() => useEchoSocket({ role: 'sender', presenceId: 'user-1' }));

    await waitFor(() => expect(result.current.status).toBe('CONNECTING'));
    expect(lastRoom()).toMatchObject({ presenceId: 'user-1', role: 'sender' });

    act(() => lastRoom().handlers.onConnectionChange(true));

    expect(result.current.status).toBe('CONNECTED');
    expect(result.current.isChannelJoined).toBe(true);
  });

  it('presenceId가 바뀌면 이전 방에서 나가고 새 ID로 다시 들어간다', async () => {
    const { rerender } = renderHook(({ presenceId }) => useEchoSocket({ role: 'sender', presenceId }), {
      initialProps: { presenceId: 'user-1' },
    });
    await waitFor(() => expect(rooms).toHaveLength(1));

    rerender({ presenceId: 'user-2' });

    await waitFor(() => expect(rooms).toHaveLength(2));
    expect(rooms[0].leave).toHaveBeenCalled();
    expect(rooms[1].presenceId).toBe('user-2');
  });

  it('언마운트하면 방에서 나간다', async () => {
    const { unmount } = renderHook(() => useEchoSocket({ role: 'sender', presenceId: 'user-1' }));
    await waitFor(() => expect(rooms).toHaveLength(1));

    unmount();

    expect(rooms[0].leave).toHaveBeenCalled();
  });

  it('presenceId가 비어 있으면 접속하지 않는다', async () => {
    renderHook(() => useEchoSocket({ role: 'sender', presenceId: '' }));
    await act(async () => { await new Promise((r) => setTimeout(r, 20)); });

    expect(rooms).toHaveLength(0);
  });

  it('enabled가 false면 접속하지 않고, true가 되면 접속한다', async () => {
    const { result, rerender } = renderHook(({ enabled }) => useEchoSocket({ role: 'speaker', presenceId: 'sp-1', enabled }), {
      initialProps: { enabled: false },
    });
    await act(async () => { await new Promise((r) => setTimeout(r, 20)); });

    expect(rooms).toHaveLength(0);
    expect(result.current.status).toBe('INITIAL');

    rerender({ enabled: true });
    await waitFor(() => expect(rooms).toHaveLength(1));
    act(() => lastRoom().handlers.onConnectionChange(true));
    expect(result.current.status).toBe('CONNECTED');
  });

  it('연결 성공 로그는 내 화면에만 남기고 DB에 저장하지 않는다', async () => {
    const { result } = await connected();

    expect(result.current.logs.some((l) => l.message.includes('서버 연결 성공'))).toBe(true);
    expect(createEchoLog).not.toHaveBeenCalled();
  });

  it('연결되면 현재 상태를 묻는 ECHO_QUERY를 보낸다 (첫 화면은 보내지 않는다)', async () => {
    await connected('sender', 'user-1');
    expect(lastRoom().send).toHaveBeenCalledWith('ECHO_QUERY', { requesterId: 'user-1' });

    rooms.length = 0;
    await connected('landing', 'user-9');
    expect(lastRoom().send).not.toHaveBeenCalled();
  });

  it('별도 연결 유지 신호(ECHO_HEARTBEAT)를 보내지 않는다', async () => {
    await connected();
    await act(async () => { await new Promise((r) => setTimeout(r, 50)); });

    const events = lastRoom().send.mock.calls.map((c) => c[0]);
    expect(events).not.toContain('ECHO_HEARTBEAT');
  });

  it('presence에서 스피커 ID 목록과 역할별 인원을 제공한다', async () => {
    const { result } = await connected();

    act(() => lastRoom().handlers.onPresence({
      'sp-a': { role: 'speaker', joinedAt: 't' },
      'sp-b': { role: 'speaker', joinedAt: 't' },
      'se-a': { role: 'sender', joinedAt: 't' },
      'la-a': { role: 'landing', joinedAt: 't' },
    }));

    expect([...result.current.speakerIds].sort()).toEqual(['sp-a', 'sp-b']);
    expect(result.current.speakerCount).toBe(2);
    expect(result.current.senderCount).toBe(1);
  });

  it('다른 사용자 퇴장은 내 화면에만 기록하고 DB 저장·브로드캐스트는 하지 않는다', async () => {
    const { result } = await connected();
    lastRoom().send.mockClear();

    act(() => lastRoom().handlers.onLeave('other-user', { role: 'speaker', joinedAt: 't' }));
    act(() => lastRoom().handlers.onLeave('user-1', { role: 'sender', joinedAt: 't' }));

    const leaves = result.current.logs.filter((l) => l.message.includes('퇴장'));
    expect(leaves).toHaveLength(1);
    expect(leaves[0]).toMatchObject({ userId: 'other-user' });
    expect(leaves[0].message).toContain('스피커');
    expect(createEchoLog).not.toHaveBeenCalled();
    expect(lastRoom().send).not.toHaveBeenCalled();
  });

  it('LOG_EVENT는 로그에 더하고, 나머지 이벤트는 onBroadcast로 넘긴다', async () => {
    const onBroadcast = vi.fn();
    const { result } = renderHook(() => useEchoSocket({ role: 'speaker', presenceId: 'sp-1', onBroadcast }));
    await waitFor(() => expect(rooms).toHaveLength(1));

    act(() => lastRoom().handlers.onEvent('LOG_EVENT', {
      id: 'log-1', timestamp: '2026-11-15T01:00:00.000Z', message: '남이 남긴 로그', eventType: 'request', userId: 'other',
    }));
    act(() => lastRoom().handlers.onEvent('ECHO_REQUEST', { senderId: 'other', seconds: 60 }));

    expect(result.current.logs.find((l) => l.id === 'log-1')).toMatchObject({ message: '남이 남긴 로그', userId: 'other' });
    expect(onBroadcast).toHaveBeenCalledTimes(1);
    expect(onBroadcast).toHaveBeenCalledWith('ECHO_REQUEST', { senderId: 'other', seconds: 60 });
  });

  it('addLog는 DB에 저장하고 LOG_EVENT로 다른 접속자에게 알리고 내 화면에도 남긴다', async () => {
    const { result } = await connected('sender', 'user-1');

    await act(async () => { await result.current.addLog('메아리를 보냈습니다.', 'request', undefined, { seconds: 60 }); });

    expect(createEchoLog).toHaveBeenCalledWith({ role: 'sender', eventType: 'request', message: '메아리를 보냈습니다.', userId: 'user-1', payload: { seconds: 60 } });
    expect(lastRoom().send).toHaveBeenCalledWith('LOG_EVENT', expect.objectContaining({ message: '메아리를 보냈습니다.', eventType: 'request', userId: 'user-1' }));
    expect(result.current.logs.some((l) => l.message === '메아리를 보냈습니다.')).toBe(true);
  });

  it('sendBroadcast는 방의 send 결과를 그대로 돌려준다', async () => {
    const { result } = await connected();

    expect(result.current.sendBroadcast('ECHO_STOP', { triggeredBy: 'user-1' })).toBe(true);
    lastRoom().send.mockReturnValueOnce(false);
    expect(result.current.sendBroadcast('ECHO_STOP', { triggeredBy: 'user-1' })).toBe(false);
    expect(lastRoom().send).toHaveBeenCalledWith('ECHO_STOP', { triggeredBy: 'user-1' });
  });

  it('방에 들어가기 전에는 sendBroadcast가 false다', () => {
    const { result } = renderHook(() => useEchoSocket({ role: 'sender', presenceId: 'user-1', enabled: false }));

    expect(result.current.sendBroadcast('ECHO_STOP', {})).toBe(false);
  });

  it('연결이 끊기면 화면에만 안내하고 DISCONNECTED가 된다 (재연결은 SDK가 한다)', async () => {
    const { result } = await connected();

    act(() => lastRoom().handlers.onConnectionChange(false));

    expect(result.current.status).toBe('DISCONNECTED');
    expect(result.current.isChannelJoined).toBe(false);
    expect(result.current.logs.some((l) => l.message.includes('연결이 잠시 끊겼습니다'))).toBe(true);
    expect(createEchoLog).not.toHaveBeenCalled();

    act(() => lastRoom().handlers.onConnectionChange(true));
    expect(result.current.status).toBe('CONNECTED');
  });

  it('서버가 거절한 오류는 ERROR로 바꾸고 이유와 함께 DB에 남긴다', async () => {
    const { result } = await connected();

    act(() => lastRoom().handlers.onError(new Error('PERMISSION_DENIED')));

    expect(result.current.status).toBe('ERROR');
    expect(createEchoLog).toHaveBeenCalledWith(expect.objectContaining({
      eventType: 'error',
      message: expect.stringContaining('PERMISSION_DENIED'),
    }));
  });

  it('첫 화면(landing)에서는 이전 로그를 불러오지 않는다', async () => {
    renderHook(() => useEchoSocket({ role: 'landing', presenceId: 'user-1' }));
    await act(async () => { await new Promise((r) => setTimeout(r, 20)); });

    expect(getEchoLogs).not.toHaveBeenCalled();
  });

  it('샌더·스피커는 접속할 때 이전 로그를 불러온다', async () => {
    vi.mocked(getEchoLogs).mockResolvedValueOnce({ success: true, data: [{ id: 'old', timestamp: new Date(), message: '이전 로그', type: 'info', userId: 'x' }] });
    const { result } = renderHook(() => useEchoSocket({ role: 'speaker', presenceId: 'sp-1' }));

    await waitFor(() => expect(result.current.logs.some((l) => l.message === '이전 로그')).toBe(true));
  });
});
