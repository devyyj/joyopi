// 조요피(JOYOPI)가 만드는 앱 목록 — 홈, /apps, 앱별 소개 페이지가 이 목록을 그린다.

export interface AppLink {
  label: string;
  href: string;
}

export interface AppEntry {
  slug: string;
  name: string;
  /** 나라별 스토어 이름 등 함께 보여 줄 다른 이름 */
  altNames: string[];
  /** 한 줄 소개 */
  description: string;
  /** 소개 페이지의 특징 목록. 앱이 실제로 하는 일만 적는다. */
  features: string[];
  /** 지원 기기·언어 등 */
  facts: { label: string; value: string }[];
  /** 스토어 주소. 출시 전에는 null → 「출시 준비 중」으로 표시 */
  appStoreUrl: string | null;
  googlePlayUrl: string | null;
  /** 소개 페이지 주소 */
  href: string;
  links: AppLink[];
}

export const APPS: AppEntry[] = [
  {
    slug: 'rockgazing',
    name: 'Rockgazing',
    altNames: ['돌멍타임', '石の子守り'],
    description: '배경과 날씨가 바뀌는 곳에 돌 하나를 두고 바라보는 앱',
    features: [
      '배경과 날씨가 바뀌는 풍경 속에 돌 하나가 놓여 있습니다.',
      '내 돌에게 이름을 지어 줍니다.',
      '켜 두고 바라보는 앱이라, 열려 있는 동안 화면이 꺼지지 않습니다.',
      '회원가입·로그인·광고가 없고, 기록은 기기 안에만 저장합니다.',
    ],
    facts: [
      { label: '기기', value: 'iPhone, iPad (Android 준비 중)' },
      { label: '언어', value: '한국어, English, 日本語' },
      { label: '가격', value: '무료 (앱 내 구입 있음)' },
    ],
    appStoreUrl: null,
    googlePlayUrl: null,
    href: '/apps/rockgazing',
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
    features: [
      '수유, 수면, 기저귀를 한 번 탭으로 기록합니다.',
      '하루 요약과 차트로 아기의 하루를 한눈에 봅니다.',
      '초대 코드로 공동양육자와 같은 기록을 함께 씁니다.',
      '같은 계정으로 로그인하면 기기를 바꿔도 이어 씁니다.',
      '아기 육아 기록은 광고에 쓰지 않습니다.',
    ],
    facts: [
      { label: '기기', value: 'iPhone, Android' },
      { label: '언어', value: '한국어' },
      { label: '가격', value: '무료 (광고 있음, 광고 제거 구입 가능)' },
    ],
    appStoreUrl: null,
    googlePlayUrl: null,
    href: '/apps/agirok',
    links: [
      { label: '개인정보처리방침', href: '/apps/agirok/privacy' },
      { label: '지원', href: '/apps/agirok/support' },
      { label: '계정·데이터 삭제', href: '/apps/agirok/delete-account' },
    ],
  },
];

export const getApp = (slug: string): AppEntry => {
  const app = APPS.find((a) => a.slug === slug);
  if (!app) throw new Error(`앱을 찾을 수 없습니다: ${slug}`);
  return app;
};
