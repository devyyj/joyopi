import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { localePath, type Lang } from '@/app/_i18n/config';
import { getDictionary } from '@/app/_i18n/dictionary';
import ExternalLink from '@/app/components/external-link';
import FeedbackButton from '@/app/components/feedback/feedback-dialog';
import { feedbackTargets } from '@/app/components/feedback/targets';
import { CONTACT_EMAIL } from '../_lib/business-info';
import { getApps } from '../_lib/apps';
import { appTheme } from '../_lib/app-theme';
import LegacyHashRedirect from './legacy-hash-redirect';

export interface DocSection {
  /** 절 id. 화면에서는 `{lang}-{id}`로 붙는다(예전 한 페이지 세 언어 시절의 앵커 `#ja-collect` 등을 그대로 살린다). */
  id: string;
  heading: string;
  body: ReactNode;
}

export interface DocLocale {
  lang: Lang;
  title: string;
  lead?: ReactNode;
  /** 눈에 띄게 둘 강조 문구 */
  notice?: ReactNode;
  sections: DocSection[];
  /** YYYY-MM-DD. 내용이 바뀔 때마다 고친다. */
  effectiveDate: string;
  updatedDate: string;
}

// 본문(body)에 들어오는 p·ul·ol·table·a 를 한곳에서 꾸민다.
const PROSE =
  'text-[15px] leading-[1.75] [&_p]:mt-2.5 [&_ul]:mt-2.5 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mt-2.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mt-1 ' +
  '[&_a]:text-[#B8440A] dark:[&_a]:text-[#FF8A3D] [&_a]:underline [&_a]:underline-offset-2 [&_a]:break-words [&_strong]:font-bold ' +
  '[&_table]:mt-3 [&_table]:w-full [&_table]:border-collapse [&_table]:overflow-hidden [&_table]:rounded-2xl [&_table]:text-sm ' +
  '[&_th]:border [&_th]:border-border [&_th]:bg-secondary [&_th]:p-2.5 [&_th]:text-left [&_th]:align-top ' +
  '[&_td]:border [&_td]:border-border [&_td]:p-2.5 [&_td]:align-top [&_td]:break-words';

interface DocPageProps {
  doc: DocLocale;
  /**
   * 페이지 주소의 언어. 보통 doc.lang과 같다. 번역이 아직 없어 다른 언어(한국어) 본문을 보여 줄 때만 다르며,
   * 그때는 맨 위에 그 언어로 「번역 준비 중, 한국어판이 기준」 한 줄을 둔다.
   */
  pageLang?: Lang;
  /** 이 문서의 앱(경로 이름). 주면 머리 칸을 그 앱 색·아이콘으로 하고 같은 앱의 다른 문서로 가는 알약을 단다 */
  slug?: string;
  /** 이 문서의 주소(언어 포함). 다른 문서 알약에서 지금 문서를 표시한다 */
  path?: string;
}

