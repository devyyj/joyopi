import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 홈 「유튜브」 칸의 영상 썸네일
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'i.ytimg.com', pathname: '/vi/**' }],
  },
  // 아기록 E2E: Android 에뮬레이터가 이 PC의 next dev(초대 링크 페이지)를 10.0.2.2로 연다(개발 서버에만 쓰인다)
  allowedDevOrigins: ['10.0.2.2'],
  experimental: {
    // 루트 레이아웃이 둘(app/[lang], app/(korean))이라 404는 app/global-not-found.tsx가 맡는다.
    globalNotFound: true,
  },
  // 없앤 문의 게시판·프로필 주소로 들어오면 지원 페이지로 보낸다.
  async redirects() {
    return [
      { source: '/board', destination: '/support', permanent: true },
      { source: '/board/:path*', destination: '/support', permanent: true },
      { source: '/profile', destination: '/support', permanent: true },
    ];
  },
};

export default nextConfig;
