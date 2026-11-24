import { NextResponse } from 'next/server';

import { handleFeedbackCleanup } from '@/utils/feedback/cleanup';
import { deleteExpiredFeedback } from '@/utils/feedback/firestore';

// 매일 한 번(vercel.json crons) 보관 기간(1년)이 지난 의견과 횟수 제한 문서를 지운다.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const res = await handleFeedbackCleanup(request.headers.get('authorization'), process.env.CRON_SECRET, {
    deleteExpired: (now) => deleteExpiredFeedback(now),
    now: () => new Date(),
    log: (msg, e) => console.error(msg, e),
  });
  return NextResponse.json(res.body, { status: res.status });
}
