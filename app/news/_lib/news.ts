// 소식(공지) 목록 — 최신 글을 맨 위에 더한다. DB 없이 이 파일만 고치면 된다.

export interface NewsItem {
  /** YYYY-MM-DD */
  date: string;
  title: string;
  body: string;
}

export const NEWS: NewsItem[] = [
  {
    date: '2026-11-12',
    title: 'joyopi.com을 새로 꾸몄습니다',
    body: '제가 만드는 앱의 소개, 지원, 개인정보 처리방침을 한곳에서 볼 수 있게 했습니다. Rockgazing(돌멍타임)과 아기록은 출시를 준비하고 있으며, 출시하면 이곳에 알리겠습니다.',
  },
];

/** 최신 글 먼저 */
export const getNews = (): NewsItem[] => [...NEWS].sort((a, b) => b.date.localeCompare(a.date));