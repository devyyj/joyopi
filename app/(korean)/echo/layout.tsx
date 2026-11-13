import type { Metadata } from 'next';

// 메뉴에는 없고 주소를 아는 사람은 누구나 로그인 없이 쓴다. 검색엔진에는 나오지 않게 한다.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function EchoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
