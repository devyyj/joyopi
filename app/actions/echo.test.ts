import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createEchoLog, getEchoLogs } from './echo';
import { db } from '@/db';

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
});
