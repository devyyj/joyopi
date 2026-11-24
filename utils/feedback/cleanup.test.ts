// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';

import { handleFeedbackCleanup } from './cleanup';

const NOW = new Date('2027-11-22T03:00:00Z');

describe('handleFeedbackCleanup', () => {
  it('CRON_SECRET이 없으면 지우지 않고 500', async () => {
    const deleteExpired = vi.fn(async () => 0);
    const res = await handleFeedbackCleanup('Bearer x', undefined, { deleteExpired, now: () => NOW });
    expect(res.status).toBe(500);
    expect(deleteExpired).not.toHaveBeenCalled();
  });

  it('인증 헤더가 맞지 않으면 401', async () => {
    const deleteExpired = vi.fn(async () => 0);
    for (const h of [null, 'Bearer wrong', 'secret']) {
      const res = await handleFeedbackCleanup(h, 'secret', { deleteExpired, now: () => NOW });
      expect(res.status).toBe(401);
    }
    expect(deleteExpired).not.toHaveBeenCalled();
  });

  it('맞으면 지금 시각 기준으로 만료 문서를 지우고 개수를 돌려준다', async () => {
    const deleteExpired = vi.fn(async () => 3);
    const res = await handleFeedbackCleanup('Bearer secret', 'secret', { deleteExpired, now: () => NOW });
    expect(deleteExpired).toHaveBeenCalledWith(NOW);
    expect(res).toEqual({ status: 200, body: { ok: true, deleted: 3 } });
  });

  it('지우다 실패하면 500', async () => {
    const res = await handleFeedbackCleanup('Bearer secret', 'secret', {
      deleteExpired: async () => { throw new Error('boom'); },
      now: () => NOW,
      log: () => {},
    });
    expect(res.status).toBe(500);
  });
});
