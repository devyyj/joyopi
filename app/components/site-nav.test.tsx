import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SiteNav from './site-nav';

const mockPathname = vi.fn(() => '/');
vi.mock('next/navigation', () => ({ usePathname: () => mockPathname() }));

describe('SiteNav (대표 메뉴)', () => {
  beforeEach(() => {
    mockPathname.mockReturnValue('/');
  });

  it('대표 메뉴를 앱·소개·소식·지원 순서로 보여 준다 (문의 게시판 없음)', () => {
    render(<SiteNav />);
    const nav = screen.getByRole('navigation', { name: '주 메뉴' });
    const links = within(nav).getAllByRole('link');
    expect(links.map((a) => a.textContent)).toEqual(['앱', '소개', '소식', '지원']);
    expect(links.map((a) => a.getAttribute('href'))).toEqual(['/apps', '/about', '/news', '/support']);
  });

  it('에코는 메뉴에 없다 (주소를 아는 사람만 들어간다)', () => {
    const { container } = render(<SiteNav />);
    fireEvent.click(screen.getByRole('button', { name: '메뉴 열기' }));
    expect(container.innerHTML).not.toContain('/echo');
    expect(container.textContent).not.toMatch(/에코|메아리|연구소/);
  });

  it('지금 있는 메뉴에 aria-current 를 붙인다 (하위 경로 포함)', () => {
    mockPathname.mockReturnValue('/apps/rockgazing/privacy');
    render(<SiteNav />);
    const nav = screen.getByRole('navigation', { name: '주 메뉴' });
    expect(within(nav).getByRole('link', { name: '앱' })).toHaveAttribute('aria-current', 'page');
    expect(within(nav).getByRole('link', { name: '소개' })).not.toHaveAttribute('aria-current');
  });

  it('모바일 메뉴 버튼으로 펼치고, 메뉴를 고르면 닫힌다', () => {
    render(<SiteNav />);
    expect(screen.queryByRole('navigation', { name: '모바일 메뉴' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '메뉴 열기' }));
    const mobile = screen.getByRole('navigation', { name: '모바일 메뉴' });
    expect(within(mobile).getAllByRole('link').map((a) => a.getAttribute('href'))).toEqual([
      '/apps',
      '/about',
      '/news',
      '/support',
    ]);
    expect(screen.getByRole('button', { name: '메뉴 닫기' })).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(within(mobile).getByRole('link', { name: '소식' }));
    expect(screen.queryByRole('navigation', { name: '모바일 메뉴' })).not.toBeInTheDocument();
  });

  it('고정 색 대신 브랜드 색 변수를 쓴다 (다크 모드 대응)', () => {
    const { container } = render(<SiteNav />);
    fireEvent.click(screen.getByRole('button', { name: '메뉴 열기' }));
    expect(container.innerHTML).not.toMatch(/bg-white|neutral-|#8B0000|indigo-|cyan-/);
  });
});
