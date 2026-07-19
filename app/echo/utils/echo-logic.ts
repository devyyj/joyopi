/**
 * 메아리(Echo) 비즈니스 유틸리티 (v2.0 Refactored)
 * 단일 진실 출처(Single Source of Truth): Unix ms timestamp 'endTime'
 */

/**
 * 종료 절대 시각(endTime)으로부터 현재 남은 잔여 시간(초)을 계산합니다.
 */
export function calculateRemainingSeconds(endTime: number, nowMs: number = Date.now()): number {
  if (!endTime || endTime <= 0) return 0;
  return Math.max(0, Math.ceil((endTime - nowMs) / 1000));
}

/**
 * 기존 종료 절대 시각(currentEndTime)에 신규 시간(addedSeconds)을 더해 새 종료 시각을 계산합니다.
 */
export function calculateNewEndTime(currentEndTime: number, addedSeconds: number, nowMs: number = Date.now()): number {
  const base = Math.max(currentEndTime || 0, nowMs);
  const validSeconds = typeof addedSeconds === 'number' && !isNaN(addedSeconds) && addedSeconds > 0
    ? addedSeconds
    : 60;
  return base + validSeconds * 1000;
}

export function calculateNewTime(current: number, increment: number): number {
  return current + increment;
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * 샌더 및 스피커 간 시간 동기화 판단 유틸리티
 */
export function resolveSyncTime(
  currentTime: number,
  syncTime: number,
  lastRequestTimeMs: number = 0,
  nowMs: number = Date.now(),
  gracePeriodMs: number = 10000
): number {
  if (syncTime === 0) {
    if (nowMs - lastRequestTimeMs < gracePeriodMs || currentTime > 60) {
      return currentTime;
    }
    return 0;
  }
  if (nowMs - lastRequestTimeMs < gracePeriodMs && syncTime < currentTime) {
    return currentTime;
  }
  if (syncTime > currentTime) {
    return syncTime;
  }
  if (currentTime > 60 && (currentTime - syncTime > 10)) {
    return currentTime;
  }
  return syncTime;
}

/**
 * 소켓 페이로드에서 연장 시간(seconds)을 안전하게 추출합니다.
 */
export function parseSeconds(payload: unknown, defaultSeconds: number = 60): number {
  if (!payload) return defaultSeconds;

  if (typeof payload === 'number' && !isNaN(payload) && payload > 0) {
    return payload;
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


