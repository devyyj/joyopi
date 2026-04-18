import { headers } from 'next/headers'

/**
 * 현재 접속 중인 웹사이트의 베이스 URL을 동적으로 결정합니다.
 * 
 * [우선순위]
 * 1. 서버 사이드: 실제 HTTP 요청 헤더 (host, x-forwarded-host) - 배포/개발 환경 자동 대응
 * 2. 클라이언트 사이드: window.location.origin - 브라우저 접속 정보 직접 참조
 * 3. 빌드 타임/기타: 환경 변수 또는 기본값 (요청 컨텍스트가 없는 경우의 폴백)
 */
export const getURL = async () => {
  // 1. 서버 사이드 환경 (Server Actions, Route Handlers 등)
  try {
    const headersList = await headers()
    // x-forwarded-host는 프록시(Vercel, Nginx 등) 환경에서 실제 도메인을 가짐
    const host = headersList.get('x-forwarded-host') || headersList.get('host')
    const protocol = headersList.get('x-forwarded-proto') || 'https'
    
    if (host) {
      // 로컬 개발 환경(localhost)인 경우 http, 그 외엔 https (또는 전달된 프로토콜)
      const finalProtocol = host.includes('localhost') ? 'http' : protocol
      const url = `${finalProtocol}://${host}`
      return url.endsWith('/') ? url.slice(0, -1) : url
    }
  } catch {
    // headers() 호출 불가 시 (클라이언트 사이드 또는 static generation 도중) 다음 단계 진행
  }

  // 2. 클라이언트 사이드 환경 (브라우저에서 직접 호출 시)
  if (typeof window !== 'undefined' && window.location.origin) {
    const url = window.location.origin
    return url.endsWith('/') ? url.slice(0, -1) : url
  }

  // 3. 빌드 타임 또는 기타 환경 (환경 변수 참조)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_VERCEL_URL
  
  if (siteUrl) {
    const url = siteUrl.startsWith('http') ? siteUrl : `https://${siteUrl}`
    return url.endsWith('/') ? url.slice(0, -1) : url
  }

  // 최후의 폴백 (로컬 기본값)
  return 'http://localhost:3000'
}
