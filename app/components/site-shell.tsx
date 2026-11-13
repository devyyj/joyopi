import type { ReactNode } from 'react';
import { Geist, Geist_Mono } from 'next/font/google';
import type { Lang } from '@/app/_i18n/config';
import MainHeader from './main-header';
import SiteFooter from './site-footer';
import { DialogProvider } from './ui/dialog-provider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

/** 두 루트 레이아웃(언어별 `app/[lang]`, 한국어 전용 `app/(korean)`)이 `<html>`에 같이 붙이는 클래스 */
export const htmlClassName = `${geistSans.variable} ${geistMono.variable} h-full antialiased`;
export const bodyClassName = 'min-h-full flex flex-col bg-background text-foreground';

/** 헤더·본문·푸터. 루트 레이아웃의 `<body>` 안에 둔다. */
export default function SiteShell({ lang, children }: { lang: Lang; children: ReactNode }) {
  return (
    <DialogProvider>
      <MainHeader lang={lang} />
      <main className="flex-1">{children}</main>
      <SiteFooter lang={lang} />
    </DialogProvider>
  );
}
