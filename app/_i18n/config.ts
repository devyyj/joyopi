// 사이트 언어 설정 — 주소 규칙과 언어 고르기를 한곳에 둔다. (docs/03_앱_스토어_페이지.md 10장)
// 앱 관련 페이지는 /ko/…, /ja/…, /en/… 로 나뉜다. 메아리·소식·소개·약관·회사 지원은 한국어만이고 주소에 언어가 없다.

export const LANGS = ['ko', 'ja', 'en'] as const;
export type Lang = (typeof LANGS)[number];

/** 한국어·일본어가 아닌 브라우저는 영어로 보낸다 */
export const FALLBACK_LANG: Lang = 'en';

/** 언어 전환 링크에 그 언어 자신의 이름으로 적는다 */
export const LANG_NAMES: Record<Lang, string> = { ko: '한국어', ja: '日本語', en: 'English' };

export const isLang = (value: string | undefined | null): value is Lang =>
  typeof value === 'string' && (LANGS as readonly string[]).includes(value);

/** 언어 없는 경로(`/`, `/apps/...`)에 언어를 붙인다 */
export const localePath = (lang: Lang, path: string): string => (path === '/' ? `/${lang}` : `/${lang}${path}`);

/** `/ja/apps/agirok` → `{ lang: 'ja', path: '/apps/agirok' }`. 언어 경로가 아니면 null */
export const splitLocalePath = (pathname: string): { lang: Lang; path: string } | null => {
  const [, first, ...rest] = pathname.split('/');
  if (!isLang(first)) return null;
  return { lang: first, path: rest.length === 0 || (rest.length === 1 && rest[0] === '') ? '/' : `/${rest.join('/')}` };
};

/**
 * 스토어에 등록한 언어 없는 주소. 계속 열려야 해서, 들어오면 브라우저 언어의 `/{lang}/…`로 임시 리다이렉트(307)한다.
 * 새 언어별 페이지를 만들 때 예전 주소가 이미 밖에 퍼져 있으면 여기와 proxy.ts의 matcher에 함께 더한다.
 */
export const LEGACY_PATHS = [
  '/',
  '/apps',
  '/apps/rockgazing',
  '/apps/rockgazing/privacy',
  '/apps/rockgazing/support',
  '/apps/agirok',
  '/apps/agirok/privacy',
  '/apps/agirok/support',
  '/apps/agirok/delete-account',
  '/apps/agirok/terms',
] as const;

export const isLegacyPath = (pathname: string): boolean => (LEGACY_PATHS as readonly string[]).includes(pathname);

/**
 * `Accept-Language`에서 사이트 언어를 고른다. 선호도(q)가 높은 순서로 보고 ko·ja·en 중 처음 나오는 것을 쓴다.
 * 셋 다 없으면 영어. 예) `fr-FR,ja;q=0.8` → ja, `fr` → en, `ko-KR` → ko
 */
export const pickLang = (acceptLanguage: string | null | undefined): Lang => {
  if (!acceptLanguage) return FALLBACK_LANG;
  const ranked = acceptLanguage
    .split(',')
    .map((part, index) => {
      const [tag, ...params] = part.trim().split(';');
      const qParam = params.map((p) => p.trim()).find((p) => p.startsWith('q='));
      const q = qParam ? Number.parseFloat(qParam.slice(2)) : 1;
      return { base: tag.trim().toLowerCase().split('-')[0], q: Number.isNaN(q) ? 0 : q, index };
    })
    .filter((entry) => entry.q > 0)
    .sort((a, b) => b.q - a.q || a.index - b.index);
  return ranked.find((entry) => isLang(entry.base))?.base as Lang | undefined ?? FALLBACK_LANG;
};
