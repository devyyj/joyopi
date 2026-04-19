import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { getProfile, updateProfile } from './profile';
import { createClient } from '@/utils/supabase/server';
import { db } from '@/db';

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
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(),
      })),
    })),
    delete: vi.fn(() => ({
      where: vi.fn().mockResolvedValue({}),
    })),
  },
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

vi.mock('@/utils/supabase/admin', () => ({
  createAdminClient: vi.fn(),
}));

global.fetch = vi.fn().mockResolvedValue({ ok: true });

describe('Profile Actions', () => {
  const mockUser = { id: 'user-123' };
  const mockSession = { user: mockUser, provider_token: 'google-token-123' };

  beforeEach(() => {
    vi.clearAllMocks();
    (createClient as Mock).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
        getSession: vi.fn().mockResolvedValue({ data: { session: mockSession } }),
        signOut: vi.fn().mockResolvedValue({}),
      },
    });
  });

  it('should get profile for logged in user', async () => {
    const mockProfile = { id: 'user-123', nickname: 'test-user' };
    (db.query.profiles.findFirst as Mock).mockResolvedValue(mockProfile);

    const result = await getProfile();
    expect(result).toEqual(mockProfile);
  });

  it('should update profile nickname and bio', async () => {
    const formData = new FormData();
    formData.append('nickname', 'new-nickname');
    formData.append('bio', 'new-bio');

    await updateProfile(formData);
    expect(db.update).toHaveBeenCalled();
  });

  it('should throw error if nickname is missing', async () => {
    const formData = new FormData();
    formData.append('bio', 'new-bio');

    await expect(updateProfile(formData)).rejects.toThrow('닉네임을 입력해주세요.');
  });

  it('should delete account and revoke google token', async () => {
    const { deleteAccount } = await import('./profile');
    const { createAdminClient } = await import('@/utils/supabase/admin');
    
    (createAdminClient as Mock).mockResolvedValue({
      auth: {
        admin: {
          deleteUser: vi.fn().mockResolvedValue({ error: null }),
        },
      },
    });

    await deleteAccount();

    expect(createAdminClient).toHaveBeenCalled();
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('oauth2.googleapis.com/revoke'),
      expect.any(Object)
    );
    expect(db.delete).toHaveBeenCalled();
  });

  it('should throw error early if admin client cannot be created', async () => {
    const { deleteAccount } = await import('./profile');
    const { createAdminClient } = await import('@/utils/supabase/admin');
    
    (createAdminClient as Mock).mockRejectedValue(new Error('Config missing'));

    await expect(deleteAccount()).rejects.toThrow('서버 설정 오류로 회원 탈퇴를 완료할 수 없습니다.');
    expect(db.delete).not.toHaveBeenCalled();
  });
});
