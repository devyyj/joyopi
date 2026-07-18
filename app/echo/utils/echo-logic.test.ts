import { describe, it, expect } from 'vitest';
import { calculateNewTime, formatTime, resolveSyncTime, parseSeconds, resolveEchoRequest } from './echo-logic';

describe('Echo Logic', () => {
  it('should add time correctly', () => {
    expect(calculateNewTime(0, 60)).toBe(60);
    expect(calculateNewTime(60, 60)).toBe(120);
    expect(calculateNewTime(0, 600)).toBe(600);
    expect(calculateNewTime(120, 600)).toBe(720);
  });

  it('should format time correctly', () => {
    expect(formatTime(0)).toBe('0:00');
    expect(formatTime(59)).toBe('0:59');
    expect(formatTime(60)).toBe('1:00');
    expect(formatTime(70)).toBe('1:10');
    expect(formatTime(600)).toBe('10:00');
    expect(formatTime(660)).toBe('11:00');
    expect(formatTime(3600)).toBe('60:00');
  });

  it('should resolve sync time correctly protecting against delayed packets after extension request', () => {
    const now = 10000;
    const lastRequest = 9000; // 1 second ago (within 3s grace period)

    // During grace period, smaller sync time from old packet should be ignored
    expect(resolveSyncTime(660, 60, lastRequest, now)).toBe(660);

    // During grace period, larger sync time should be accepted
    expect(resolveSyncTime(600, 660, lastRequest, now)).toBe(660);

    // After grace period, sync time should be accepted
    const oldRequest = -5000; // 15 seconds ago (after 10s grace period)
    expect(resolveSyncTime(60, 30, oldRequest, now)).toBe(30);
  });

  it('should parse seconds correctly from various payload formats', () => {
    expect(parseSeconds({ seconds: 600 })).toBe(600);
    expect(parseSeconds({ seconds: '600' })).toBe(600);
    expect(parseSeconds({ payload: { seconds: 600 } })).toBe(600);
    expect(parseSeconds({ payload: { seconds: '600' } })).toBe(600);
    expect(parseSeconds({})).toBe(60);
    expect(parseSeconds(null)).toBe(60);
    expect(parseSeconds(undefined)).toBe(60);
  });

  describe('resolveEchoRequest - delta(seconds) 기반 시간 추가', () => {
    it('should always use delta (seconds) to add time, ignoring absoluteTime', () => {
      // sender가 seconds: 600 (10분)을 보내면, speaker의 현재 시간에 600을 더해야 함
      const payload = { senderId: 'abc', seconds: 600, absoluteTime: 660 };
      const prev = 60;
      // absoluteTime(660)이 아닌 prev(60) + seconds(600) = 660
      expect(resolveEchoRequest(prev, payload)).toBe(660);
    });

    it('should add 10 minutes correctly even when sender/speaker times are out of sync', () => {
      // 핵심 버그 재현: sender의 senderTimeRef=0, speaker의 remainingTime=540
      // sender가 10분 보내기 → absoluteTime=600 (sender 기준 0+600)
      // 기존 코드: absoluteTime 우선 → speaker 540→600 (60초=1분만 추가!) ← 버그!
      // 수정 코드: delta 우선 → speaker 540+600=1140 (정확히 10분 추가) ← 올바름
      const payload = { senderId: 'abc', seconds: 600, absoluteTime: 600 };
      const speakerCurrentTime = 540;
      expect(resolveEchoRequest(speakerCurrentTime, payload)).toBe(1140);
    });

    it('should add 1 minute correctly', () => {
      const payload = { senderId: 'abc', seconds: 60, absoluteTime: 120 };
      const prev = 300;
      expect(resolveEchoRequest(prev, payload)).toBe(360);
    });

    it('should fallback to default 60 seconds when seconds is missing', () => {
      const payload = { senderId: 'abc' };
      const prev = 100;
      // seconds 필드가 없으면 parseSeconds의 default인 60 사용
      expect(resolveEchoRequest(prev, payload)).toBe(160);
    });

    it('should handle string seconds value', () => {
      const payload = { senderId: 'abc', seconds: '600' };
      const prev = 0;
      expect(resolveEchoRequest(prev, payload)).toBe(600);
    });

    it('should handle nested payload format', () => {
      const payload = { payload: { seconds: 600 } };
      const prev = 120;
      expect(resolveEchoRequest(prev, payload)).toBe(720);
    });

    it('should work from zero remaining time', () => {
      const payload = { senderId: 'abc', seconds: 600, absoluteTime: 600 };
      const prev = 0;
      expect(resolveEchoRequest(prev, payload)).toBe(600);
    });
  });
});
