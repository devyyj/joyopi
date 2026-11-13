import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import { LANGS, LANG_NAMES, localePath } from '@/app/_i18n/config';
import SiteShell, { bodyClassName, htmlClassName } from '@/app/components/site-shell';

// 어느 경로에도 맞지 않는 주소의 404. 루트 레이아웃이 둘(언어별 app/[lang], 한국어 전용 app/(korean))이라
// 한 레이아웃으로 404를 만들 수 없어 Next.js의 global-not-found를 쓴다(next.config.ts experimental.globalNotFound).
// 주소에 언어가 없으니 세 언어로 같이 적는다.
export const metadata: Metadata = {
  title: '404 — joyopi',
  robots: { index: false },
};

const MESSAGES = [
  { lang: 'ko', text: '페이지를 찾을 수 없습니다.' },
  { lang: 'ja', text: 'ページが見つかりません。' },
  { lang: 'en', text: 'Page not found.' },
] as const;

export default function GlobalNotFound() {
  return (
    <html lang="ko" className={htmlClassName}>
      <body className={bodyClassName}>
        <SiteShell lang="ko">
          <div className="mx-auto w-full max-w-3xl px-4 py-16">
            <h1 className="text-2xl font-extrabold tracking-tight">404</h1>
            <ul className="mt-4 space-y-1 text-sm">
              {MESSAGES.map((m) => (
                <li key={m.lang} lang={m.lang}>
                  {m.text}
                </li>
              ))}
            </ul>
            <ul className="mt-6 flex flex-wrap gap-3 text-sm">
              {LANGS.map((lang) => (
                <li key={lang}>
                  <Link href={localePath(lang, '/')} hrefLang={lang} lang={lang} className="text-primary underline underline-offset-2">
                    {LANG_NAMES[lang]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </SiteShell>
      </body>
    </html>
  );
}
