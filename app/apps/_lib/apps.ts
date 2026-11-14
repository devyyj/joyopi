// 조요피(JOYOPI)가 만드는 앱 목록 — 홈, /{lang}/apps, 앱별 소개 페이지가 이 목록을 그린다.
// 문구는 언어별로 두고, 화면에서는 getApps(lang)·getApp(slug, lang)로 그 언어 것만 꺼내 쓴다.
import { localePath, type Lang } from '@/app/_i18n/config';

export interface AppLink {
  label: string;
  href: string;
}

/** 한 언어로 펼친 앱 정보(화면이 쓰는 모양) */
export interface AppEntry {
  slug: string;
  /** 그 언어의 스토어 이름 */
  name: string;
  /** 다른 나라 스토어 이름 등 함께 보여 줄 이름 */
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
  /** 소개 페이지 주소(언어 포함) */
  href: string;
  links: AppLink[];
  /** 개인정보 처리방침 링크(푸터용) */
  privacy: AppLink;
}

interface AppText {
  name: string;
  altNames: string[];
  description: string;
  features: string[];
  facts: { label: string; value: string }[];
  /** 문서 링크 이름. 키는 `pages`의 key */
  pageLabels: Record<string, string>;
}

interface AppSource {
  slug: string;
  appStoreUrl: string | null;
  googlePlayUrl: string | null;
  /** 앱 문서 페이지(언어 없는 경로). 첫 번째가 개인정보 처리방침 */
  pages: { key: string; path: string }[];
  text: Record<Lang, AppText>;
}

const SOURCES: AppSource[] = [
  {
    slug: 'rockgazing',
    appStoreUrl: null,
    googlePlayUrl: null,
    pages: [
      { key: 'privacy', path: '/apps/rockgazing/privacy' },
      { key: 'support', path: '/apps/rockgazing/support' },
    ],
    text: {
      ko: {
        name: '돌멍타임',
        altNames: ['Rockgazing', '石の子守り'],
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
        pageLabels: { privacy: '개인정보 처리방침', support: '지원' },
      },
      ja: {
        name: '石の子守り',
        altNames: ['Rockgazing', '돌멍타임'],
        description: '背景と天気が移り変わる場所に石をひとつ置いて、眺めるアプリ',
        features: [
          '背景と天気が移り変わる風景の中に、石がひとつ置かれています。',
          '自分の石に名前をつけられます。',
          '画面をつけっぱなしで眺めるアプリなので、開いている間は画面がスリープしません。',
          '会員登録・ログイン・広告はなく、データは端末内にだけ保存されます。',
        ],
        facts: [
          { label: '端末', value: 'iPhone、iPad（Android は準備中）' },
          { label: '言語', value: '한국어, English, 日本語' },
          { label: '価格', value: '無料（アプリ内課金あり）' },
        ],
        pageLabels: { privacy: 'プライバシーポリシー', support: 'サポート' },
      },
      en: {
        name: 'Rockgazing',
        altNames: ['돌멍타임', '石の子守り'],
        description: 'Place a single stone where the background and weather change, and just gaze at it',
        features: [
          'A single stone sits in a scene where the background and weather change.',
          'Give your stone a name.',
          "It's an app you leave on and gaze at, so the screen stays on while it's open.",
          'No sign-up, login, or ads. Your data stays on your device.',
        ],
        facts: [
          { label: 'Devices', value: 'iPhone, iPad (Android coming soon)' },
          { label: 'Languages', value: '한국어, English, 日本語' },
          { label: 'Price', value: 'Free (in-app purchases)' },
        ],
        pageLabels: { privacy: 'Privacy Policy', support: 'Support' },
      },
    },
  },
  {
    slug: 'agirok',
    appStoreUrl: null,
    googlePlayUrl: null,
    pages: [
      { key: 'privacy', path: '/apps/agirok/privacy' },
      { key: 'support', path: '/apps/agirok/support' },
      { key: 'deleteAccount', path: '/apps/agirok/delete-account' },
      { key: 'terms', path: '/apps/agirok/terms' },
    ],
    text: {
      ko: {
        name: '아기록',
        altNames: ['Agirok', 'ベビろく'],
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
          { label: '언어', value: '한국어, English, 日本語' },
          { label: '가격', value: '무료 (광고 있음, 광고 제거 구입 가능)' },
        ],
        pageLabels: { privacy: '개인정보처리방침', support: '지원', deleteAccount: '계정·데이터 삭제', terms: '이용약관' },
      },
      ja: {
        name: 'ベビろく',
        altNames: ['아기록', 'Agirok'],
        description: '片手でワンタップ、すぐ終わる育児記録',
        features: [
          '授乳・睡眠・おむつをワンタップで記録します。',
          '1日のまとめとグラフで、赤ちゃんの1日がひと目でわかります。',
          '招待コードで、一緒に育児をする家族と記録を共有できます。',
          '同じアカウントでログインすれば、機種変更後も続けて使えます。',
          '赤ちゃんの育児記録を広告に使うことはありません。',
        ],
        facts: [
          { label: '端末', value: 'iPhone、Android' },
          { label: '言語', value: '한국어, English, 日本語' },
          { label: '価格', value: '無料（広告あり。アプリ内課金で広告を非表示にできます）' },
        ],
        pageLabels: { privacy: 'プライバシーポリシー', support: 'サポート', deleteAccount: 'アカウント・データの削除', terms: '利用規約' },
      },
      en: {
        name: 'Agirok',
        altNames: ['아기록', 'ベビろく'],
        description: 'A one-handed, one-tap baby log',
        features: [
          'Log feeding, sleep, and diapers with a single tap.',
          "See your baby's day at a glance with daily summaries and charts.",
          'Share the log with your partner or other caregivers using an invite code.',
          'Sign in with the same account to pick up where you left off on a new device.',
          "Your baby's records are never used for advertising.",
        ],
        facts: [
          { label: 'Devices', value: 'iPhone, Android' },
          { label: 'Languages', value: '한국어, English, 日本語' },
          { label: 'Price', value: 'Free (with ads; remove ads with a one-time in-app purchase)' },
        ],
        pageLabels: { privacy: 'Privacy Policy', support: 'Support', deleteAccount: 'Delete account & data', terms: 'Terms of Use' },
      },
    },
  },
];

const toEntry = (source: AppSource, lang: Lang): AppEntry => {
  const text = source.text[lang];
  const links = source.pages.map((page) => ({
    label: text.pageLabels[page.key],
    href: localePath(lang, page.path),
  }));
  return {
    slug: source.slug,
    name: text.name,
    altNames: text.altNames,
    description: text.description,
    features: text.features,
    facts: text.facts,
    appStoreUrl: source.appStoreUrl,
    googlePlayUrl: source.googlePlayUrl,
    href: localePath(lang, `/apps/${source.slug}`),
    links,
    privacy: links[0],
  };
};

export const getApps = (lang: Lang): AppEntry[] => SOURCES.map((source) => toEntry(source, lang));

export const getApp = (slug: string, lang: Lang): AppEntry => {
  const source = SOURCES.find((a) => a.slug === slug);
  if (!source) throw new Error(`앱을 찾을 수 없습니다: ${slug}`);
  return toEntry(source, lang);
};
