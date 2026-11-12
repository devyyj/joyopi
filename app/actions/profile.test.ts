import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import * as profileActions from './profile';
import { getProfile, deleteAccount } from './profile';
import { createClient } from '@/utils/supabase/server';
import { db } from '@/db';
import { redirect } from 'next/navigation';

vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(),
}));

vi.mock('@/db', () => ({
  db: {
    query: {
      profiles: {
        findFirst: vi.fn(),
      },
    },
  },
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

describe('Profile Actions', () => {
  const mockUser = { id: 'user-123' };
  const mockSession = { user: mockUser, provider_token: 'google-token-123' };

  function mockClient(overrides: {
    user?: unknown;
    session?: unknown;
    sessionError?: unknown;
    invoke?: Mock;
    signOut?: Mock;
  } = {}) {
    const client = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: 'user' in overrides ? overrides.user : mockUser } }),
        getSession: vi.fn().mockResolvedValue({
          data: { session: 'session' in overrides ? overrides.session : mockSession },
          error: overrides.sessionError ?? null,
        }),
        signOut: overrides.signOut ?? vi.fn().mockResolvedValue({}),
      },
      functions: {
        invoke: overrides.invoke ?? vi.fn().mockResolvedValue({ data: { success: true }, error: null }),
      },
    };
    (createClient as Mock).mockResolvedValue(client);
    return client;
  }

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('프로필 수정·공개 프로필 조회 액션은 없다 (닉네임·자기소개·사진을 받지 않는다)', () => {
    expect(profileActions).not.toHaveProperty('updateProfile');
    expect(profileActions).not.toHaveProperty('getPublicProfile');
  });

  describe('getProfile', () => {
    it('로그인한 사용자의 프로필을 돌려준다', async () => {
      mockClient();
      const mockProfile = { id: 'user-123', nickname: 'test-user' };
      (db.query.profiles.findFirst as Mock).mockResolvedValue(mockProfile);

      expect(await getProfile()).toEqual(mockProfile);
    });

    it('로그인하지 않았으면 null 을 돌려주고 DB 를 읽지 않는다', async () => {
      mockClient({ user: null });

      expect(await getProfile()).toBeNull();
      expect(db.query.profiles.findFirst).not.toHaveBeenCalled();
    });

    it('DB 오류가 나면 null 을 돌려준다', async () => {
      mockClient();
      (db.query.profiles.findFirst as Mock).mockRejectedValue(new Error('db down'));

      expect(await getProfile()).toBeNull();
    });
  });

  describe('deleteAccount', () => {
    it('Edge Function 으로 탈퇴하고 로그아웃한 뒤 홈으로 보낸다', async () => {
      const client = mockClient();

      await deleteAccount();

      expect(client.functions.invoke).toHaveBeenCalledWith('withdraw-user', {
        body: { googleToken: 'google-token-123' },
      });
      expect(client.auth.signOut).toHaveBeenCalled();
      expect(redirect).toHaveBeenCalledWith('/');
    });

    it('세션이 없으면 실패를 돌려주고 탈퇴를 호출하지 않는다', async () => {
      const client = mockClient({ session: null });

      const result = await deleteAccount();

      expect(result).toEqual({ success: false, message: '로그인 세션이 만료되었습니다.' });
      expect(client.functions.invoke).not.toHaveBeenCalled();
    });

    it('세션 조회에 오류가 있으면 실패를 돌려준다', async () => {
      const client = mockClient({ sessionError: new Error('session error') });

      const result = await deleteAccount();

      expect(result.success).toBe(false);
      expect(client.functions.invoke).not.toHaveBeenCalled();
    });

    it('Edge Function 이 실패하면 로그아웃하지 않고 실패를 돌려준다', async () => {
      const client = mockClient({
        invoke: vi.fn().mockResolvedValue({ data: null, error: new Error('boom') }),
      });

      const result = await deleteAccount();

      expect(result).toEqual({ success: false, message: '회원 탈퇴 처리 중 오류가 발생했습니다.' });
      expect(client.auth.signOut).not.toHaveBeenCalled();
      expect(redirect).not.toHaveBeenCalled();
    });

    it('예상하지 못한 예외가 나면 실패를 돌려준다', async () => {
      mockClient({ invoke: vi.fn().mockRejectedValue(new Error('network')) });

      const result = await deleteAccount();

      expect(result).toEqual({ success: false, message: '탈퇴 처리 중 예상치 못한 오류가 발생했습니다.' });
    });
  });
});
