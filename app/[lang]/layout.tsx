import '../globals.css';
import type { Metadata } from 'next';
import { LANGS } from '@/app/_i18n/config';
import { resolveLang, type LangParams } from '@/app/_i18n/page';
import SiteShell, { bodyClassName, htmlClassName } from '@/app/components/site-shell';
import { getSiteMetadata } from '@/app/site-metadata';

// 앱 관련 페이지(/ko/…, /ja/…, /en/…)의 루트 레이아웃. <html lang>이 주소의 언어를 따른다.
// 언어 없는 예전 주소는 proxy.ts가 브라우저 언어로 골라 이리로 보낸다.
export { viewport } from '@/app/site-metadata';

export const dynamicParams = false;

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  return getSiteMetadata(await resolveLang(params));
}

export default async function LangRootLayout({ children, params }: LangParams & { children: React.ReactNode }) {
  const lang = await resolveLang(params);
  return (
    <html lang={lang} className={htmlClassName}>
      <body className={bodyClassName}>
        <SiteShell lang={lang}>{children}</SiteShell>
      </body>
    </html>
  );
}
