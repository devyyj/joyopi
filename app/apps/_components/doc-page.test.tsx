import { render, screen, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import DocPage, { type DocLocale } from './doc-page';
import { hashTarget } from './legacy-hash-redirect';

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
    render(<DocPage doc={ko} />);
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

  it('목차 링크가 각 절의 id(`{lang}-{id}`, 예전 앵커와 같음)와 맞는다', () => {
    const { container } = render(<DocPage doc={ko} />);
    const toc = screen.getByRole('navigation', { name: '목차' });
    const links = within(toc).getAllByRole('link');
    expect(links.map((a) => a.getAttribute('href'))).toEqual(['#ko-collect', '#ko-contact']);
    expect(container.querySelector('#ko-collect')).not.toBeNull();
    expect(container.querySelector('#ko-contact')).not.toBeNull();
  });

  it('한 언어만 보여 주고, 그 언어 lang 속성 구역과 그 언어의 날짜 이름·앱 목록 링크를 쓴다', () => {
    const { container } = render(<DocPage doc={en} />);
    expect(container.querySelector('section#en')).toHaveAttribute('lang', 'en');
    expect(container.querySelectorAll('section[lang]')).toHaveLength(1);
    expect(screen.getByText(/Effective date/).textContent).toContain('2026-11-12');
    expect(screen.getByRole('link', { name: 'JOYOPI apps' })).toHaveAttribute('href', '/en/apps');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('페이지 언어와 본문 언어가 다르면(번역 준비 중) 맨 위에 페이지 언어로 안내 한 줄', () => {
    render(<DocPage doc={ko} pageLang="ja" />);
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('lang', 'ja');
    expect(status.textContent).toContain('韓国語版が正式');
    expect(screen.getByRole('link', { name: '조요피 앱 목록' })).toHaveAttribute('href', '/ja/apps');
  });
});

describe('hashTarget (예전 한 페이지 세 언어 앵커 → 그 언어 페이지)', () => {
  it.each([
    ['/en/apps/rockgazing/privacy', '#ja', 'en', '/ja/apps/rockgazing/privacy#ja'],
    ['/en/apps/rockgazing/privacy', '#ko-collect', 'en', '/ko/apps/rockgazing/privacy#ko-collect'],
    ['/ko/apps/rockgazing/support', '#en', 'ko', '/en/apps/rockgazing/support#en'],
  ] as const)('%s%s → %s', (path, hash, current, expected) => {
    expect(hashTarget(path, hash, current)).toBe(expected);
  });

  it.each([
    ['/ja/apps/rockgazing/privacy', '#ja', 'ja'],
    ['/ja/apps/rockgazing/privacy', '#ja-collect', 'ja'],
    ['/ja/apps/rockgazing/privacy', '', 'ja'],
    ['/ja/apps/rockgazing/privacy', '#faq', 'ja'],
    ['/ja/apps/rockgazing/privacy', '#english', 'ja'],
  ] as const)('%s%s 는 그대로', (path, hash, current) => {
    expect(hashTarget(path, hash, current)).toBeNull();
  });
});