/** 앱 문서(개인정보 처리방침·지원·약관·삭제 안내) 공통 틀. 한 페이지에 한 언어만 보여 준다. */
export default function DocPage({ doc, pageLang = doc.lang, slug, path }: DocPageProps) {
  const t = getDictionary(doc.lang).doc;
  const pageDict = getDictionary(pageLang);
  const pending = pageLang !== doc.lang ? pageDict.doc.translationPending : null;
  const apps = getApps(pageLang);
  const app = slug ? apps.find((a) => a.slug === slug) : undefined;
  const c = app ? appTheme(app.slug) : null;

  return (
    <article className="mx-auto flex w-full max-w-[1160px] flex-col gap-4 px-4 pb-14 pt-2">
      <LegacyHashRedirect lang={pageLang} />
      {app ? (
        <nav aria-label={pageDict.apps.breadcrumb} className="px-1.5 text-sm text-muted">
          <Link href={localePath(pageLang, '/apps')} className="underline-offset-4 hover:underline">
            {pageDict.apps.title}
          </Link>{' '}
          <span aria-hidden="true">›</span>{' '}
          <Link href={app.href} className="underline-offset-4 hover:underline">
            {app.name}
          </Link>{' '}
          <span aria-hidden="true">›</span> {doc.title}
        </nav>
      ) : null}
      {pending && (
        <p role="status" lang={pageLang} className="rounded-2xl bg-[#FFE8A3] px-5 py-3.5 text-sm font-medium text-[#1B1B1B]">
          {pending}
        </p>
      )}

      <section id={doc.lang} lang={doc.lang} className="flex scroll-mt-20 flex-col gap-4">
        <header
          className={`flex flex-wrap items-center gap-5 rounded-[36px] px-6 py-7 sm:px-10 sm:py-8 ${c ? `${c.tile} ${c.text}` : 'bg-card text-card-foreground'}`}
        >
          {app ? <Image src={app.icon} alt="" width={76} height={76} className="h-16 w-16 rounded-[18px] shadow-[0_6px_16px_rgba(27,27,27,.15)] sm:h-[76px] sm:w-[76px] sm:rounded-[20px]" /> : null}
          <div className="min-w-0 flex-[1_1_320px]">
            {app ? <p className={`text-sm ${c?.sub}`}>{app.name}</p> : null}
            <h1 className="mt-1 font-display text-[32px] leading-[1.15] sm:text-[42px]">{doc.title}</h1>
          </div>
          {app ? (
            <ul aria-label={pageDict.doc.docsAria} className="flex flex-wrap gap-1.5">
              {app.links.map((l) => {
                const current = path === l.href;
                return (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      aria-current={current ? 'page' : undefined}
                      className={`inline-flex min-h-11 items-center rounded-full px-4 text-sm ${current ? 'bg-[#1B1B1B] text-[#F5F2EA]' : app.slug === 'rockgazing' ? 'bg-white/15' : 'bg-white text-[#1B1B1B]'}`}
                    >
                      {l.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </header>

        <div className="flex flex-wrap items-start gap-4">
          <nav aria-label={t.toc} className="flex-[1_1_260px] rounded-[28px] bg-card p-5 text-card-foreground lg:sticky lg:top-20">
            <p className="font-display text-xl">{t.toc}</p>
            <ol className="mt-3 flex flex-col gap-1 text-sm">
              {doc.sections.map((s, i) => (
                <li key={s.id}>
                  <a href={`#${doc.lang}-${s.id}`} className="flex min-h-10 items-center gap-2.5 rounded-xl px-3 py-1.5 hover:bg-background">
                    <span aria-hidden="true" className="font-brand text-[13px] font-extrabold text-[#B8440A] dark:text-[#FF8A3D]">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span>{s.heading}</span>
                  </a>
                </li>
              ))}
            </ol>
            <p className="mt-3.5 border-t border-border pt-3 text-xs text-muted">
              {t.effective}: {doc.effectiveDate} · <span>{t.updated}: {doc.updatedDate}</span>
            </p>
          </nav>

          <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-3">
            {doc.lead && <div className={`rounded-[28px] bg-card px-6 py-5 text-card-foreground sm:px-7 ${PROSE} [&>*:first-child]:mt-0`}>{doc.lead}</div>}

            {doc.notice && (
              <div role="note" className={`rounded-[28px] bg-[#FFF4EC] px-6 py-5 font-medium text-[#1B1B1B] sm:px-7 ${PROSE} [&>*:first-child]:mt-0`}>
                {doc.notice}
              </div>
            )}

            {doc.sections.map((s) => (
              <section key={s.id} id={`${doc.lang}-${s.id}`} className="scroll-mt-20 rounded-[28px] bg-card px-6 py-6 text-card-foreground sm:px-7">
                <h2 className="text-[19px] font-bold leading-snug">{s.heading}</h2>
                <div className={`overflow-x-auto ${PROSE}`}>{s.body}</div>
              </section>
            ))}

            <section className="flex flex-wrap items-center justify-between gap-3 rounded-[28px] bg-[#FFE8A3] px-6 py-5 text-[#1B1B1B] sm:px-7">
              <h2 className="font-display text-xl">{t.contact}</h2>
              <div className="flex flex-wrap items-center gap-2">
                <FeedbackButton lang={pageLang} apps={feedbackTargets(apps)} className="inline-flex min-h-11 cursor-pointer items-center rounded-full bg-[#1B1B1B] px-5 text-[15px] text-[#F5F2EA]">
                  {pageDict.feedback.title}
                </FeedbackButton>
                <ExternalLink href={`mailto:${CONTACT_EMAIL}`} lang={doc.lang} className="min-h-11 px-3 text-[15px] underline-offset-4 hover:underline">
                  {CONTACT_EMAIL}
                </ExternalLink>
              </div>
            </section>

            <p className="px-1.5 text-sm">
              <Link href={localePath(pageLang, '/apps')} className="text-muted underline underline-offset-2">
                {t.home}
              </Link>
            </p>
          </div>
        </div>
      </section>
    </article>
  );
}
