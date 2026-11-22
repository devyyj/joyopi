'use server';

import { headers } from 'next/headers';

import { getDb } from '@/utils/firebase/admin';
import { isBotUserAgent, kstDay, type VisitStats } from '@/utils/visits';

// visits/{YYYY-MM-DD} { count } — 그날(한국 날짜) 방문
// visits/total { count, since } — 누적 방문과 기록 시작일
// 개인을 알아볼 수 있는 정보(IP, 브라우저 정보 등)는 저장하지 않는다.
const COLLECTION = 'visits';
const TOTAL_ID = 'total';

function readCount(data: Record<string, unknown> | undefined): number {
  const n = data?.count;
  return typeof n === 'number' && Number.isFinite(n) ? n : 0;
}

function readSince(data: Record<string, unknown> | undefined): string | null {
  return typeof data?.since === 'string' ? data.since : null;
}

/**
 * 홈 방문을 기록하고 방문자 수를 돌려준다.
 * 같은 브라우저는 하루에 한 번만 세도록 클라이언트가 count를 정한다(true면 1 올리고, false면 읽기만).
 * 로봇·미리보기 요청은 count가 true여도 세지 않는다. 실패하면 null.
 */
export async function recordVisit(count: boolean): Promise<VisitStats | null> {
  if (typeof count !== 'boolean') return null;
  try {
    const ua = (await headers()).get('user-agent') ?? '';
    const shouldCount = count && !isBotUserAgent(ua);
    const db = getDb();
    const day = kstDay(new Date());
    const dayRef = db.collection(COLLECTION).doc(day);
    const totalRef = db.collection(COLLECTION).doc(TOTAL_ID);

    if (!shouldCount) {
      const [d, t] = await db.getAll(dayRef, totalRef);
      return { today: readCount(d.data()), total: readCount(t.data()), since: readSince(t.data()) };
    }

    return await db.runTransaction(async (tx) => {
      const [d, t] = await tx.getAll(dayRef, totalRef);
      const today = readCount(d.data()) + 1;
      const total = readCount(t.data()) + 1;
      const since = readSince(t.data()) ?? day;
      tx.set(dayRef, { count: today });
      tx.set(totalRef, { count: total, since });
      return { today, total, since };
    });
  } catch (error) {
    console.error('Failed to record visit:', error);
    return null;
  }
}
