import type { ReactNode } from 'react';

interface PageShellProps {
  title: string;
  lead?: ReactNode;
  children: ReactNode;
}

/** 소개·소식·지원 같은 안내 페이지의 공통 틀(제목 + 머리말 + 본문). */
export default function PageShell({ title, lead, children }: PageShellProps) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 md:py-12">
      <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
      {lead && <p className="mt-2 text-sm text-muted leading-relaxed">{lead}</p>}
      <div className="mt-8">{children}</div>
    </div>
  );
}

/** 안내 페이지 안의 한 구역 */
export function PageSection({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section className="mt-8 first:mt-0">
      <h2 className="text-base font-bold">{heading}</h2>
      <div className="mt-2 text-sm leading-relaxed [&_p]:mt-2 [&_ul]:mt-2 [&_ul]:space-y-1.5 [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2">
        {children}
      </div>
    </section>
  );
}
