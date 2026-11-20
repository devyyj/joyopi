/** 의견 전송 횟수 제한: 한 시간 창마다 기기 5번, IP 20번(같은 와이파이의 여러 사람을 생각해 IP는 넉넉히) */
export const RATE_WINDOW_MS = 60 * 60 * 1000;
export const DEVICE_LIMIT = 5;
export const IP_LIMIT = 20;

export type RateState = { windowStart: number; count: number };

/** 이전 상태와 지금 시각으로 이번 전송을 허용할지와 새 상태를 정한다. 막힐 때는 횟수를 늘리지 않는다 */
export function nextRateState(prev: RateState | undefined, now: Date, limit: number): { allowed: boolean; state: RateState } {
  const t = now.getTime();
  if (!prev || t - prev.windowStart >= RATE_WINDOW_MS) return { allowed: true, state: { windowStart: t, count: 1 } };
  if (prev.count >= limit) return { allowed: false, state: prev };
  return { allowed: true, state: { windowStart: prev.windowStart, count: prev.count + 1 } };
}
