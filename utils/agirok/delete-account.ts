/**
 * 아기록 탈퇴 API의 판단 부분(라우트: app/api/agirok/delete-account/route.ts).
 *
 * 앱(Firebase 클라이언트)에서 계정을 지우면 Firebase가 로그인한 지 오래된 계정을 auth/requires-recent-login으로
 * 거절해 사용자에게 다시 로그인을 시켜야 한다. 그래서 앱은 기록을 지운 뒤 자기 ID 토큰을 보내고, 여기서
 * Firebase Admin SDK로 토큰을 확인해 그 토큰의 사용자만 지운다(아기록 docs/decisions.md ‘탈퇴 순서’).
 */
export type DeleteAccountDeps = {
  /** Firebase ID 토큰 확인. 위조·만료·다른 프로젝트 토큰이면 던진다 */
  verifyIdToken: (token: string) => Promise<{ uid: string }>;
  deleteUser: (uid: string) => Promise<void>;
};

export type ApiResult = { status: number; body: { ok: boolean; error?: string } };

export async function handleDeleteAccount(authorization: string | null, deps: DeleteAccountDeps): Promise<ApiResult> {
  const token = authorization?.match(/^Bearer (\S+)$/)?.[1];
  if (!token) return { status: 401, body: { ok: false, error: 'missing-token' } };

  let uid: string;
  try {
    ({ uid } = await deps.verifyIdToken(token));
  } catch {
    return { status: 401, body: { ok: false, error: 'invalid-token' } };
  }

  try {
    await deps.deleteUser(uid);
  } catch (e) {
    // 이미 지워진 계정이면 목적은 이뤄졌다(앱이 다시 요청해도 안전하게).
    if ((e as { code?: string } | null)?.code !== 'auth/user-not-found') {
      return { status: 500, body: { ok: false, error: 'delete-failed' } };
    }
  }
  return { status: 200, body: { ok: true } };
}
