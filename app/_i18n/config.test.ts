import { describe, it, expect } from 'vitest';
import { LEGACY_PATHS, isLegacyPath, localePath, pickLang, splitLocalePath } from './config';

describe('pickLang (Accept-Language로 언어 고르기)', () => {
  it.each([
    ['ko-KR,ko;q=0.9,en-US;q=0.8', 'ko'],
    ['ja,en-US;q=0.9', 'ja'],
    ['en-US,en;q=0.9', 'en'],
    ['fr-FR,fr;q=0.9', 'en'],
    ['fr-FR,ja;q=0.8', 'ja'],
    ['fr,en;q=0.9,ja;q=0.8', 'en'],
    ['en;q=0.5,ko;q=0.9', 'ko'],
    ['ko;q=0,ja', 'ja'],
    ['*', 'en'],
    ['', 'en'],
    [null, 'en'],
  ])('%s → %s', (header, expected) => {
    expect(pickLang(header)).toBe(expected);
  });
});

describe('주소 규칙', () => {
  it('언어 없는 경로에 언어를 붙인다', () => {
    expect(localePath('ja', '/')).toBe('/ja');
    expect(localePath('en', '/apps/agirok/privacy')).toBe('/en/apps/agirok/privacy');
  });

  it('언어 경로를 나눈다. 언어 경로가 아니면 null', () => {
    expect(splitLocalePath('/ja')).toEqual({ lang: 'ja', path: '/' });
    expect(splitLocalePath('/ko/')).toEqual({ lang: 'ko', path: '/' });
    expect(splitLocalePath('/en/apps/rockgazing')).toEqual({ lang: 'en', path: '/apps/rockgazing' });
    expect(splitLocalePath('/news')).toBeNull();
    expect(splitLocalePath('/')).toBeNull();
  });

  it('스토어에 등록한 9개 주소만 예전 주소로 본다', () => {
    expect(LEGACY_PATHS).toHaveLength(9);
    for (const path of ['/echo', '/news', '/about', '/policies', '/support', '/app-ads.txt', '/ko/apps', '/apps/unknown']) {
      expect(isLegacyPath(path)).toBe(false);
    }
  });
});
