import { NextResponse, type NextRequest } from 'next/server';
import { isLegacyPath, localePath, pickLang } from '@/app/_i18n/config';

/**
 * 언어 없는 예전 주소(스토어에 등록한 주소)를 브라우저 언어의 `/{lang}/…`로 보낸다.
 * 307(임시): 같은 주소라도 사람마다 언어가 달라 영구 리다이렉트로 캐시되면 안 된다.
 * 메아리·소식·소개·약관·회사 지원, app-ads.txt 등 정적 파일, API는 matcher에 없어 이 함수가 돌지 않는다.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!isLegacyPath(pathname)) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = localePath(pickLang(request.headers.get('accept-language')), pathname);
  const response = NextResponse.redirect(url, 307);
  response.headers.set('Vary', 'Accept-Language');
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
}

// app/_i18n/config.ts 의 LEGACY_PATHS와 같은 목록. matcher는 빌드 때 정적으로 읽혀 상수 배열을 직접 적는다.
export const config = {
  matcher: [
    '/',
    '/apps',
    '/apps/rockgazing',
    '/apps/rockgazing/privacy',
    '/apps/rockgazing/support',
    '/apps/agirok',
    '/apps/agirok/privacy',
    '/apps/agirok/support',
    '/apps/agirok/delete-account',
    '/apps/agirok/terms',
  ],
};
