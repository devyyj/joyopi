import type { Metadata } from 'next';
import { getApps } from '@/app/apps/_lib/apps';
import { getAllNews } from './_lib/all-news';
import NewsList from './news-list';

export const metadata: Metadata = {
  title: '소식 — 조요피',
  description: '조요피의 앱 출시·업데이트 소식',
};

// 소식 — 앱 새 소식(앱 안 「새 소식」과 같은 글)과 사이트 소식을 한곳에. 앱별로 골라 볼 수 있다.
export default function NewsPage() {
  const sources = [
    ...getApps('ko').map((a) => ({ id: a.slug, name: a.name, icon: a.icon })),
    { id: 'site', name: '사이트', icon: null },
  ];
  return (
    <div className="mx-auto flex w-full max-w-[1160px] flex-col gap-4 px-4 pb-14 pt-2">
      <NewsList items={getAllNews()} sources={sources} />
    </div>
  );
}
