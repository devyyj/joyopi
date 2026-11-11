/**
 * 메아리 기기 간 동기화 규칙.
 * 기기마다 시계가 다를 수 있으므로 종료 시각(절대값)이 아니라 남은 시간(ms)을 주고받고,
 * 받은 쪽이 자기 시계 기준으로 종료 시각을 다시 계산한다.
 */

/** 스피커의 주기 동기화 간격. 그 사이는 각 기기가 자기 종료 시각으로 직접 카운트다운한다. */
export const SYNC_INTERVAL_MS = 10_000;
/** 내 요청 직후, 요청 전에 출발한 이전 패킷이 값을 되돌리지 못하게 막는 유예 시간 */
export const OWN_REQUEST_GRACE_MS = 2_000;
/** 스피커끼리 이 정도 차이는 같은 값으로 보고 무시한다 (서로 값을 주고받으며 흔들리는 것 방지) */
export const SPEAKER_SYNC_TOLERANCE_MS = 1_500;

export function endTimeFromRemaining(remainingMs: number, nowMs: number = Date.now()): number {
  return remainingMs > 0 ? nowMs + remainingMs : 0;
}

export function remainingMsOf(endTime: number, nowMs: number = Date.now()): number {
  if (!endTime || endTime <= 0) return 0;
  return Math.max(0, endTime - nowMs);
}

interface SenderSyncInput {
  localEndTime: number;
  remainingMs: number;
  lastRequestAt: number;
  nowMs?: number;
}

/** 샌더: 스피커가 알려준 값을 기준으로 삼되, 내 요청 직후 도착한 더 작은 값은 무시한다. */
export function resolveSenderEndTime({ localEndTime, remainingMs, lastRequestAt, nowMs = Date.now() }: SenderSyncInput): number {
  const synced = endTimeFromRemaining(remainingMs, nowMs);
  const withinGrace = nowMs - lastRequestAt < OWN_REQUEST_GRACE_MS;
  if (withinGrace && synced < localEndTime) return localEndTime;
  return synced;
}

interface SpeakerSyncInput {
  localEndTime: number;
  remainingMs: number;
  nowMs?: number;
}

/** 스피커: 재생 중이 아니면 다른 스피커 값을 따르고, 재생 중이면 확실히 더 클 때만 따른다. */
export function resolveSpeakerEndTime({ localEndTime, remainingMs, nowMs = Date.now() }: SpeakerSyncInput): number {
  const synced = endTimeFromRemaining(remainingMs, nowMs);
  if (localEndTime <= nowMs) return synced;
  return synced > localEndTime + SPEAKER_SYNC_TOLERANCE_MS ? synced : localEndTime;
}

/** 스피커가 여러 대일 때 재생·완료 로그는 사전순 첫 번째 스피커 한 대만 남긴다. */
export function isLogLeader(myId: string, speakerIds: string[]): boolean {
  if (speakerIds.length === 0) return true;
  return [...speakerIds].sort()[0] === myId;
}

/** 즉시 중지 직후, 중지 전에 출발한 동기화 패킷이 재생을 되살리지 못하게 막는 유예 시간 */
export const STOP_GRACE_MS = 2_000;

export function isWithinStopGrace(lastStopAt: number, nowMs: number = Date.now()): boolean {
  return lastStopAt > 0 && nowMs - lastStopAt < STOP_GRACE_MS;
}
