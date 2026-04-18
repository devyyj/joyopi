import { headers } from 'next/headers'

/**
 * 현재 환경의 베이스 URL을 반환합니다.
 * 1. 서버 사이드: 요청 헤더(host, x-forwarded-proto)를 통해 실제 접속 도메인 감지
 * 2. 클라이언트 사이드: window.location.origin 사용
 * 3. 기타: 환경 변수(NEXT_PUBLIC_SITE_URL, NEXT_PUBLIC_VERCEL_URL) 또는 로컬호스트
 */
export const getURL = async () => {
  let url: string

  // 1. 서버 사이드 환경 (Server Actions, Route Handlers 등)
  try {
    const headersList = await headers()
    const host = headersList.get('host')
    const protocol = headersList.get('x-forwarded-proto') || 'https'
    
    if (host) {
      // 로컬 개발 환경(localhost)인 경우 http, 그 외엔 https (또는 전달된 프로토콜)
      const finalProtocol = host.includes('localhost') ? 'http' : protocol
      url = `${finalProtocol}://${host}`
      return url.endsWith('/') ? url.slice(0, -1) : url
    }
  } catch {
    // headers() 호출 불가 시 (클라이언트 사이드 등) 다음 단계 진행
  }

  // 2. 클라이언트 사이드 환경
  if (typeof window !== 'undefined' && window.location.origin) {
    url = window.location.origin
    return url.endsWith('/') ? url.slice(0, -1) : url
  }

  // 3. 환경 변수 참조 (빌드 타임 등)
  url =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_VERCEL_URL ??
    'http://localhost:3000'
  
  url = url.startsWith('http') ? url : `https://${url}`
  url = url.endsWith('/') ? url.slice(0, -1) : url
  
  return url
}
