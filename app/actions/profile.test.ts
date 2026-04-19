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
    formData.append('nickname', 'new-nick');
    formData.append('bio', 'new-bio');

    const result = await updateProfile(formData);
    expect(db.update).toHaveBeenCalled();
    expect(result.success).toBe(true);
  });

  it('should fail if nickname is too long', async () => {
    const formData = new FormData();
    formData.append('nickname', 'a'.repeat(11));
    formData.append('bio', 'valid');

    const result = await updateProfile(formData);
    expect(result.success).toBe(false);
    expect(result.message).toContain('최대 10자');
  });

  it('should fail if bio is too long', async () => {
    const formData = new FormData();
    formData.append('nickname', 'nick');
    formData.append('bio', 'a'.repeat(101));

    const result = await updateProfile(formData);
    expect(result.success).toBe(false);
    expect(result.message).toContain('최대 100자');
  });

  it('should delete account via edge function', async () => {
    const { deleteAccount } = await import('./profile');
    
    // Supabase client의 functions.invoke 모킹
    const mockInvoke = vi.fn().mockResolvedValue({ data: { message: 'success' }, error: null });
    (createClient as Mock).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
        getSession: vi.fn().mockResolvedValue({ data: { session: mockSession } }),
        signOut: vi.fn().mockResolvedValue({}),
      },
      functions: {
        invoke: mockInvoke,
      },
    });

    await deleteAccount();

    expect(mockInvoke).toHaveBeenCalledWith('withdraw-user', {
      body: { googleToken: 'google-token-123' }
    });
  });
});
