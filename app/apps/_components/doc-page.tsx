import type { ReactNode } from 'react';
import Link from 'next/link';
import { localePath, type Lang } from '@/app/_i18n/config';
import { getDictionary } from '@/app/_i18n/dictionary';
import { CONTACT_EMAIL } from '../_lib/business-info';
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
  'text-sm leading-relaxed [&_p]:mt-2 [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mt-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mt-1 ' +
  '[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_a]:break-words [&_strong]:font-bold ' +
  '[&_table]:mt-3 [&_table]:w-full [&_table]:border-collapse [&_table]:text-xs ' +
  '[&_th]:border [&_th]:border-border [&_th]:bg-secondary [&_th]:p-2 [&_th]:text-left [&_th]:align-top ' +
  '[&_td]:border [&_td]:border-border [&_td]:p-2 [&_td]:align-top [&_td]:break-words';

interface DocPageProps {
  doc: DocLocale;
  /**
   * 페이지 주소의 언어. 보통 doc.lang과 같다. 번역이 아직 없어 다른 언어(한국어) 본문을 보여 줄 때만 다르며,
   * 그때는 맨 위에 그 언어로 「번역 준비 중, 한국어판이 기준」 한 줄을 둔다.
   */
  pageLang?: Lang;
}

/** 앱 문서(개인정보 처리방침·지원·삭제 안내) 공통 틀. 한 페이지에 한 언어만 보여 준다. */
export default function DocPage({ doc, pageLang = doc.lang }: DocPageProps) {
  const t = getDictionary(doc.lang).doc;
  const pending = pageLang !== doc.lang ? getDictionary(pageLang).doc.translationPending : null;

  return (
    <article className="mx-auto w-full max-w-2xl px-4 py-6 md:py-10">
      <LegacyHashRedirect lang={pageLang} />
      {pending && (
        <p role="status" lang={pageLang} className="mb-5 rounded-lg border border-border bg-secondary p-3 text-sm font-medium">
          {pending}
        </p>
      )}
      <section id={doc.lang} lang={doc.lang} className="scroll-mt-20">
        <h1 className="text-xl font-extrabold tracking-tight">{doc.title}</h1>

        {doc.lead && <div className={`mt-4 ${PROSE}`}>{doc.lead}</div>}

        {doc.notice && (
          <div role="note" className={`mt-4 rounded-lg border border-primary bg-card p-3 font-medium ${PROSE}`}>
            {doc.notice}
          </div>
        )}

        <nav aria-label={t.toc} className="mt-5 rounded-lg border border-border bg-card p-3">
          <p className="text-xs font-bold">{t.toc}</p>
          <ol className="mt-1 space-y-1 text-xs">
            {doc.sections.map((s) => (
              <li key={s.id}>
                <a href={`#${doc.lang}-${s.id}`} className="text-primary underline underline-offset-2">
                  {s.heading}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {doc.sections.map((s) => (
          <section key={s.id} id={`${doc.lang}-${s.id}`} className="mt-7 scroll-mt-20">
            <h2 className="text-base font-bold">{s.heading}</h2>
            <div className={PROSE}>{s.body}</div>
          </section>
        ))}

        <section className="mt-8 rounded-lg border border-border bg-card p-3 text-sm">
          <h2 className="text-xs font-bold">{t.contact}</h2>
          <p className="mt-1">
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline underline-offset-2">
              {CONTACT_EMAIL}
            </a>
          </p>
        </section>

        <p className="mt-6 text-xs text-muted">
          {t.effective}: {doc.effectiveDate} · <span>{t.updated}: {doc.updatedDate}</span>
        </p>
        <p className="mt-2 text-xs">
          <Link href={localePath(pageLang, '/apps')} className="text-muted underline underline-offset-2">
            {t.home}
          </Link>
        </p>
      </section>
    </article>
  );
}
