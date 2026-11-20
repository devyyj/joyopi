import { NextResponse } from 'next/server';

import { firestoreFeedbackDeps } from '@/utils/feedback/firestore';
import { handleFeedback } from '@/utils/feedback/handle-feedback';
import { formatSlackText, postToSlack } from '@/utils/feedback/slack';

// 모든 앱 공통 「의견 보내기」: 검사·저장·Slack 알림(판단은 utils/feedback/handle-feedback.ts).
// 규칙의 정본은 business/apps/common.md 4장.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** 요청 본문 최대 크기. 글 2000자(UTF-8로 최대 약 6KB)와 기기 정보를 넉넉히 담는다 */
const MAX_BODY_BYTES = 16 * 1024;

// 웹뷰 앱(돌보기·쌤케줄)은 출처가 joyopi.com이 아니므로 CORS를 연다. 쿠키·인증을 쓰지 않아 *로 충분하다.
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

const json = (body: unknown, status: number) => NextResponse.json(body, { status, headers: CORS });

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

function clientIp(request: Request): string | null {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwarded || request.headers.get('x-real-ip') || null;
}

export async function POST(request: Request) {
  const raw = await request.text();
  if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) return json({ ok: false, error: 'too-large' }, 413);

  let body: unknown = null;
  try {
    body = JSON.parse(raw);
  } catch {
    // body가 null이면 handleFeedback이 invalid-body로 답한다
  }

  let store;
  try {
    store = firestoreFeedbackDeps();
  } catch (e) {
    console.error('[feedback] Firebase Admin 설정 오류', e);
    return json({ ok: false, error: 'server-config' }, 500);
  }

  const res = await handleFeedback(body, clientIp(request), {
    ...store,
    notify: async (rec, id) => {
      const webhook = process.env.SLACK_FEEDBACK_WEBHOOK_URL;
      if (!webhook) throw new Error('SLACK_FEEDBACK_WEBHOOK_URL 없음');
      await postToSlack(webhook, formatSlackText(rec, id));
    },
    now: () => new Date(),
    log: (msg, e) => console.error(msg, e),
  });
  return json(res.body, res.status);
}
