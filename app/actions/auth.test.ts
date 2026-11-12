import { describe, it, expect, vi, type Mock } from 'vitest';
import { signInWithGoogle } from './auth';
import { headers } from 'next/headers';
import { createClient } from '@/utils/supabase/server';

vi.mock('next/headers', () => ({
  headers: vi.fn(),
}));

vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

describe('signInWithGoogle Server Action', () => {
  it('배포 환경에서 https 프로토콜과 호스트를 올바르게 조합하여 리다이렉트 주소를 생성해야 함', async () => {
    const mockHeaders = {
      get: vi.fn((key: string) => {
        if (key === 'host') return 'joyopi.vercel.app';
        return null;
      }),
    };
    (headers as Mock).mockResolvedValue(mockHeaders);

    const mockSupabase = {
      auth: {
        signInWithOAuth: vi.fn().mockResolvedValue({ data: { url: 'https://supabase.com/auth' } }),
      },
    };
    (createClient as Mock).mockResolvedValue(mockSupabase);

    await signInWithGoogle();

    expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({
          redirectTo: 'https://joyopi.vercel.app/auth/callback',
        }),
      })
    );
  });

  it('구글에는 식별자와 이메일만 요청한다 (profile 범위를 넣으면 실명·사진이 넘어온다)', async () => {
    (headers as Mock).mockResolvedValue({ get: vi.fn(() => 'joyopi.vercel.app') });

    const mockSupabase = {
      auth: {
        signInWithOAuth: vi.fn().mockResolvedValue({ data: { url: 'https://supabase.com/auth' } }),
      },
    };
    (createClient as Mock).mockResolvedValue(mockSupabase);

    await signInWithGoogle();

    const { options } = mockSupabase.auth.signInWithOAuth.mock.calls[0][0];
    expect(options.queryParams.scope).toBe('openid email');
    expect(options.scopes).toBeUndefined();
  });
});
