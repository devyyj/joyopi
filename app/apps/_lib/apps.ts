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
  /** 스토어 주소. 출시 전(또는 판매 중지)에는 null → 「출시 준비 중」으로 표시 */
  appStoreUrl: string | null;
  googlePlayUrl: string | null;
  /** 아직 받을 수 없는 앱의 상태(홈 배지): 심사·출시 준비는 soon, 판매 중지·다듬는 중은 polishing */
  upcoming: 'soon' | 'polishing' | null;
  /** 앱 아이콘(public 경로) */
  icon: string;
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

/** App Store에 공개된 앱. 페이지 언어마다 보낼 나라 스토어를 정한다(팔지 않는 나라로 보내면 빈 화면이 나온다). */
interface AppStoreListing {
  id: string;
  country: Record<Lang, string>;
}

interface AppSource {
  slug: string;
  /** App Store에서 지금 받을 수 있을 때만 채운다. 심사 중·판매 중지면 null */
  appStore: AppStoreListing | null;
  upcoming?: 'soon' | 'polishing';
  /** 앱 아이콘. 언어마다 다르면 그 언어 것을 따로 둔다 */
  icon: string;
  iconByLang?: Partial<Record<Lang, string>>;
  googlePlayUrl: string | null;
  /** 앱 문서 페이지(언어 없는 경로). 첫 번째가 개인정보 처리방침 */
  pages: { key: string; path: string }[];
  text: Record<Lang, AppText>;
}

