import Link from 'next/link';
import AppCard from '@/app/apps/_components/app-card';
import { APPS } from '@/app/apps/_lib/apps';
import { getNews } from '@/app/news/_lib/news';

// 홈 — 조요피의 사이트 첫 화면. 조요피는 회사가 아니라 사람(온라인 활동명)으로 소개한다. 스토어의 「개발자 웹사이트」로 쓰인다.
export default function Home() {
  const latestNews = getNews().slice(0, 3);

  return (
    <div className="mx-auto w-full max-w-5xl px-4">
      <section className="py-12 md:py-20">
        <p className="font-mono text-xs font-bold text-primary">JOYOPI</p>
        <h1 className="mt-3 text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
          안녕하세요,
          <br />
          조요피입니다
        </h1>
        <p className="mt-4 max-w-xl text-sm md:text-base text-muted leading-relaxed">
          모바일 앱을 만듭니다. 지금은 돌 하나를 바라보는 Rockgazing과 한 번 탭으로 끝나는 육아 기록 아기록을 만들고 있습니다.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/apps" className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground">
            앱 보기
          </Link>
          <Link href="/support" className="rounded-full border border-border bg-card px-5 py-2 text-sm font-bold hover:border-primary">
            지원
          </Link>
        </div>
      </section>

      <section aria-label="앱" className="pb-12">
        <div className="grid gap-4 md:grid-cols-2">
          {APPS.map((app) => (
            <AppCard key={app.slug} app={app} />
          ))}
        </div>
      </section>

      <section className="grid gap-4 pb-16 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-baseline justify-between">
            <h2 className="text-base font-bold">소식</h2>
            <Link href="/news" className="text-xs text-primary underline underline-offset-2">
              모두 보기
            </Link>
          </div>
          <ul className="mt-3 space-y-3 text-sm">
            {latestNews.map((item) => (
              <li key={item.date + item.title}>
                <time dateTime={item.date} className="block text-xs text-muted">
                  {item.date}
                </time>
                {item.title}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="text-base font-bold">문의</h2>
          <p className="mt-3 text-sm leading-relaxed">
            앱을 쓰다가 궁금한 점이나 문제가 있으면 문의 게시판에 남기거나 메일로 보내 주세요. 제가 직접 답합니다.
          </p>
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <li>
              <Link href="/board" className="text-primary underline underline-offset-2">
                문의 게시판
              </Link>
            </li>
            <li>
              <a href="mailto:hello@joyopi.com" className="text-primary underline underline-offset-2">
                hello@joyopi.com
              </a>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}