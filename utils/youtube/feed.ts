/**
 * 홈 「유튜브」 칸의 최근 영상. 유튜브가 채널마다 공개하는 피드(최근 15개, API 키 없음)를 읽는다.
 *
 * 피드에는 쇼츠 표시가 없어서, `youtube.com/shorts/<ID>`가 그대로 열리면(200) 쇼츠,
 * 일반 영상 주소로 넘기면(3xx) 일반 영상으로 가른다. 캐시는 app/_data/external.ts가 맡는다.
 */

export const YOUTUBE_CHANNEL_ID = 'UCNosV5E-sWXAG_yQCSshgJQ';
export const YOUTUBE_CHANNEL_URL = 'https://www.youtube.com/@joyopi';
const FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${YOUTUBE_CHANNEL_ID}`;

export interface FeedEntry {
  id: string;
  /** 해시태그를 뗀 제목 */
  title: string;
  /** YYYY-MM-DD */
  published: string;
}

export interface Video extends FeedEntry {
  url: string;
  thumbnail: string;
}

export interface YoutubeHighlights {
  /** 가장 최근 일반 영상. 최근 15개 안에 없으면 null */
  latest: Video | null;
  /** 최근 쇼츠(최대 3개) */
  shorts: Video[];
}

const decode = (s: string) =>
  s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');

/** 「동시성 문제 해결 방법 #동시성문제 #인프런」 → 「동시성 문제 해결 방법」 */
export const stripHashtags = (title: string) => title.replace(/(^|\s)#[^\s#]+/g, '').replace(/\s+/g, ' ').trim();

/** 피드 XML에서 영상 목록(피드 순서 = 최신 먼저)을 꺼낸다. 형식이 다르면 빈 배열 */
export function parseFeed(xml: string): FeedEntry[] {
  const entries: FeedEntry[] = [];
  for (const block of xml.split('<entry>').slice(1)) {
    const id = block.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1]?.trim();
    const rawTitle = block.match(/<title>([^<]*)<\/title>/)?.[1];
    const published = block.match(/<published>(\d{4}-\d{2}-\d{2})/)?.[1];
    if (!id || !/^[A-Za-z0-9_-]{6,20}$/.test(id) || rawTitle === undefined || !published) continue;
    const title = stripHashtags(decode(rawTitle)) || decode(rawTitle).trim();
    entries.push({ id, title, published });
  }
  return entries;
}

const toVideo = (e: FeedEntry, short: boolean): Video => ({
  ...e,
  url: short ? `https://www.youtube.com/shorts/${e.id}` : `https://www.youtube.com/watch?v=${e.id}`,
  thumbnail: `https://i.ytimg.com/vi/${e.id}/hqdefault.jpg`,
});

type Fetch = (input: string, init?: RequestInit) => Promise<Response>;

/** 쇼츠면 true, 일반 영상이면 false, 알 수 없으면(네트워크 오류 등) null */
export async function isShort(id: string, fetchImpl: Fetch): Promise<boolean | null> {
  try {
    const res = await fetchImpl(`https://www.youtube.com/shorts/${id}`, { method: 'HEAD', redirect: 'manual' });
    if (res.status === 200) return true;
    if (res.status >= 300 && res.status < 400) return false;
    return null;
  } catch {
    return null;
  }
}

/** 피드를 읽어 최근 일반 영상 1개와 쇼츠 3개를 고른다. 피드를 못 읽으면 예외 */
export async function loadYoutubeHighlights(fetchImpl: Fetch = fetch): Promise<YoutubeHighlights> {
  const res = await fetchImpl(FEED_URL);
  if (!res.ok) throw new Error(`유튜브 피드 응답 ${res.status}`);
  const entries = parseFeed(await res.text());
  const kinds = await Promise.all(entries.map((e) => isShort(e.id, fetchImpl)));

  let latest: Video | null = null;
  const shorts: Video[] = [];
  entries.forEach((e, i) => {
    if (kinds[i] === false && !latest) latest = toVideo(e, false);
    if (kinds[i] === true && shorts.length < 3) shorts.push(toVideo(e, true));
  });
  return { latest, shorts };
}
