// 사이트 대표 메뉴 — 헤더와 푸터가 같이 쓴다.
// 에코(/echo)는 일부러 넣지 않는다. 주소를 아는 사람만 직접 들어간다.
// 문의는 메일로 받는다. 방법은 지원(/support)에 적는다.
// 앱은 언어별 주소(/{lang}/apps), 소개·소식·지원·약관·정책은 한국어 페이지(언어 없는 주소)다.
import { localePath, type Lang } from '@/app/_i18n/config';
import { getDictionary } from '@/app/_i18n/dictionary';
import { getApps } from '@/app/apps/_lib/apps';

export interface SiteLink {
  label: string;
  href: string;
  /** 링크한 페이지가 한국어로만 있으면 'ko' (hrefLang) */
  hrefLang?: Lang;
}

export const getNavItems = (lang: Lang): SiteLink[] => {
  const t = getDictionary(lang).nav;
  const ko = lang === 'ko' ? undefined : 'ko';
  return [
    { label: t.apps, href: localePath(lang, '/apps') },
    { label: t.about, href: '/about', hrefLang: ko },
    { label: t.news, href: '/news', hrefLang: ko },
    { label: t.support, href: '/support', hrefLang: ko },
  ];
};

export const getPolicyLinks = (lang: Lang): SiteLink[] => [
  { label: getDictionary(lang).footer.policies, href: '/policies', hrefLang: lang === 'ko' ? undefined : 'ko' },
  ...getApps(lang).map((app) => ({ label: `${app.name} ${app.privacy.label}`, href: app.privacy.href })),
];
