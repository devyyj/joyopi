import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
