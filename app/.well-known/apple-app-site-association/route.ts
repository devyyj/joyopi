import { NextResponse } from 'next/server';

/**
 * iOS 유니버설 링크 설정(Apple은 확장자 없는 이 주소를 JSON으로 읽는다).
 * 아기록 초대 링크 /agirok/i/* 를 앱(팀 7YP66VZKDM, com.joyopi.agirok)이 받는다(아기록 docs/decisions.md ‘초대 링크’).
 * 앱이 받는 링크 경로를 더하면 여기에 모두 적는다(business apps/common.md 11장).
 */
export const dynamic = 'force-static';

export function GET() {
  return NextResponse.json(
    {
      applinks: {
        details: [{ appIDs: ['7YP66VZKDM.com.joyopi.agirok'], components: [{ '/': '/agirok/i/*', comment: '아기록 초대 링크' }] }],
      },
    },
    { headers: { 'Cache-Control': 'public, max-age=3600' } },
  );
}
