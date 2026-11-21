import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Play } from 'lucide-react';
import { getDictionary } from '@/app/_i18n/dictionary';
import { localizedMetadata, resolveLang, type LangParams } from '@/app/_i18n/page';
import { getApps, type AppEntry } from '@/app/apps/_lib/apps';
import { getInflearnProfile, getYoutubeHighlights } from '@/app/_data/external';
import { getHomeNews } from '@/app/_data/home-news';
import FeedbackButton from '@/app/components/feedback/feedback-dialog';
import { feedbackTargets } from '@/app/components/feedback/targets';
import { YOUTUBE_CHANNEL_URL } from '@/utils/youtube/feed';
import { fallbackCourses, inflearnProfileUrl } from '@/utils/inflearn/profile';

// 유튜브 최근 영상을 1시간마다 새로 반영한다(인프런 숫자는 app/_data/external.ts에서 하루 한 번).
export const revalidate = 3600;

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const lang = await resolveLang(params);
  const { title, description } = getDictionary(lang).site;
  return localizedMetadata(lang, '/', { title, description });
}

/** 앱마다 타일 색. 앱 아이콘과 어울리게 고른다 */
const APP_TILE: Record<string, { tile: string; text: string; sub: string; badge: string; button: string }> = {
  rockgazing: { tile: 'bg-[#2C3550]', text: 'text-[#F5F2EA]', sub: 'text-[#DDD6C8]', badge: 'bg-white/15', button: 'bg-[#F5F2EA] text-[#1B1B1B]' },
  ssamkejul: { tile: 'bg-[#FFE3CF]', text: 'text-[#1B1B1B]', sub: 'text-[#3E3933]', badge: 'bg-white', button: 'bg-[#1B1B1B] text-[#F5F2EA]' },
  agirok: { tile: 'bg-[#E3EEF8]', text: 'text-[#1B1B1B]', sub: 'text-[#3E3933]', badge: 'bg-white', button: 'bg-[#1B1B1B] text-[#F5F2EA]' },
  likeloop: { tile: 'bg-[#EEE6FA]', text: 'text-[#1B1B1B]', sub: 'text-[#3E3933]', badge: 'bg-white', button: 'bg-[#1B1B1B] text-[#F5F2EA]' },
};

const pill = 'inline-flex min-h-11 items-center rounded-full px-[18px] text-[15px]';

function AppTile({ app, t }: { app: AppEntry; t: ReturnType<typeof getDictionary>['home'] }) {
  const c = APP_TILE[app.slug] ?? APP_TILE.agirok;
  const badge = app.appStoreUrl ? t.badgeStore : app.upcoming === 'polishing' ? t.badgePolishing : t.badgeSoon;
  return (
    <article className={`flex min-h-[290px] flex-col gap-2.5 rounded-[32px] p-6 ${c.tile} ${c.text}`}>
      <span className={`self-start rounded-full px-3 py-1.5 text-[13px] ${c.badge}`}>{badge}</span>
      <div className="flex flex-1 items-center justify-center py-2">
        <Image src={app.icon} alt="" width={88} height={88} className="h-[88px] w-[88px] rounded-[22px] shadow-[0_6px_16px_rgba(27,27,27,.18)]" />
      </div>
      <h2 className="font-display text-[26px] leading-tight">
        <Link href={app.href} className="hover:underline underline-offset-4">
          {app.name}
        </Link>
      </h2>
      <p className={`text-[15px] leading-relaxed ${c.sub}`}>{app.description}</p>
      {app.appStoreUrl ? (
        <a href={app.appStoreUrl} className={`${pill} self-start ${c.button}`}>
          {t.getApp}
        </a>
      ) : (
        <Link href={app.href} className="inline-flex min-h-11 items-center self-start text-[15px] underline-offset-4 hover:underline">
          {t.details} →
        </Link>
      )}
    </article>
  );
}

