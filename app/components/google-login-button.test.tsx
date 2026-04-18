import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { createClient } from '@/utils/supabase/client';

// Supabase 클라이언트 모킹
vi.mock('@/utils/supabase/client', () => ({
  createClient: vi.fn(),
}));

describe('GoogleLogin Logic', () => {
  const mockSignInWithOAuth = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (createClient as Mock).mockReturnValue({
      auth: {
        signInWithOAuth: mockSignInWithOAuth,
      },
    });
  });

  it('Supabase 클라이언트가 올바른 파라미터로 signInWithOAuth를 호출해야 함', async () => {
    const supabase = createClient();
    const redirectTo = 'http://localhost:3000/auth/callback';

    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
      },
    });

    expect(mockSignInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:3000/auth/callback',
      },
    });
  });
});
