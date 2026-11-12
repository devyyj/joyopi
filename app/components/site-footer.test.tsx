import { render, screen, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SiteFooter from './site-footer';

describe('SiteFooter (공통 푸터)', () => {
  it('사업자 정보를 보여 준다', () => {
    render(<SiteFooter />);
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
    render(<SiteFooter />);
    const hrefs = screen.getAllByRole('link').map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual(
      expect.arrayContaining([
        '/apps',
        '/about',
        '/news',
        '/support',
        '/board',
        '/policies',
        '/apps/rockgazing/privacy',
        '/apps/agirok/privacy',
      ]),
    );
  });

  it('에코 링크는 없다', () => {
    const { container } = render(<SiteFooter />);
    expect(container.innerHTML).not.toContain('/echo');
  });
});
