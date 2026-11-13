import { NextResponse } from 'next/server';

import { handleDeleteAccount } from '@/utils/agirok/delete-account';
import { agirokAuthDeps } from '@/utils/agirok/firebase-admin';

// 아기록 앱의 탈퇴 요청: Firebase ID 토큰의 사용자 계정을 지운다(판단은 utils/agirok/delete-account.ts).
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  let deps;
  try {
    deps = agirokAuthDeps();
  } catch (e) {
    console.error('[agirok/delete-account] Firebase Admin 설정 오류', e);
    return NextResponse.json({ ok: false, error: 'server-config' }, { status: 500 });
  }
  const res = await handleDeleteAccount(request.headers.get('authorization'), deps);
  if (res.status === 500) console.error('[agirok/delete-account] 계정 삭제 실패');
  return NextResponse.json(res.body, { status: res.status });
}
