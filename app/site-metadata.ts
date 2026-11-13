import type { Metadata, Viewport } from 'next';
import type { Lang } from '@/app/_i18n/config';
import { getDictionary } from '@/app/_i18n/dictionary';

// 로고 에셋 원본: apps/business/logo (joyopi 브랜드)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F5F2EA' },
    { media: '(prefers-color-scheme: dark)', color: '#161513' },
  ],
};

const OG_LOCALES: Record<Lang, string> = { ko: 'ko_KR', ja: 'ja_JP', en: 'en_US' };

/** 사이트 기본 메타데이터(언어별). 페이지가 title·description·alternates를 덮어쓴다. */
export const getSiteMetadata = (lang: Lang): Metadata => {
  const { title, description } = getDictionary(lang).site;
  return {
    metadataBase: new URL('https://joyopi.com'),
    title,
    description,
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: '48x48' },
        { url: '/favicon.svg', type: 'image/svg+xml' },
      ],
      shortcut: '/favicon.ico',
      apple: '/apple-touch-icon.png',
    },
    manifest: '/site.webmanifest',
    openGraph: {
      title,
      description,
      locale: OG_LOCALES[lang],
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'joyopi' }],
    },
  };
};
