import { describe, it, expect, vi, beforeEach } from 'vitest';
import EchoLayout from './layout';

const mockGetUser = vi.fn();
const mockRedirect = vi.fn((path: string) => {
  throw new Error(`NEXT_REDIRECT:${path}`);
});

vi.mock('@/utils/supabase/server', () => ({
  createClient: async () => ({ auth: { getUser: mockGetUser } }),
}));

vi.mock('next/navigation', () => ({
  redirect: (path: string) => mockRedirect(path),
}));

const loginAs = (email: string | null) =>
  mockGetUser.mockResolvedValue({ data: { user: email ? { id: 'u', email } : null } });

describe('EchoLayout 접근 제어', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('허용된 계정이면 하위 페이지를 그대로 렌더링한다', async () => {
    loginAs('noticeably34@gmail.com');
    const result = await EchoLayout({ children: 'echo-page' });
    expect(result).toBe('echo-page');
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it('비로그인 사용자는 메인으로 리다이렉트한다', async () => {
    loginAs(null);
    await expect(EchoLayout({ children: 'echo-page' })).rejects.toThrow('NEXT_REDIRECT:/');
  });

  it('허용 목록에 없는 계정은 메인으로 리다이렉트한다', async () => {
    loginAs('stranger@gmail.com');
    await expect(EchoLayout({ children: 'echo-page' })).rejects.toThrow('NEXT_REDIRECT:/');
  });
});
