'use client';

import { useEffect, useState } from 'react';

import styles from './invite.module.css';

/**
 * 「아기록 앱에서 열기」·코드 복사·만료 시각(보는 사람의 시간대로).
 * 카카오톡 같은 앱 안 브라우저는 유니버설 링크를 따르지 않아, 페이지가 열리자마자 앱 스킴으로 한 번 열어 본다
 * (business apps/common.md 11장). 앱이 없으면 아무 일도 없고 이 페이지가 남는다.
 */
export default function InviteActions({
  code,
  openHref,
  autoOpen,
  expiresAt,
  lang,
  text,
}: {
  code: string;
  openHref: string;
  autoOpen: boolean;
  expiresAt: number;
  lang: string;
  text: { open: string; openNote: string; copy: string; copied: string; expires: string };
}) {
  const [copied, setCopied] = useState(false);
  const [when, setWhen] = useState('');

  useEffect(() => {
    if (autoOpen) window.location.href = openHref;
  }, [autoOpen, openHref]);

  useEffect(() => {
    // 서버(미국)와 보는 사람의 시간대가 달라 브라우저에서 만든다
    const id = requestAnimationFrame(() =>
      setWhen(new Date(expiresAt).toLocaleString(lang, { month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' })),
    );
    return () => cancelAnimationFrame(id);
  }, [expiresAt, lang]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 복사를 막는 브라우저는 코드가 화면에 보이므로 그대로 둔다
    }
  };

  return (
    <div className={styles.actions}>
      <a className={styles.open} href={openHref} data-testid="open-app">
        {text.open}
      </a>
      <p className={styles.small}>{text.openNote}</p>
      <div className={styles.codeBox}>
        <span className={styles.codeBig}>{code}</span>
        <button type="button" className={styles.copy} onClick={copy}>
          {copied ? text.copied : text.copy}
        </button>
      </div>
      {when && <p className={styles.small}>{text.expires.replace('{when}', when)}</p>}
    </div>
  );
}
