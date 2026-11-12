import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Home from '@/app/page';
import AboutPage, { metadata as aboutMeta } from '@/app/about/page';
import NewsPage, { metadata as newsMeta } from '@/app/news/page';
import SupportPage, { metadata as supportMeta } from '@/app/support/page';
import PoliciesPage, { metadata as policiesMeta } from '@/app/policies/page';
import BoardIntro from '@/app/board/components/board-intro';
import { metadata as echoMeta } from '@/app/echo/layout';
import AppsIndex, { metadata as appsMeta } from './page';
import RockgazingPage, { metadata as rockgazingMeta } from './rockgazing/page';
import AgirokPage, { metadata as agirokMeta } from './agirok/page';
import RockgazingPrivacy, { metadata as rockgazingPrivacyMeta } from './rockgazing/privacy/page';
import RockgazingSupport, { metadata as rockgazingSupportMeta } from './rockgazing/support/page';
import AgirokPrivacy, { metadata as agirokPrivacyMeta } from './agirok/privacy/page';
import AgirokSupport, { metadata as agirokSupportMeta } from './agirok/support/page';
import AgirokDeleteAccount, { metadata as agirokDeleteMeta } from './agirok/delete-account/page';

const hrefs = () => screen.getAllByRole('link').map((a) => a.getAttribute('href'));
const hasMailLink = () =>
  screen.getAllByRole('link', { name: 'hello@joyopi.com' }).every((a) => a.getAttribute('href') === 'mailto:hello@joyopi.com');

describe('홈', () => {
  it('회사 소개 한 줄, 두 앱(소개 페이지 링크), 최근 소식, 문의 안내를 보여 준다', () => {
    const { container } = render(<Home />);
    // 조요피는 회사가 아니라 사람(온라인 활동명)으로 소개한다
    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('조요피입니다');
    expect(container.textContent).not.toMatch(/개발사|회사/);
    expect(screen.getByRole('heading', { name: /Rockgazing/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '아기록' })).toBeInTheDocument();
    expect(hrefs()).toEqual(
      expect.arrayContaining(['/apps/rockgazing', '/apps/agirok', '/apps', '/news', '/support', '/board']),
    );
    expect(container.innerHTML).not.toContain('/echo');
  });
});

describe('앱 (제품)', () => {
  it('/apps 는 앱 목록이다', () => {
    render(<AppsIndex />);
    expect(appsMeta.title).toBe('앱 — 조요피');
    expect(screen.getByRole('heading', { level: 1, name: '앱' })).toBeInTheDocument();
    expect(hrefs()).toEqual(expect.arrayContaining(['/apps/rockgazing', '/apps/agirok']));
  });

  it('Rockgazing 소개: 이름·특징·스토어 상태, 개인정보 처리방침·지원 링크', () => {
    const { container } = render(<RockgazingPage />);
    expect(rockgazingMeta.title).toBe('Rockgazing — 조요피');
    expect(screen.getByRole('heading', { level: 1, name: 'Rockgazing' })).toBeInTheDocument();
    expect(container.textContent).toContain('돌멍타임');
    expect(container.textContent).toContain('출시 준비 중');
    expect(screen.getAllByRole('listitem').length).toBeGreaterThanOrEqual(3);
    expect(hrefs()).toEqual(expect.arrayContaining(['/apps/rockgazing/privacy', '/apps/rockgazing/support']));
  });

  it('아기록 소개: 이름·특징, 개인정보처리방침·지원·계정 삭제 링크', () => {
    render(<AgirokPage />);
    expect(agirokMeta.title).toBe('아기록 — 조요피');
    expect(screen.getByRole('heading', { level: 1, name: '아기록' })).toBeInTheDocument();
    expect(hrefs()).toEqual(
      expect.arrayContaining(['/apps/agirok/privacy', '/apps/agirok/support', '/apps/agirok/delete-account']),
    );
  });
});

describe('소개·소식·지원·약관·정책', () => {
  it('소개: 조요피를 사람으로 소개하고(1인칭), 하는 일과 연락처를 적는다', () => {
    const { container } = render(<AboutPage />);
    expect(container.textContent).toContain('조요피입니다');
    expect(container.textContent).toContain('저는');
    expect(container.textContent).not.toMatch(/개발사|회사/);
    expect(aboutMeta.title).toBe('소개 — 조요피');
    expect(screen.getByRole('heading', { level: 1, name: '소개' })).toBeInTheDocument();
    expect(container.textContent).toContain('JOYOPI');
    expect(hasMailLink()).toBe(true);
    expect(hrefs()).toContain('/apps');
  });

  it('소식: 날짜가 있는 글 목록(최신 먼저)', () => {
    const { container } = render(<NewsPage />);
    expect(newsMeta.title).toBe('소식 — 조요피');
    expect(screen.getByRole('heading', { level: 1, name: '소식' })).toBeInTheDocument();
    const dates = [...container.querySelectorAll('time')].map((t) => t.getAttribute('datetime') ?? '');
    expect(dates.length).toBeGreaterThanOrEqual(1);
    expect(dates).toEqual([...dates].sort().reverse());
  });

  it('지원: 앱별 지원 페이지, 문의 게시판, 메일', () => {
    render(<SupportPage />);
    expect(supportMeta.title).toBe('지원 — 조요피');
    expect(screen.getByRole('heading', { level: 1, name: '지원' })).toBeInTheDocument();
    expect(hrefs()).toEqual(
      expect.arrayContaining(['/apps/rockgazing/support', '/apps/agirok/support', '/apps/agirok/delete-account', '/board']),
    );
    expect(hasMailLink()).toBe(true);
  });

  it('약관·정책: 앱별 개인정보 처리방침과 계정 삭제 안내', () => {
    render(<PoliciesPage />);
    expect(policiesMeta.title).toBe('약관·정책 — 조요피');
    expect(screen.getByRole('heading', { level: 1, name: '약관·정책' })).toBeInTheDocument();
    expect(hrefs()).toEqual(
      expect.arrayContaining(['/apps/rockgazing/privacy', '/apps/agirok/privacy', '/apps/agirok/delete-account']),
    );
  });
});

