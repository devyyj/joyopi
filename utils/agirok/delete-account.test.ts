// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';

import { handleDeleteAccount } from './delete-account';

function deps(over: Partial<Parameters<typeof handleDeleteAccount>[1]> = {}) {
  return {
    verifyIdToken: vi.fn(async (token: string) => ({ uid: `uid-of-${token}` })),
    deleteUser: vi.fn(async () => {}),
    ...over,
  };
}

describe('handleDeleteAccount', () => {
  it('ID 토큰을 확인하고 그 사용자만 지운다', async () => {
    const d = deps();
    const res = await handleDeleteAccount('Bearer tok', d);
    expect(res.status).toBe(200);
    expect(d.verifyIdToken).toHaveBeenCalledWith('tok');
    expect(d.deleteUser).toHaveBeenCalledWith('uid-of-tok');
  });

  it('Authorization 헤더가 없거나 Bearer가 아니면 401이고 아무것도 지우지 않는다', async () => {
    for (const h of [null, '', 'tok', 'Basic tok', 'Bearer ']) {
      const d = deps();
      const res = await handleDeleteAccount(h, d);
      expect(res.status).toBe(401);
      expect(d.deleteUser).not.toHaveBeenCalled();
    }
  });

  it('토큰 확인이 실패하면(위조·만료·다른 프로젝트) 401이고 아무것도 지우지 않는다', async () => {
    const d = deps({
      verifyIdToken: vi.fn(async () => {
        throw Object.assign(new Error('expired'), { code: 'auth/id-token-expired' });
      }),
    });
    const res = await handleDeleteAccount('Bearer bad', d);
    expect(res.status).toBe(401);
    expect(d.deleteUser).not.toHaveBeenCalled();
  });

  it('이미 지워진 계정이면 성공으로 본다(다시 요청해도 안전)', async () => {
    const d = deps({
      deleteUser: vi.fn(async () => {
        throw Object.assign(new Error('gone'), { code: 'auth/user-not-found' });
      }),
    });
    const res = await handleDeleteAccount('Bearer tok', d);
    expect(res.status).toBe(200);
  });

  it('계정 삭제가 그 밖의 이유로 실패하면 500이다', async () => {
    const d = deps({
      deleteUser: vi.fn(async () => {
        throw Object.assign(new Error('boom'), { code: 'auth/internal-error' });
      }),
    });
    const res = await handleDeleteAccount('Bearer tok', d);
    expect(res.status).toBe(500);
  });
});
