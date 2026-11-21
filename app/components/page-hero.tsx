import type { ReactNode } from 'react';

interface PageHeroProps {
  /** 제목 위 터미널 명령 모양 머리글(예: `ls apps`). 끝에 커서 `_`가 붙는다 */
  prompt: string;
  title: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
}

/** 하위 페이지 맨 위의 검은 둥근 칸. 홈 인사 칸과 같은 모양(2026-11-22 개편). */
export default function PageHero({ prompt, title, lead, children }: PageHeroProps) {
  return (
    <section className="rounded-[36px] bg-[#1B1B1B] px-6 py-9 text-[#F5F2EA] sm:px-10 sm:py-10 lg:px-12 dark:ring-1 dark:ring-white/10">
      <p aria-hidden="true" className="font-brand text-[15px] font-extrabold text-[#FF8A3D]">
        &gt; {prompt}_
      </p>
      <h1 className="mt-3 font-display text-[36px] leading-[1.15] sm:text-[48px]">{title}</h1>
      {lead ? <div className="mt-2.5 max-w-[640px] text-base leading-relaxed text-[#DDD6C8]">{lead}</div> : null}
      {children}
    </section>
  );
}
