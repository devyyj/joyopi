// 홈 「새 소식」: 사이트 소식(한국어)과 앱마다의 새 소식(public/apps/<앱>/news.json, 앱 안 「새 소식」과 같은 글)을 합쳐 최신 순으로.
import type { Lang } from '@/app/_i18n/config';
import { getApps } from '@/app/apps/_lib/apps';
import { getNews } from '@/app/(korean)/news/_lib/news';
import rockgazing from '@/public/apps/rockgazing/news.json';
import agirok from '@/public/apps/agirok/news.json';
import ssamkejul from '@/public/apps/ssamkejul/news.json';
import likeloop from '@/public/apps/likeloop/news.json';

interface AppNewsItem {
  id: string;
  date: string;
  kind?: string;
  title: Partial<Record<Lang, string>>;
  body?: Partial<Record<Lang, string>>;
}

export interface AppNews {
  id: string;
  date: string;
  /** update | notice 등(news.json의 kind) */
  kind: string;
  title: string;
  /** 줄마다 「- 」로 시작하는 목록 */
  lines: string[];
}

/** 그 앱의 새 소식(최신 먼저). 그 언어 글이 없으면 한국어 */
export function getAppNews(slug: string, lang: Lang): AppNews[] {
  return [...(APP_NEWS[slug] ?? [])]
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((n) => ({
      id: n.id,
      date: n.date,
      kind: n.kind ?? 'update',
      title: n.title[lang] ?? n.title.ko ?? '',
      lines: (n.body?.[lang] ?? n.body?.ko ?? '')
        .split('\n')
        .map((l) => l.replace(/^-\s*/, '').trim())
        .filter(Boolean),
    }));
}

const APP_NEWS: Record<string, AppNewsItem[]> = { rockgazing, agirok, ssamkejul, likeloop };

export interface HomeNewsItem {
  key: string;
  date: string;
  title: string;
  href: string;
  /** 링크한 페이지가 한국어뿐이면 'ko' */
  hrefLang?: Lang;
}

/**
 * 앱 글은 「앱 이름 + 제목」, 그 언어 제목이 없으면 한국어 제목.
 * 사이트 소식은 한국어로만 쓰므로 한국어 화면에서만 넣는다.
 */
export function getHomeNews(lang: Lang, limit = 3): HomeNewsItem[] {
  const items: HomeNewsItem[] = [];
  for (const app of getApps(lang)) {
    for (const n of APP_NEWS[app.slug] ?? []) {
      const title = n.title[lang] ?? n.title.ko;
      if (!title) continue;
      items.push({ key: `${app.slug}-${n.id}`, date: n.date, title: `${app.name} · ${title}`, href: app.href });
    }
  }
  if (lang === 'ko') {
    for (const n of getNews()) items.push({ key: `site-${n.date}-${n.title}`, date: n.date, title: n.title, href: '/news' });
  }
  return items.sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit);
}
