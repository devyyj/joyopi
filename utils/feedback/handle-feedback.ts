/**
 * 모든 앱 공통 「의견 보내기」 API의 판단 부분(라우트: app/api/feedback/route.ts).
 *
 * 앱 안 시트에서 보낸 의견을 검사해 저장하고 Slack으로 알린다. 규칙의 정본은
 * business/apps/common.md 4장이다. 저장(Firestore)·횟수 제한·알림(Slack)은 deps로 받아 테스트한다.
 */

/** 받는 앱: 앱 경로(joyopi.com/apps/<경로>) → Slack에 보일 이름 */
export const FEEDBACK_APPS = {
  agirok: '아기록',
  rockgazing: '돌보기',
  ssamkejul: '쌤케줄',
  likeloop: 'LikeLoop',
  /** joyopi.com 웹의 「의견 보내기」에서 「사이트 전체」를 고른 의견 */
  joyopi: '사이트(joyopi.com)',
} as const;
export type FeedbackApp = keyof typeof FEEDBACK_APPS;

/** 시트의 칩: 불편해요 / 이런 기능 원해요 / 기타. 고르지 않으면 null */
export const FEEDBACK_KINDS = ['bug', 'idea', 'other'] as const;
export type FeedbackKind = (typeof FEEDBACK_KINDS)[number];

/** 앱이 자동으로 붙이는 기기 정보. 이 키만 남긴다 */
const META_KEYS = ['appVersion', 'build', 'os', 'osVersion', 'device', 'lang'] as const;
export type FeedbackMeta = Partial<Record<(typeof META_KEYS)[number], string>>;

export const MESSAGE_MAX = 2000;
const META_MAX = 64;
const EMAIL_MAX = 254;
/** 앱 설치마다 만든 익명 ID(UUID 등). 횟수 제한에만 쓴다 */
const DEVICE_ID = /^[A-Za-z0-9_-]{8,64}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type FeedbackRecord = {
  app: FeedbackApp;
  kind: FeedbackKind | null;
  message: string;
  email: string | null;
  deviceId: string;
  meta: FeedbackMeta;
  createdAt: Date;
};

export type FeedbackDeps = {
  /** 기기·IP별 전송 횟수 확인. 보내도 되면 true(그리고 1 센다) */
  checkRate: (keys: { deviceId: string; ip: string | null }, now: Date) => Promise<boolean>;
  /** 저장하고 문서 ID를 돌려준다 */
  save: (rec: FeedbackRecord) => Promise<string>;
  notify: (rec: FeedbackRecord, id: string) => Promise<void>;
  now: () => Date;
  log: (msg: string, e?: unknown) => void;
};

export type ApiResult = { status: number; body: { ok: boolean; error?: string } };

const bad = (error: string): ApiResult => ({ status: 400, body: { ok: false, error } });

type Parsed = { ok: true; value: Omit<FeedbackRecord, 'createdAt'> } | { ok: false; error: string };

function parse(body: unknown): Parsed {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return { ok: false, error: 'invalid-body' };
  const b = body as Record<string, unknown>;

  if (typeof b.app !== 'string' || !Object.hasOwn(FEEDBACK_APPS, b.app)) return { ok: false, error: 'invalid-app' };
  const app = b.app as FeedbackApp;

  let kind: FeedbackKind | null = null;
  if (b.kind !== undefined && b.kind !== null) {
    if (!FEEDBACK_KINDS.includes(b.kind as FeedbackKind)) return { ok: false, error: 'invalid-kind' };
    kind = b.kind as FeedbackKind;
  }

  const message = typeof b.message === 'string' ? b.message.trim() : '';
  if (!message) return { ok: false, error: 'empty-message' };
  if (message.length > MESSAGE_MAX) return { ok: false, error: 'message-too-long' };

  let email: string | null = null;
  if (typeof b.email === 'string' && b.email.trim()) {
    email = b.email.trim();
    if (email.length > EMAIL_MAX || !EMAIL.test(email)) return { ok: false, error: 'invalid-email' };
  } else if (b.email !== undefined && b.email !== null && typeof b.email !== 'string') {
    return { ok: false, error: 'invalid-email' };
  }

  if (typeof b.deviceId !== 'string' || !DEVICE_ID.test(b.deviceId)) return { ok: false, error: 'invalid-device' };

  const meta: FeedbackMeta = {};
  if (b.meta && typeof b.meta === 'object' && !Array.isArray(b.meta)) {
    const m = b.meta as Record<string, unknown>;
    for (const key of META_KEYS) {
      const v = m[key];
      if (typeof v === 'string' && v.trim()) meta[key] = v.trim().slice(0, META_MAX);
    }
  }

  return { ok: true, value: { app, kind, message, email, deviceId: b.deviceId, meta } };
}

export async function handleFeedback(body: unknown, ip: string | null, deps: FeedbackDeps): Promise<ApiResult> {
  const parsed = parse(body);
  if (!parsed.ok) return bad(parsed.error);

  const now = deps.now();
  const rec: FeedbackRecord = { ...parsed.value, createdAt: now };

  let id: string;
  try {
    if (!(await deps.checkRate({ deviceId: rec.deviceId, ip }, now))) {
      return { status: 429, body: { ok: false, error: 'rate-limited' } };
    }
    id = await deps.save(rec);
  } catch (e) {
    deps.log('[feedback] 저장 실패', e);
    return { status: 500, body: { ok: false, error: 'save-failed' } };
  }

  // 저장까지 됐으면 의견은 받은 것이다. 알림 실패는 기록만 하고 사용자에게는 성공을 준다.
  try {
    await deps.notify(rec, id);
  } catch (e) {
    deps.log('[feedback] Slack 알림 실패', e);
  }
  return { status: 200, body: { ok: true } };
}
