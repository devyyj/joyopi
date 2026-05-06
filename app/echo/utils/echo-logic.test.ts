import { describe, it, expect } from 'vitest';
import { calculateNewTime, formatTime } from './echo-logic';

describe('Echo Logic', () => {
  it('should add time correctly', () => {
    expect(calculateNewTime(0, 60)).toBe(60);
    expect(calculateNewTime(60, 60)).toBe(120);
  });

  it('should format time correctly', () => {
    expect(formatTime(0)).toBe('0:00');
    expect(formatTime(59)).toBe('0:59');
    expect(formatTime(60)).toBe('1:00');
    expect(formatTime(70)).toBe('1:10');
    expect(formatTime(3600)).toBe('60:00');
  });
});
