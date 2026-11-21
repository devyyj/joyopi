// 홈에 보여 주는 바깥 데이터(유튜브 최근 영상, 인프런 강의·숫자)를 캐시해 읽는다.
// 유튜브는 1시간, 인프런은 하루에 한 번 새로 읽는다. 읽다가 실패하면 그 회차는 캐시하지 않고 null을 돌려주며,
// 홈은 그 칸을 기본 모양(채널 버튼만, 숫자 없이 기본 강의 목록)으로 보여 준다.
import { unstable_cache } from 'next/cache';
import { loadYoutubeHighlights, type YoutubeHighlights } from '@/utils/youtube/feed';
import { loadInflearnProfile, type InflearnProfile } from '@/utils/inflearn/profile';

export const YOUTUBE_REVALIDATE = 60 * 60;
export const INFLEARN_REVALIDATE = 60 * 60 * 24;

const cachedYoutube = unstable_cache(() => loadYoutubeHighlights(), ['youtube-highlights'], {
  revalidate: YOUTUBE_REVALIDATE,
});
const cachedInflearn = unstable_cache(() => loadInflearnProfile(), ['inflearn-profile'], {
  revalidate: INFLEARN_REVALIDATE,
});

export async function getYoutubeHighlights(): Promise<YoutubeHighlights | null> {
  try {
    return await cachedYoutube();
  } catch (e) {
    console.error('[home] 유튜브 피드를 읽지 못했습니다', e);
    return null;
  }
}

export async function getInflearnProfile(): Promise<InflearnProfile | null> {
  try {
    return await cachedInflearn();
  } catch (e) {
    console.error('[home] 인프런 강의 정보를 읽지 못했습니다', e);
    return null;
  }
}
