// 보관 기간이 지난 의견·횟수 제한 문서를 지우는 매일 크론(app/api/cron/feedback-cleanup).
// joyopi Firebase 프로젝트는 결제(Blaze)가 꺼져 있어 Firestore TTL을 쓸 수 없어 직접 지운다.
import { timingSafeEqual } from 'node:crypto';

export type CleanupDeps = {
  /** expireAt이 now 이하인 문서를 지우고 지운 개수를 돌려준다 */
  deleteExpired: (now: Date) => Promise<number>;
  now: () => Date;
  log?: (msg: string, e?: unknown) => void;
};

export type CleanupResult = { status: number; body: { ok: boolean; deleted?: number; error?: string } };

function sameSecret(header: string | null, secret: string): boolean {
  const a = Buffer.from(header ?? '');
  const b = Buffer.from(`Bearer ${secret}`);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Vercel 크론은 CRON_SECRET 환경 변수가 있으면 Authorization: Bearer <CRON_SECRET>을 붙여 부른다 */
export async function handleFeedbackCleanup(
  authHeader: string | null,
  secret: string | undefined,
  deps: CleanupDeps,
): Promise<CleanupResult> {
  if (!secret) return { status: 500, body: { ok: false, error: 'server-config' } };
  if (!sameSecret(authHeader, secret)) return { status: 401, body: { ok: false, error: 'unauthorized' } };
  try {
    const deleted = await deps.deleteExpired(deps.now());
    return { status: 200, body: { ok: true, deleted } };
  } catch (e) {
    deps.log?.('[feedback-cleanup] 삭제 실패', e);
    return { status: 500, body: { ok: false, error: 'delete-failed' } };
  }
}
