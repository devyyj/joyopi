import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Home from '@/app/page';
import AppsIndex from './page';
import RockgazingPrivacy, { metadata as rockgazingPrivacyMeta } from './rockgazing/privacy/page';
import RockgazingSupport, { metadata as rockgazingSupportMeta } from './rockgazing/support/page';
import AgirokPrivacy, { metadata as agirokPrivacyMeta } from './agirok/privacy/page';
import AgirokSupport, { metadata as agirokSupportMeta } from './agirok/support/page';
import AgirokDeleteAccount, { metadata as agirokDeleteMeta } from './agirok/delete-account/page';

const mockPermanentRedirect = vi.fn((path: string) => {
  throw new Error(`NEXT_REDIRECT:${path}`);
});
vi.mock('next/navigation', () => ({
  permanentRedirect: (path: string) => mockPermanentRedirect(path),
}));

const hasMailLink = () =>
  screen.getAllByRole('link', { name: 'hello@joyopi.com' }).every((a) => a.getAttribute('href') === 'mailto:hello@joyopi.com');

describe('홈 (앱 목록)', () => {
  it('두 앱과 각 페이지 링크, 사업자 정보를 보여 준다', () => {
    render(<Home />);
    expect(screen.getByRole('heading', { name: /Rockgazing/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '아기록' })).toBeInTheDocument();

    const hrefs = screen.getAllByRole('link').map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual(
      expect.arrayContaining([
        '/apps/rockgazing/privacy',
        '/apps/rockgazing/support',
        '/apps/agirok/privacy',
        '/apps/agirok/support',
        '/apps/agirok/delete-account',
      ]),
    );

    expect(screen.getByText('사업자등록번호')).toBeInTheDocument();
    expect(screen.getByText('180-21-02731')).toBeInTheDocument();
    expect(hasMailLink()).toBe(true);
  });

  it('/apps 는 홈으로 영구 이동한다', () => {
    expect(() => AppsIndex()).toThrow('NEXT_REDIRECT:/');
  });
});

describe('돌보기(Rockgazing) 페이지', () => {
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
    // 핵심 항목: 서버로 보내는 정보 없음, 결제는 스토어가 처리, 13세 미만
    expect(container.textContent).toContain('개발자 서버로 보내는 개인정보가 없습니다');
    expect(container.textContent).toContain('Keychain');
    expect(container.textContent).toContain('13세 미만');
  });

  it('지원: 세 언어, 자주 묻는 질문, 환불 안내, 사업자 정보', () => {
    const { container } = render(<RockgazingSupport />);
    expect(rockgazingSupportMeta.title).toBe('Rockgazing 지원');
    for (const lang of ['ko', 'en', 'ja']) {
      expect(container.querySelector(`section#${lang}`)).not.toBeNull();
    }
    expect(container.textContent).toContain('reportaproblem.apple.com');
    expect(container.textContent).toContain('돌 만나기');
    expect(screen.getByText('사업자등록번호')).toBeInTheDocument();
    expect(screen.getByText('Business registration no.')).toBeInTheDocument();
    expect(screen.getByText('事業者登録番号')).toBeInTheDocument();
    expect(hasMailLink()).toBe(true);
  });
});

describe('아기록 페이지', () => {
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

  it('지원: 자주 묻는 질문, 계정 삭제 페이지 링크, 사업자 정보', () => {
    const { container } = render(<AgirokSupport />);
    expect(agirokSupportMeta.title).toBe('아기록 지원');
    expect(container.textContent).toContain('초대 코드');
    expect(container.textContent).toContain('광고 제거');
    const hrefs = screen.getAllByRole('link').map((a) => a.getAttribute('href'));
    expect(hrefs).toContain('/apps/agirok/delete-account');
    expect(screen.getByText('사업자등록번호')).toBeInTheDocument();
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
