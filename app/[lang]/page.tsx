import type { Metadata } from 'next';
import Link from 'next/link';
import { localePath } from '@/app/_i18n/config';
import { getDictionary } from '@/app/_i18n/dictionary';
import { localizedMetadata, resolveLang, type LangParams } from '@/app/_i18n/page';
import AppCard from '@/app/apps/_components/app-card';
import { getApps } from '@/app/apps/_lib/apps';
import { getNews } from '@/app/(korean)/news/_lib/news';

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const lang = await resolveLang(params);
  const { title, description } = getDictionary(lang).site;
  return localizedMetadata(lang, '/', { title, description });
}

// 홈 — 조요피의 사이트 첫 화면. 조요피는 회사가 아니라 사람(온라인 활동명)으로 소개한다. 스토어의 「개발자 웹사이트」로 쓰인다.
// 소식·지원(회사)은 한국어 페이지라 언어 없는 주소로 링크한다.
export default async function Home({ params }: LangParams) {
  const lang = await resolveLang(params);
  const t = getDictionary(lang).home;
  const koOnly = lang === 'ko' ? undefined : 'ko';
  const latestNews = getNews().slice(0, 3);

  return (
    <div className="mx-auto w-full max-w-5xl px-4">
      <section className="py-12 md:py-20">
        <p className="font-mono text-xs font-bold text-primary">JOYOPI</p>
        <h1 className="mt-3 text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
          {t.greeting[0]}
          <br />
          {t.greeting[1]}
        </h1>
        <p className="mt-4 max-w-xl text-sm md:text-base text-muted leading-relaxed">{t.intro}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={localePath(lang, '/apps')} className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground">
            {t.viewApps}
          </Link>
          <Link href="/support" hrefLang={koOnly} className="rounded-full border border-border bg-card px-5 py-2 text-sm font-bold hover:border-primary">
            {t.support}
          </Link>
        </div>
      </section>

      <section aria-label={t.appsAria} className="pb-12">
        <div className="grid gap-4 md:grid-cols-2">
          {getApps(lang).map((app) => (
            <AppCard key={app.slug} app={app} lang={lang} />
          ))}
        </div>
      </section>

      <section className="grid gap-4 pb-16 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-baseline justify-between">
            <h2 className="text-base font-bold">{t.news}</h2>
            <Link href="/news" hrefLang={koOnly} className="text-xs text-primary underline underline-offset-2">
              {t.seeAll}
            </Link>
          </div>
          {t.newsKoreanOnly && <p className="mt-1 text-xs text-muted">{t.newsKoreanOnly}</p>}
          <ul lang="ko" className="mt-3 space-y-3 text-sm">
            {latestNews.map((item) => (
              <li key={item.date + item.title}>
                <time dateTime={item.date} className="block text-xs text-muted">
                  {item.date}
                </time>
                {item.title}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="text-base font-bold">{t.contact}</h2>
          <p className="mt-3 text-sm leading-relaxed">{t.contactBody}</p>
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <li>
              <Link href="/support" hrefLang={koOnly} className="text-primary underline underline-offset-2">
                {t.supportFaq}
              </Link>
            </li>
            <li>
              <a href="mailto:hello@joyopi.com" className="text-primary underline underline-offset-2">
                hello@joyopi.com
              </a>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
