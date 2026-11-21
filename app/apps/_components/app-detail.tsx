import Image from 'next/image';
import Link from 'next/link';
import { localePath, type Lang } from '@/app/_i18n/config';
import { getDictionary } from '@/app/_i18n/dictionary';
import ExternalLink from '@/app/components/external-link';
import FeedbackButton from '@/app/components/feedback/feedback-dialog';
import { feedbackTargets } from '@/app/components/feedback/targets';
import { getAppNews } from '@/app/_data/home-news';
import { getApps, type AppEntry } from '../_lib/apps';
import { appTheme } from '../_lib/app-theme';

const pill = 'inline-flex min-h-[52px] items-center rounded-full px-6 text-base';
const FEATURE_DOTS = ['bg-[#FFE3CF]', 'bg-[#CFE8DC]', 'bg-[#E3EEF8]', 'bg-[#FFE8A3]', 'bg-[#EEE6FA]'];

/** 앱 소개 페이지 본문(App Store 「마케팅 URL」). 앱 색 큰 칸 + 앱 화면, 특징, 정보·새 소식·지원과 정책, 다른 앱. */
export default function AppDetail({ app, lang }: { app: AppEntry; lang: Lang }) {
  const dict = getDictionary(lang);
  const t = dict.apps;
  const home = dict.home;
  const c = appTheme(app.slug);
  const latest = getAppNews(app.slug, lang)[0];
  const others = getApps(lang).filter((a) => a.slug !== app.slug);
  const support = app.links.find((l) => l.href.endsWith('/support'));
  const badge = app.appStoreUrl ? home.badgeStore : app.upcoming === 'polishing' ? home.badgePolishing : home.badgeSoon;
  const price = app.facts[app.facts.length - 1]?.value;

  return (
    <div className="mx-auto flex w-full max-w-[1160px] flex-col gap-4 px-4 pb-14 pt-2">
      <nav aria-label={t.breadcrumb} className="px-1.5 text-sm text-muted">
        <Link href={localePath(lang, '/apps')} className="underline-offset-4 hover:underline">
          {t.title}
        </Link>{' '}
        <span aria-hidden="true">›</span> {app.name}
      </nav>

      <section className={`flex flex-wrap items-center gap-9 overflow-hidden rounded-[40px] p-6 sm:p-10 lg:p-12 ${c.tile} ${c.text}`}>
        <div className="min-w-0 flex-[999_1_420px]">
          <div className="flex items-center gap-4">
            <Image src={app.icon} alt="" width={96} height={96} className="h-20 w-20 rounded-[22px] shadow-[0_8px_20px_rgba(27,27,27,.18)] sm:h-24 sm:w-24 sm:rounded-[24px]" />
            <div>
              <span className={`inline-block rounded-full px-3 py-1 text-[13px] ${c.chip}`}>
                {badge}
                {price ? ` · ${price}` : ''}
              </span>
              {app.altNames.length > 0 ? <p className={`mt-2 text-[13px] ${c.sub}`}>{app.altNames.join(' · ')}</p> : null}
            </div>
          </div>
          <h1 className="mt-6 font-display text-[44px] leading-[1.1] sm:text-[60px]">{app.name}</h1>
          <p className="mt-3.5 max-w-[560px] font-display text-2xl leading-snug sm:text-[26px]">{app.description}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {app.appStoreUrl ? (
              <ExternalLink href={app.appStoreUrl} lang={lang} className={`${pill} ${c.button}`}>
                {t.getAppLong}
              </ExternalLink>
            ) : null}
            {support ? (
              <Link href={support.href} className={`${pill} text-[15px] ${c.outline}`}>
                {t.supportFaq}
              </Link>
            ) : null}
          </div>
        </div>
        {app.screens.length > 0 ? (
          <ul aria-label={t.screens} className="flex flex-[1_1_340px] items-end justify-center gap-3.5">
            {app.screens.map((src, i) => (
              <li key={src} className={i === 1 ? 'relative z-10' : i === 0 ? 'translate-y-6 -rotate-[4deg]' : 'translate-y-6 rotate-[4deg]'}>
                <Image
                  src={src}
                  alt=""
                  width={540}
                  height={1170}
                  sizes="170px"
                  className={`h-auto rounded-[22px] shadow-[0_14px_30px_rgba(27,27,27,.22)] ${i === 1 ? 'w-[130px] sm:w-[170px]' : 'w-[110px] sm:w-[150px]'}`}
                />
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section aria-labelledby="features" className={`grid gap-3 sm:grid-cols-2 sm:gap-4 ${app.features.length % 4 === 0 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
        <h2 id="features" className="col-span-full mx-1.5 mt-3 font-display text-[28px]">
          {t.featuresTitle}
        </h2>
        {app.features.map((f, i) => (
          <div key={f} className="flex items-start gap-3.5 rounded-[28px] bg-card p-5 text-card-foreground sm:block sm:p-6">
            <span aria-hidden="true" className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl font-brand text-[15px] font-extrabold text-[#1B1B1B] ${FEATURE_DOTS[i % FEATURE_DOTS.length]}`}>
              {String(i + 1).padStart(2, '0')}
            </span>
            <p className="text-[15px] leading-relaxed sm:mt-3.5">{f}</p>
          </div>
        ))}
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-[28px] bg-card p-6 text-card-foreground">
          <h2 className="font-display text-2xl">{t.info}</h2>
          <dl className="mt-3.5 grid grid-cols-[auto_1fr] gap-x-5 gap-y-2.5 text-[15px]">
            {app.facts.map((fact) => (
              <div key={fact.label} className="contents">
                <dt className="text-muted">{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        {latest ? (
          <section className="rounded-[28px] bg-card p-6 text-card-foreground">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-display text-2xl">{t.news}</h2>
              <span className="text-[13px] text-muted">{t.newsSame}</span>
            </div>
            <p className="mt-3.5 text-[13px] text-muted">
              <time dateTime={latest.date}>{latest.date}</time>
            </p>
            <p className="mt-0.5 text-base font-bold">{latest.title}</p>
            {latest.lines[0] ? <p className="mt-1.5 text-sm leading-relaxed text-muted">{latest.lines[0]}</p> : null}
          </section>
        ) : null}

        <section className="rounded-[28px] bg-[#1B1B1B] p-6 text-[#F5F2EA] dark:ring-1 dark:ring-white/10">
          <h2 className="font-display text-2xl">{t.supportAndPolicies}</h2>
          <ul className="mt-3.5 flex flex-wrap gap-2">
            {app.links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="inline-flex min-h-11 items-center rounded-full bg-[#2A2825] px-4 text-sm hover:bg-[#3A3733]">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-3.5 text-sm text-[#DDD6C8]">{t.feedbackHint}</p>
          <FeedbackButton
            lang={lang}
            apps={feedbackTargets(getApps(lang))}
            className="mt-3 inline-flex min-h-11 cursor-pointer items-center rounded-full bg-[#F5F2EA] px-5 text-sm text-[#1B1B1B]"
          >
            {dict.feedback.title}
          </FeedbackButton>
        </section>
      </div>

      <section aria-labelledby="other-apps" className="flex flex-wrap items-center gap-3 rounded-[28px] bg-card px-6 py-5 text-card-foreground">
        <h2 id="other-apps" className="basis-full font-display text-xl">
          {t.otherApps}
        </h2>
        {others.map((o) => {
          const oc = appTheme(o.slug);
          return (
            <Link key={o.slug} href={o.href} className={`inline-flex items-center gap-2.5 rounded-full py-2 pl-2 pr-4 ${oc.tile} ${oc.text}`}>
              <Image src={o.icon} alt="" width={40} height={40} className="h-10 w-10 rounded-xl" />
              {o.name}
            </Link>
          );
        })}
      </section>
    </div>
  );
}
