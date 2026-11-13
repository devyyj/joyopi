import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LANGS, isLang, localePath, type Lang } from './config';

/** `app/[lang]/…` 페이지·레이아웃이 받는 params */
export interface LangParams {
  params: Promise<{ lang: string }>;
}

/** params에서 언어를 꺼낸다. 지원하지 않는 언어면 404 */
export const resolveLang = async (params: LangParams['params']): Promise<Lang> => {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return lang;
};

/**
 * 언어별 페이지의 메타데이터. canonical은 지금 언어 주소, hreflang 대체 주소는 세 언어,
 * x-default는 언어 없는 주소(브라우저 언어로 보내 주는 주소)다.
 */
export const localizedMetadata = (
  lang: Lang,
  path: string,
  { title, description }: { title: string; description?: string },
): Metadata => ({
  title,
  ...(description ? { description } : {}),
  alternates: {
    canonical: localePath(lang, path),
    languages: {
      ...Object.fromEntries(LANGS.map((l) => [l, localePath(l, path)])),
      'x-default': path,
    },
  },
});
