import type { Metadata } from 'next';
import PageShell from '@/app/components/page-shell';
import { getNews } from './_lib/news';

export const metadata: Metadata = {
  title: '소식 — 조요피',
  description: '조요피(JOYOPI)의 앱 출시·업데이트 소식',
};

export default function NewsPage() {
  const news = getNews();
  return (
    <PageShell title="소식" lead="앱 출시와 업데이트, 사이트 변경을 알립니다.">
      <ul className="space-y-4">
        {news.map((item) => (
          <li key={item.date + item.title} className="rounded-2xl border border-border bg-card p-5">
            <time dateTime={item.date} className="text-xs text-muted">
              {item.date}
            </time>
            <h2 className="mt-1 text-base font-bold">{item.title}</h2>
            <p className="mt-2 text-sm leading-relaxed">{item.body}</p>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}