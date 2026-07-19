import { describe, it, expect } from 'vitest';
import { 
  calculateNewTime, 
  formatTime, 
  resolveSyncTime, 
  parseSeconds, 
  resolveEchoRequest,
  calculateRemainingSeconds,
  calculateNewEndTime
} from './echo-logic';

describe('Echo Logic (v2.0 Refactored)', () => {
  describe('calculateRemainingSeconds', () => {
    it('종료 시각이 0이면 0을 반환해야 한다', () => {
      expect(calculateRemainingSeconds(0)).toBe(0);
    });

    it('현재 시각과 종료 시각 차이에 따라 남은 초를 올바르게 계산해야 한다', () => {
      const now = 1000000;
      const endTime = 1060000; // 60초 후
      expect(calculateRemainingSeconds(endTime, now)).toBe(60);
    });

    it('종료 시각이 과거이면 0을 반환해야 한다', () => {
      const now = 1000000;
      const endTime = 900000;
      expect(calculateRemainingSeconds(endTime, now)).toBe(0);
    });
  });

  describe('calculateNewEndTime', () => {
    it('현재 유휴 상태(currentEndTime=0)에서 600초 추가 시 now + 600초가 되어야 한다', () => {
      const now = 1000000;
      expect(calculateNewEndTime(0, 600, now)).toBe(now + 600000);
    });

    it('이미 종료 시각이 많이 남아있는 상태에서 추가 600초 요청 시 누적 가산되어야 한다', () => {
      const now = 1000000;
      const currentEndTime = now + 120000; // 2분 남음
      expect(calculateNewEndTime(currentEndTime, 600, now)).toBe(currentEndTime + 600000);
    });
  });

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
    expect(parseSeconds(600)).toBe(600);
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
      const payload = { senderId: 'abc', seconds: 600, absoluteTime: 660 };
      const prev = 60;
      expect(resolveEchoRequest(prev, payload)).toBe(660);
    });

    it('should add 10 minutes correctly even when sender/speaker times are out of sync', () => {
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

