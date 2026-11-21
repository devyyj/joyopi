// 소식 페이지: 사이트 소식(이 폴더의 news.ts)과 앱마다의 새 소식(public/apps/<앱>/news.json)을 한 목록으로.
import { getApps } from '@/app/apps/_lib/apps';
import { getAppNews } from '@/app/_data/home-news';
import { getNews } from './news';

export interface NewsEntry {
  key: string;
  /** 앱 경로 이름, 사이트 소식은 'site' */
  source: string;
  sourceName: string;
  /** 앱 아이콘(사이트 소식은 없음) */
  icon: string | null;
  /** 업데이트 · 공지 · 사이트 */
  tag: string;
  date: string;
  title: string;
  lines: string[];
  href: string;
}

const TAGS: Record<string, string> = { update: '업데이트', notice: '공지' };

/** 최신 먼저 */
export function getAllNews(): NewsEntry[] {
  const items: NewsEntry[] = [];
  for (const app of getApps('ko')) {
    for (const n of getAppNews(app.slug, 'ko')) {
      items.push({
        key: `${app.slug}-${n.id}`,
        source: app.slug,
        sourceName: app.name,
        icon: app.icon,
        tag: TAGS[n.kind] ?? '소식',
        date: n.date,
        title: n.title,
        lines: n.lines,
        href: app.href,
      });
    }
  }
  for (const n of getNews()) {
    items.push({
      key: `site-${n.date}-${n.title}`,
      source: 'site',
      sourceName: 'joyopi.com',
      icon: null,
      tag: '사이트',
      date: n.date,
      title: n.title,
      lines: [n.body],
      href: '/',
    });
  }
  return items.sort((a, b) => b.date.localeCompare(a.date));
}
