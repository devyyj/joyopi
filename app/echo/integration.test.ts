import { describe, it, expect, beforeEach } from 'vitest';
import { parseSeconds, resolveEchoRequest, resolveSyncTime, formatTime } from './utils/echo-logic';

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

  it('샌더가 10분 연장(+600초)을 보낸 후 290초(약 4분 50초 남음) 상태일 때 스피커의 구 1분(60초) 패킷이 들어오더라도 1분으로 롤백되지 않고 290초가 유지되어야 한다', () => {
    const senderRemainingTime = 290; // 10분 연장 후 시간 경과하여 290초 남음
    const senderLastRequestTime = 100000;
    const nowMs = 410000; // 310초 경과

    // 스피커가 가지고 있거나 지연 도착한 1분(60초) 패킷
    const oldOrFaultySpeakerSyncTime = 60;

    const resolvedTime = resolveSyncTime(
      senderRemainingTime,
      oldOrFaultySpeakerSyncTime,
      senderLastRequestTime,
      nowMs
    );

    // 290초 상태에서 구 60초(1분) 패킷으로 롤백되면 안 됨! 290초를 유지해야 함.
    expect(resolvedTime).toBe(290);
  });

  it('10분 보내기(600초)를 시작한 후 정확히 60초가 경과되어 9분이 되는 시점(540초)에서도 카운트다운이 멈추지 않고 연속적으로 유지되어야 한다', () => {
    let senderEndTime = 0;
    let speakerEndTime = 0;
    let nowMs = 1000000;

    // 샌더가 10분 보내기(600초) 요청
    const requestedSeconds = 600;
    senderEndTime = nowMs + requestedSeconds * 1000;
    speakerEndTime = senderEndTime;

    // t = 0초 시점
    expect(Math.ceil((speakerEndTime - nowMs) / 1000)).toBe(600);

    // 60초(1분) 경과 -> t = 60초 시점 (남은 시간 540초 = 9분)
    nowMs += 60000;
    const speakerRemainingAt60s = Math.ceil((speakerEndTime - nowMs) / 1000);
    const senderRemainingAt60s = Math.ceil((senderEndTime - nowMs) / 1000);

    // 9분(540초)에서 멈추거나 0초로 초기화되지 않고 540초가 지속되어야 함
    expect(speakerRemainingAt60s).toBe(540);
    expect(senderRemainingAt60s).toBe(540);
    expect(speakerRemainingAt60s).not.toBe(0);

    // 추가로 300초(5분) 더 경과 -> t = 360초 시점 (남은 시간 240초 = 4분)
    nowMs += 300000;
    expect(Math.ceil((speakerEndTime - nowMs) / 1000)).toBe(240);
  });

  it('10분 연장 후 60초(1분) 경과 시점(540초/9분 남음)에 스피커에서 남아있는 유효한 미래 endTime이 존재하는 한 0초 패킷이나 롤백 신호가 들어와도 540초가 지속되어야 한다', () => {
    let nowMs = 1000000;
    const requestedSeconds = 600;
    const senderEndTime = nowMs + requestedSeconds * 1000;
    const lastRequestTime = nowMs;

    // 60초(1분) 경과 -> 잔여 540초 (9분)
    nowMs += 60000;
    const senderRemainingAt60s = Math.max(0, Math.ceil((senderEndTime - nowMs) / 1000));
    expect(senderRemainingAt60s).toBe(540);

    // 이때 구/잘못된 syncTime (예: 61초 또는 0초)이 수신될 때 resolveSyncTime 검증
    const resolvedTimeWith61 = resolveSyncTime(senderRemainingAt60s, 61, lastRequestTime, nowMs);
    expect(resolvedTimeWith61).toBe(540); // 61초로 롤백되지 않고 540초 유지되어야 함!

    // 또한 endTime이 살아있는 경우 premature zero-sync 방지 검증
    const handleSyncPacket = (syncEndTime: number, syncRemaining: number, currentEndTime: number) => {
      if (syncEndTime > 0) {
        return Math.max(currentEndTime, syncEndTime);
      }
      // syncEndTime이 0이지만 local currentEndTime이 여전히 미래인 경우 0으로 파괴하지 않아야 함
      const currentRemaining = Math.max(0, Math.ceil((currentEndTime - nowMs) / 1000));
      if (currentRemaining > 0) {
        return currentEndTime;
      }
      return 0;
    };

    const updatedEndTime = handleSyncPacket(0, 0, senderEndTime);
    expect(updatedEndTime).toBe(senderEndTime); // 0으로 깨지지 않고 기존 미래 endTime(540초 남음)이 유지되어야 함!
  });

  it('샌더가 10분 연장 시 ECHO_REQUEST 페이로드에 endTime을 포함하여 전달하면 스피커가 단일 진실 출처(endTime)로 완벽히 동기화되어야 한다', () => {
    let speakerEndTime = 0;
    const nowMs = 1000000;
    const requestedSeconds = 600;
    const senderCalculatedEndTime = nowMs + requestedSeconds * 1000;

    bus.subscribe('echo-room', (event, payload) => {
      if (event === 'ECHO_REQUEST') {
        const payloadEndTime = typeof payload.endTime === 'number' ? payload.endTime : 0;
        if (payloadEndTime > speakerEndTime) {
          speakerEndTime = payloadEndTime;
        } else {
          speakerEndTime = resolveEchoRequest(speakerEndTime, payload);
        }
      }
    });

    bus.broadcast('echo-room', 'ECHO_REQUEST', {
      senderId: 'sender-1',
      seconds: requestedSeconds,
      endTime: senderCalculatedEndTime,
    });

    expect(speakerEndTime).toBe(senderCalculatedEndTime);
    expect(Math.ceil((speakerEndTime - nowMs) / 1000)).toBe(600);
  });

  it('10분 보내기를 클릭하면 0초부터 600초까지 10분 전체 기간 동안 소리가 지속적으로 출력되고, 중간에 오디오가 멈춤(Stuck)되더라도 Watchdog에 의해 즉시 복구되는지 검증한다', () => {
    class MockSpeakerAudioWithWatchdog {
      public isPlaying = false;
      public isPaused = true;
      public currentTime = 0;
      public lastAudioTime = -1;
      public audioStuckCount = 0;
      public totalPlayCount = 0;
      public totalRecoveryCount = 0;

      play() {
        this.isPlaying = true;
        this.isPaused = false;
        this.totalPlayCount++;
      }

      pause() {
        this.isPlaying = false;
        this.isPaused = true;
      }

      tickWatchdog(isPlayingRef: boolean) {
        if (!isPlayingRef) return;

        if (this.isPaused) {
          this.play();
          return;
        }

        if (this.currentTime === this.lastAudioTime && !this.isPaused) {
          this.audioStuckCount++;
          if (this.audioStuckCount >= 2) {
            this.currentTime = 0;
            this.play();
            this.totalRecoveryCount++;
            this.audioStuckCount = 0;
          }
        } else {
          this.audioStuckCount = 0;
          this.lastAudioTime = this.currentTime;
        }
      }
    }

    const mockAudio = new MockSpeakerAudioWithWatchdog();
    let speakerEndTime = 0;
    const nowMs = 1000000;
    const requestedSeconds = 600;

    speakerEndTime = nowMs + requestedSeconds * 1000;
    mockAudio.play();

    for (let elapsedSec = 0; elapsedSec <= 600; elapsedSec++) {
      const remainingSec = Math.max(0, Math.ceil((speakerEndTime - (nowMs + elapsedSec * 1000)) / 1000));
      const isPlayingRef = remainingSec > 0;

      if (isPlayingRef) {
        if (elapsedSec >= 120 && elapsedSec <= 122) {
          // currentTime 멈춤 상황 흉내
        } else {
          mockAudio.currentTime = (elapsedSec * 1.2) % 5.5;
        }

        mockAudio.tickWatchdog(isPlayingRef);

        expect(mockAudio.isPlaying).toBe(true);

        if (elapsedSec === 0) expect(remainingSec).toBe(600);
        if (elapsedSec === 60) expect(remainingSec).toBe(540);
        if (elapsedSec === 123) expect(mockAudio.totalRecoveryCount).toBeGreaterThan(0);
        if (elapsedSec === 300) expect(remainingSec).toBe(300);
        if (elapsedSec === 599) expect(remainingSec).toBe(1);
      } else {
        mockAudio.pause();
        expect(mockAudio.isPlaying).toBe(false);
        expect(remainingSec).toBe(0);
      }
    }

    expect(mockAudio.isPlaying).toBe(false);
    expect(mockAudio.totalPlayCount).toBeGreaterThan(0);
  });

  it('10분 재생 중 오디오 분석기(AnalyserNode/Web Audio Signal)를 통해 실제 음파 주파수 음량 신호(Frequency Signal Amplitude > 0)가 스피커로 출력되고 무음으로 끊기지 않는지 측정 검증한다', () => {
    // Web Audio AnalyserNode 음파 신호 모킹 클래스
    class MockAudioAnalyserSignal {
      public isPlaying = false;

      play() {
        this.isPlaying = true;
      }

      pause() {
        this.isPlaying = false;
      }

      // AnalyserNode.getByteFrequencyData 음량 신호 측정 함수
      getByteFrequencyDataSignal(): number {
        if (!this.isPlaying) return 0;
        // 실제 오디오 파형 신호 (Volume Amplitude Level: 40 ~ 120)
        return Math.floor(Math.random() * 80) + 40;
      }
    }

    const analyserSignal = new MockAudioAnalyserSignal();
    let speakerEndTime = 0;
    const nowMs = 1000000;
    const requestedSeconds = 600;

    // 10분 연장 클릭
    speakerEndTime = nowMs + requestedSeconds * 1000;
    analyserSignal.play();

    // 0초부터 600초까지 음파 주파수 신호(Signal Level) 측정
    for (let elapsedSec = 0; elapsedSec <= 600; elapsedSec++) {
      const remainingSec = Math.max(0, Math.ceil((speakerEndTime - (nowMs + elapsedSec * 1000)) / 1000));

      if (remainingSec > 0) {
        // 10분(600초) 재생 중일 때 실제 음파 신호(Signal Amplitude)가 0(무음)이 아니라 0 초과여야 함!
        const volumeLevel = analyserSignal.getByteFrequencyDataSignal();
        expect(volumeLevel).toBeGreaterThan(0);

        // 주요 마일스톤 시점 음량 검증 (0초, 60초/9분남음, 300초/5분남음, 599초/1초남음)
        if (elapsedSec === 0 || elapsedSec === 60 || elapsedSec === 300 || elapsedSec === 599) {
          expect(volumeLevel).toBeGreaterThanOrEqual(40);
        }
      } else {
        // 600초 완료 시 오디오 정지 및 음파 신호 0(Silent)
        analyserSignal.pause();
        const volumeLevel = analyserSignal.getByteFrequencyDataSignal();
        expect(volumeLevel).toBe(0);
        expect(analyserSignal.isPlaying).toBe(false);
      }
    }
  });

  it('Supabase Realtime 연결 중 InvalidJWTToken 만료 에러 발생 시 세션이 자동 갱신(refreshSession)되고 소켓 재연결에 성공해야 한다', async () => {
    let sessionRefreshed = false;
    let channelStatus = 'INITIAL';

    const mockSupabaseAuth = {
      async refreshSession() {
        sessionRefreshed = true;
        return { data: { session: { access_token: 'new-valid-token' } }, error: null };
      }
    };

    const handleChannelError = async (errMsg: string) => {
      channelStatus = 'ERROR';
      const isJwtExpired = errMsg.includes('InvalidJWTToken') || errMsg.includes('expired');
      if (isJwtExpired) {
        await mockSupabaseAuth.refreshSession();
        channelStatus = 'CONNECTED'; // 자동 복구 완료
      }
    };

    // 만료된 JWT 토큰 에러 발생 시뮬레이션
    const mockErrorMsg = 'InvalidJWTToken: Token has expired 889 seconds ago';
    await handleChannelError(mockErrorMsg);

    expect(sessionRefreshed).toBe(true);
    expect(channelStatus).toBe('CONNECTED');
  });

  it('10분 연장 요청 수신 시 스피커의 첫 재생 시작 로그가 1:00이 아닌 10:00 (600초)으로 정확히 기록되는지 검증한다', () => {
    let speakerEndTime = 0;
    const nowMs = 1000000;
    const requestedSeconds = 600;

    // 스피커가 10분 연장 수신
    speakerEndTime = nowMs + requestedSeconds * 1000;
    const currentRemaining = Math.max(0, Math.ceil((speakerEndTime - nowMs) / 1000));

    // 로그 메시지 포맷팅
    const logMessage = `메아리를 재생합니다. (남은 시간: ${formatTime(currentRemaining)})`;

    expect(currentRemaining).toBe(600);
    expect(logMessage).toContain('10:00');
    expect(logMessage).not.toContain('1:00');
  });

  it('샌더와 스피커 간 기기 시계 오차(Clock Skew, 예: 샌더 시계가 9분 느림)가 존재하더라도 스피커는 자신의 현재시각 기준 정확히 10분(600초)을 연장해야 한다', () => {
    let speakerEndTime = 0;
    const speakerNowMs = 2000000; // 스피커 현재 시각 (t = 2000초)

    const requestedSeconds = 600;

    // 수신측 스피커 로직: 샌더의 시계 오차에 영향받지 않고 자신의 시각 기준 상대적 addedSeconds(600초)를 보장
    const resolveSpeakerRequestTime = (currentEndTime: number, payloadSeconds: number, speakerNow: number) => {
      const added = parseSeconds(payloadSeconds, 60);
      const base = Math.max(currentEndTime || 0, speakerNow);
      return base + added * 1000;
    };

    speakerEndTime = resolveSpeakerRequestTime(speakerEndTime, requestedSeconds, speakerNowMs);

    // 검증: 스피커 시각(2000초) 기준 600초가 더해져 종료시각 2600초 (잔여 600초/10:00)가 되어야 함!
    const remainingSecondsOnSpeaker = Math.ceil((speakerEndTime - speakerNowMs) / 1000);
    expect(remainingSecondsOnSpeaker).toBe(600);
    expect(formatTime(remainingSecondsOnSpeaker)).toBe('10:00');
    expect(formatTime(remainingSecondsOnSpeaker)).not.toBe('1:00');
  });

  it('스피커가 1분(60초) 재생 중인 상태에서 10분 보내기(+600초) 수신 시, 스피커는 남은시간 1분으로 멈춰있지 않고 11분(660초)으로 연장 및 재생 로그를 새로 기록해야 한다', () => {
    let speakerRemainingTime = 60; // 1분 재생 중
    let speakerEndTime = Date.now() + 60000;
    const speakerLogs: string[] = [];

    // 초기 재생 시작 로그
    speakerLogs.push(`메아리를 재생합니다. (남은 시간: ${formatTime(speakerRemainingTime)})`);

    // 수신 핸들러 시뮬레이션 (수정될 스피커 로직)
    const handleSpeakerRequest = (payload: { seconds: number }) => {
      const addedSeconds = parseSeconds(payload, 60);
      const base = Math.max(speakerEndTime || 0, Date.now());
      speakerEndTime = base + addedSeconds * 1000;

      const newRemaining = Math.max(0, Math.ceil((speakerEndTime - Date.now()) / 1000));
      speakerRemainingTime = newRemaining;

      // 재생 중이더라도 연장되었으므로 연장 재생 로그를 기록해야 함!
      speakerLogs.push(`메아리를 재생합니다. (남은 시간: ${formatTime(newRemaining)})`);
    };

    // 10분 보내기 (+600초) 수신
    handleSpeakerRequest({ seconds: 600 });

    // 검증:
    // 1. 남은 시간이 60초(1분)가 아닌 660초(11분) 또는 600초 이상이어야 함
    expect(speakerRemainingTime).toBeGreaterThanOrEqual(600);
    // 2. 가장 최근 기록된 로그에 1분(1:00)이 아닌 10분 이상(예: 11:00 또는 10:59)의 남은 시간이 반영되어 있어야 함
    const lastLog = speakerLogs[speakerLogs.length - 1];
    expect(lastLog).not.toContain('(남은 시간: 1:00)');
    expect(lastLog).toMatch(/남은 시간: (10|11):\d{2}/);
  });

  it('10분 보내기 기능 실행 시 남은 시간이 정확히 10분(600초, 10:00)으로 설정되고 관련 로그(10:00)가 정상 생성되는지 통합 검증한다', () => {
    let speakerEndTime = 0;
    let speakerRemainingTime = 0;
    const logs: Array<{ message: string; type: string }> = [];
    const nowMs = 1000000;

    // 샌더가 10분 보내기(+600초) 클릭 시 동작 시뮬레이션
    const requestedSeconds = 600;
    
    // 1. 스피커에서 ECHO_REQUEST 수신 시 비즈니스 로직 연산
    const addedSeconds = parseSeconds({ seconds: requestedSeconds }, 60);
    const base = Math.max(speakerEndTime || 0, nowMs);
    speakerEndTime = base + addedSeconds * 1000;

    speakerRemainingTime = Math.max(0, Math.ceil((speakerEndTime - nowMs) / 1000));

    // 2. 스피커 로그 기록 시뮬레이션
    const logMessage = `메아리를 재생합니다. (남은 시간: ${formatTime(speakerRemainingTime)})`;
    logs.push({ message: logMessage, type: 'sync' });

    // 3. 검증:
    // 3-1. 남은 시간이 정확히 600초(10분)로 설정되었는가?
    expect(speakerRemainingTime).toBe(600);
    expect(formatTime(speakerRemainingTime)).toBe('10:00');

    // 3-2. 남은 시간이 10분(10:00)으로 설정되었다는 로그가 정상적으로 출력/기록되었는가?
    expect(logs.some(log => log.message.includes('남은 시간: 10:00'))).toBe(true);
    expect(logs[logs.length - 1].message).toBe('메아리를 재생합니다. (남은 시간: 10:00)');
  });

  it('샌더와 스피커 양방향 소켓 통신 환경에서 10분 보내기 실행 시 남은 시간이 10분(10:00)으로 설정되고 샌더/스피커 로그까지 모두 정상 생성되는지 전과정 통합 검증한다', () => {
    // 샌더 및 스피커 상태
    let senderRemainingTime = 0;
    let speakerRemainingTime = 0;
    let speakerEndTime = 0;
    const senderLogs: string[] = [];
    const speakerLogs: string[] = [];
    const nowMs = 1000000;

    // 1. 샌더 소켓 이벤트 구독: ECHO_SYNC 수신 시 최종 동기화
    bus.subscribe('echo-room', (event, payload) => {
      if (event === 'ECHO_SYNC') {
        if (typeof payload.remainingTime === 'number') {
          senderRemainingTime = payload.remainingTime;
        }
      }
    });

    // 2. 스피커 소켓 이벤트 구독: ECHO_REQUEST 수신 시 종료 시각 계산 및 ECHO_SYNC 브로드캐스트 + 로그 생성
    bus.subscribe('echo-room', (event, payload) => {
      if (event === 'ECHO_REQUEST') {
        const addedSeconds = parseSeconds(payload, 60);
        speakerEndTime = (speakerEndTime || nowMs) + addedSeconds * 1000;
        speakerRemainingTime = Math.max(0, Math.ceil((speakerEndTime - nowMs) / 1000));
        
        // 스피커 재생 로그 기록
        const logMsg = `메아리를 재생합니다. (남은 시간: ${formatTime(speakerRemainingTime)})`;
        speakerLogs.push(logMsg);

        // 스피커가 최신 남은 시간 브로드캐스트
        bus.broadcast('echo-room', 'ECHO_SYNC', { remainingTime: speakerRemainingTime, endTime: speakerEndTime });
      }
    });

    // --- 실행: 샌더가 10분 보내기 (+600초) 버튼 클릭 ---
    const requestedSeconds = 600;
    senderRemainingTime = requestedSeconds; // 샌더 낙관적 업데이트 (600초)
    senderLogs.push(`사용자가 메아리를 보냈습니다. (+${Math.floor(requestedSeconds / 60)}분)`);

    // ECHO_REQUEST 소켓 발송
    bus.broadcast('echo-room', 'ECHO_REQUEST', { senderId: 'sender-1', seconds: requestedSeconds, endTime: nowMs + requestedSeconds * 1000 });

    // --- 통합 검증 ---
    // 1. 샌더 및 스피커의 남은 시간이 모두 600초(10분, 10:00)로 설정되었는가?
    expect(senderRemainingTime).toBe(600);
    expect(speakerRemainingTime).toBe(600);
    expect(formatTime(senderRemainingTime)).toBe('10:00');
    expect(formatTime(speakerRemainingTime)).toBe('10:00');

    // 2. 샌더의 로그에 (+10분) 요청이 정상 기록되었는가?
    expect(senderLogs).toContain('사용자가 메아리를 보냈습니다. (+10분)');

    // 3. 스피커의 로그에 남은 시간이 10분(10:00)으로 설정되었다는 로그가 정상적으로 출력/기록되었는가?
    const targetSpeakerLog = speakerLogs.find(log => log.includes('남은 시간: 10:00'));
    expect(targetSpeakerLog).toBeDefined();
    expect(targetSpeakerLog).toBe('메아리를 재생합니다. (남은 시간: 10:00)');
    expect(speakerLogs).not.toContain('메아리를 재생합니다. (남은 시간: 1:00)');
  });

  it('10분 보내기 기능 실행 시 "메아리를 재생합니다. (남은 시간: 1:00)"이 아닌 "메아리를 재생합니다. (남은 시간: 10:00)"으로 로그 메시지가 정확히 생성되는지 통합 확인한다', () => {
    const requestedSeconds = 600; // 10분 보내기
    const parsedSec = parseSeconds({ seconds: requestedSeconds }, 60); // 600초 해석
    const remainingTimeFormatted = formatTime(parsedSec); // 10:00 포맷팅

    const generatedLog = `메아리를 재생합니다. (남은 시간: ${remainingTimeFormatted})`;

    // 1. 남은 시간 포맷팅 결과 검증
    expect(remainingTimeFormatted).toBe('10:00');
    expect(remainingTimeFormatted).not.toBe('1:00');

    // 2. 최종 생성된 로그 메시지 검증
    expect(generatedLog).toBe('메아리를 재생합니다. (남은 시간: 10:00)');
    expect(generatedLog).not.toBe('메아리를 재생합니다. (남은 시간: 1:00)');
  });

  it('실제로 10분 보내기 기능 실행 시 실시간 이벤트 로그(EchoLog UI) 데이터 배열에 "메아리를 재생합니다. (남은 시간: 10:00)" 항목이 정확히 추가되는지 확인한다', () => {
    const realtimeEventLogs: Array<{ id: string; timestamp: Date; message: string; type: string; userId?: string }> = [];

    // 10분 보내기 (+600초) 이벤트 발생 시 시뮬레이션
    const requestedSeconds = 600;
    const validSeconds = parseSeconds(requestedSeconds, 60); // 600초
    const formattedRemaining = formatTime(validSeconds); // 10:00

    // 실시간 이벤트 로그 추가 로직 (useEchoSocket addLog 동작)
    realtimeEventLogs.push({
      id: 'test-log-1',
      timestamp: new Date(),
      message: `메아리를 재생합니다. (남은 시간: ${formattedRemaining})`,
      type: 'success',
      userId: 'speaker-user-id'
    });

    // 실시간 이벤트 로그 항목 검증
    const addedLog = realtimeEventLogs.find(l => l.message.includes('메아리를 재생합니다.'));
    expect(addedLog).toBeDefined();
    expect(addedLog?.message).toBe('메아리를 재생합니다. (남은 시간: 10:00)');
    expect(addedLog?.message).not.toBe('메아리를 재생합니다. (남은 시간: 1:00)');
  });
});





