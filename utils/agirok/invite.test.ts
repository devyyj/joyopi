import { describe, expect, test, vi } from 'vitest';

import { fetchInvite, isInAppBrowser, normalizeCode, openAppHref, parseInviteDoc, previewText } from './invite';

describe('아기록 초대 링크', () => {
  test('미리보기 문구(앱 src/domain/invite.ts와 같아야 한다)', () => {
    expect(previewText('ko', '하늘이', '엄마')).toEqual({
      title: '하늘이 기록에 초대받았어요',
      desc: '엄마님이 아기록에서 함께 기록하자고 했어요. 24시간 동안 열 수 있어요.',
    });
    expect(previewText('ko', null).title).toBe('아기록 · 함께 쓰는 육아 기록');
    expect(previewText('ja', 'そら', '').title).toBe('そらの記録に招待されました');
    expect(previewText('en', 'Sky', 'Mom').title).toBe("You're invited to Sky's log");
  });

  test('코드 정리', () => {
    expect(normalizeCode('k7qm2p')).toBe('K7QM2P');
    expect(normalizeCode('K7QM2P1')).toBeNull();
    expect(normalizeCode('../x')).toBeNull();
  });

  test('Firestore 문서 읽기', () => {
    const doc = {
      fields: {
        babyId: { stringValue: 'b1' },
        babyName: { stringValue: '하늘이' },
        inviterName: { stringValue: '엄마' },
        lang: { stringValue: 'ja' },
        expiresAt: { integerValue: '1795300000000' },
      },
    };
    expect(parseInviteDoc('K7QM2P', doc)).toEqual({ code: 'K7QM2P', babyName: '하늘이', inviterName: '엄마', lang: 'ja', expiresAt: 1795300000000 });
    expect(parseInviteDoc('K7QM2P', { fields: {} })).toBeNull();
    expect(parseInviteDoc('K7QM2P', null)).toBeNull();
  });

  test('없는 코드·오류면 null(페이지는 일반 문구로)', async () => {
    const notFound = vi.fn(async () => new Response('{}', { status: 404 }));
    expect(await fetchInvite('AAAAAA', notFound as unknown as typeof fetch)).toBeNull();
    const err = vi.fn(async () => {
      throw new Error('net');
    });
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(await fetchInvite('AAAAAA', err as unknown as typeof fetch)).toBeNull();
    spy.mockRestore();
  });

  test('앱 안 브라우저와 앱 열기 주소', () => {
    const kakao = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 KAKAOTALK 10.8.0';
    expect(isInAppBrowser(kakao)).toBe(true);
    expect(isInAppBrowser('Mozilla/5.0 (iPhone) Safari/604.1')).toBe(false);
    expect(openAppHref('K7QM2P', kakao)).toBe('agirok://i/K7QM2P');
    expect(openAppHref('K7QM2P', 'Mozilla/5.0 (Linux; Android 16) Chrome/140')).toBe('intent://i/K7QM2P#Intent;scheme=agirok;package=com.joyopi.agirok;end');
  });
});
