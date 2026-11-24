// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';

import { feedbackExpireAt, handleFeedback, type FeedbackDeps } from './handle-feedback';

const NOW = new Date('2026-11-21T10:00:00Z');

describe('feedbackExpireAt', () => {
  it('보낸 날로부터 1년(365일) 뒤에 지워지도록 만료 시각을 정한다', () => {
    expect(feedbackExpireAt(NOW).toISOString()).toBe('2027-11-21T10:00:00.000Z');
  });
});

function deps(over: Partial<FeedbackDeps> = {}): FeedbackDeps {
  return {
    checkRate: vi.fn(async () => true),
    save: vi.fn(async () => 'fb1'),
    notify: vi.fn(async () => {}),
    now: () => NOW,
    log: vi.fn(),
    ...over,
  };
}

const valid = {
  app: 'agirok',
  kind: 'bug',
  message: '  밤중 수유 기록할 때 화면이 너무 밝아요  ',
  email: 'parent@example.com',
  deviceId: 'dev-1234abcd',
  meta: { appVersion: '1.0.2', build: '11', os: 'iOS', osVersion: '18.1', device: 'iPhone15,2', lang: 'ko' },
};

describe('handleFeedback', () => {
  it('올바른 의견을 저장하고 Slack으로 알린 뒤 200을 준다', async () => {
    const d = deps();
    const res = await handleFeedback(valid, '1.2.3.4', d);
    expect(res).toEqual({ status: 200, body: { ok: true } });
    expect(d.checkRate).toHaveBeenCalledWith({ deviceId: 'dev-1234abcd', ip: '1.2.3.4' }, NOW);
    const rec = (d.save as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(rec).toEqual({
      app: 'agirok',
      kind: 'bug',
      message: '밤중 수유 기록할 때 화면이 너무 밝아요',
      email: 'parent@example.com',
      deviceId: 'dev-1234abcd',
      meta: { appVersion: '1.0.2', build: '11', os: 'iOS', osVersion: '18.1', device: 'iPhone15,2', lang: 'ko' },
      createdAt: NOW,
    });
    expect(d.notify).toHaveBeenCalledWith(rec, 'fb1');
  });

  it('칩·이메일·기기 정보가 없어도 보낼 수 있다(kind·email은 null, 모르는 meta 키는 버린다)', async () => {
    const d = deps();
    const res = await handleFeedback(
      { app: 'rockgazing', message: '돌 이름을 짓고 싶어요', email: '  ', deviceId: 'dev-1234abcd', meta: { lang: 'ja', secret: 'x' } },
      null,
      d,
    );
    expect(res.status).toBe(200);
    const rec = (d.save as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(rec.kind).toBeNull();
    expect(rec.email).toBeNull();
    expect(rec.meta).toEqual({ lang: 'ja' });
  });

  it('joyopi.com 웹의 「의견 보내기」는 app: joyopi(사이트)로 받는다', async () => {
    const d = deps();
    const res = await handleFeedback(
      { app: 'joyopi', kind: 'idea', message: '유튜브 영상을 더 보여 주세요', deviceId: 'web-1234abcd', meta: { os: 'web', lang: 'ko' } },
      null,
      d,
    );
    expect(res.status).toBe(200);
    expect((d.save as ReturnType<typeof vi.fn>).mock.calls[0][0].app).toBe('joyopi');
  });

  it('형식이 틀리면 400이고 저장·알림을 하지 않는다', async () => {
    const cases: [unknown, string][] = [
      [null, 'invalid-body'],
      ['문자열', 'invalid-body'],
      [{ ...valid, app: 'unknown-app' }, 'invalid-app'],
      [{ ...valid, kind: 'praise' }, 'invalid-kind'],
      [{ ...valid, message: '   ' }, 'empty-message'],
      [{ ...valid, message: 123 }, 'empty-message'],
      [{ ...valid, message: '가'.repeat(2001) }, 'message-too-long'],
      [{ ...valid, email: 'not-an-email' }, 'invalid-email'],
      [{ ...valid, email: `${'a'.repeat(250)}@x.com` }, 'invalid-email'],
      [{ ...valid, deviceId: 'short' }, 'invalid-device'],
      [{ ...valid, deviceId: 'has space 1234' }, 'invalid-device'],
      [{ ...valid, deviceId: undefined }, 'invalid-device'],
    ];
    for (const [body, error] of cases) {
      const d = deps();
      const res = await handleFeedback(body, '1.2.3.4', d);
      expect(res, JSON.stringify(body)?.slice(0, 60)).toEqual({ status: 400, body: { ok: false, error } });
      expect(d.save).not.toHaveBeenCalled();
      expect(d.notify).not.toHaveBeenCalled();
    }
  });

  it('meta 값은 문자열만 64자까지 남긴다', async () => {
    const d = deps();
    await handleFeedback({ ...valid, meta: { appVersion: 102, device: 'x'.repeat(100), os: ' iOS ' } }, null, d);
    const rec = (d.save as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(rec.meta).toEqual({ device: 'x'.repeat(64), os: 'iOS' });
  });

  it('전송 횟수 제한에 걸리면 429이고 저장하지 않는다', async () => {
    const d = deps({ checkRate: vi.fn(async () => false) });
    const res = await handleFeedback(valid, '1.2.3.4', d);
    expect(res).toEqual({ status: 429, body: { ok: false, error: 'rate-limited' } });
    expect(d.save).not.toHaveBeenCalled();
  });

  it('횟수 확인이나 저장이 실패하면 500이고 알리지 않는다', async () => {
    for (const over of [
      { checkRate: vi.fn(async () => { throw new Error('db down'); }) },
      { save: vi.fn(async () => { throw new Error('db down'); }) },
    ]) {
      const d = deps(over);
      const res = await handleFeedback(valid, null, d);
      expect(res).toEqual({ status: 500, body: { ok: false, error: 'save-failed' } });
      expect(d.notify).not.toHaveBeenCalled();
      expect(d.log).toHaveBeenCalled();
    }
  });

  it('저장 뒤 Slack 알림만 실패하면 의견은 받은 것이므로 200을 주고 오류를 남긴다', async () => {
    const d = deps({ notify: vi.fn(async () => { throw new Error('slack 500'); }) });
    const res = await handleFeedback(valid, null, d);
    expect(res.status).toBe(200);
    expect(d.save).toHaveBeenCalled();
    expect(d.log).toHaveBeenCalled();
  });
});
