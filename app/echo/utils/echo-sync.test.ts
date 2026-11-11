import { describe, it, expect } from 'vitest';
import {
  endTimeFromRemaining,
  remainingMsOf,
  resolveSenderEndTime,
  resolveSpeakerEndTime,
  isLogLeader,
  isWithinStopGrace,
  OWN_REQUEST_GRACE_MS,
  STOP_GRACE_MS,
} from './echo-sync';

describe('echo-sync: 시계 차이와 무관한 동기화', () => {
  it('남은 시간(ms)을 내 시계 기준 종료 시각으로 바꾼다', () => {
    expect(endTimeFromRemaining(5000, 1_000)).toBe(6_000);
    expect(endTimeFromRemaining(0, 1_000)).toBe(0);
    expect(endTimeFromRemaining(-10, 1_000)).toBe(0);
  });

  it('종료 시각에서 남은 시간(ms)을 구한다', () => {
    expect(remainingMsOf(6_000, 1_000)).toBe(5_000);
    expect(remainingMsOf(500, 1_000)).toBe(0);
    expect(remainingMsOf(0, 1_000)).toBe(0);
  });

  describe('샌더', () => {
    it('스피커가 알려준 남은 시간을 항상 기준으로 삼는다 (내 값이 더 커도 내려간다)', () => {
      const now = 100_000;
      // 샌더 시계가 빨라 로컬 종료 시각이 30초 더 크게 잡혀 있던 상황
      const local = now + 630_000;
      expect(resolveSenderEndTime({ localEndTime: local, remainingMs: 600_000, lastRequestAt: 0, nowMs: now }))
        .toBe(now + 600_000);
    });

    it('내 요청 직후 도착한 이전 패킷(더 작은 값)은 무시한다', () => {
      const now = 100_000;
      const local = now + 660_000;
      const lastRequestAt = now - (OWN_REQUEST_GRACE_MS - 500);
      expect(resolveSenderEndTime({ localEndTime: local, remainingMs: 60_000, lastRequestAt, nowMs: now }))
        .toBe(local);
    });

    it('유예 시간이 지나면 더 작은 값도 받아들인다', () => {
      const now = 100_000;
      const lastRequestAt = now - OWN_REQUEST_GRACE_MS - 1;
      expect(resolveSenderEndTime({ localEndTime: now + 660_000, remainingMs: 60_000, lastRequestAt, nowMs: now }))
        .toBe(now + 60_000);
    });

    it('재생 종료(0) 패킷은 유예 시간이 지나면 0으로 만든다', () => {
      const now = 100_000;
      expect(resolveSenderEndTime({ localEndTime: now + 3_000, remainingMs: 0, lastRequestAt: 0, nowMs: now })).toBe(0);
    });
  });

  describe('스피커 간 동기화', () => {
    it('재생 중이 아니면 다른 스피커 값을 그대로 따른다 (늦게 들어온 스피커)', () => {
      expect(resolveSpeakerEndTime({ localEndTime: 0, remainingMs: 300_000, nowMs: 1_000 })).toBe(301_000);
    });

    it('오차 범위 안의 차이는 무시해 스피커끼리 값을 주고받으며 흔들리지 않는다', () => {
      const now = 1_000;
      expect(resolveSpeakerEndTime({ localEndTime: now + 300_000, remainingMs: 300_800, nowMs: now })).toBe(now + 300_000);
    });

    it('확실히 더 큰 값(내가 놓친 연장)은 따른다', () => {
      const now = 1_000;
      expect(resolveSpeakerEndTime({ localEndTime: now + 60_000, remainingMs: 660_000, nowMs: now })).toBe(now + 660_000);
    });
  });

  describe('로그 대표 스피커', () => {
    it('스피커 ID 중 사전순 첫 번째만 대표가 된다', () => {
      expect(isLogLeader('b', ['c', 'b', 'd'])).toBe(true);
      expect(isLogLeader('c', ['c', 'b', 'd'])).toBe(false);
    });

    it('아직 접속 목록이 비어 있으면 내가 대표다', () => {
      expect(isLogLeader('a', [])).toBe(true);
    });

    it('목록에 내가 없으면 대표가 아니다', () => {
      expect(isLogLeader('z', ['a'])).toBe(false);
    });
  });

  describe('즉시 중지 직후', () => {
    it('중지 직후 도착한 이전 동기화 패킷은 무시해야 한다 (재생이 되살아나지 않도록)', () => {
      expect(isWithinStopGrace(10_000, 10_000 + STOP_GRACE_MS - 1)).toBe(true);
    });

    it('유예 시간이 지나면 다시 동기화를 받는다', () => {
      expect(isWithinStopGrace(10_000, 10_000 + STOP_GRACE_MS)).toBe(false);
    });

    it('중지한 적이 없으면 무시하지 않는다', () => {
      expect(isWithinStopGrace(0, 5_000)).toBe(false);
    });
  });
});