describe('문의 게시판', () => {
  it('머리말: 이름, 공개 게시판 주의, 메일 문의, 앱별 자주 묻는 질문', () => {
    const { container } = render(<BoardIntro />);
    expect(screen.getByRole('heading', { level: 1, name: '문의 게시판' })).toBeInTheDocument();
    expect(container.textContent).toContain('누구나 볼 수 있');
    expect(container.textContent).toContain('개인정보');
    expect(hasMailLink()).toBe(true);
    expect(hrefs()).toContain('/support');
    expect(container.textContent).not.toMatch(/자유게시판|소식 전하기/);
  });
});

describe('에코', () => {
  it('검색엔진에 나오지 않게 noindex 로 둔다', () => {
    expect(echoMeta.robots).toEqual({ index: false, follow: false });
  });
});

describe('돌보기(Rockgazing) 문서', () => {
  it('개인정보 처리방침: 제목과 ko/en/ja 세 언어, 문의 메일', () => {
    const { container } = render(<RockgazingPrivacy />);
    expect(rockgazingPrivacyMeta.title).toBe('Rockgazing 개인정보 처리방침');
    for (const lang of ['ko', 'en', 'ja']) {
      expect(container.querySelector(`section#${lang}`)).toHaveAttribute('lang', lang);
    }
    expect(screen.getByRole('heading', { level: 1, name: 'Rockgazing 개인정보 처리방침' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Rockgazing Privacy Policy' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Rockgazing プライバシーポリシー' })).toBeInTheDocument();
    expect(hasMailLink()).toBe(true);
    expect(container.textContent).toContain('개발자 서버로 보내는 개인정보가 없습니다');
    expect(container.textContent).toContain('Keychain');
    expect(container.textContent).toContain('13세 미만');
  });

  it('지원: 세 언어, 자주 묻는 질문, 환불 안내. 영어·일본어 구역에는 그 언어의 사업자 정보', () => {
    const { container } = render(<RockgazingSupport />);
    expect(rockgazingSupportMeta.title).toBe('Rockgazing 지원');
    for (const lang of ['ko', 'en', 'ja']) {
      expect(container.querySelector(`section#${lang}`)).not.toBeNull();
    }
    expect(container.textContent).toContain('reportaproblem.apple.com');
    expect(container.textContent).toContain('돌 만나기');
    // 한국어 사업자 정보는 공통 푸터가 맡는다
    expect(screen.queryByText('사업자등록번호')).not.toBeInTheDocument();
    expect(screen.getByText('Business registration no.')).toBeInTheDocument();
    expect(screen.getByText('事業者登録番号')).toBeInTheDocument();
    expect(hasMailLink()).toBe(true);
  });
});

describe('아기록 문서', () => {
  it('개인정보처리방침: 제목, 필수 항목, 광고에 쓰지 않는다는 강조', () => {
    const { container } = render(<AgirokPrivacy />);
    expect(agirokPrivacyMeta.title).toBe('아기록 개인정보처리방침');
    expect(screen.getByRole('heading', { level: 1, name: '아기록 개인정보처리방침' })).toBeInTheDocument();
    const text = container.textContent ?? '';
    for (const item of ['보유', '파기', '제3자 제공', '위탁', '국외 이전', '안전성 확보', '광고 식별자', '보호책임자', '변경']) {
      expect(text).toContain(item);
    }
    expect(screen.getByRole('note').textContent).toContain('광고에 쓰지 않');
    expect(text).not.toMatch(/\[이름\]|\[이메일\]|\[YYYY-MM-DD\]/);
    expect(hasMailLink()).toBe(true);
  });

  it('지원: 자주 묻는 질문, 계정 삭제 페이지 링크', () => {
    const { container } = render(<AgirokSupport />);
    expect(agirokSupportMeta.title).toBe('아기록 지원');
    expect(container.textContent).toContain('초대 코드');
    expect(container.textContent).toContain('광고 제거');
    expect(hrefs()).toContain('/apps/agirok/delete-account');
  });

  it('계정·데이터 삭제: 앱 이름과 개발자, 앱에서 지우는 법, 앱 없이 요청하는 법', () => {
    const { container } = render(<AgirokDeleteAccount />);
    expect(agirokDeleteMeta.title).toBe('아기록 계정·데이터 삭제');
    const text = container.textContent ?? '';
    expect(text).toContain('아기록');
    expect(text).toContain('JOYOPI');
    expect(text).toContain('탈퇴하고 데이터 지우기');
    expect(text).toContain('아기록 계정 삭제 요청');
    expect(text).toContain('영업일 7일');
    expect(hasMailLink()).toBe(true);
  });
});
