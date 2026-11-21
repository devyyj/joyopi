/**
 * 홈 「인프런 강의」 칸의 강의 목록과 숫자(수강생·평점·수강평).
 *
 * 인프런은 공개 API가 없어서, 강사 강의 목록 페이지에 들어 있는 데이터를 읽는다.
 * 주소에 언어(/ko/, /ja/, /en/)를 붙여 그 언어 제목을 받는다. 붙이지 않으면 읽는 서버의 나라(Vercel은 미국)에 따라 영어가 온다.
 * 인프런이 화면을 바꿔 못 읽으면 예외를 던지고, 홈은 숫자 줄을 숨기고 아래 기본 강의 목록을 보여 준다.
 * 캐시(하루 한 번)는 app/_data/external.ts가 맡는다.
 */

export const INFLEARN_USER_ID = '1167019';
export type InflearnLang = 'ko' | 'ja' | 'en';
/** 강사 페이지(사이트 메뉴는 한국어 주소) */
export const INFLEARN_PROFILE_URL = `https://www.inflearn.com/users/${INFLEARN_USER_ID}/@joyopi`;
export const inflearnProfileUrl = (lang: InflearnLang) => `https://www.inflearn.com/${lang}/users/${INFLEARN_USER_ID}/@joyopi`;
const coursesPage = (lang: InflearnLang) => `https://www.inflearn.com/${lang}/users/${INFLEARN_USER_ID}/courses`;

export type CourseLevel = 'BASIC' | 'INTERMEDIATE' | 'ADVANCED' | 'OTHER';

export interface Course {
  slug: string;
  title: string;
  level: CourseLevel;
  url: string;
}

export interface InflearnStats {
  students: number;
  reviews: number;
  /** "5.0" 같은 평균 평점 */
  rating: string;
}

export interface InflearnProfile {
  stats: InflearnStats;
  courses: Course[];
}

const courseUrl = (slug: string, lang: InflearnLang) => `https://www.inflearn.com/${lang}/course/${encodeURIComponent(slug)}`;

/** 인프런을 못 읽을 때 보여 줄 강의(2026-11-22 기준, 제목은 인프런의 언어별 제목). 새 강의를 내면 여기에도 더한다 */
const FALLBACK: { slug: string; level: CourseLevel; title: Record<InflearnLang, string> }[] = [
  {
    slug: 'distributed-transact-1',
    level: 'ADVANCED',
    title: {
      ko: '코드로 끝내는 분산 트랜잭션 (feat. AI Agent)',
      ja: 'コードで完結させる分散トランザクション (feat. AI Agent)',
      en: 'Distributed Transactions Through Code (feat. AI Agent)',
    },
  },
  {
    slug: '가장-쉬운-동시성-문제-race-co',
    level: 'BASIC',
    title: {
      ko: '가장 쉬운 동시성 문제 - Race Condition',
      ja: '最も簡単な並行性問題 - Race Condition',
      en: 'The Easiest Concurrency Problem - Race Condition',
    },
  },
];

export const fallbackCourses = (lang: InflearnLang): Course[] =>
  FALLBACK.map((c) => ({ slug: c.slug, title: c.title[lang], level: c.level, url: courseUrl(c.slug, lang) }));

const unescapeJson = (s: string): string => {
  try {
    return JSON.parse(`"${s}"`) as string;
  } catch {
    return s;
  }
};

const toLevel = (v: string | undefined): CourseLevel =>
  v === 'BASIC' || v === 'INTERMEDIATE' || v === 'ADVANCED' ? v : 'OTHER';

/** 강의 목록 페이지 HTML에서 강사 숫자와 강의를 꺼낸다. 숫자를 못 찾으면 예외 */
export function parseInflearnPage(html: string, lang: InflearnLang = 'ko'): InflearnProfile {
  const stat = html.match(/"reviewAverage":"([\d.]+)","reviewCount":(\d+),"studentCount":(\d+)/);
  if (!stat) throw new Error('인프런 강사 숫자를 찾지 못했습니다');
  const stats: InflearnStats = { rating: stat[1], reviews: Number(stat[2]), students: Number(stat[3]) };

  const courses: Course[] = [];
  const seen = new Set<string>();
  const re = /"course":\{"id":\d+,"slug":"((?:[^"\\]|\\.)+)",(?:"[^"]+":(?:"(?:[^"\\]|\\.)*"|null),)*?"title":"((?:[^"\\]|\\.)+)"/g;
  for (const m of html.matchAll(re)) {
    const slug = unescapeJson(m[1]);
    if (seen.has(slug)) continue;
    seen.add(slug);
    const rest = html.slice(m.index ?? 0, (m.index ?? 0) + 20000);
    const level = rest.match(/"metadata":\{"level":"([A-Z]+)"/)?.[1];
    courses.push({ slug, title: unescapeJson(m[2]), level: toLevel(level), url: courseUrl(slug, lang) });
  }
  return { stats, courses: courses.length > 0 ? courses : fallbackCourses(lang) };
}

type Fetch = (input: string, init?: RequestInit) => Promise<Response>;

export async function loadInflearnProfile(lang: InflearnLang = 'ko', fetchImpl: Fetch = fetch): Promise<InflearnProfile> {
  const res = await fetchImpl(coursesPage(lang), { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; joyopi.com)' } });
  if (!res.ok) throw new Error(`인프런 응답 ${res.status}`);
  return parseInflearnPage(await res.text(), lang);
}
