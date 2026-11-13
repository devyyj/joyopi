// 공통 틀(메뉴·푸터)·홈·앱 목록 문구 사전. 앱별 문구는 app/apps/_lib/apps.ts, 문서 본문은 각 페이지 파일에 있다.
// 새 문구는 ko를 기준으로 세 언어를 함께 더한다(타입이 빠진 언어를 잡는다).
import type { Lang } from './config';

const ko = {
  site: {
    title: '조요피 (joyopi)',
    description: '모바일 앱을 만드는 조요피입니다 — 돌멍타임(Rockgazing), 아기록',
    homeAria: '조요피 홈',
  },
  nav: {
    apps: '앱',
    about: '소개',
    news: '소식',
    support: '지원',
    mainMenu: '주 메뉴',
    mobileMenu: '모바일 메뉴',
    openMenu: '메뉴 열기',
    closeMenu: '메뉴 닫기',
    language: '언어',
  },
  footer: {
    policies: '약관·정책',
  },
  home: {
    greeting: ['안녕하세요,', '조요피입니다'],
    intro: '모바일 앱을 만듭니다. 지금은 돌 하나를 바라보는 돌멍타임과 한 번 탭으로 끝나는 육아 기록 아기록을 만들고 있습니다.',
    viewApps: '앱 보기',
    support: '지원',
    appsAria: '앱',
    news: '소식',
    /** 소식은 한국어로만 쓴다. 한국어 화면에서는 따로 알리지 않는다 */
    newsKoreanOnly: null as string | null,
    seeAll: '모두 보기',
    contact: '문의',
    contactBody: '앱을 쓰다가 궁금한 점이나 문제가 있으면 메일로 보내 주세요. 제가 직접 답합니다.',
    supportFaq: '지원 · 자주 묻는 질문',
  },
  apps: {
    title: '앱',
    metaTitle: '앱 — 조요피',
    metaDescription: '조요피가 만드는 앱: 돌멍타임(Rockgazing), 아기록',
    lead: '제가 만들고 운영하는 모바일 앱입니다.',
    comingSoon: '출시 준비 중',
    details: '자세히 보기',
    features: '특징',
    info: '정보',
    supportAndPolicies: '지원과 정책',
    metaSuffix: ' — 조요피',
  },
  doc: {
    toc: '목차',
    contact: '문의',
    effective: '시행일',
    updated: '최종 수정일',
    home: '조요피 앱 목록',
    /** 번역이 아직 없는 문서 맨 위 한 줄. 한국어판에는 쓰지 않는다 */
    translationPending: null as string | null,
  },
};

export type Dictionary = typeof ko;

const ja: Dictionary = {
  site: {
    title: 'JOYOPI（joyopi）',
    description: 'モバイルアプリを作っている JOYOPI です — 石の子守り（Rockgazing）、ベビろく',
    homeAria: 'JOYOPI ホーム',
  },
  nav: {
    apps: 'アプリ',
    about: '紹介',
    news: 'お知らせ',
    support: 'サポート',
    mainMenu: 'メインメニュー',
    mobileMenu: 'モバイルメニュー',
    openMenu: 'メニューを開く',
    closeMenu: 'メニューを閉じる',
    language: '言語',
  },
  footer: {
    policies: '規約・ポリシー',
  },
  home: {
    greeting: ['こんにちは、', 'JOYOPI です'],
    intro:
      'モバイルアプリを作っています。いまは、石をひとつ眺める「石の子守り」と、ワンタップで終わる育児記録「ベビろく」を作っています。',
    viewApps: 'アプリを見る',
    support: 'サポート',
    appsAria: 'アプリ',
    news: 'お知らせ',
    newsKoreanOnly: 'お知らせは韓国語のみです。',
    seeAll: 'すべて見る',
    contact: 'お問い合わせ',
    contactBody: 'アプリについてのご質問や不具合は、メールでお送りください。私が直接お返事します。',
    supportFaq: 'サポート・よくある質問',
  },
  apps: {
    title: 'アプリ',
    metaTitle: 'アプリ — JOYOPI',
    metaDescription: 'JOYOPI が作るアプリ：石の子守り（Rockgazing）、ベビろく',
    lead: '私が作り、運営しているモバイルアプリです。',
    comingSoon: 'リリース準備中',
    details: '詳しく見る',
    features: '特長',
    info: '情報',
    supportAndPolicies: 'サポートとポリシー',
    metaSuffix: ' — JOYOPI',
  },
  doc: {
    toc: '目次',
    contact: 'お問い合わせ',
    effective: '施行日',
    updated: '最終更新日',
    home: 'JOYOPIのアプリ一覧',
    translationPending: '日本語版は翻訳準備中です。以下の韓国語版が正式な内容です。',
  },
};

const en: Dictionary = {
  site: {
    title: 'JOYOPI (joyopi)',
    description: 'JOYOPI makes mobile apps — Rockgazing and Agirok',
    homeAria: 'JOYOPI home',
  },
  nav: {
    apps: 'Apps',
    about: 'About',
    news: 'News',
    support: 'Support',
    mainMenu: 'Main menu',
    mobileMenu: 'Mobile menu',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    language: 'Language',
  },
  footer: {
    policies: 'Terms & policies',
  },
  home: {
    greeting: ['Hello,', "I'm JOYOPI"],
    intro:
      "I make mobile apps. Right now I'm working on Rockgazing, an app for gazing at a single stone, and Agirok, a baby log that takes just one tap.",
    viewApps: 'See apps',
    support: 'Support',
    appsAria: 'Apps',
    news: 'News',
    newsKoreanOnly: 'News is posted in Korean only.',
    seeAll: 'See all',
    contact: 'Contact',
    contactBody: 'If you have a question or a problem with an app, please email me. I reply personally.',
    supportFaq: 'Support & FAQ',
  },
  apps: {
    title: 'Apps',
    metaTitle: 'Apps — JOYOPI',
    metaDescription: 'Apps by JOYOPI: Rockgazing and Agirok',
    lead: 'Mobile apps I make and run myself.',
    comingSoon: 'Coming soon',
    details: 'Learn more',
    features: 'Features',
    info: 'Details',
    supportAndPolicies: 'Support & policies',
    metaSuffix: ' — JOYOPI',
  },
  doc: {
    toc: 'Contents',
    contact: 'Contact',
    effective: 'Effective date',
    updated: 'Last updated',
    home: 'JOYOPI apps',
    translationPending: 'The English version is being translated. The Korean version below is the official text.',
  },
};

const DICTIONARIES: Record<Lang, Dictionary> = { ko, ja, en };

export const getDictionary = (lang: Lang): Dictionary => DICTIONARIES[lang];
