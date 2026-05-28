import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import PiggyAnalytics from './piggy-analytics';
import { MealStats } from '../types';

// JSDOM 환경에서 Recharts가 0px 너비 경고 없이 렌더링되도록 ResponsiveContainer 모킹 (any 배제)
vi.mock('recharts', async () => {
  const original = await vi.importActual<Record<string, unknown>>('recharts');
  return {
    ...original,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div style={{ width: '400px', height: '300px' }} data-testid="responsive-container">
        {children}
      </div>
    ),
  };
});

describe('PiggyAnalytics - Flat Pie Chart TDD', () => {
  const mockStats: MealStats = {
    count: 3,
    nightSnackRatio: 33,
    character: {
      type: '미식가 황제 돼지',
      description: '맛있는 음식에 플렉스하는 왕!',
    },
    mostEaten: {
      menuName: '제육볶음',
      count: 2,
    },
    longestUnEaten: {
      menuName: '제육볶음',
      daysAgo: 1,
    },
    mealTypeDistribution: {
      lunch: 2,
      night_snack: 1,
    },
    satisfactionDistribution: {
      5: 2,
      4: 1,
      3: 0,
      2: 0,
      1: 0,
    },
    mostEatenList: [
      { menuName: '제육볶음', count: 2 },
      { menuName: '김치찌개', count: 1 }
    ],
    longestUnEatenList: [
      { menuName: '김치찌개', daysAgo: 3 },
      { menuName: '제육볶음', daysAgo: 1 }
    ],
    weeklyDateRange: {
      start: `${new Date().getFullYear()}.01.01.`,
      end: `${new Date().getFullYear()}.01.07.`,
    },
  };

  it('1. 최애 메뉴 및 그리운 맛 합본 카드가 화면에 잘 잡히는지 확인', () => {
    render(<PiggyAnalytics stats={mockStats} />);
    
    expect(screen.getByText('👑 최애 메뉴 TOP 5')).toBeInTheDocument();
    expect(screen.getByText('🕰️ 그리운 맛 TOP 5')).toBeInTheDocument();
  });

  it('2. [Red Test] Recharts 라이브러리 연동 및 차트 구성 요소 마운트 검증', async () => {
    render(<PiggyAnalytics stats={mockStats} />);
    
    // Recharts 모킹 컨테이너가 렌더링되었는지 비동기적으로 대기 및 검사
    const responsiveContainers = await screen.findAllByTestId('responsive-container');
    expect(responsiveContainers.length).toBeGreaterThan(0);

    // piggy-analytics.tsx 파일 내부에 recharts와 PieChart 임포트 구문이 다시 존재해야 함
    const fileContent = fs.readFileSync(
      path.resolve(__dirname, './piggy-analytics.tsx'),
      'utf8'
    );
    expect(fileContent).toContain('recharts');
    expect(fileContent).toContain('PieChart');
  });

  it('3. [Red Test] 5색 플랫 파스텔 배색 및 중앙 도넛 피드백 표현 연동 검증', async () => {
    render(<PiggyAnalytics stats={mockStats} />);

    // 도넛 중앙에 디폴트 뷰로서 가장 높은 횟수(5점)의 라벨("5점 👑")이 정상적으로 렌더링되는지 확인
    const labelElement = await screen.findByText('5점 👑');
    expect(labelElement).toBeInTheDocument();

    // 수평 막대 차트 컴포넌트는 완전히 제거되어 더 이상 DOM 상에 없어야 함
    const spectrumBar = screen.queryByTestId('satisfaction-spectrum-bar');
    expect(spectrumBar).toBeNull();
  });
});
