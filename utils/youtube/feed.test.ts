import { describe, it, expect, vi } from 'vitest';
import { parseFeed, stripHashtags, isShort, loadYoutubeHighlights, YOUTUBE_CHANNEL_ID } from './feed';

const entry = (id: string, title: string, date: string) => `
 <entry>
  <id>yt:video:${id}</id>
  <yt:videoId>${id}</yt:videoId>
  <title>${title}</title>
  <published>${date}T09:00:00+00:00</published>
 </entry>`;

const feed = (...entries: string[]) => `<?xml version="1.0"?><feed><title>조요피</title>${entries.join('')}</feed>`;

describe('stripHashtags', () => {
  it('제목 속 해시태그를 떼고 공백을 정리한다', () => {
    expect(stripHashtags('동시성 문제 해결 방법 - 분산 환경 #동시성문제 #인프런')).toBe('동시성 문제 해결 방법 - 분산 환경');
    expect(stripHashtags('#개발자면접 성과를 말할 때')).toBe('성과를 말할 때');
    expect(stripHashtags('C# 기초')).toBe('C# 기초');
  });
});

describe('parseFeed', () => {
  it('영상 ID·제목(해시태그 제거, 엔티티 해석)·날짜를 피드 순서대로 꺼낸다', () => {
    const xml = feed(entry('kLwfYp8c8z4', '분산 환경 #동시성문제', '2026-11-15'), entry('8JfA3iRZqsg', 'Q&amp;A 8분 컷!', '2026-11-10'));
    expect(parseFeed(xml)).toEqual([
      { id: 'kLwfYp8c8z4', title: '분산 환경', published: '2026-11-15' },
      { id: '8JfA3iRZqsg', title: 'Q&A 8분 컷!', published: '2026-11-10' },
    ]);
  });

  it('해시태그뿐인 제목은 원래 제목을 그대로 쓴다', () => {
    expect(parseFeed(feed(entry('abcdefgh123', '#shorts', '2026-11-01')))[0].title).toBe('#shorts');
  });

  it('형식이 다르거나 ID가 이상한 항목은 건너뛰고, 피드가 아니면 빈 배열', () => {
    expect(parseFeed(feed(entry('bad id!', '제목', '2026-11-01'), '<entry><title>x</title></entry>'))).toEqual([]);
    expect(parseFeed('<html>오류</html>')).toEqual([]);
  });
});

const res = (status: number, body = '') => ({ status, ok: status >= 200 && status < 300, text: async () => body }) as Response;

describe('isShort', () => {
  it('shorts 주소가 그대로 열리면 쇼츠, 다른 곳으로 넘기면 일반 영상', async () => {
    expect(await isShort('a', async () => res(200))).toBe(true);
    expect(await isShort('a', async () => res(303))).toBe(false);
  });

  it('오류·알 수 없는 응답이면 null (어느 쪽에도 넣지 않는다)', async () => {
    expect(await isShort('a', async () => res(500))).toBeNull();
    expect(await isShort('a', async () => { throw new Error('offline'); })).toBeNull();
  });

  it('리다이렉트를 따라가지 않고 HEAD로 묻는다', async () => {
    const f = vi.fn(async () => res(200));
    await isShort('abc', f);
    expect(f).toHaveBeenCalledWith('https://www.youtube.com/shorts/abc', { method: 'HEAD', redirect: 'manual' });
  });
});

describe('loadYoutubeHighlights', () => {
  const xml = feed(
    entry('short01aaaa', '쇼츠 1', '2026-11-15'),
    entry('short02aaaa', '쇼츠 2', '2026-11-15'),
    entry('video01aaaa', '영상 1', '2026-11-14'),
    entry('short03aaaa', '쇼츠 3', '2026-11-13'),
    entry('video02aaaa', '영상 2', '2026-11-12'),
    entry('short04aaaa', '쇼츠 4', '2026-11-11'),
    entry('unknown0aaa', '모름', '2026-11-10'),
  );
  const fakeFetch = (feedStatus = 200) =>
    vi.fn(async (url: string) => {
      if (url.includes('feeds/videos.xml')) return res(feedStatus, xml);
      const id = url.split('/').pop()!;
      if (id.startsWith('short')) return res(200);
      if (id.startsWith('video')) return res(303);
      return res(500);
    });

  it('가장 최근 일반 영상 1개와 최근 쇼츠 3개를 고른다', async () => {
    const f = fakeFetch();
    const r = await loadYoutubeHighlights(f);
    expect(f).toHaveBeenCalledWith(`https://www.youtube.com/feeds/videos.xml?channel_id=${YOUTUBE_CHANNEL_ID}`);
    expect(r.latest).toEqual({
      id: 'video01aaaa',
      title: '영상 1',
      published: '2026-11-14',
      url: 'https://www.youtube.com/watch?v=video01aaaa',
      thumbnail: 'https://i.ytimg.com/vi/video01aaaa/hqdefault.jpg',
    });
    expect(r.shorts.map((v) => v.id)).toEqual(['short01aaaa', 'short02aaaa', 'short03aaaa']);
    expect(r.shorts[0].url).toBe('https://www.youtube.com/shorts/short01aaaa');
  });

  it('일반 영상이 없으면 latest는 null', async () => {
    const only = feed(entry('short01aaaa', '쇼츠', '2026-11-15'));
    const r = await loadYoutubeHighlights(async (url) => (url.includes('feeds') ? res(200, only) : res(200)));
    expect(r).toEqual({ latest: null, shorts: [expect.objectContaining({ id: 'short01aaaa' })] });
  });

  it('피드를 못 읽으면 예외 (마지막으로 읽은 값을 쓰게)', async () => {
    await expect(loadYoutubeHighlights(fakeFetch(503))).rejects.toThrow('503');
  });
});
