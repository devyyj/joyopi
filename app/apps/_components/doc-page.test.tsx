import { render, screen, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import DocPage, { type DocLocale } from './doc-page';

const ko: DocLocale = {
  lang: 'ko',
  title: '테스트앱 개인정보 처리방침',
  lead: '머리말입니다.',
  sections: [
    { id: 'collect', heading: '1. 모으는 정보', body: <p>모으지 않습니다.</p> },
    { id: 'contact', heading: '2. 문의', body: <p>메일로 문의해 주세요.</p> },
  ],
  effectiveDate: '2026-11-12',
  updatedDate: '2026-11-13',
};

const en: DocLocale = {
  lang: 'en',
  title: 'TestApp Privacy Policy',
  sections: [{ id: 'collect', heading: '1. Data we collect', body: <p>None.</p> }],
  effectiveDate: '2026-11-12',
  updatedDate: '2026-11-13',
};

describe('DocPage (앱 문서 공통 틀)', () => {
  it('제목·머리말·본문·시행일·최종 수정일·문의 메일을 표시한다', () => {
    render(<DocPage locales={[ko]} />);
    expect(screen.getByRole('heading', { level: 1, name: '테스트앱 개인정보 처리방침' })).toBeInTheDocument();
    expect(screen.getByText('머리말입니다.')).toBeInTheDocument();
    expect(screen.getByText('모으지 않습니다.')).toBeInTheDocument();
    expect(screen.getByText(/시행일/).textContent).toContain('2026-11-12');
    expect(screen.getByText(/최종 수정일/).textContent).toContain('2026-11-13');
    expect(screen.getAllByRole('link', { name: 'hello@joyopi.com' })[0]).toHaveAttribute(
      'href',
      'mailto:hello@joyopi.com',
    );
  });

  it('목차 링크가 각 절의 id와 맞는다', () => {
    const { container } = render(<DocPage locales={[ko]} />);
    const toc = screen.getByRole('navigation', { name: '목차' });
    const links = within(toc).getAllByRole('link');
    expect(links.map((a) => a.getAttribute('href'))).toEqual(['#ko-collect', '#ko-contact']);
    expect(container.querySelector('#ko-collect')).not.toBeNull();
    expect(container.querySelector('#ko-contact')).not.toBeNull();
  });

  it('언어가 하나면 언어 이동 링크를 두지 않는다', () => {
    render(<DocPage locales={[ko]} />);
    expect(screen.queryByRole('navigation', { name: 'Language' })).not.toBeInTheDocument();
  });

  it('언어가 여럿이면 맨 위에 언어 이동 링크를 두고, 언어마다 lang 속성이 있는 구역으로 나눈다', () => {
    const { container } = render(<DocPage locales={[ko, en]} />);
    const nav = screen.getByRole('navigation', { name: 'Language' });
    expect(within(nav).getByRole('link', { name: '한국어' })).toHaveAttribute('href', '#ko');
    expect(within(nav).getByRole('link', { name: 'English' })).toHaveAttribute('href', '#en');
    expect(container.querySelector('section#ko')).toHaveAttribute('lang', 'ko');
    expect(container.querySelector('section#en')).toHaveAttribute('lang', 'en');
    expect(container.querySelector('#en-collect')).not.toBeNull();
    expect(screen.getByText(/Effective date/).textContent).toContain('2026-11-12');
  });

  it('showBusinessInfo가 켜진 문서에만 사업자 정보를 붙인다', () => {
    const { unmount } = render(<DocPage locales={[ko]} />);
    expect(screen.queryByText('사업자등록번호')).not.toBeInTheDocument();
    unmount();
    render(<DocPage locales={[{ ...ko, showBusinessInfo: true }]} />);
    expect(screen.getByText('사업자등록번호')).toBeInTheDocument();
    expect(screen.getByText('180-21-02731')).toBeInTheDocument();
  });
});
