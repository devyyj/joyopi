import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import NavigationMenu from './navigation-menu';

const mockGetUser = vi.fn();
vi.mock('@/utils/supabase/client', () => ({
  createClient: () => ({ auth: { getUser: mockGetUser } }),
}));

const loginAs = (email: string | null) =>
  mockGetUser.mockResolvedValue({ data: { user: email ? { email } : null } });

const openMenu = () => fireEvent.click(screen.getByRole('button', { name: '메뉴 열기' }));

describe('NavigationMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    loginAs(null);
  });

  it('메뉴 이름은 "앱", "게시판", "에코" 순서로 표시한다', async () => {
    loginAs('devyyj@gmail.com');
    render(<NavigationMenu />);
    openMenu();
    await waitFor(() => expect(screen.getByText('에코')).toBeInTheDocument());
    const hrefs = screen.getAllByRole('link').map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual(['/', '/board', '/echo']);
    expect(screen.getByText('앱')).toBeInTheDocument();
    expect(screen.getByText('게시판')).toBeInTheDocument();
  });

  it('"연구소" 표현을 쓰지 않는다', () => {
    const { container } = render(<NavigationMenu />);
    openMenu();
    expect(container.textContent).not.toMatch(/연구소|연구원/);
  });

  it('에코는 허용된 계정에게만 보인다', async () => {
    render(<NavigationMenu />);
    openMenu();
    await waitFor(() => expect(mockGetUser).toHaveBeenCalled());
    expect(screen.getByText('게시판')).toBeInTheDocument();
    expect(screen.queryByText('에코')).not.toBeInTheDocument();
  });

  it('버튼과 펼침 창은 고정 색 대신 브랜드 색 변수를 쓴다 (다크 모드 대응)', () => {
    const { container } = render(<NavigationMenu />);
    const button = screen.getByRole('button', { name: '메뉴 열기' });
    fireEvent.click(button);
    const html = container.innerHTML;
    expect(html).not.toMatch(/bg-white|neutral-|#8B0000|indigo-|cyan-/);
    expect(button.className).toContain('border-border');
    expect(button.className).toContain('hover:border-primary');
  });

  it('펼침 창 머리글은 로고처럼 > 와 커서 _ 를 주황으로 표시한다', () => {
    render(<NavigationMenu />);
    openMenu();
    const header = screen.getByTestId('menu-header');
    expect(header.textContent).toBe('> menu_');
    expect(header.className).toContain('font-mono');
    const accents = header.querySelectorAll('.text-primary');
    expect([...accents].map((el) => el.textContent)).toEqual(['>', '_']);
  });
});
