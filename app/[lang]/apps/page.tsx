import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getDictionary } from '@/app/_i18n/dictionary';
import { localizedMetadata, resolveLang, type LangParams } from '@/app/_i18n/page';
import PageHero from '@/app/components/page-hero';
import ExternalLink from '@/app/components/external-link';
import FeedbackButton from '@/app/components/feedback/feedback-dialog';
import { feedbackTargets } from '@/app/components/feedback/targets';
import { getApps } from '@/app/apps/_lib/apps';
import { appTheme } from '@/app/apps/_lib/app-theme';

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const lang = await resolveLang(params);
  const t = getDictionary(lang).apps;
  return localizedMetadata(lang, '/apps', { title: t.metaTitle, description: t.metaDescription });
}

const pill = 'inline-flex min-h-11 items-center rounded-full px-[18px] text-[15px]';

// 앱 목록 — 앱마다 그 앱 색의 큰 카드(아이콘·다른 나라 이름·설명·기기와 가격·받기/자세히). 받을 수 있는 앱을 먼저.
export default async function AppsIndex({ params }: LangParams) {
  const lang = await resolveLang(params);
  const dict = getDictionary(lang);
  const t = dict.apps;
  const home = dict.home;
  const apps = [...getApps(lang)].sort((a, b) => Number(!a.appStoreUrl) - Number(!b.appStoreUrl));
  const available = apps.filter((a) => a.appStoreUrl).length;

  return (
    <div className="mx-auto flex w-full max-w-[1160px] flex-col gap-4 px-4 pb-14 pt-2">
      <PageHero prompt={t.prompt} title={t.title} lead={t.lead}>
        <ul aria-label={t.countsAria} className="mt-5 flex flex-wrap gap-1.5 text-sm">
          <li className="rounded-full bg-[#F5F2EA] px-4 py-2.5 text-[#1B1B1B]">{t.countAll(apps.length)}</li>
          <li className="rounded-full bg-[#2A2825] px-4 py-2.5 text-[#DDD6C8]">{t.countStore(available)}</li>
          <li className="rounded-full bg-[#2A2825] px-4 py-2.5 text-[#DDD6C8]">{t.countUpcoming(apps.length - available)}</li>
        </ul>
      </PageHero>

      <div className="grid gap-4 lg:grid-cols-2">
        {apps.map((app) => {
          const c = appTheme(app.slug);
          const badge = app.appStoreUrl ? home.badgeStore : app.upcoming === 'polishing' ? home.badgePolishing : home.badgeSoon;
          const facts = app.facts.filter((f) => f.label !== app.facts[1]?.label).map((f) => f.value);
          return (
            <article key={app.slug} className={`flex flex-wrap items-start gap-5 rounded-[32px] p-6 sm:p-7 ${c.tile} ${c.text}`}>
              <Image src={app.icon} alt="" width={112} height={112} className="h-24 w-24 rounded-[24px] shadow-[0_8px_20px_rgba(27,27,27,.18)] sm:h-28 sm:w-28 sm:rounded-[26px]" />
              <div className="flex min-w-0 flex-[1_1_240px] flex-col gap-2">
                <span className={`self-start rounded-full px-3 py-1 text-[13px] ${c.chip}`}>{badge}</span>
                <h2 className="font-display text-[30px] leading-tight">
                  <Link href={app.href} className="underline-offset-4 hover:underline">
                    {app.name}
                  </Link>
                </h2>
                {app.altNames.length > 0 ? <p className={`text-[13px] ${c.sub}`}>{app.altNames.join(' · ')}</p> : null}
                <p className={`text-[15px] leading-relaxed ${app.slug === 'rockgazing' ? c.sub : ''}`}>{app.description}</p>
                <p className={`text-[13px] ${c.sub}`}>{facts.join(' · ')}</p>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {app.appStoreUrl ? (
                    <ExternalLink href={app.appStoreUrl} lang={lang} className={`${pill} ${c.button}`}>
                      {t.getApp}
                    </ExternalLink>
                  ) : null}
                  <Link href={app.href} className={`${pill} ${c.outline}`}>
                    {t.details}
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <section className="flex flex-wrap items-center justify-between gap-3.5 rounded-[32px] bg-[#FFE8A3] px-7 py-6 text-[#1B1B1B]">
        <div>
          <h2 className="font-display text-2xl">{t.ideaTitle}</h2>
          <p className="mt-1.5 text-[15px]">{t.ideaBody}</p>
        </div>
        <FeedbackButton lang={lang} apps={feedbackTargets(apps)} className="inline-flex min-h-12 cursor-pointer items-center rounded-full bg-[#1B1B1B] px-6 text-[#F5F2EA]">
          {dict.feedback.title}
        </FeedbackButton>
      </section>
    </div>
  );
}
