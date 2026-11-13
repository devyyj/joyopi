'use client';

import { usePathname } from 'next/navigation';
import { LANGS, LANG_NAMES, localePath, splitLocalePath, type Lang } from '@/app/_i18n/config';

/** 같은 페이지의 다른 언어 주소. 한국어로만 있는 페이지(언어 없는 주소)에서는 그 언어의 홈으로 보낸다. */
export const languageHref = (pathname: string, target: Lang): string => {
  const parts = splitLocalePath(pathname);
  return localePath(target, parts ? parts.path : '/');
};

/** 헤더의 언어 전환 링크(한국어 · 日本語 · English). 언어마다 전체 페이지를 새로 연다(루트 레이아웃이 언어별이라). */
export default function LanguageSwitcher({ lang, label }: { lang: Lang; label: string }) {
  const pathname = usePathname() ?? '/';
  return (
    <nav aria-label={label} className="flex items-center gap-0.5 text-xs">
      {LANGS.map((target) => (
        <a
          key={target}
          href={languageHref(pathname, target)}
          hrefLang={target}
          lang={target}
          aria-current={target === lang ? 'true' : undefined}
          className={`rounded-md px-1.5 py-1 font-bold whitespace-nowrap ${target === lang ? 'text-primary' : 'text-muted hover:text-primary'}`}
        >
          {LANG_NAMES[target]}
        </a>
      ))}
    </nav>
  );
}
