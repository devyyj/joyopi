import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import BusinessInfo from './business-info';
import { BUSINESS_INFO, type BusinessInfoData } from '../_lib/business-info';

const full: BusinessInfoData = {
  ...BUSINESS_INFO,
  mailOrderNumber: '제0000-테스트-0000호',
  addressKo: '테스트시 테스트로 1',
  addressEn: '1, Test-ro, Test-si',
  phone: '070-0000-0000',
};

describe('BusinessInfo (사업자 정보)', () => {
  it('상호·대표자·사업자등록번호·이메일을 표시한다', () => {
    render(<BusinessInfo />);
    expect(screen.getByText('조요피(JOYOPI)')).toBeInTheDocument();
    expect(screen.getByText('조영용')).toBeInTheDocument();
    expect(screen.getByText('180-21-02731')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'hello@joyopi.com' })).toHaveAttribute(
      'href',
      'mailto:hello@joyopi.com',
    );
  });

  it('값이 없는 항목(신고번호·주소·전화)은 빈칸으로 두지 않고 줄 자체를 숨긴다', () => {
    render(
      <BusinessInfo info={{ ...BUSINESS_INFO, mailOrderNumber: null, addressKo: null, addressEn: null, phone: null }} />,
    );
    expect(screen.queryByText('통신판매업 신고번호')).not.toBeInTheDocument();
    expect(screen.queryByText('주소')).not.toBeInTheDocument();
    expect(screen.queryByText('전화')).not.toBeInTheDocument();
  });

  it('값이 있으면 신고번호·주소·전화를 표시한다', () => {
    render(<BusinessInfo info={full} />);
    expect(screen.getByText('제0000-테스트-0000호')).toBeInTheDocument();
    expect(screen.getByText('테스트시 테스트로 1')).toBeInTheDocument();
    expect(screen.getByText('070-0000-0000')).toBeInTheDocument();
  });

  it('영어·일본어는 항목 이름을 그 언어로, 주소는 영문 표기로 보여 준다', () => {
    const { unmount } = render(<BusinessInfo lang="en" info={full} />);
    expect(screen.getByText('Business registration no.')).toBeInTheDocument();
    expect(screen.getByText('1, Test-ro, Test-si')).toBeInTheDocument();
    expect(screen.getByText('JOYOPI')).toBeInTheDocument();
    unmount();

    render(<BusinessInfo lang="ja" info={full} />);
    expect(screen.getByText('事業者登録番号')).toBeInTheDocument();
    expect(screen.getByText('1, Test-ro, Test-si')).toBeInTheDocument();
  });
});
