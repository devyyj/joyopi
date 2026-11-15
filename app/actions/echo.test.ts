import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createEchoLog, getEchoLogs } from './echo';

// Firestore 대역: echo_logs 컬렉션 한 개만 흉내낸다
const add = vi.fn();
const batchDelete = vi.fn();
const batchCommit = vi.fn();
const pruneGet = vi.fn();
const listGet = vi.fn();
const where = vi.fn();
const orderBy = vi.fn();
const collection = vi.fn();

vi.mock('@/utils/firebase/admin', () => ({
  getDb: () => ({
    collection,
    batch: () => ({ delete: batchDelete, commit: batchCommit }),
  }),
}));

vi.mock('firebase-admin/firestore', () => ({
  FieldValue: { serverTimestamp: () => 'SERVER_TIMESTAMP' },
  Timestamp: { fromDate: (d: Date) => ({ toDate: () => d }) },
}));

function setupCollection() {
  add.mockResolvedValue({ id: 'new-id' });
  pruneGet.mockResolvedValue({ empty: true, docs: [] });
  where.mockReturnValue({ limit: () => ({ get: pruneGet }) });
  orderBy.mockReturnValue({
    limit: () => ({
      get: listGet,
    }),
  });
  listGet.mockResolvedValue({
    docs: [
      {
        id: '2',
        data: () => ({ userId: 'user-2', role: 'sender', eventType: 'request', message: '보냈습니다', createdAt: { toDate: () => new Date('2026-11-15T01:00:01Z') } }),
      },
      {
        id: '1',
        data: () => ({ userId: 'user-1', role: 'speaker', eventType: 'sync', message: '메아리를 재생합니다.', createdAt: { toDate: () => new Date('2026-11-15T01:00:00Z') } }),
      },
    ],
  });
  collection.mockReturnValue({ add, where, orderBy });
}

describe('Echo Actions (Firestore)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupCollection();
  });

  it('createEchoLog는 echo_logs 컬렉션에 로그를 저장한다', async () => {
    const result = await createEchoLog({ role: 'speaker', eventType: 'sync', message: '  메아리 재생 중  ', userId: 'test-user', payload: { seconds: 600 } });

    expect(result).toEqual({ success: true });
    expect(collection).toHaveBeenCalledWith('echo_logs');
    expect(add).toHaveBeenCalledWith({
      userId: 'test-user',
      role: 'speaker',
      eventType: 'sync',
      message: '메아리 재생 중',
      payload: JSON.stringify({ seconds: 600 }),
      createdAt: 'SERVER_TIMESTAMP',
    });
  });

  it('userId·payload가 없으면 null로 저장한다', async () => {
    await createEchoLog({ role: 'sender', eventType: 'request', message: 'x' });

    expect(add).toHaveBeenCalledWith(expect.objectContaining({ userId: null, payload: null }));
  });

  it('저장 뒤 30일이 지난 로그를 지운다', async () => {
    const ref = { id: 'old' };
    pruneGet.mockResolvedValueOnce({ empty: false, docs: [{ ref }] });
    const before = Date.now();

    await createEchoLog({ role: 'sender', eventType: 'request', message: 'x' });

    expect(where).toHaveBeenCalledWith('createdAt', '<', expect.anything());
    const cutoff = (where.mock.calls[0][2] as { toDate: () => Date }).toDate().getTime();
    expect(before - cutoff).toBeGreaterThanOrEqual(30 * 24 * 60 * 60 * 1000 - 1000);
    expect(batchDelete).toHaveBeenCalledWith(ref);
    expect(batchCommit).toHaveBeenCalled();
  });

  it('오래된 로그 정리가 실패해도 저장은 성공으로 돌려준다', async () => {
    pruneGet.mockRejectedValueOnce(new Error('prune failed'));
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await createEchoLog({ role: 'sender', eventType: 'request', message: 'x' });

    expect(result).toEqual({ success: true });
  });

  it('Firestore 저장 오류는 실패로 돌려준다', async () => {
    add.mockRejectedValueOnce(new Error('DB Error'));
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await createEchoLog({ role: 'speaker', eventType: 'error', message: 'Fail' });

    expect(result).toEqual({ success: false, error: 'Failed to save log' });
  });

  it('getEchoLogs는 최신순으로 읽어 오래된 순으로 돌려준다', async () => {
    const result = await getEchoLogs(10);

    expect(orderBy).toHaveBeenCalledWith('createdAt', 'desc');
    expect(result.success).toBe(true);
    expect(result.data!.map((l) => l.id)).toEqual(['1', '2']);
    expect(result.data![0]).toEqual({
      id: '1',
      timestamp: new Date('2026-11-15T01:00:00Z'),
      message: '메아리를 재생합니다.',
      type: 'success',
      userId: 'user-1',
    });
  });

  it('getEchoLogs 조회 오류는 실패로 돌려준다', async () => {
    listGet.mockRejectedValueOnce(new Error('read failed'));
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await getEchoLogs();

    expect(result).toEqual({ success: false, error: 'Failed to fetch logs' });
  });

  it('로그인 없이 누구나 저장하고 조회한다 (인증 정보를 읽지 않는다)', async () => {
    const created = await createEchoLog({ role: 'sender', eventType: 'request', message: 'x' });
    const fetched = await getEchoLogs();

    expect(created).toEqual({ success: true });
    expect(fetched.success).toBe(true);
  });

  it.each([
    ['빈 메시지', { role: 'sender', eventType: 'request', message: '   ' }],
    ['너무 긴 메시지', { role: 'sender', eventType: 'request', message: 'a'.repeat(501) }],
    ['역할 없음', { role: '', eventType: 'request', message: 'x' }],
    ['너무 긴 이벤트 종류', { role: 'sender', eventType: 'e'.repeat(101), message: 'x' }],
    ['너무 긴 사용자 ID', { role: 'sender', eventType: 'request', message: 'x', userId: 'u'.repeat(101) }],
    ['너무 큰 payload', { role: 'sender', eventType: 'request', message: 'x', payload: { big: 'p'.repeat(2001) } }],
  ])('%s은 저장하지 않는다', async (_name, params) => {
    const result = await createEchoLog(params);

    expect(result).toEqual({ success: false, error: 'Invalid log' });
    expect(add).not.toHaveBeenCalled();
  });

  it('조회 개수는 1~100으로 제한한다', async () => {
    const limit = vi.fn(() => ({ get: listGet }));
    orderBy.mockReturnValue({ limit });

    await getEchoLogs(1000);
    await getEchoLogs(-5);

    expect(limit).toHaveBeenNthCalledWith(1, 100);
    expect(limit).toHaveBeenNthCalledWith(2, 1);
  });
});
