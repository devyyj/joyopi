import Link from 'next/link';
import type { AppEntry } from '../_lib/apps';

/** 스토어 버튼. 주소가 없으면(출시 전) 「출시 준비 중」. */
export function StoreLinks({ app }: { app: AppEntry }) {
  const stores = [
    { label: 'App Store', url: app.appStoreUrl },
    { label: 'Google Play', url: app.googlePlayUrl },
  ].filter((s): s is { label: string; url: string } => Boolean(s.url));

  if (stores.length === 0) {
    return (
      <p className="inline-block rounded-full border border-border px-3 py-1 text-xs font-bold text-muted">
        출시 준비 중
      </p>
    );
  }
  return (
    <ul className="flex flex-wrap gap-2">
      {stores.map((s) => (
        <li key={s.label}>
          <a
            href={s.url}
            className="inline-block rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground"
          >
            {s.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

/** 앱 목록의 카드 한 장 */
export default function AppCard({ app }: { app: AppEntry }) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-border bg-card p-5 text-card-foreground">
      <h2 className="text-lg font-bold">
        <Link href={app.href} className="hover:text-primary">
          {app.name}
        </Link>
      </h2>
      {app.altNames.length > 0 && <p className="text-xs text-muted">{app.altNames.join(' · ')}</p>}
      <p className="mt-2 flex-1 text-sm">{app.description}</p>
      <div className="mt-4">
        <StoreLinks app={app} />
      </div>
      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1 border-t border-border pt-3 text-xs">
        <li>
          <Link href={app.href} className="font-bold text-primary underline underline-offset-2">
            자세히 보기
          </Link>
        </li>
        {app.links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-muted underline underline-offset-2 hover:text-primary">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </article>
  );
}
