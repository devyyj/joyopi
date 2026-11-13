import { render, screen, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SiteFooter from './site-footer';

describe('SiteFooter (공통 푸터)', () => {
  it('사업자 정보를 보여 준다', () => {
    render(<SiteFooter lang="ko" />);
    const footer = screen.getByRole('contentinfo');
    expect(within(footer).getByText('사업자등록번호')).toBeInTheDocument();
    expect(within(footer).getByText('180-21-02731')).toBeInTheDocument();
    expect(within(footer).getByText('통신판매업 신고번호')).toBeInTheDocument();
    expect(within(footer).getByRole('link', { name: 'hello@joyopi.com' })).toHaveAttribute(
      'href',
      'mailto:hello@joyopi.com',
    );
  });

  it('대표 메뉴와 약관·정책, 앱별 개인정보 처리방침 링크가 있다', () => {
    render(<SiteFooter lang="ko" />);
    const hrefs = screen.getAllByRole('link').map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual(
      expect.arrayContaining([
        '/ko/apps',
        '/about',
        '/news',
        '/support',
        '/policies',
        '/ko/apps/rockgazing/privacy',
        '/ko/apps/agirok/privacy',
      ]),
    );
  });

  it('영어·일본어: 사업자 정보와 메뉴를 그 언어로, 앱 링크는 그 언어 주소, 한국어 전용 페이지는 hreflang="ko"', () => {
    const { unmount } = render(<SiteFooter lang="en" />);
    expect(screen.getByText('Business registration no.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Apps' })).toHaveAttribute('href', '/en/apps');
    expect(screen.getByRole('link', { name: 'News' })).toHaveAttribute('hreflang', 'ko');
    expect(screen.getByRole('link', { name: 'Agirok Privacy Policy' })).toHaveAttribute('href', '/en/apps/agirok/privacy');
    unmount();

    render(<SiteFooter lang="ja" />);
    expect(screen.getByText('事業者登録番号')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'ベビろく プライバシーポリシー' })).toHaveAttribute('href', '/ja/apps/agirok/privacy');
  });

  it('에코 링크는 없다', () => {
    const { container } = render(<SiteFooter lang="ko" />);
    expect(container.innerHTML).not.toContain('/echo');
  });
});
