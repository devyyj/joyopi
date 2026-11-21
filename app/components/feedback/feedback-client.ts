// joyopi.com 웹의 「의견 보내기」: 공통 의견 API(/api/feedback)로 보낸다. 규칙은 business/apps/common.md 4장.
import type { FeedbackApp, FeedbackKind } from '@/utils/feedback/handle-feedback';

const DEVICE_KEY = 'joyopi-feedback-device';

/** 브라우저마다 한 번 만든 익명 ID(횟수 제한에만 쓴다). 저장소를 못 쓰면 이번 방문용 ID */
export function getDeviceId(storage: Pick<Storage, 'getItem' | 'setItem'> | null, makeId: () => string): string {
  try {
    const saved = storage?.getItem(DEVICE_KEY);
    if (saved && /^[A-Za-z0-9_-]{8,64}$/.test(saved)) return saved;
  } catch {
    // 사생활 보호 모드 등: 저장소 없이 진행
  }
  const id = `web-${makeId()}`.slice(0, 64);
  try {
    storage?.setItem(DEVICE_KEY, id);
  } catch {
    // 저장하지 못해도 이번 전송은 한다
  }
  return id;
}

export interface FeedbackInput {
  app: FeedbackApp;
  kind: FeedbackKind | null;
  message: string;
  email: string;
  lang: string;
}

export type SendResult = 'ok' | 'rate-limited' | 'failed';

/** 보내고 결과를 돌려준다. 실패해도 쓴 글은 화면에 그대로 둔다(호출하는 쪽) */
export async function sendFeedback(
  input: FeedbackInput,
  deviceId: string,
  fetchImpl: typeof fetch = fetch,
): Promise<SendResult> {
  try {
    const res = await fetchImpl('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        app: input.app,
        kind: input.kind,
        message: input.message.trim(),
        email: input.email.trim(),
        deviceId,
        meta: { os: 'web', lang: input.lang },
      }),
    });
    if (res.ok) return 'ok';
    if (res.status === 429) return 'rate-limited';
    return 'failed';
  } catch {
    return 'failed';
  }
}
