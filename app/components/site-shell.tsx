import type { ReactNode } from 'react';
import { Geist, Geist_Mono, Jua, M_PLUS_Rounded_1c, JetBrains_Mono } from 'next/font/google';
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

// 홈의 둥근 제목 글꼴: 한글은 Jua, 일본어는 M PLUS Rounded 1c. 글자 범위별로 나눠 받으므로 미리 받지 않는다
const jua = Jua({ weight: '400', subsets: ['latin'], variable: '--font-jua', preload: false });
const mplusRounded = M_PLUS_Rounded_1c({ weight: '700', subsets: ['latin'], variable: '--font-mplus-rounded', preload: false });
// 브랜드 프롬프트(`> hello_`)
const jetbrainsMono = JetBrains_Mono({ weight: '800', subsets: ['latin'], variable: '--font-jetbrains' });

/** 두 루트 레이아웃(언어별 `app/[lang]`, 한국어 전용 `app/(korean)`)이 `<html>`에 같이 붙이는 클래스 */
export const htmlClassName = `${geistSans.variable} ${geistMono.variable} ${jua.variable} ${mplusRounded.variable} ${jetbrainsMono.variable} h-full antialiased`;
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
