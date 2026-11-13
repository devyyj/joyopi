'use client';

import { useEffect } from 'react';
import { isLang, splitLocalePath, type Lang } from '@/app/_i18n/config';

/**
 * 예전 주소의 언어 앵커를 그 언어 페이지로 넘긴다.
 * 돌보기 문서는 한 페이지에 세 언어가 있어 `/apps/rockgazing/privacy#ja`, `#en-collect` 같은 링크가 밖에 있을 수 있다.
 * 앵커는 서버로 오지 않아 리다이렉트로 못 고르므로, 도착한 페이지에서 앵커의 언어가 다르면 그 언어 주소로 바꾼다.
 */
export const hashTarget = (pathname: string, hash: string, current: Lang): string | null => {
  const match = /^#(ko|ja|en)(?:-|$)/.exec(hash);
  if (!match || !isLang(match[1]) || match[1] === current) return null;
  const parts = splitLocalePath(pathname);
  if (!parts) return null;
  return `/${match[1]}${parts.path === '/' ? '' : parts.path}${hash}`;
};

export default function LegacyHashRedirect({ lang }: { lang: Lang }) {
  useEffect(() => {
    // 이 페이지에 그 앵커가 있으면(한국어 본문을 보여 주는 번역 준비 중 페이지의 목차 등) 그대로 둔다
    if (document.getElementById(decodeURIComponent(window.location.hash.slice(1)))) return;
    const target = hashTarget(window.location.pathname, window.location.hash, lang);
    if (target) window.location.replace(target);
  }, [lang]);
  return null;
}
