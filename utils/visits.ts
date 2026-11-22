// 방문자 수: 서버 액션(app/actions/visits.ts)과 홈의 방문자 줄(app/components/visitor-line.tsx)이 함께 쓴다.

/** 방문자 수를 날짜별로 나누는 기준 날짜(한국 시각) — YYYY-MM-DD */
export function kstDay(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
}

// 검색 로봇, 메신저 링크 미리보기, 자동화(헤드리스) 브라우저. 브라우저 정보가 없는 요청도 세지 않는다.
const BOT_PATTERN = /bot|crawl|spider|slurp|preview|facebookexternalhit|headless|lighthouse|playwright|puppeteer|curl|wget/i;

export function isBotUserAgent(ua: string): boolean {
  return !ua.trim() || BOT_PATTERN.test(ua);
}

export interface VisitStats {
  /** 오늘(한국 날짜) 방문 */
  today: number;
  /** 기록을 시작한 뒤 누적 방문 */
  total: number;
  /** 기록을 시작한 날(YYYY-MM-DD). 아직 기록이 없으면 null */
  since: string | null;
}
