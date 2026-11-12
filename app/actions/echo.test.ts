import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createEchoLog, getEchoLogs } from './echo';
import { db } from '@/db';

vi.mock('@/db', () => ({
  db: {
    insert: vi.fn(() => ({
      values: vi.fn().mockResolvedValue({}),
    })),
    delete: vi.fn(() => ({
      where: vi.fn().mockResolvedValue({}),
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

describe('Echo Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

  it('로그인 없이 누구나 저장하고 조회한다 (인증 정보를 읽지 않는다)', async () => {
    const created = await createEchoLog({ role: 'sender', eventType: 'request', message: 'x' });
    const fetched = await getEchoLogs();

    expect(created).toEqual({ success: true });
    expect(fetched.success).toBe(true);
  });

  it('역할·이벤트 종류가 없거나 100자를 넘으면 저장하지 않는다', async () => {
    const invalid = { success: false, error: 'Invalid log' };
    expect(await createEchoLog({ role: '', eventType: 'request', message: 'x' })).toEqual(invalid);
    expect(await createEchoLog({ role: 'sender', eventType: 'a'.repeat(101), message: 'x' })).toEqual(invalid);
    expect(await createEchoLog({ role: 'sender', eventType: 'request', message: 'x', userId: 'u'.repeat(101) })).toEqual(invalid);
    expect(await createEchoLog({ role: 123 as unknown as string, eventType: 'request', message: 'x' })).toEqual(invalid);
    expect(db.insert).not.toHaveBeenCalled();
  });

  it('payload 가 2000자를 넘으면 저장하지 않는다', async () => {
    const result = await createEchoLog({
      role: 'sender',
      eventType: 'request',
      message: 'x',
      payload: { blob: 'a'.repeat(2001) },
    });
    expect(result).toEqual({ success: false, error: 'Invalid log' });
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

  it('로그를 저장할 때 보관 기간(30일)이 지난 로그를 함께 지운다', async () => {
    await createEchoLog({ role: 'sender', eventType: 'request', message: '메아리 보냄' });
    expect(db.delete).toHaveBeenCalled();
  });

  it('오래된 로그 삭제가 실패해도 저장은 성공으로 처리한다', async () => {
    vi.mocked(db.delete).mockImplementationOnce(() => { throw new Error('boom'); });
    const result = await createEchoLog({ role: 'sender', eventType: 'request', message: '메아리 보냄' });
    expect(result.success).toBe(true);
  });
});
