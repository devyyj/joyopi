import type { Metadata } from 'next';
import { headers } from 'next/headers';

import { APP_STORE_URL, OG_IMAGE_PATH, PAGE_TEXT, isAndroid, isInAppBrowser, openAppHref, previewText } from '@/utils/agirok/invite';

import InviteActions from './invite-actions';
import { loadInvite } from './load';
import styles from './invite.module.css';

/**
 * 아기록 초대 링크 https://joyopi.com/agirok/i/{코드} (아기록 docs/decisions.md ‘초대 링크’, business apps/common.md 11장).
 * 앱이 있으면 iOS 유니버설 링크로 이 페이지 대신 앱이 열린다. 여기까지 왔으면 앱이 없거나 앱 안 브라우저(카카오톡 등)다.
 * 없는 코드·만료여도 일반 문구로 200을 준다(404 금지).
 */
export const dynamic = 'force-dynamic';

const ORIGIN = 'https://joyopi.com';

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  const { code, invite, lang } = await loadInvite((await params).code);
  const p = previewText(lang, invite?.babyName, invite?.inviterName);
  const url = `${ORIGIN}/agirok/i/${code ?? ''}`;
  return {
    metadataBase: new URL(ORIGIN),
    title: p.title,
    description: p.desc,
    robots: { index: false, follow: false },
    openGraph: {
      type: 'website',
      url,
      title: p.title,
      description: p.desc,
      siteName: lang === 'ja' ? 'ベビろく' : lang === 'en' ? 'Agirok' : '아기록',
      images: [{ url: OG_IMAGE_PATH, width: 1200, height: 630, alt: p.title }],
    },
    twitter: { card: 'summary_large_image', title: p.title, description: p.desc, images: [OG_IMAGE_PATH] },
  };
}

export default async function AgirokInvitePage({ params }: { params: Promise<{ code: string }> }) {
  const { code, invite, lang, expired } = await loadInvite((await params).code);
  const ua = (await headers()).get('user-agent') ?? '';
  const tx = PAGE_TEXT[lang];
  const state = !invite ? 'notFound' : expired ? 'expired' : 'ok';
  const android = isAndroid(ua);

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        {/* eslint-disable-next-line @next/next/no-img-element -- 정적 아이콘 한 장 */}
        <img className={styles.icon} src="/apps/agirok/icon.png" alt="" width={88} height={88} />
        <h1 className={styles.title} data-testid="invite-title">
          {invite ? tx.titleNamed(invite.babyName) : tx.titleGeneric}
        </h1>
        <p className={styles.by}>{invite?.inviterName ? tx.by(invite.inviterName) : tx.byGeneric}</p>

        {state !== 'ok' && <p className={styles.warn}>{state === 'expired' ? tx.expired : tx.notFound}</p>}

        {code && state === 'ok' && (
          <InviteActions
            code={code}
            openHref={openAppHref(code, ua)}
            autoOpen={isInAppBrowser(ua)}
            expiresAt={invite!.expiresAt}
            lang={lang}
            text={{ open: tx.open, openNote: tx.openNote, copy: tx.copy, copied: tx.copied, expires: tx.expires('{when}') }}
          />
        )}

        <section className={styles.noApp}>
          <h2 className={styles.noAppTitle}>{tx.noApp}</h2>
          {android ? (
            <p className={styles.small}>{tx.androidNote}</p>
          ) : (
            <a className={styles.store} href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" aria-label={`${tx.store} ${tx.newWindow}`}>
              {tx.store} <span aria-hidden="true">↗</span>
            </a>
          )}
          {code && state === 'ok' && (
            <p className={styles.small}>
              {tx.codeNote} <strong className={styles.code}>{code}</strong>
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
