import type { ReactNode } from 'react';
import Link from 'next/link';
import BusinessInfo, { type Lang } from './business-info';
import { CONTACT_EMAIL } from '../_lib/business-info';

export interface DocSection {
  /** 절 id. 화면에서는 `{lang}-{id}`로 붙는다(여러 언어가 한 페이지에 있어도 겹치지 않게). */
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
  /** 사업자 정보를 문서 아래에 붙일지(지원 페이지) */
  showBusinessInfo?: boolean;
}

const LANG_NAMES: Record<Lang, string> = { ko: '한국어', en: 'English', ja: '日本語' };

const LABELS: Record<Lang, { toc: string; contact: string; effective: string; updated: string; home: string }> = {
  ko: { toc: '목차', contact: '문의', effective: '시행일', updated: '최종 수정일', home: '조요피 앱 목록' },
  en: { toc: 'Contents', contact: 'Contact', effective: 'Effective date', updated: 'Last updated', home: 'JOYOPI apps' },
  ja: { toc: '目次', contact: 'お問い合わせ', effective: '施行日', updated: '最終更新日', home: 'JOYOPIのアプリ一覧' },
};

// 본문(body)에 들어오는 p·ul·ol·table·a 를 한곳에서 꾸민다.
const PROSE =
  'text-sm leading-relaxed [&_p]:mt-2 [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mt-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mt-1 ' +
  '[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_a]:break-words [&_strong]:font-bold ' +
  '[&_table]:mt-3 [&_table]:w-full [&_table]:border-collapse [&_table]:text-xs ' +
  '[&_th]:border [&_th]:border-border [&_th]:bg-secondary [&_th]:p-2 [&_th]:text-left [&_th]:align-top ' +
  '[&_td]:border [&_td]:border-border [&_td]:p-2 [&_td]:align-top [&_td]:break-words';

function LocaleBlock({ doc }: { doc: DocLocale }) {
  const t = LABELS[doc.lang];
  return (
    <section id={doc.lang} lang={doc.lang} className="scroll-mt-20 py-8 first:pt-0 border-b border-border last:border-b-0">
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

      {doc.showBusinessInfo && <BusinessInfo lang={doc.lang} className="mt-6" />}

      <p className="mt-6 text-xs text-muted">
        {t.effective}: {doc.effectiveDate} · <span>{t.updated}: {doc.updatedDate}</span>
      </p>
      <p className="mt-2 text-xs">
        <Link href="/" className="text-muted underline underline-offset-2">
          {t.home}
        </Link>
      </p>
    </section>
  );
}

/** 앱 문서(개인정보 처리방침·지원·삭제 안내) 공통 틀. 언어가 여럿이면 위아래로 놓고 맨 위에 이동 링크를 둔다. */
export default function DocPage({ locales }: { locales: DocLocale[] }) {
  return (
    <article className="mx-auto w-full max-w-2xl px-4 py-6 md:py-10">
      {locales.length > 1 && (
        <nav aria-label="Language" className="mb-6 flex flex-wrap gap-2 text-xs">
          {locales.map((doc) => (
            <a
              key={doc.lang}
              href={`#${doc.lang}`}
              lang={doc.lang}
              className="rounded-full border border-border bg-card px-3 py-1 font-bold hover:border-primary"
            >
              {LANG_NAMES[doc.lang]}
            </a>
          ))}
        </nav>
      )}
      {locales.map((doc) => (
        <LocaleBlock key={doc.lang} doc={doc} />
      ))}
    </article>
  );
}
