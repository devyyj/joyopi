// 조요피(JOYOPI)가 만드는 앱 목록 — 홈(/)이 이 목록을 그린다.

export interface AppLink {
  label: string;
  href: string;
}

export interface AppEntry {
  slug: string;
  name: string;
  /** 나라별 스토어 이름 등 함께 보여 줄 다른 이름 */
  altNames: string[];
  description: string;
  /** 스토어 주소. 출시 전에는 null → 「출시 준비 중」으로 표시 */
  appStoreUrl: string | null;
  googlePlayUrl: string | null;
  links: AppLink[];
}

export const APPS: AppEntry[] = [
  {
    slug: 'rockgazing',
    name: 'Rockgazing',
    altNames: ['돌멍타임', '石の子守り'],
    description: '배경과 날씨가 바뀌는 곳에 돌 하나를 두고 바라보는 앱',
    appStoreUrl: null,
    googlePlayUrl: null,
    links: [
      { label: '개인정보 처리방침', href: '/apps/rockgazing/privacy' },
      { label: '지원', href: '/apps/rockgazing/support' },
    ],
  },
  {
    slug: 'agirok',
    name: '아기록',
    altNames: [],
    description: '한 손, 한 번 탭으로 끝나는 육아 기록',
    appStoreUrl: null,
    googlePlayUrl: null,
    links: [
      { label: '개인정보처리방침', href: '/apps/agirok/privacy' },
      { label: '지원', href: '/apps/agirok/support' },
      { label: '계정·데이터 삭제', href: '/apps/agirok/delete-account' },
    ],
  },
];
