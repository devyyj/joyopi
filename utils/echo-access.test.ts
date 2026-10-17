import { describe, it, expect } from 'vitest';
import { isEchoAllowedEmail } from './echo-access';

describe('isEchoAllowedEmail', () => {
  it('허용 목록의 이메일은 통과한다', () => {
    expect(isEchoAllowedEmail('devyyj@gmail.com')).toBe(true);
    expect(isEchoAllowedEmail('noticeably34@gmail.com')).toBe(true);
  });

  it('대소문자와 앞뒤 공백은 무시한다', () => {
    expect(isEchoAllowedEmail('  DevYYJ@Gmail.com ')).toBe(true);
  });

  it('목록에 없거나 비어 있는 이메일은 거부한다', () => {
    expect(isEchoAllowedEmail('someone@gmail.com')).toBe(false);
    expect(isEchoAllowedEmail('')).toBe(false);
    expect(isEchoAllowedEmail(undefined)).toBe(false);
    expect(isEchoAllowedEmail(null)).toBe(false);
  });
});
