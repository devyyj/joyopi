export const getURL = () => {
  let url =
    process.env.NEXT_PUBLIC_SITE_URL ?? // 프로젝트 설정 환경 변수
    process.env.NEXT_PUBLIC_VERCEL_URL ?? // Vercel 배포 시 자동 생성
    'http://localhost:3000'
  
  // 프로토콜 포함 확인 및 슬래시 제거
  url = url.startsWith('http') ? url : `https://${url}`
  url = url.endsWith('/') ? url.slice(0, -1) : url
  
  return url
}
