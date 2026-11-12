import type { Metadata, Viewport } from 'next';

// 로고 에셋 원본: apps/logo (joyopi 브랜드)
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

export const metadata: Metadata = {
  metadataBase: new URL('https://joyopi.com'),
  title: '조요피 (joyopi)',
  description: '조요피(JOYOPI)가 만드는 앱 — Rockgazing(돌멍타임), 아기록',
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
    title: '조요피 (joyopi)',
    description: '조요피(JOYOPI)가 만드는 앱 — Rockgazing(돌멍타임), 아기록',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'joyopi' }],
  },
};
