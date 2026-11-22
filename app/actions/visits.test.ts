import { describe, it, expect, vi, beforeEach } from 'vitest';
import { recordVisit } from './visits';
import { kstDay, isBotUserAgent } from '@/utils/visits';

// Firestore 대역: visits 컬렉션의 날짜 문서와 total 문서만 흉내낸다
const store = new Map<string, Record<string, unknown>>();
const txSet = vi.fn((ref: { id: string }, data: Record<string, unknown>) => store.set(ref.id, data));
const snap = (ref: { id: string }) => ({ exists: store.has(ref.id), data: () => store.get(ref.id) });
const getAll = vi.fn(async (...refs: { id: string }[]) => refs.map(snap));
const runTransaction = vi.fn(async (fn: (tx: unknown) => unknown) => fn({ getAll, set: txSet }));
const collection = vi.fn(() => ({ doc: (id: string) => ({ id }) }));
let ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Safari/604.1';

vi.mock('@/utils/firebase/admin', () => ({
  getDb: () => ({ collection, getAll, runTransaction }),
}));
vi.mock('next/headers', () => ({
  headers: async () => new Headers({ 'user-agent': ua }),
}));

describe('recordVisit (방문자 수)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    store.clear();
    ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Safari/604.1';
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-22T03:00:00Z')); // 한국 시각 12:00
  });

  it('처음 방문을 세면 오늘·누적이 1이 되고 시작일이 오늘로 저장된다', async () => {
    const result = await recordVisit(true);

    expect(result).toEqual({ today: 1, total: 1, since: '2026-11-22' });
    expect(collection).toHaveBeenCalledWith('visits');
    expect(store.get('2026-11-22')).toEqual({ count: 1 });
    expect(store.get('total')).toEqual({ count: 1, since: '2026-11-22' });
  });

  it('기존 숫자에 1을 더하고 시작일은 바꾸지 않는다', async () => {
    store.set('2026-11-22', { count: 41 });
    store.set('total', { count: 900, since: '2026-11-20' });

    const result = await recordVisit(true);

    expect(result).toEqual({ today: 42, total: 901, since: '2026-11-20' });
    expect(store.get('total')).toEqual({ count: 901, since: '2026-11-20' });
  });

  it('count가 false면 숫자를 올리지 않고 읽기만 한다', async () => {
    store.set('2026-11-22', { count: 5 });
    store.set('total', { count: 10, since: '2026-11-20' });

    const result = await recordVisit(false);

    expect(result).toEqual({ today: 5, total: 10, since: '2026-11-20' });
    expect(runTransaction).not.toHaveBeenCalled();
    expect(txSet).not.toHaveBeenCalled();
  });

  it('기록이 하나도 없으면 0과 시작일 null을 돌려준다', async () => {
    expect(await recordVisit(false)).toEqual({ today: 0, total: 0, since: null });
  });

  it('검색 로봇·자동화 브라우저는 세지 않는다', async () => {
    ua = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';

    const result = await recordVisit(true);

    expect(result).toEqual({ today: 0, total: 0, since: null });
    expect(txSet).not.toHaveBeenCalled();
  });

  it('불리언이 아닌 값으로 부르면 아무것도 하지 않고 null을 돌려준다', async () => {
    expect(await recordVisit('yes' as unknown as boolean)).toBeNull();
    expect(collection).not.toHaveBeenCalled();
  });

  it('Firestore 오류가 나면 null을 돌려준다', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    runTransaction.mockRejectedValueOnce(new Error('unavailable'));

    expect(await recordVisit(true)).toBeNull();
    spy.mockRestore();
  });

  it('한국 시각 자정이 지나면 다음 날 문서에 센다', async () => {
    vi.setSystemTime(new Date('2026-11-22T15:30:00Z')); // 한국 시각 11-23 00:30

    await recordVisit(true);

    expect(store.get('2026-11-23')).toEqual({ count: 1 });
  });
});

describe('방문 유틸', () => {
  it('kstDay는 한국 날짜를 YYYY-MM-DD로 돌려준다', () => {
    expect(kstDay(new Date('2026-11-22T14:59:59Z'))).toBe('2026-11-22');
    expect(kstDay(new Date('2026-11-22T15:00:00Z'))).toBe('2026-11-23');
  });

  it('isBotUserAgent는 로봇·미리보기·헤드리스를 가려낸다', () => {
    expect(isBotUserAgent('Mozilla/5.0 (compatible; bingbot/2.0)')).toBe(true);
    expect(isBotUserAgent('facebookexternalhit/1.1')).toBe(true);
    expect(isBotUserAgent('Mozilla/5.0 HeadlessChrome/120.0')).toBe(true);
    expect(isBotUserAgent('')).toBe(true);
    expect(isBotUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131.0 Safari/537.36')).toBe(false);
  });
});