const SOURCES: AppSource[] = [
  {
    slug: 'rockgazing',
    icon: '/apps/rockgazing/icon.png',
    appStore: { id: '6833780121', country: { ko: 'kr', ja: 'jp', en: 'us' } },
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
    upcoming: 'soon',
    icon: '/apps/agirok/icon.png',
    appStore: null,
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
  {
    slug: 'ssamkejul',
    icon: '/apps/ssamkejul/icon.png',
    iconByLang: { ja: '/apps/ssamkejul/icon-ja.png' },
    // 한국·일본에서만 판다. 영어 페이지는 한국 스토어로 보낸다
    appStore: { id: '6835451326', country: { ko: 'kr', ja: 'jp', en: 'kr' } },
    googlePlayUrl: null,
    pages: [
      { key: 'privacy', path: '/apps/ssamkejul/privacy' },
      { key: 'support', path: '/apps/ssamkejul/support' },
      { key: 'deleteAccount', path: '/apps/ssamkejul/delete-account' },
      { key: 'terms', path: '/apps/ssamkejul/terms' },
    ],
    text: {
      ko: {
        name: '쌤케줄',
        altNames: ['せんせジュール', 'Ssamkejul'],
        description: '쌤, 언제 돼요? 이제 묻지 마세요',
        features: [
          '1인 레슨 선생님을 위한 일정 앱입니다.',
          '수강생은 앱 설치 없이 카톡 링크와 카카오 로그인으로 일정을 보고 신청·변경·취소합니다.',
          '자동 확정·마감 같은 규칙을 정해 두면 「그때 돼요?」 대화를 하지 않아도 됩니다.',
          '같은 시간에 두 수강생이 겹치지 않습니다.',
          '광고가 없고, 지금은 무료입니다.',
        ],
        facts: [
          { label: '기기', value: 'iPhone, iPad (선생님, Android 준비 중), 웹 (수강생)' },
          { label: '언어', value: '한국어, 日本語' },
          { label: '가격', value: '지금은 무료' },
        ],
        pageLabels: { privacy: '개인정보처리방침', support: '지원', deleteAccount: '계정·데이터 삭제', terms: '이용약관' },
      },
      ja: {
        name: 'せんせジュール',
        altNames: ['쌤케줄', 'Ssamkejul'],
        description: 'レッスンの予約・振替、LINEでかんたん',
        features: [
          '個人レッスンの先生のためのスケジュールアプリです。',
          '生徒はアプリのインストール不要。LINEのリンクとLINEログインで予定の確認・予約・振替・キャンセルができます。',
          '自動確定や締切などのルールを決めておけば、「その日空いてますか?」のやりとりが不要になります。',
          '同じ時間に2人の生徒が重なることはありません。',
          '広告はなく、今は無料です。',
        ],
        facts: [
          { label: '端末', value: 'iPhone、iPad(先生。Android は準備中)、Web(生徒)' },
          { label: '言語', value: '한국어, 日本語' },
          { label: '価格', value: '現在無料' },
        ],
        pageLabels: { privacy: 'プライバシーポリシー', support: 'サポート', deleteAccount: 'アカウント・データの削除', terms: '利用規約' },
      },
      en: {
        name: 'Ssamkejul',
        altNames: ['쌤케줄', 'せんせジュール'],
        description: 'Lesson scheduling for independent teachers — students just open a link',
        features: [
          'A scheduling app for independent lesson teachers.',
          'Students need nothing to install: they open a link, sign in with Kakao or LINE, and book, reschedule or cancel.',
          'Set rules like auto-confirm and deadlines, and stop the endless “are you free then?” chats.',
          'Two students can never book the same time.',
          'No ads, and free for now.',
        ],
        facts: [
          { label: 'Devices', value: 'iPhone, iPad (teachers; Android coming soon), web (students)' },
          { label: 'Languages', value: '한국어, 日本語' },
          { label: 'Price', value: 'Free for now' },
        ],
        pageLabels: { privacy: 'Privacy Policy', support: 'Support', deleteAccount: 'Delete account & data', terms: 'Terms of Use' },
      },
    },
  },
  {
    slug: 'likeloop',
    upcoming: 'polishing',
    icon: '/apps/likeloop/icon.png',
    appStore: null,
    googlePlayUrl: null,
    pages: [
      { key: 'privacy', path: '/apps/likeloop/privacy' },
      { key: 'support', path: '/apps/likeloop/support' },
      { key: 'deleteAccount', path: '/apps/likeloop/delete-account' },
      { key: 'terms', path: '/apps/likeloop/terms' },
    ],
    text: {
      ko: {
        name: 'LikeLoop',
        altNames: [],
        description: '좋아? 싫어? 답하면 바로 비교되는 취향 궁합',
        features: [
          '좋아·싫어 질문에 답하면 다른 사람들의 답과 바로 비교됩니다.',
          '친구에게 링크를 보내면 친구는 설치 없이 웹에서 답하고 미리보기 궁합을 봅니다.',
          '과·동아리·팀과 그룹을 만들어 우리 취향 지도를 봅니다.',
          '답마다 공개 범위(나만·통계만·궁합까지)를 고를 수 있고, 답을 팔지 않습니다.',
          '광고가 없고 무료입니다.',
        ],
        facts: [
          { label: '기기', value: 'iPhone, Android' },
          { label: '언어', value: '한국어, English, 日本語' },
          { label: '가격', value: '무료' },
        ],
        pageLabels: { privacy: '개인정보처리방침', support: '지원', deleteAccount: '계정·데이터 삭제', terms: '이용약관' },
      },
      ja: {
        name: 'LikeLoop',
        altNames: [],
        description: '好き?嫌い?答えるとすぐ比べられる好みの相性',
        features: [
          '好き・嫌いの質問に答えると、ほかの人の答えとすぐに比べられます。',
          '友だちにリンクを送れば、友だちはインストールなしでWebで答えてプレビュー相性を見られます。',
          'クラス・サークル・チームでグループを作り、みんなの好みマップを見られます。',
          '答えごとに公開範囲（自分だけ・統計のみ・相性まで）を選べ、答えを販売することはありません。',
          '広告はなく、無料です。',
        ],
        facts: [
          { label: '端末', value: 'iPhone、Android' },
          { label: '言語', value: '한국어, English, 日本語' },
          { label: '価格', value: '無料' },
        ],
        pageLabels: { privacy: 'プライバシーポリシー', support: 'サポート', deleteAccount: 'アカウント・データの削除', terms: '利用規約' },
      },
      en: {
        name: 'LikeLoop',
        altNames: [],
        description: 'Like it or not? Answer and compare tastes instantly',
        features: [
          'Answer like-or-dislike questions and see right away how you compare with everyone else.',
          'Send a link to a friend: they answer on the web without installing anything and see a preview match.',
          'Make a group for your class, club or team and see your shared taste map.',
          'Choose who sees each answer (Only me, Stats only, Matches too). We never sell your answers.',
          'No ads, and free.',
        ],
        facts: [
          { label: 'Devices', value: 'iPhone, Android' },
          { label: 'Languages', value: '한국어, English, 日本語' },
          { label: 'Price', value: 'Free' },
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
    appStoreUrl: source.appStore
      ? `https://apps.apple.com/${source.appStore.country[lang]}/app/id${source.appStore.id}`
      : null,
    googlePlayUrl: source.googlePlayUrl,
    upcoming: source.appStore ? null : (source.upcoming ?? 'soon'),
    icon: source.iconByLang?.[lang] ?? source.icon,
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
