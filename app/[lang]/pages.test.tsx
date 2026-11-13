import type { ReactElement } from 'react';
import { render, screen, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import type { Metadata } from 'next';
import type { Lang } from '@/app/_i18n/config';
import type { LangParams } from '@/app/_i18n/page';
import LangRootLayout, { generateStaticParams, dynamicParams } from './layout';
import Home, { generateMetadata as homeMeta } from './page';
import AppsIndex, { generateMetadata as appsMeta } from './apps/page';
import RockgazingPage, { generateMetadata as rockgazingMeta } from './apps/rockgazing/page';
import AgirokPage, { generateMetadata as agirokMeta } from './apps/agirok/page';
import RockgazingPrivacy, { generateMetadata as rockgazingPrivacyMeta } from './apps/rockgazing/privacy/page';
import RockgazingSupport, { generateMetadata as rockgazingSupportMeta } from './apps/rockgazing/support/page';
import AgirokPrivacy, { generateMetadata as agirokPrivacyMeta } from './apps/agirok/privacy/page';
import AgirokSupport, { generateMetadata as agirokSupportMeta } from './apps/agirok/support/page';
import AgirokDeleteAccount, { generateMetadata as agirokDeleteMeta } from './apps/agirok/delete-account/page';
import AboutPage, { metadata as aboutMeta } from '@/app/(korean)/about/page';
import NewsPage, { metadata as newsMeta } from '@/app/(korean)/news/page';
import SupportPage, { metadata as supportMeta } from '@/app/(korean)/support/page';
import PoliciesPage, { metadata as policiesMeta } from '@/app/(korean)/policies/page';
import EchoLayout, { metadata as echoMeta } from '@/app/(korean)/echo/layout';
import KoreanRootLayout from '@/app/(korean)/layout';

// 루트 레이아웃이 쓰는 next/font는 Next 빌드 밖(vitest)에서 돌지 않아 가짜로 둔다
vi.mock('next/font/google', () => ({ Geist: () => ({ variable: 'font-sans' }), Geist_Mono: () => ({ variable: 'font-mono' }) }));

const params = (lang: string): LangParams => ({ params: Promise.resolve({ lang }) });
type AsyncPage = (props: LangParams) => Promise<ReactElement>;
const renderPage = async (Page: AsyncPage, lang: Lang) => render(await Page(params(lang)));
const meta = (fn: (props: LangParams) => Promise<Metadata>, lang: Lang) => fn(params(lang));

const hrefs = () => screen.getAllByRole('link').map((a) => a.getAttribute('href'));
const hasMailLink = () =>
  screen.getAllByRole('link', { name: 'hello@joyopi.com' }).every((a) => a.getAttribute('href') === 'mailto:hello@joyopi.com');

describe('언어별 루트 레이아웃', () => {
  it('ko·ja·en 세 언어만 미리 만들고 그 밖의 언어는 404', () => {
    expect(generateStaticParams()).toEqual([{ lang: 'ko' }, { lang: 'ja' }, { lang: 'en' }]);
    expect(dynamicParams).toBe(false);
  });

  it.each(['ko', 'ja', 'en'] as const)('<html lang>이 주소의 언어(%s)를 따른다', async (lang) => {
    const html = await LangRootLayout({ children: null, ...params(lang) });
    expect(html.type).toBe('html');
    expect(html.props.lang).toBe(lang);
  });

  it('한국어 전용 페이지(소개·소식·메아리 등)의 루트 레이아웃은 lang="ko"', () => {
    const html = KoreanRootLayout({ children: null });
    expect(html.props.lang).toBe('ko');
  });
});

describe('hreflang 대체 주소', () => {
  const cases: [string, (props: LangParams) => Promise<Metadata>][] = [
    ['/', homeMeta],
    ['/apps', appsMeta],
    ['/apps/rockgazing', rockgazingMeta],
    ['/apps/rockgazing/privacy', rockgazingPrivacyMeta],
    ['/apps/rockgazing/support', rockgazingSupportMeta],
    ['/apps/agirok', agirokMeta],
    ['/apps/agirok/privacy', agirokPrivacyMeta],
    ['/apps/agirok/support', agirokSupportMeta],
    ['/apps/agirok/delete-account', agirokDeleteMeta],
  ];

  it.each(cases)('%s: canonical은 지금 언어, 대체 주소는 ko·ja·en과 x-default(언어 없는 주소)', async (path, fn) => {
    const m = await meta(fn, 'ja');
    const suffix = path === '/' ? '' : path;
    expect(m.alternates?.canonical).toBe(`/ja${suffix}`);
    expect(m.alternates?.languages).toEqual({
      ko: `/ko${suffix}`,
      ja: `/ja${suffix}`,
      en: `/en${suffix}`,
      'x-default': path,
    });
  });
});

describe('홈', () => {
  it('한국어: 사람 소개 한 줄, 두 앱(소개 페이지 링크), 최근 소식, 문의 안내', async () => {
    const { container } = await renderPage(Home, 'ko');
    // 조요피는 회사가 아니라 사람(온라인 활동명)으로 소개한다
    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('조요피입니다');
    expect(container.textContent).not.toMatch(/개발사|회사/);
    expect(screen.getByRole('heading', { name: '돌멍타임' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '아기록' })).toBeInTheDocument();
    expect(hrefs()).toEqual(
      expect.arrayContaining(['/ko/apps/rockgazing', '/ko/apps/agirok', '/ko/apps', '/news', '/support']),
    );
    // 문의는 메일로만 받는다 (공개 게시판 없음)
    expect(hrefs()).not.toContain('/board');
    expect(hasMailLink()).toBe(true);
    expect(container.innerHTML).not.toContain('/echo');
  });

  it('일본어·영어: 그 언어 문구와 스토어 이름, 그 언어 앱 주소', async () => {
    const ja = await renderPage(Home, 'ja');
    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('JOYOPI です');
    expect(screen.getByRole('heading', { name: '石の子守り' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'ベビろく' })).toBeInTheDocument();
    expect(hrefs()).toEqual(expect.arrayContaining(['/ja/apps', '/ja/apps/agirok/delete-account']));
    // 소식은 한국어뿐이라 알린다
    expect(ja.container.textContent).toContain('韓国語のみ');
    ja.unmount();

    await renderPage(Home, 'en');
    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain("I'm JOYOPI");
    expect(screen.getByRole('heading', { name: 'Rockgazing' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Agirok' })).toBeInTheDocument();
    expect(hrefs()).toEqual(expect.arrayContaining(['/en/apps', '/en/apps/rockgazing/privacy']));
  });
});

describe('앱 (제품)', () => {
  it('/{lang}/apps 는 앱 목록이다', async () => {
    await renderPage(AppsIndex, 'ko');
    expect((await meta(appsMeta, 'ko')).title).toBe('앱 — 조요피');
    expect((await meta(appsMeta, 'en')).title).toBe('Apps — JOYOPI');
    expect(screen.getByRole('heading', { level: 1, name: '앱' })).toBeInTheDocument();
    expect(hrefs()).toEqual(expect.arrayContaining(['/ko/apps/rockgazing', '/ko/apps/agirok']));
  });

  it('돌멍타임(Rockgazing) 소개: 이름·특징·스토어 상태, 개인정보 처리방침·지원 링크', async () => {
    const { container } = await renderPage(RockgazingPage, 'ko');
    expect((await meta(rockgazingMeta, 'ko')).title).toBe('돌멍타임 — 조요피');
    expect(screen.getByRole('heading', { level: 1, name: '돌멍타임' })).toBeInTheDocument();
    expect(container.textContent).toContain('Rockgazing');
    expect(container.textContent).toContain('출시 준비 중');
    expect(screen.getAllByRole('listitem').length).toBeGreaterThanOrEqual(3);
    expect(hrefs()).toEqual(expect.arrayContaining(['/ko/apps/rockgazing/privacy', '/ko/apps/rockgazing/support']));
  });

  it('아기록 소개: 이름·특징, 개인정보처리방침·지원·계정 삭제 링크 (언어별 이름)', async () => {
    const ko = await renderPage(AgirokPage, 'ko');
    expect((await meta(agirokMeta, 'ko')).title).toBe('아기록 — 조요피');
    expect(screen.getByRole('heading', { level: 1, name: '아기록' })).toBeInTheDocument();
    expect(hrefs()).toEqual(
      expect.arrayContaining(['/ko/apps/agirok/privacy', '/ko/apps/agirok/support', '/ko/apps/agirok/delete-account']),
    );
    ko.unmount();

    const ja = await renderPage(AgirokPage, 'ja');
    expect(screen.getByRole('heading', { level: 1, name: 'ベビろく' })).toBeInTheDocument();
    expect(ja.container.textContent).toContain('リリース準備中');
    ja.unmount();

    await renderPage(AgirokPage, 'en');
    expect((await meta(agirokMeta, 'en')).title).toBe('Agirok — JOYOPI');
    expect(screen.getByRole('heading', { level: 1, name: 'Agirok' })).toBeInTheDocument();
    expect(hrefs()).toEqual(expect.arrayContaining(['/en/apps/agirok/support']));
  });
});

describe('소개·소식·지원·약관·정책 (한국어만, 언어 없는 주소)', () => {
  it('소개: 조요피를 사람으로 소개하고(1인칭), 하는 일과 연락처를 적는다', () => {
    const { container } = render(<AboutPage />);
    expect(container.textContent).toContain('조요피입니다');
    expect(container.textContent).toContain('저는');
    expect(container.textContent).not.toMatch(/개발사|회사/);
    expect(aboutMeta.title).toBe('소개 — 조요피');
    expect(screen.getByRole('heading', { level: 1, name: '소개' })).toBeInTheDocument();
    expect(container.textContent).toContain('JOYOPI');
    expect(hasMailLink()).toBe(true);
    expect(hrefs()).toContain('/ko/apps');
  });

  it('소식: 날짜가 있는 글 목록(최신 먼저)', () => {
    const { container } = render(<NewsPage />);
    expect(newsMeta.title).toBe('소식 — 조요피');
    expect(screen.getByRole('heading', { level: 1, name: '소식' })).toBeInTheDocument();
    const dates = [...container.querySelectorAll('time')].map((t) => t.getAttribute('datetime') ?? '');
    expect(dates.length).toBeGreaterThanOrEqual(1);
    expect(dates).toEqual([...dates].sort().reverse());
  });

  it('지원: 앱별 지원 페이지(한국어 주소)와 메일 문의 (게시판·로그인 없음)', () => {
    render(<SupportPage />);
    expect(supportMeta.title).toBe('지원 — 조요피');
    expect(screen.getByRole('heading', { level: 1, name: '지원' })).toBeInTheDocument();
    expect(hrefs()).toEqual(
      expect.arrayContaining(['/ko/apps/rockgazing/support', '/ko/apps/agirok/support', '/ko/apps/agirok/delete-account']),
    );
    expect(hrefs()).not.toContain('/board');
    expect(hasMailLink()).toBe(true);
  });

  it('약관·정책: 앱별 개인정보 처리방침과 계정 삭제 안내', () => {
    render(<PoliciesPage />);
    expect(policiesMeta.title).toBe('약관·정책 — 조요피');
    expect(screen.getByRole('heading', { level: 1, name: '약관·정책' })).toBeInTheDocument();
    expect(hrefs()).toEqual(
      expect.arrayContaining([
        '/ko/apps/rockgazing/privacy',
        '/en/apps/rockgazing/privacy',
        '/ja/apps/rockgazing/privacy',
        '/ko/apps/agirok/privacy',
        '/ko/apps/agirok/delete-account',
      ]),
    );
  });
});

describe('에코', () => {
  it('검색엔진에 나오지 않게 noindex 로 둔다', () => {
    expect(echoMeta.robots).toEqual({ index: false, follow: false });
  });

  it('로그인 없이 누구나 연다 (레이아웃이 하위 페이지를 그대로 그린다)', () => {
    expect(EchoLayout({ children: 'echo-page' })).toBe('echo-page');
  });
});

describe('돌멍타임(Rockgazing) 문서 — 언어별 페이지는 그 언어 하나만', () => {
  it('개인정보 처리방침(ko): 제목, 필수 항목, 문의 메일. 다른 언어 구역은 없다', async () => {
    const { container } = await renderPage(RockgazingPrivacy, 'ko');
    expect((await meta(rockgazingPrivacyMeta, 'ko')).title).toBe('Rockgazing 개인정보 처리방침');
    expect(container.querySelector('section#ko')).toHaveAttribute('lang', 'ko');
    expect(container.querySelector('section#en')).toBeNull();
    expect(container.querySelector('section#ja')).toBeNull();
    expect(screen.getByRole('heading', { level: 1, name: 'Rockgazing 개인정보 처리방침' })).toBeInTheDocument();
    expect(hasMailLink()).toBe(true);
    const text = container.textContent ?? '';
    // 1.0.0 동작: 분석·오류 수집(PostHog, 독일 저장)과 실제 날씨(위치, Apple WeatherKit)
    for (const item of ['PostHog Inc.', '독일', '국외 이전', '보유 기간', '1년', '위탁', '거부', 'WeatherKit', '13세 미만']) {
      expect(text).toContain(item);
    }
    // 저장 위치: iOS Keychain·Apple 구매 기록, Android Block Store. iCloud는 쓰지 않는다
    expect(text).toContain('Keychain');
    expect(text).toContain('Block Store');
    expect(text).toContain('구매 기록');
    expect(text).not.toContain('iCloud');
    expect(text).not.toMatch(/개발자 서버로 보내는 개인정보가 없습니다|분석 도구가 없습니다/);
  });

  it('개인정보 처리방침(en·ja): 그 언어 본문만', async () => {
    const en = await renderPage(RockgazingPrivacy, 'en');
    expect((await meta(rockgazingPrivacyMeta, 'en')).title).toBe('Rockgazing Privacy Policy');
    expect(en.container.querySelector('section#en')).toHaveAttribute('lang', 'en');
    expect(en.container.querySelector('section#ko')).toBeNull();
    for (const item of ['Germany', 'International transfer']) expect(en.container.textContent).toContain(item);
    expect(en.container.textContent).not.toMatch(/no sign-up, login, advertising, tracking, or\s+analytics/);
    en.unmount();

    const ja = await renderPage(RockgazingPrivacy, 'ja');
    expect(screen.getByRole('heading', { level: 1, name: 'Rockgazing プライバシーポリシー' })).toBeInTheDocument();
    for (const item of ['ドイツ', '国外移転']) expect(ja.container.textContent).toContain(item);
    expect(ja.container.textContent).not.toContain('독일');
  });

  it('지원: 언어별 한 페이지, 자주 묻는 질문, 환불 안내 (사업자 정보는 그 언어의 공통 푸터가 맡는다)', async () => {
    const ko = await renderPage(RockgazingSupport, 'ko');
    expect((await meta(rockgazingSupportMeta, 'ko')).title).toBe('Rockgazing 지원');
    expect(ko.container.textContent).toContain('reportaproblem.apple.com');
    expect(ko.container.textContent).toContain('돌 만나기');
    expect(ko.container.querySelector('section#en')).toBeNull();
    expect(screen.queryByText('사업자등록번호')).not.toBeInTheDocument();
    expect(hasMailLink()).toBe(true);
    ko.unmount();

    const en = await renderPage(RockgazingSupport, 'en');
    expect(en.container.querySelector('section#en')).not.toBeNull();
    expect(en.container.querySelector('section#ja')).toBeNull();
    expect(en.container.textContent).toContain('reportaproblem.apple.com');
  });
});

describe('아기록 문서', () => {
  it('개인정보처리방침(ko): 제목, 필수 항목, 광고에 쓰지 않는다는 강조', async () => {
    const { container } = await renderPage(AgirokPrivacy, 'ko');
    expect((await meta(agirokPrivacyMeta, 'ko')).title).toBe('아기록 개인정보처리방침');
    expect(screen.getByRole('heading', { level: 1, name: '아기록 개인정보처리방침' })).toBeInTheDocument();
    const text = container.textContent ?? '';
    for (const item of ['보유', '파기', '제3자 제공', '위탁', '국외 이전', '안전성 확보', '광고 식별자', '보호책임자', '변경']) {
      expect(text).toContain(item);
    }
    expect(screen.getByRole('note').textContent).toContain('광고에 쓰지 않');
    expect(text).not.toMatch(/\[이름\]|\[이메일\]|\[YYYY-MM-DD\]/);
    expect(hasMailLink()).toBe(true);
    // 한국어판에는 번역 준비 중 안내가 없다
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it.each([
    ['ja', '翻訳準備中'],
    ['en', 'being translated'],
  ] as const)('개인정보처리방침(%s): 번역 전이라 한국어 본문, 맨 위에 그 언어로 「번역 준비 중, 한국어판이 기준」', async (lang, pending) => {
    const { container } = await renderPage(AgirokPrivacy, lang);
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('lang', lang);
    expect(status.textContent).toContain(pending);
    expect(container.querySelector('section#ko')).toHaveAttribute('lang', 'ko');
    expect(screen.getByRole('heading', { level: 1, name: '아기록 개인정보처리방침' })).toBeInTheDocument();
    // 본문 안 링크는 그 언어 페이지로
    expect(hrefs()).toContain(`/${lang}/apps/agirok/delete-account`);
  });

  it('지원: 자주 묻는 질문, 계정 삭제 페이지 링크', async () => {
    const { container } = await renderPage(AgirokSupport, 'ko');
    expect((await meta(agirokSupportMeta, 'ko')).title).toBe('아기록 지원');
    expect(container.textContent).toContain('초대 코드');
    expect(container.textContent).toContain('광고 제거');
    expect(hrefs()).toContain('/ko/apps/agirok/delete-account');
  });

  it('계정·데이터 삭제: 앱 이름과 개발자, 앱에서 지우는 법, 앱 없이 요청하는 법', async () => {
    const { container } = await renderPage(AgirokDeleteAccount, 'ko');
    expect((await meta(agirokDeleteMeta, 'ko')).title).toBe('아기록 계정·데이터 삭제');
    const text = container.textContent ?? '';
    expect(text).toContain('아기록');
    expect(text).toContain('JOYOPI');
    expect(text).toContain('탈퇴하고 데이터 지우기');
    expect(text).toContain('아기록 계정 삭제 요청');
    expect(text).toContain('영업일 7일');
    expect(hasMailLink()).toBe(true);
    expect(within(container).getAllByRole('link').map((a) => a.getAttribute('href'))).toContain('/ko/apps/agirok/privacy');
  });

  it('지원(ja·en): 번역본만 보여 주고, 버튼 이름은 앱 화면 문구, 계정 삭제 링크는 그 언어 주소', async () => {
    const ja = await renderPage(AgirokSupport, 'ja');
    expect((await meta(agirokSupportMeta, 'ja')).title).toBe('ベビろく サポート');
    expect(ja.container.querySelector('section#ja')).toHaveAttribute('lang', 'ja');
    expect(ja.container.querySelector('section#ko')).toBeNull();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    for (const item of ['招待コードを作る', '招待コードを受け取りました', '購入を復元', '退会してデータを削除', 'reportaproblem.apple.com']) {
      expect(ja.container.textContent).toContain(item);
    }
    expect(hrefs()).toContain('/ja/apps/agirok/delete-account');
    expect(hasMailLink()).toBe(true);
    ja.unmount();

    const en = await renderPage(AgirokSupport, 'en');
    expect((await meta(agirokSupportMeta, 'en')).title).toBe('Agirok Support');
    for (const item of ['Create invite code', 'I have an invite code', 'Restore purchase', 'Delete account and data']) {
      expect(en.container.textContent).toContain(item);
    }
    expect(en.container.textContent).not.toContain('초대 코드');
    expect(hrefs()).toContain('/en/apps/agirok/delete-account');
  });

  it.each([
    ['ja', 'ベビろく', '退会してデータを削除', 'ベビろく アカウント削除リクエスト', '7 営業日'],
    ['en', 'Agirok', 'Delete account and data', 'Agirok account deletion request', '7 business days'],
  ] as const)('계정·데이터 삭제(%s): 앱 이름과 개발자(JOYOPI), 앱에서 지우는 법, 앱 없이 요청하는 법', async (lang, name, button, subject, days) => {
    const { container } = await renderPage(AgirokDeleteAccount, lang);
    const text = container.textContent ?? '';
    expect(container.querySelector(`section#${lang}`)).toHaveAttribute('lang', lang);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(text).toContain(name);
    expect(text).toContain('JOYOPI');
    expect(text).toContain(button);
    expect(text).toContain(subject);
    expect(text).toContain(days);
    expect(hasMailLink()).toBe(true);
    expect(hrefs()).toContain(`/${lang}/apps/agirok/privacy`);
  });
});
