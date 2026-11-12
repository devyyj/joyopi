// 사이트 대표 메뉴 — 헤더와 푸터가 같이 쓴다.
// 에코(/echo)는 일부러 넣지 않는다. 주소를 아는 허용 계정만 직접 들어간다.

export interface SiteLink {
  label: string;
  href: string;
}

export const NAV_ITEMS: SiteLink[] = [
  { label: '앱', href: '/apps' },
  { label: '소개', href: '/about' },
  { label: '소식', href: '/news' },
  { label: '지원', href: '/support' },
  { label: '문의', href: '/board' },
];

export const POLICY_LINKS: SiteLink[] = [
  { label: '약관·정책', href: '/policies' },
  { label: 'Rockgazing 개인정보 처리방침', href: '/apps/rockgazing/privacy' },
  { label: '아기록 개인정보처리방침', href: '/apps/agirok/privacy' },
];
