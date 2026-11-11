import { describe, it, expect } from 'vitest';
import { calculateNewEndTime, calculateRemainingSeconds } from './utils/echo-logic';
import { remainingMsOf, resolveSenderEndTime, resolveSpeakerEndTime } from './utils/echo-sync';

/**
 * 샌더·스피커 동기화 통합 테스트.
 * 각 기기는 자기 시계(now + skew)만 알고, 소켓으로는 남은 시간(ms)만 주고받는다.
 */
class Speaker {
  endTime = 0;
  constructor(public skewMs: number) {}
  now(t: number) { return t + this.skewMs; }
  request(seconds: number, t: number) { this.endTime = calculateNewEndTime(this.endTime, seconds, this.now(t)); }
  syncPayload(t: number) { return { remainingMs: remainingMsOf(this.endTime, this.now(t)) }; }
  onSync(p: { remainingMs: number }, t: number) {
    this.endTime = resolveSpeakerEndTime({ localEndTime: this.endTime, remainingMs: p.remainingMs, nowMs: this.now(t) });
  }
  remaining(t: number) { return calculateRemainingSeconds(this.endTime, this.now(t)); }
}

class Sender {
  endTime = 0;
  lastRequestAt = 0;
  constructor(public skewMs: number) {}
  now(t: number) { return t + this.skewMs; }
  request(seconds: number, t: number) {
    this.lastRequestAt = this.now(t);
    this.endTime = calculateNewEndTime(this.endTime, seconds, this.now(t));
  }
  onSync(p: { remainingMs: number }, t: number) {
    this.endTime = resolveSenderEndTime({
      localEndTime: this.endTime, remainingMs: p.remainingMs, lastRequestAt: this.lastRequestAt, nowMs: this.now(t),
    });
  }
  remaining(t: number) { return calculateRemainingSeconds(this.endTime, this.now(t)); }
}

describe('메아리 샌더·스피커 동기화 (시계 차이 포함)', () => {
  it('샌더 시계가 9분 빨라도 동기화 후 샌더와 스피커의 남은 시간이 같다', () => {
    const speaker = new Speaker(0);
    const sender = new Sender(9 * 60_000);
    let t = 1_000_000;

    // 스피커가 1분 재생 중
    speaker.request(60, t);
    sender.onSync(speaker.syncPayload(t), t);
    expect(sender.remaining(t)).toBe(60);

    // 샌더가 +10분: 샌더는 낙관적으로 11분, 스피커도 11분
    t += 5_000;
    sender.request(600, t);
    speaker.request(600, t);
    t += 3_000; // 유예 시간 이후 주기 동기화
    sender.onSync(speaker.syncPayload(t), t);
    expect(sender.remaining(t)).toBe(speaker.remaining(t));
    expect(speaker.remaining(t)).toBe(60 - 8 + 600);
  });

  it('샌더 시계가 빨라 낙관적 값이 더 커져도 스피커 값으로 내려온다', () => {
    const speaker = new Speaker(0);
    const sender = new Sender(30_000);
    const t = 2_000_000;
    sender.endTime = sender.now(t) + 630_000; // 잘못 커진 로컬 값
    speaker.request(600, t);
    sender.onSync(speaker.syncPayload(t), t);
    expect(sender.remaining(t)).toBe(600);
  });

  it('요청 직후 도착한 이전 1분 패킷이 샌더를 1분으로 되돌리지 않는다', () => {
    const speaker = new Speaker(0);
    const sender = new Sender(0);
    let t = 3_000_000;
    speaker.request(60, t);
    sender.onSync(speaker.syncPayload(t), t);
    const stale = speaker.syncPayload(t); // 연장 전 보낸 패킷
    t += 200;
    sender.request(600, t);
    sender.onSync(stale, t + 100);
    expect(sender.remaining(t + 100)).toBeGreaterThan(600);
  });

  it('늦게 들어온 스피커도 기존 스피커와 같은 남은 시간으로 맞춰진다 (시계 차이 무관)', () => {
    const a = new Speaker(0);
    const b = new Speaker(-120_000);
    const t = 4_000_000;
    a.request(600, t);
    b.onSync(a.syncPayload(t), t);
    expect(b.remaining(t)).toBe(a.remaining(t));
  });

  it('여러 스피커가 같은 요청을 각자 처리해도 서로 동기화하며 값이 커지지 않는다', () => {
    const a = new Speaker(0);
    const b = new Speaker(700);
    let t = 5_000_000;
    a.request(600, t);
    b.request(600, t + 300); // 네트워크 지연
    for (let i = 0; i < 5; i++) {
      t += 10_000;
      a.onSync(b.syncPayload(t), t);
      b.onSync(a.syncPayload(t), t);
    }
    expect(Math.abs(a.remaining(t) - b.remaining(t))).toBeLessThanOrEqual(1);
    expect(a.remaining(t)).toBeLessThanOrEqual(600 - 50 + 1);
  });
});
