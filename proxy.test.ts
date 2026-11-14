// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { unstable_doesMiddlewareMatch } from 'next/experimental/testing/server';
import { proxy, config } from './proxy';
import { LEGACY_PATHS } from '@/app/_i18n/config';

const request = (path: string, acceptLanguage?: string) =>
  new NextRequest(`https://joyopi.com${path}`, {
    headers: acceptLanguage ? { 'accept-language': acceptLanguage } : {},
  });

const LANG_HEADERS = [
  ['ko-KR,ko;q=0.9,en;q=0.8', 'ko'],
  ['ja-JP,ja;q=0.9', 'ja'],
  ['en-US,en;q=0.9', 'en'],
  ['fr-FR,fr;q=0.9', 'en'],
] as const;

describe('proxy (언어 없는 예전 주소 → /{lang}/…)', () => {
  const cases = LEGACY_PATHS.flatMap((path) => LANG_HEADERS.map(([header, lang]) => [path, header, lang] as const));

  it.each(cases)('%s + Accept-Language "%s" → /%s… 로 307', (path, header, lang) => {
    const res = proxy(request(path, header));
    expect(res.status).toBe(307);
    const location = new URL(res.headers.get('location') ?? '');
    expect(location.pathname).toBe(path === '/' ? `/${lang}` : `/${lang}${path}`);
    expect(res.headers.get('vary')).toContain('Accept-Language');
  });

  it('Accept-Language가 없으면 영어', () => {
    const res = proxy(request('/apps/agirok/support'));
    expect(new URL(res.headers.get('location') ?? '').pathname).toBe('/en/apps/agirok/support');
  });

  it('쿼리 문자열은 그대로 넘긴다', () => {
    const res = proxy(request('/apps/rockgazing/privacy?from=store', 'ja'));
    const location = new URL(res.headers.get('location') ?? '');
    expect(location.pathname + location.search).toBe('/ja/apps/rockgazing/privacy?from=store');
  });

  it('matcher 목록이 LEGACY_PATHS와 같다(한쪽만 고치지 않게)', () => {
    expect(config.matcher).toEqual([...LEGACY_PATHS]);
  });

  it('matcher는 10개 예전 주소에만 걸린다', () => {
    for (const path of LEGACY_PATHS) {
      expect(unstable_doesMiddlewareMatch({ config, url: path })).toBe(true);
    }
    for (const path of ['/echo', '/echo/speaker', '/news', '/about', '/policies', '/support', '/app-ads.txt', '/ko', '/ja/apps', '/favicon.ico', '/api/x']) {
      expect(unstable_doesMiddlewareMatch({ config, url: path })).toBe(false);
    }
  });

  it('matcher 밖 주소가 들어와도 리다이렉트하지 않는다', () => {
    for (const path of ['/echo', '/news', '/app-ads.txt']) {
      const res = proxy(request(path, 'ja'));
      expect(res.headers.get('location')).toBeNull();
      expect(res.status).toBe(200);
    }
  });
});
