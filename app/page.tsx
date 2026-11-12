import Link from 'next/link';
import BusinessInfo from '@/app/apps/_components/business-info';
import { APPS, type AppEntry } from '@/app/apps/_lib/apps';

function StoreLinks({ app }: { app: AppEntry }) {
  const stores = [
    { label: 'App Store', url: app.appStoreUrl },
    { label: 'Google Play', url: app.googlePlayUrl },
  ].filter((s): s is { label: string; url: string } => Boolean(s.url));

  if (stores.length === 0) {
    return <p className="text-xs text-muted">출시 준비 중</p>;
  }
  return (
    <ul className="flex flex-wrap gap-2">
      {stores.map((s) => (
        <li key={s.label}>
          <a
            href={s.url}
            className="inline-block rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground"
          >
            {s.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

// 홈 = 조요피(JOYOPI)가 만드는 앱 목록과 사업자 정보. 스토어의 「개발자 웹사이트」로 쓰인다.
export default function Home() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 md:py-10">
      <h1 className="text-xl font-extrabold tracking-tight">조요피(JOYOPI)의 앱</h1>
      <p className="mt-1 text-sm text-muted">조요피가 만들고 운영하는 모바일 앱입니다.</p>

      <ul className="mt-6 space-y-4">
        {APPS.map((app) => (
          <li key={app.slug} className="rounded-2xl border border-border bg-card p-4 text-card-foreground">
            <h2 className="text-base font-bold">{app.name}</h2>
            {app.altNames.length > 0 && <p className="text-xs text-muted">{app.altNames.join(' · ')}</p>}
            <p className="mt-2 text-sm">{app.description}</p>
            <div className="mt-3">
              <StoreLinks app={app} />
            </div>
            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-border pt-3 text-xs">
              {app.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-primary underline underline-offset-2">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      <footer className="mt-10 border-t border-border pt-6">
        <BusinessInfo />
        <p className="mt-4 text-[10px] text-muted">&copy; 2026 JOYOPI</p>
      </footer>
    </div>
  );
}
