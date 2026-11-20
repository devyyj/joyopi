// @vitest-environment node
import { describe, expect, it } from 'vitest';

import { nextRateState, RATE_WINDOW_MS } from './rate';

const T0 = new Date('2026-11-21T10:00:00Z');
const at = (ms: number) => new Date(T0.getTime() + ms);

describe('nextRateState', () => {
  it('기록이 없으면 새 창을 열고 1로 센다', () => {
    expect(nextRateState(undefined, T0, 5)).toEqual({ allowed: true, state: { windowStart: T0.getTime(), count: 1 } });
  });

  it('창 안에서는 한도까지 허용하고 넘으면 막는다(막힐 때 횟수는 늘리지 않는다)', () => {
    let state = nextRateState(undefined, T0, 3).state;
    state = nextRateState(state, at(1000), 3).state;
    const third = nextRateState(state, at(2000), 3);
    expect(third.allowed).toBe(true);
    const fourth = nextRateState(third.state, at(3000), 3);
    expect(fourth).toEqual({ allowed: false, state: third.state });
  });

  it('창이 지나면 다시 1부터 센다', () => {
    const full = { windowStart: T0.getTime(), count: 3 };
    expect(nextRateState(full, at(RATE_WINDOW_MS), 3)).toEqual({
      allowed: true,
      state: { windowStart: at(RATE_WINDOW_MS).getTime(), count: 1 },
    });
  });
});
