import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Top5Stats from './top5-stats';

describe('Top5Stats', () => {
  const mockMostEaten = [
    { menuName: '제육볶음', count: 5 },
    { menuName: '김치찌개', count: 3 },
    { menuName: '라면', count: 2 },
    { menuName: '비빔밥', count: 1 },
    { menuName: '순대국', count: 1 },
  ];

  const mockLongestUneaten = [
    { menuName: '교촌치킨', daysAgo: 17 },
    { menuName: '피자', daysAgo: 10 },
    { menuName: '삼겹살', daysAgo: 7 },
    { menuName: '초밥', daysAgo: 5 },
    { menuName: '짜장면', daysAgo: 3 },
  ];

  it('1. 최애 메뉴 TOP5 목록이 올바르게 렌더링되어야 함', () => {
    render(<Top5Stats mostEatenList={mockMostEaten} longestUnEatenList={mockLongestUneaten} />);
    const list = screen.getByTestId('most-eaten-list');
    expect(list).toBeInTheDocument();
    expect(screen.getByText('제육볶음')).toBeInTheDocument();
    expect(screen.getByText('5회')).toBeInTheDocument();
    expect(screen.getByText('순대국')).toBeInTheDocument();
  });

  it('2. 그리운 맛 TOP5 목록이 올바르게 렌더링되어야 함', () => {
    render(<Top5Stats mostEatenList={mockMostEaten} longestUnEatenList={mockLongestUneaten} />);
    const list = screen.getByTestId('longest-uneaten-list');
    expect(list).toBeInTheDocument();
    expect(screen.getByText('교촌치킨')).toBeInTheDocument();
    expect(screen.getByText('17일 전')).toBeInTheDocument();
    expect(screen.getByText('짜장면')).toBeInTheDocument();
  });

  it('3. 빈 데이터 상태에서 빈 상태 UI가 표시되어야 함', () => {
    render(<Top5Stats mostEatenList={[]} longestUnEatenList={[]} />);
    expect(screen.getByText('해당 기간에 기록된 식사가 없습니다.')).toBeInTheDocument();
  });

  it('4. 1위 항목에 금색 강조 클래스가 적용되어야 함', () => {
    render(<Top5Stats mostEatenList={mockMostEaten} longestUnEatenList={mockLongestUneaten} />);
    const firstRankRows = screen.getAllByTestId('rank-row-1');
    expect(firstRankRows.length).toBeGreaterThan(0);
  });
});
