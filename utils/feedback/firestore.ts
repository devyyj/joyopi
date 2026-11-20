// 서버(라우트 핸들러)에서만 import한다. Firebase Admin 비공개 키를 읽는다.
import { createHash } from 'node:crypto';

import type { Firestore } from 'firebase-admin/firestore';

import { getDb } from '@/utils/firebase/admin';

import type { FeedbackDeps } from './handle-feedback';
import { DEVICE_LIMIT, IP_LIMIT, nextRateState, RATE_WINDOW_MS, type RateState } from './rate';

/** 의견 원문. 브라우저 접근은 firestore.rules가 모두 막고, Firebase 콘솔과 Admin SDK로만 본다 */
export const FEEDBACK_COLLECTION = 'feedback';
/** 기기·IP별 전송 횟수. 문서 ID는 해시라 IP 원문은 남지 않는다. expireAt으로 TTL 정리를 걸 수 있다 */
export const FEEDBACK_RATE_COLLECTION = 'feedback_rate';

const hashKey = (s: string) => createHash('sha256').update(s).digest('hex');

export function firestoreFeedbackDeps(db: Firestore = getDb()): Pick<FeedbackDeps, 'checkRate' | 'save'> {
  return {
    checkRate: ({ deviceId, ip }, now) =>
      db.runTransaction(async (tx) => {
        const keys = [
          { ref: db.collection(FEEDBACK_RATE_COLLECTION).doc(hashKey(`device:${deviceId}`)), limit: DEVICE_LIMIT },
          ...(ip ? [{ ref: db.collection(FEEDBACK_RATE_COLLECTION).doc(hashKey(`ip:${ip}`)), limit: IP_LIMIT }] : []),
        ];
        // 트랜잭션은 읽기를 모두 끝낸 뒤 쓴다
        const snaps = await Promise.all(keys.map((k) => tx.get(k.ref)));
        const results = keys.map((k, i) => {
          const d = snaps[i].data() as RateState | undefined;
          return nextRateState(d && { windowStart: d.windowStart, count: d.count }, now, k.limit);
        });
        if (results.some((r) => !r.allowed)) return false;
        keys.forEach((k, i) => {
          const { state } = results[i];
          tx.set(k.ref, { ...state, expireAt: new Date(state.windowStart + RATE_WINDOW_MS) });
        });
        return true;
      }),
    save: async (rec) => (await db.collection(FEEDBACK_COLLECTION).add(rec)).id,
  };
}
