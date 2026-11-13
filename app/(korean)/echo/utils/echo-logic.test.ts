import { describe, it, expect } from 'vitest';
import {
  formatTime,
  parseSeconds,
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

  it('should format time correctly', () => {
    expect(formatTime(0)).toBe('0:00');
    expect(formatTime(59)).toBe('0:59');
    expect(formatTime(60)).toBe('1:00');
    expect(formatTime(70)).toBe('1:10');
    expect(formatTime(600)).toBe('10:00');
    expect(formatTime(660)).toBe('11:00');
    expect(formatTime(3600)).toBe('60:00');
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

});

