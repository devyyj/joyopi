import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createEchoLog, getEchoLogs } from './echo';
import { db } from '@/db';

const mockGetUser = vi.fn();

vi.mock('@/utils/supabase/server', () => ({
  createClient: async () => ({ auth: { getUser: mockGetUser } }),
}));

vi.mock('@/db', () => ({
  db: {
    insert: vi.fn(() => ({
      values: vi.fn().mockResolvedValue({}),
    })),
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        orderBy: vi.fn(() => ({
          limit: vi.fn().mockResolvedValue([
            {
              id: '1',
              userId: 'user-1',
              role: 'speaker',
              eventType: 'sync',
              message: '메아리를 재생합니다.',
              createdAt: new Date(),
            }
          ]),
        })),
      })),
    })),
  },
}));

const loginAs = (email: string | null) =>
  mockGetUser.mockResolvedValue({ data: { user: email ? { id: 'u', email } : null } });

describe('Echo Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    loginAs('devyyj@gmail.com');
  });

  it('createEchoLog should insert log into database', async () => {
    const params = {
      role: 'speaker',
      eventType: 'sync',
      message: '메아리 재생 중',
      userId: 'test-user'
    };

    const result = await createEchoLog(params);

    expect(db.insert).toHaveBeenCalled();
    expect(result.success).toBe(true);
  });

  it('getEchoLogs should return formatted logs', async () => {
    const result = await getEchoLogs(10);

    expect(db.select).toHaveBeenCalled();
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1);
    expect(result.data![0]).toHaveProperty('message', '메아리를 재생합니다.');
    expect(result.data![0]).toHaveProperty('type', 'success');
  });

  it('should handle database errors gracefully', async () => {
    vi.mocked(db.insert).mockImplementationOnce(() => {
      throw new Error('DB Error');
    });

    const result = await createEchoLog({
      role: 'speaker',
      eventType: 'error',
      message: 'Fail'
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Failed to save log');
  });

  it('비로그인 사용자는 로그를 저장하거나 조회할 수 없다', async () => {
    loginAs(null);

    const created = await createEchoLog({ role: 'sender', eventType: 'request', message: 'x' });
    const fetched = await getEchoLogs();

    expect(created).toEqual({ success: false, error: 'Unauthorized' });
    expect(fetched).toEqual({ success: false, error: 'Unauthorized' });
    expect(db.insert).not.toHaveBeenCalled();
    expect(db.select).not.toHaveBeenCalled();
  });

  it('허용 목록에 없는 계정은 로그를 저장하거나 조회할 수 없다', async () => {
    loginAs('stranger@gmail.com');

    expect(await createEchoLog({ role: 'sender', eventType: 'request', message: 'x' })).toEqual({
      success: false,
      error: 'Unauthorized',
    });
    expect(await getEchoLogs()).toEqual({ success: false, error: 'Unauthorized' });
    expect(db.insert).not.toHaveBeenCalled();
  });

  it('메시지가 비었거나 500자를 넘으면 저장하지 않는다', async () => {
    expect(await createEchoLog({ role: 'sender', eventType: 'request', message: '  ' })).toEqual({
      success: false,
      error: 'Invalid log',
    });
    expect(await createEchoLog({ role: 'sender', eventType: 'request', message: 'a'.repeat(501) })).toEqual({
      success: false,
      error: 'Invalid log',
    });
    expect(db.insert).not.toHaveBeenCalled();
  });

  it('조회 개수는 1~100으로 제한한다', async () => {
    await getEchoLogs(10000);
    const limitFn = vi.mocked(db.select).mock.results[0].value.from.mock.results[0].value.orderBy.mock.results[0].value.limit;
    expect(limitFn).toHaveBeenCalledWith(100);
  });
});