// 홈 — 조요피는 회사가 아니라 사람(온라인 활동명)으로 소개한다. 스토어의 「개발자 웹사이트」로 쓰인다.
// 앱·유튜브·인프런 강의·새 소식·의견 보내기를 둥근 타일로 한 화면에 모은다(2026-11-22 시안 C).
export default async function Home({ params }: LangParams) {
  const lang = await resolveLang(params);
  const dict = getDictionary(lang);
  const t = dict.home;
  // 받을 수 있는 앱(App Store)을 먼저
  const apps = [...getApps(lang)].sort((a, b) => Number(!a.appStoreUrl) - Number(!b.appStoreUrl));
  const [youtube, inflearn] = await Promise.all([getYoutubeHighlights(), getInflearnProfile(lang)]);
  const courses = inflearn?.courses ?? fallbackCourses(lang);
  const news = getHomeNews(lang);

  return (
    <div className="mx-auto w-full max-w-[1160px] px-4 pb-12 pt-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        {/* 인사 */}
        <section className="col-span-full flex flex-wrap items-end justify-between gap-7 rounded-[36px] bg-[#1B1B1B] p-6 text-[#F5F2EA] sm:p-10 lg:p-[52px] dark:ring-1 dark:ring-white/10">
          <div className="min-w-0 flex-[999_1_420px]">
            <p aria-hidden="true" className="font-brand text-base font-extrabold text-[#FF8A3D]">
              &gt; hello_
            </p>
            <h1 className={`mt-4 font-display text-[32px] leading-[1.15] min-[400px]:text-[36px] ${t.title[1].length > 10 ? 'sm:text-[44px] lg:text-[52px]' : 'sm:text-[56px] lg:text-[64px]'}`}>
              {t.title[0]}
              <br />
              {t.title[1]}
              <span aria-hidden="true" className="cursor-blink ml-[0.12em] inline-block h-[0.12em] w-[0.5em] bg-[#E8590C]" />
            </h1>
            <p className="mt-4 max-w-[520px] text-[17px] leading-relaxed text-[#DDD6C8]">{t.intro}</p>
          </div>
          <ul aria-label={t.statsAria} className="grid flex-[1_1_300px] grid-cols-3 gap-2.5">
            {[
              [apps.length, t.statApps],
              [courses.length, t.statCourses],
              [1, t.statMaker],
            ].map(([n, label]) => (
              <li key={label} className="rounded-[22px] bg-[#2A2825] px-2 py-4 text-center">
                <span className="block font-display text-3xl text-[#FF8A3D]">{n}</span>
                <span className="whitespace-nowrap text-[13px] text-[#DDD6C8]">{label}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* 앱 */}
        {apps.map((app) => (
          <AppTile key={app.slug} app={app} t={t} />
        ))}

        {/* 유튜브 */}
        <section id="youtube" className="col-span-full flex scroll-mt-20 flex-col gap-4 rounded-[32px] bg-[#E8590C] p-6 text-[#1B1B1B] lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <span aria-hidden="true" className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-[20px] bg-[#1B1B1B]">
                <Play className="h-6 w-6 fill-[#E8590C] text-[#E8590C]" />
              </span>
              <div>
                <h2 className="font-display text-[30px] leading-tight">{t.youtube}</h2>
                <p className="mt-0.5 text-[15px]">{t.youtubeLead}</p>
              </div>
            </div>
            <a href={YOUTUBE_CHANNEL_URL} className={`${pill} bg-[#1B1B1B] text-[#F5F2EA]`}>
              {t.channel}
            </a>
          </div>
          {youtube?.latest ? (
            <a href={youtube.latest.url} className="block rounded-[22px] bg-[#FFF4EC] p-2.5 hover:bg-white">
              <span className="relative block aspect-video overflow-hidden rounded-[14px] bg-[#3A2A20]">
                <Image src={youtube.latest.thumbnail} alt="" fill sizes="(min-width: 1024px) 520px, 100vw" className="object-cover" />
              </span>
              <span className="flex justify-between gap-3 px-1.5 pb-1 pt-3">
                <span className="text-base leading-snug">{youtube.latest.title}</span>
                <span className="shrink-0 text-[13px] text-[#6A4A36]">{t.published(youtube.latest.published)}</span>
              </span>
            </a>
          ) : null}
          {youtube && youtube.shorts.length > 0 ? (
            <>
              <h3 className="mt-1 text-sm font-bold">{t.latestShorts}</h3>
              <ul className="grid grid-cols-3 gap-2.5">
                {youtube.shorts.map((v) => (
                  <li key={v.id}>
                    <a href={v.url} className="group block">
                      <span className="relative block aspect-[9/14] overflow-hidden rounded-2xl bg-[#3A2A20]">
                        <Image src={v.thumbnail} alt="" fill sizes="(min-width: 1024px) 170px, 33vw" className="object-cover transition-transform group-hover:scale-105" />
                      </span>
                      <span className="mt-1.5 line-clamp-2 block text-[13px] leading-snug">{v.title}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
          {!youtube?.latest && !youtube?.shorts.length ? <p className="text-[15px]">{t.youtubeEmpty}</p> : null}
          {t.koreanContent ? <p className="mt-auto text-[13px] text-[#4A2A14]">{t.koreanContent}</p> : null}
        </section>

        {/* 인프런 강의 */}
        <section id="courses" className="col-span-full flex scroll-mt-20 flex-col gap-4 rounded-[32px] bg-[#CFE8DC] p-6 text-[#1B1B1B] lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <span aria-hidden="true" className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-[20px] bg-white">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 5h6a3 3 0 0 1 3 3v11a2 2 0 0 0-2-2H4z" />
                  <path d="M20 5h-6a3 3 0 0 0-3 3v11a2 2 0 0 1 2-2h7z" />
                </svg>
              </span>
              <div>
                <h2 className="font-display text-[30px] leading-tight">{t.courses}</h2>
                {inflearn ? <p className="mt-0.5 text-[15px]">{t.courseStats(inflearn.stats.students, inflearn.stats.rating, inflearn.stats.reviews)}</p> : null}
              </div>
            </div>
            <a href={inflearnProfileUrl(lang)} className={`${pill} bg-[#1B1B1B] text-[#F5F2EA]`}>
              {t.instructorPage}
            </a>
          </div>
          <ul className="flex flex-col gap-2.5">
            {courses.map((c) => (
              <li key={c.slug}>
                <a href={c.url} className="block rounded-[20px] bg-white px-[18px] py-4 hover:bg-[#FBFAF6]">
                  {t.levels[c.level] ? (
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-[13px] ${c.level === 'BASIC' ? 'bg-[#CFE8DC]' : 'bg-[#FFE3CF]'}`}>
                      {t.levels[c.level]}
                    </span>
                  ) : null}
                  <span className="mt-2 block text-[17px] leading-snug">{c.title}</span>
                </a>
              </li>
            ))}
          </ul>
          {inflearn ? <p className="mt-auto text-[13px] text-[#2F4F42]">{t.statsDaily}</p> : null}
        </section>

        {/* 새 소식 */}
        <section className="col-span-full rounded-[32px] bg-white p-6 text-[#1B1B1B] lg:col-span-2">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-display text-[26px]">{t.news}</h2>
            <Link href="/news" hrefLang={lang === 'ko' ? undefined : 'ko'} className="text-sm text-[#B8440A] underline-offset-4 hover:underline">
              {t.seeAll} →
            </Link>
          </div>
          <ul className="mt-3.5 flex flex-col gap-3 text-base">
            {news.map((n) => (
              <li key={n.key}>
                <time dateTime={n.date} className="block text-[13px] text-[#6A645B]">
                  {n.date}
                </time>
                <Link href={n.href} className="underline-offset-4 hover:underline">
                  {n.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* 의견 보내기 */}
        <section className="col-span-full flex flex-col gap-3.5 rounded-[32px] bg-[#FFE8A3] p-6 text-[#1B1B1B] lg:col-span-2">
          <h2 className="font-display text-[28px] leading-tight">
            {t.feedbackTitle[0]}
            <br />
            {t.feedbackTitle[1]}
          </h2>
          <p className="text-[15px] leading-relaxed">{t.feedbackBody}</p>
          <div className="flex flex-wrap items-center gap-2">
            <FeedbackButton lang={lang} apps={feedbackTargets(apps)} className="inline-flex min-h-12 cursor-pointer items-center rounded-full bg-[#1B1B1B] px-6 text-base text-[#F5F2EA]">
              {dict.feedback.title}
            </FeedbackButton>
            <a href="mailto:hello@joyopi.com" className="inline-flex min-h-12 items-center px-4 text-[15px] underline-offset-4 hover:underline">
              hello@joyopi.com
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
