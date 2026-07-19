import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEchoSocket } from './use-echo-socket';

// Mock server actions
vi.mock('@/app/actions/echo', () => ({
  createEchoLog: vi.fn().mockResolvedValue({ success: true }),
  getEchoLogs: vi.fn().mockResolvedValue({ success: true, data: [] }),
}));

// Mock Supabase Realtime channel and client
interface MockChannel {
  topic: string;
  state: string;
  on: (type: string, filter: unknown, callback: (event: string, payload: Record<string, unknown>) => void) => MockChannel;
  subscribe: (callback?: (status: string, err: Error | null) => void) => MockChannel;
  unsubscribe: () => Promise<string>;
  track: () => Promise<string>;
  send: () => Promise<string>;
  presenceState: () => Record<string, unknown>;
  _isSubscribed: () => boolean;
}

const mockChannels: MockChannel[] = [];

const createMockChannel = (topic: string): MockChannel => {
  let isSubscribed = false;
  const listeners: Record<string, Array<(event: string, payload: Record<string, unknown>) => void>> = {};

  const channelObj: MockChannel = {
    topic,
    state: 'closed',
    on: vi.fn((type: string, _filter: unknown, callback: (event: string, payload: Record<string, unknown>) => void) => {
      if (isSubscribed) {
        throw new Error(`cannot add ${type} callbacks for ${topic} after subscribe()`);
      }
      if (!listeners[type]) listeners[type] = [];
      listeners[type].push(callback);
      return channelObj;
    }),
    subscribe: vi.fn((callback?: (status: string, err: Error | null) => void) => {
      isSubscribed = true;
      channelObj.state = 'joined';
      if (callback) callback('SUBSCRIBED', null);
      return channelObj;
    }),
    unsubscribe: vi.fn(() => {
      isSubscribed = false;
      channelObj.state = 'closed';
      return Promise.resolve('ok');
    }),
    track: vi.fn().mockResolvedValue('ok'),
    send: vi.fn().mockResolvedValue('ok'),
    presenceState: vi.fn().mockReturnValue({}),
    _isSubscribed: () => isSubscribed,
  };
  return channelObj;
};

const mockSupabaseClient = {
  auth: {
    getSession: vi.fn().mockImplementation(() => new Promise(res => setTimeout(() => res({ data: { session: null } }), 10))),
    refreshSession: vi.fn().mockResolvedValue({ data: { session: null } }),
  },
  channel: vi.fn((topic: string) => {
    const existing = mockChannels.find(c => c.topic === topic || c.topic === `realtime:${topic}`);
    if (existing) {
      return existing;
    }
    const newCh = createMockChannel(`realtime:${topic}`);
    mockChannels.push(newCh);
    return newCh;
  }),
  getChannels: vi.fn(() => mockChannels),
  removeChannel: vi.fn((ch: MockChannel) => {
    const idx = mockChannels.indexOf(ch);
    if (idx !== -1) {
      mockChannels.splice(idx, 1);
    }
    return Promise.resolve('ok');
  }),
};

vi.mock('@/utils/supabase/client', () => ({
  createClient: () => mockSupabaseClient,
}));

describe('useEchoSocket Hook Concurrency & Cleanup Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockChannels.length = 0;
  });

  it('should initialize socket connection without errors', async () => {
    const { result } = renderHook(() =>
      useEchoSocket({ role: 'sender', presenceId: 'user-1' })
    );

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    expect(mockSupabaseClient.channel).toHaveBeenCalledWith('echo-room', expect.any(Object));
    expect(result.current.status).toBe('CONNECTED');
  });

  it('should re-setup channel when presenceId changes', async () => {
    const { rerender } = renderHook(
      ({ presenceId }) => useEchoSocket({ role: 'sender', presenceId }),
      { initialProps: { presenceId: 'user-1' } }
    );

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    await act(async () => {
      rerender({ presenceId: 'user-2' });
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    expect(mockSupabaseClient.removeChannel).toHaveBeenCalled();
  });

  it('should prevent "cannot add presence callbacks after subscribe()" when concurrent setups occur', async () => {
    const preExistingChannel = createMockChannel('realtime:echo-room');
    preExistingChannel.subscribe();
    mockChannels.push(preExistingChannel);

    const { result } = renderHook(() =>
      useEchoSocket({ role: 'sender', presenceId: 'user-concurrent' })
    );

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    expect(result.current.status).toBe('CONNECTED');
  });
});
