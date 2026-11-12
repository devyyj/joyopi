import Link from 'next/link';
import type { AppEntry } from '../_lib/apps';
import { StoreLinks } from './app-card';

/** 앱 소개 페이지 본문. App Store 「마케팅 URL」로 쓴다. 스크린샷은 출시 때 더한다. */
export default function AppDetail({ app }: { app: AppEntry }) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 md:py-12">
      <p className="text-xs">
        <Link href="/apps" className="text-muted underline underline-offset-2 hover:text-primary">
          앱
        </Link>
      </p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight">{app.name}</h1>
      {app.altNames.length > 0 && <p className="mt-1 text-sm text-muted">{app.altNames.join(' · ')}</p>}
      <p className="mt-4 text-base leading-relaxed">{app.description}</p>
      <div className="mt-5">
        <StoreLinks app={app} />
      </div>

      <section className="mt-10">
        <h2 className="text-base font-bold">특징</h2>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed">
          {app.features.map((feature) => (
            <li key={feature} className="rounded-xl border border-border bg-card px-4 py-3">
              {feature}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-base font-bold">정보</h2>
        <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
          {app.facts.map((fact) => (
            <div key={fact.label} className="contents">
              <dt className="text-muted">{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-10">
        <h2 className="text-base font-bold">지원과 정책</h2>
        <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          {app.links.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="text-primary underline underline-offset-2">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
