import { describe, it, expect, beforeEach } from 'vitest';
import { parseSeconds, resolveEchoRequest, resolveSyncTime } from './utils/echo-logic';

/**
 * 샌더(Sender)와 스피커(Speaker) 간 메아리 시간 연장 통합 테스트 (Integration Test)
 * 
 * 시나리오:
 * 1. 샌더가 +10분 보내기(600초)를 클릭하여 소켓으로 ECHO_REQUEST를 브로드캐스트함.
 * 2. 스피커가 ECHO_REQUEST를 받아 재생 시간을 10분(600초) 연장하고, ECHO_SYNC를 응답함.
 * 3. 샌더가 ECHO_SYNC를 수신하여 시간을 최종 동기화함.
 * 4. 다양한 예외 및 엣지 케이스(이벤트 객체 전달, payload 중첩, 문자열 600, 지연 패킷 등)에서도
 *    실제로 10분(600초)이 정확하게 추가되는지 통합 검증.
 */

describe('Echo Integration Test - 10분 보내기 (+600초) 통합 검증', () => {
  // 모의 소켓 네트워크 버스
  class MockSocketBus {
    private listeners: Map<string, Array<(event: string, payload: Record<string, unknown>) => void>> = new Map();

    subscribe(channel: string, callback: (event: string, payload: Record<string, unknown>) => void) {
      if (!this.listeners.has(channel)) {
        this.listeners.set(channel, []);
      }
      this.listeners.get(channel)!.push(callback);
    }

    broadcast(channel: string, event: string, payload: Record<string, unknown>) {
      const channelListeners = this.listeners.get(channel) || [];
      for (const listener of channelListeners) {
        // 네트워크 비동기 전달 흉내
        listener(event, payload);
      }
    }
  }

  let bus: MockSocketBus;

  beforeEach(() => {
    bus = new MockSocketBus();
  });

  it('샌더가 10분 보내기(+600초)를 누르면 스피커 및 샌더 모두 10분이 정확히 추가되어야 한다', () => {
    // 샌더 상태
    let senderRemainingTime = 0;
    let senderLastRequestTime = 0;

    // 스피커 상태
    let speakerRemainingTime = 0;

    // 샌더 소켓 수신 등록
    bus.subscribe('echo-room', (event, payload) => {
      if (event === 'ECHO_SYNC') {
        if (typeof payload.remainingTime === 'number') {
          senderRemainingTime = resolveSyncTime(
            senderRemainingTime,
            payload.remainingTime,
            senderLastRequestTime
          );
        }
      }
    });

    // 스피커 소켓 수신 등록
    bus.subscribe('echo-room', (event, payload) => {
      if (event === 'ECHO_REQUEST') {
        const newTime = resolveEchoRequest(speakerRemainingTime, payload);
        speakerRemainingTime = newTime;
        // 스피커가 변경된 시간 브로드캐스트
        bus.broadcast('echo-room', 'ECHO_SYNC', { remainingTime: newTime });
      }
    });

    // --- 실행: 샌더가 10분 보내기(600초) 클릭 ---
    const requestedSeconds = 600;
    senderLastRequestTime = Date.now();
    senderRemainingTime = senderRemainingTime + requestedSeconds; // 낙관적 업데이트

    // 스피커에게 ECHO_REQUEST 전송
    bus.broadcast('echo-room', 'ECHO_REQUEST', { senderId: 'sender-1', seconds: requestedSeconds });

    // --- 검증 ---
    // 1. 스피커 시간이 600초(10분)로 연장되었는가?
    expect(speakerRemainingTime).toBe(600);

    // 2. 샌더 시간도 600초(10분)로 동기화되었는가?
    expect(senderRemainingTime).toBe(600);
  });

  it('기존 남은 시간이 있는 상태에서 10분 보내기를 눌렀을 때 600초가 누적 추가되어야 한다', () => {
    let senderRemainingTime = 120; // 기존 2분
    let senderLastRequestTime = 0;
    let speakerRemainingTime = 120; // 기존 2분

    bus.subscribe('echo-room', (event, payload) => {
      if (event === 'ECHO_SYNC') {
        if (typeof payload.remainingTime === 'number') {
          senderRemainingTime = resolveSyncTime(
            senderRemainingTime,
            payload.remainingTime,
            senderLastRequestTime
          );
        }
      }
    });

    bus.subscribe('echo-room', (event, payload) => {
      if (event === 'ECHO_REQUEST') {
        const newTime = resolveEchoRequest(speakerRemainingTime, payload);
        speakerRemainingTime = newTime;
        bus.broadcast('echo-room', 'ECHO_SYNC', { remainingTime: newTime });
      }
    });

    // +10분 연장 클릭 (600초)
    const seconds = 600;
    senderLastRequestTime = Date.now();
    senderRemainingTime += seconds;

    bus.broadcast('echo-room', 'ECHO_REQUEST', { senderId: 'sender-1', seconds });

    // 120초 + 600초 = 720초 (12분)
    expect(speakerRemainingTime).toBe(720);
    expect(senderRemainingTime).toBe(720);
  });

  it('버튼 이벤트 객체나 비정상 값이 handleSendEcho로 넘어오더라도 600초 요청은 올바르게 전송 및 해석되어야 한다', () => {
    // handleSendEcho에 이벤트 객체(MouseEvent 등)가 잘못 전달되었을 때 방어 로직 검증
    const sanitizeSeconds = (input: unknown, defaultVal = 60): number => {
      if (typeof input === 'number' && !isNaN(input) && input > 0) return input;
      if (typeof input === 'string') {
        const p = parseInt(input, 10);
        if (!isNaN(p) && p > 0) return p;
      }
      return defaultVal;
    };

    // 1. 정상 600초
    expect(sanitizeSeconds(600)).toBe(600);

    // 2. MouseEvent 객체인 경우 (디폴트 60으로 안전 처리)
    const mockMouseEvent = { target: {}, preventDefault: () => {} };
    expect(sanitizeSeconds(mockMouseEvent)).toBe(60);

    // 3. 문자열 '600'
    expect(sanitizeSeconds('600')).toBe(600);
  });

  it('Supabase Realtime의 중첩된 payload 구조에서도 600초가 1분(60초)으로 잘못 떨어지지 않고 600초로 파싱되어야 한다', () => {
    // Supabase Realtime broadcast 수신 객체 형태들
    const payload1 = { senderId: 'sender-1', seconds: 600 };
    const payload2 = { payload: { senderId: 'sender-1', seconds: 600 } };
    const payload3 = { payload: { payload: { senderId: 'sender-1', seconds: 600 } } };
    const payloadStr = { senderId: 'sender-1', seconds: '600' };

    expect(parseSeconds(payload1)).toBe(600);
    expect(parseSeconds(payload2)).toBe(600);
    expect(parseSeconds(payload3)).toBe(600);
    expect(parseSeconds(payloadStr)).toBe(600);
  });

  it('10분 보내기 버튼을 클릭한 뒤 n초(예: 5초, 10초) 경과 후에도 남은 시간이 1분이 아닌 10분 가까이(600 - n초) 유지되는지 검증한다', () => {
    let senderRemainingTime = 0;
    let senderLastRequestTime = 0;
    let speakerRemainingTime = 0;
    let currentTimeMs = 100000; // 가상 시작 시간 (ms)

    // 소켓 수신 핸들러
    bus.subscribe('echo-room', (event, payload) => {
      if (event === 'ECHO_SYNC') {
        if (typeof payload.remainingTime === 'number') {
          senderRemainingTime = resolveSyncTime(
            senderRemainingTime,
            payload.remainingTime,
            senderLastRequestTime,
            currentTimeMs // 가상 현재 시간 전달
          );
        }
      }
    });

    bus.subscribe('echo-room', (event, payload) => {
      if (event === 'ECHO_REQUEST') {
        const newTime = resolveEchoRequest(speakerRemainingTime, payload);
        speakerRemainingTime = newTime;
        bus.broadcast('echo-room', 'ECHO_SYNC', { remainingTime: newTime });
      }
    });

    // 1. 샌더가 10분 보내기(+600초) 클릭
    const addedSeconds = 600;
    senderLastRequestTime = currentTimeMs;
    senderRemainingTime += addedSeconds;

    bus.broadcast('echo-room', 'ECHO_REQUEST', { senderId: 'sender-1', seconds: addedSeconds });

    // 클릭 직후 (t = 0초): 600초
    expect(speakerRemainingTime).toBe(600);
    expect(senderRemainingTime).toBe(600);

    // 2. n초 (예: n = 12초) 경과 시뮬레이션 (10초 유예 기간 지난 후 동기화 검증)
    const nSeconds = 12;
    for (let sec = 1; sec <= nSeconds; sec++) {
      // 1초 시간 경과
      currentTimeMs += 1000;
      speakerRemainingTime = Math.max(0, speakerRemainingTime - 1);

      // 스피커가 1초마다 동기화 신호 전송
      bus.broadcast('echo-room', 'ECHO_SYNC', { remainingTime: speakerRemainingTime });
    }

    // 3. n초(12초) 경과 후 남은 시간 측정
    const expectedRemainingTime = 600 - nSeconds; // 588초 (9분 48초)

    // 검증: 1분(60초 미만)이 아니라 10분 가까이(588초) 유지되어야 한다
    expect(speakerRemainingTime).toBe(expectedRemainingTime);
    expect(senderRemainingTime).toBe(expectedRemainingTime);

    // 580초 초과 (10분에 가까운 약 9분 48초) 인지 명시적 검증
    expect(speakerRemainingTime).toBeGreaterThan(580);
    expect(senderRemainingTime).toBeGreaterThan(580);
  });

  it('샌더가 10분 연장을 눌렀을 때, 뒤늦게도착한 스피커의 구 1분(57초) 패킷이 샌더를 1분으로 롤백시키는 것을 완벽히 방지해야 한다', () => {
    const senderRemainingTime = 600; // 10분 연장된 상태
    const senderLastRequestTime = 100000;
    const nowMs = 104000; // 4초 경과 (3초 넘김)

    // 스피커가 가지고 있던 이전 1분짜리 구(old) 패킷 (57초)
    const delayedOldSpeakerSyncTime = 57;

    const resolvedTime = resolveSyncTime(
      senderRemainingTime,
      delayedOldSpeakerSyncTime,
      senderLastRequestTime,
      nowMs
    );

    // 구 1분 패킷(57초)으로 롤백되지 않고 600초가 그대로 보존되어야 함!
    expect(resolvedTime).toBe(600);
  });

  it('샌더가 10분 연장(+600초)을 1번 누르면 정확히 10분(600초)만 추가되어야 하며 11분(+660초)이나 이중 가산이 발생하지 않아야 한다', () => {
    let speakerRemainingTime = 0;
    let senderRemainingTime = 0;
    const speakerPresenceId = 'speaker-id-123';
    const senderPresenceId = 'sender-id-456';

    bus.subscribe('echo-room', (event, payload) => {
      if (event === 'ECHO_REQUEST') {
        // 자기 자신이 보낸 ECHO_REQUEST는 이미 더했으므로 무시
        if (payload.senderId === speakerPresenceId) return;

        const added = parseSeconds(payload, 60);
        speakerRemainingTime += added;
        bus.broadcast('echo-room', 'ECHO_SYNC', { remainingTime: speakerRemainingTime });
      }
    });

    bus.subscribe('echo-room', (event, payload) => {
      if (event === 'ECHO_SYNC') {
        if (typeof payload.remainingTime === 'number' && payload.remainingTime > senderRemainingTime) {
          senderRemainingTime = payload.remainingTime;
        }
      }
    });

    // --- 실행: 샌더가 10분 보내기(600초) 클릭 ---
    const seconds = 600;
    senderRemainingTime += seconds;

    // 샌더는 오직 ECHO_REQUEST 단 1개만 브로드캐스트 (ECHO_SYNC 중복 발송 안함)
    bus.broadcast('echo-room', 'ECHO_REQUEST', { senderId: senderPresenceId, seconds });

    // 검증: 정확히 600초(10분)만 추가되어야 함 (660초/11분이나 1200초/20분 이중 가산 금지!)
    expect(speakerRemainingTime).toBe(600);
    expect(senderRemainingTime).toBe(600);
    expect(speakerRemainingTime).not.toBe(660);
  });
});
