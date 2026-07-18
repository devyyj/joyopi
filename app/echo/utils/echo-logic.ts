export function calculateNewTime(current: number, increment: number): number {
  return current + increment;
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function resolveSyncTime(
  currentTime: number,
  syncTime: number,
  lastRequestTimeMs: number = 0,
  nowMs: number = Date.now(),
  gracePeriodMs: number = 10000
): number {
  // 최근 연장 요청 후 유예 기간(10초) 동안은 스피커의 구(old) 시간으로 인한 롤백 방지
  if (nowMs - lastRequestTimeMs < gracePeriodMs && syncTime < currentTime) {
    return currentTime;
  }
  // syncTime이 더 크면 항상 최신 확장 시간을 채택
  if (syncTime > currentTime) {
    return syncTime;
  }
  // 요청이 진행 중이었고 현재 남아있는 시간이 300초(5분) 이상인데 갑자기 120초 이하의 구 패킷이 도착한 경우 덮어쓰기 차단
  if (currentTime > 300 && syncTime < 120 && (nowMs - lastRequestTimeMs < 30000)) {
    return currentTime;
  }
  return syncTime;
}

export function parseSeconds(payload: unknown, defaultSeconds: number = 60): number {
  if (!payload) {
    return defaultSeconds;
  }

  if (typeof payload === 'string') {
    const trimmed = payload.trim();
    if (/^\d+$/.test(trimmed)) {
      const p = parseInt(trimmed, 10);
      if (p > 0) return p;
    }
    try {
      const parsedObj = JSON.parse(trimmed);
      return parseSeconds(parsedObj, defaultSeconds);
    } catch {
      return defaultSeconds;
    }
  }

  if (typeof payload !== 'object' || payload === null) {
    return defaultSeconds;
  }

  let curr: Record<string, unknown> | null = payload as Record<string, unknown>;
  let val: unknown = undefined;

  // 재귀적으로 obj.seconds 또는 obj.payload 속성을 탐색
  while (curr && typeof curr === 'object' && curr !== null) {
    if ('seconds' in curr && curr.seconds !== undefined) {
      val = curr.seconds;
      break;
    }
    if ('payload' in curr && curr.payload) {
      if (typeof curr.payload === 'object') {
        curr = curr.payload as Record<string, unknown>;
      } else if (typeof curr.payload === 'string') {
        return parseSeconds(curr.payload, defaultSeconds);
      } else {
        break;
      }
    } else {
      break;
    }
  }

  if (typeof val === 'number' && !isNaN(val) && val > 0) {
    return val;
  }

  if (typeof val === 'string') {
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return defaultSeconds;
}

/**
 * ECHO_REQUEST payload를 받아 speaker의 새 remainingTime을 계산합니다.
 * 항상 delta(seconds) 기반으로 계산하여 sender/speaker 간 시간 불일치 문제를 방지합니다.
 *
 * 이전에는 sender가 보내는 absoluteTime을 우선 사용했으나,
 * sender의 senderTimeRef가 speaker의 실제 remainingTime과 동기화되지 않으면
 * 10분 보내기가 1분만 추가되는 버그가 발생했습니다.
 */
export function resolveEchoRequest(currentTime: number, payload: unknown): number {
  const addedSeconds = parseSeconds(payload, 60);
  return currentTime + addedSeconds;
}


export function mapEventTypeToLogType(eventType: string): 'info' | 'success' | 'warning' | 'error' {
  switch (eventType) {
    case 'join':
    case 'request':
    case 'sync':
      return 'success';
    case 'leave':
    case 'stop':
      return 'warning';
    case 'error':
      return 'error';
    default:
      return 'info';
  }
}

