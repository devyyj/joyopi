import { render, screen, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LanguageSwitcher, { languageHref } from './language-switcher';

const mockPathname = vi.fn(() => '/ko');
vi.mock('next/navigation', () => ({ usePathname: () => mockPathname() }));

describe('LanguageSwitcher (언어 전환 링크)', () => {
  beforeEach(() => mockPathname.mockReturnValue('/ko'));

  it('같은 페이지의 세 언어 주소로 링크하고 지금 언어를 표시한다', () => {
    mockPathname.mockReturnValue('/ja/apps/agirok/support');
    render(<LanguageSwitcher lang="ja" label="言語" />);
    const nav = screen.getByRole('navigation', { name: '言語' });
    const links = within(nav).getAllByRole('link');
    expect(links.map((a) => a.textContent)).toEqual(['한국어', '日本語', 'English']);
    expect(links.map((a) => a.getAttribute('href'))).toEqual([
      '/ko/apps/agirok/support',
      '/ja/apps/agirok/support',
      '/en/apps/agirok/support',
    ]);
    expect(links.map((a) => a.getAttribute('hreflang'))).toEqual(['ko', 'ja', 'en']);
    expect(links[1]).toHaveAttribute('aria-current', 'true');
    expect(links[0]).not.toHaveAttribute('aria-current');
  });

  it('한국어로만 있는 페이지(언어 없는 주소)에서는 각 언어의 홈으로', () => {
    expect(languageHref('/news', 'en')).toBe('/en');
    expect(languageHref('/echo/speaker', 'ja')).toBe('/ja');
    expect(languageHref('/en', 'ko')).toBe('/ko');
  });
});
