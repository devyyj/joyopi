import { describe, it, expect, vi } from 'vitest';
import { getDeviceId, sendFeedback } from './feedback-client';

const memory = () => {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) };
};

describe('getDeviceId', () => {
  it('처음에는 만들어 저장하고, 다음부터는 같은 ID', () => {
    const s = memory();
    const id = getDeviceId(s, () => '1234-abcd-5678');
    expect(id).toBe('web-1234-abcd-5678');
    expect(getDeviceId(s, () => 'other-id-0000')).toBe(id);
  });

  it('저장소를 못 써도(사생활 보호 모드) ID를 돌려준다', () => {
    const broken = {
      getItem: () => { throw new Error('denied'); },
      setItem: () => { throw new Error('denied'); },
    };
    expect(getDeviceId(broken, () => 'abcdefgh-1')).toBe('web-abcdefgh-1');
    expect(getDeviceId(null, () => 'abcdefgh-2')).toBe('web-abcdefgh-2');
  });
});

describe('sendFeedback', () => {
  const input = { app: 'joyopi' as const, kind: 'idea' as const, message: '  영상 더 보여 주세요 ', email: ' ', lang: 'ko' };

  it('공통 의견 API로 앱·칩·글(앞뒤 공백 제거)·기기 ID·웹 정보를 보낸다', async () => {
    const f = vi.fn(async () => ({ ok: true, status: 200 }) as Response);
    expect(await sendFeedback(input, 'web-12345678', f)).toBe('ok');
    const [url, init] = f.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('/api/feedback');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body as string)).toEqual({
      app: 'joyopi',
      kind: 'idea',
      message: '영상 더 보여 주세요',
      email: '',
      deviceId: 'web-12345678',
      meta: { os: 'web', lang: 'ko' },
    });
  });

  it('429는 rate-limited, 그 밖의 오류·네트워크 실패는 failed', async () => {
    expect(await sendFeedback(input, 'web-12345678', async () => ({ ok: false, status: 429 }) as Response)).toBe('rate-limited');
    expect(await sendFeedback(input, 'web-12345678', async () => ({ ok: false, status: 500 }) as Response)).toBe('failed');
    expect(await sendFeedback(input, 'web-12345678', async () => { throw new Error('offline'); })).toBe('failed');
  });
});
