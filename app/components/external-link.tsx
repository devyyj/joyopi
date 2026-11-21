import type { ReactNode } from 'react';
import type { Lang } from '@/app/_i18n/config';
import { getDictionary } from '@/app/_i18n/dictionary';

/** 「새 창」 아이콘(네모에서 오른쪽 위로 나가는 화살표). 화면 낭독기에서는 숨긴다 */
export function NewWindowIcon({ className = 'h-[0.9em] w-[0.9em]' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`inline-block shrink-0 ${className}`}
    >
      <path d="M14 4h6v6" />
      <path d="M20 4l-9 9" />
      <path d="M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4" />
    </svg>
  );
}

interface ExternalLinkProps {
  href: string;
  lang: Lang;
  className?: string;
  children: ReactNode;
}

/**
 * 사이트 밖(스토어·유튜브·인프런·메일 앱)을 여는 버튼·링크. 모든 앱 공통 규칙(business/apps/common.md 9장):
 * 글자 끝에 새 창 아이콘을 두고, 화면 낭독기에는 「(새 창에서 열려요)」를 읽힌다.
 * 웹 주소는 새 창(탭)으로 열고, 메일 주소는 메일 앱이 열리므로 표시만 한다.
 */
export default function ExternalLink({ href, lang, className = '', children }: ExternalLinkProps) {
  const isWeb = /^https?:\/\//.test(href);
  return (
    <a
      href={href}
      target={isWeb ? '_blank' : undefined}
      rel={isWeb ? 'noopener noreferrer' : undefined}
      className={`inline-flex items-center gap-1.5 ${className}`}
    >
      {children}
      <NewWindowIcon />
      <span className="sr-only"> {getDictionary(lang).nav.newWindow}</span>
    </a>
  );
}
