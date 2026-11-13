import '../globals.css';
import SiteShell, { bodyClassName, htmlClassName } from '@/app/components/site-shell';
import { getSiteMetadata } from '@/app/site-metadata';

// 한국어로만 두는 페이지(소개·소식·지원·약관·정책·메아리)의 루트 레이아웃. 주소에 언어가 없다.
// 앱 관련 페이지는 app/[lang]/layout.tsx가 따로 루트 레이아웃이다(<html lang>을 언어별로 두려고).
export { viewport } from '@/app/site-metadata';
export const metadata = getSiteMetadata('ko');

export default function KoreanRootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className={htmlClassName}>
      <body className={bodyClassName}>
        <SiteShell lang="ko">{children}</SiteShell>
      </body>
    </html>
  );
}
