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
  };

  it('1. 기본 돼지 지수 리포트 내용이 화면에 잘 잡히는지 확인', () => {
    render(<PiggyAnalytics stats={mockStats} period="7days" onPeriodChange={() => {}} />);
    expect(screen.getByText('미식가 황제 돼지')).toBeInTheDocument();
    expect(screen.getByText('맛있는 음식에 플렉스하는 왕!')).toBeInTheDocument();
  });

  it('2. [Red Test] Recharts 라이브러리 연동 및 차트 구성 요소 마운트 검증', async () => {
    render(<PiggyAnalytics stats={mockStats} period="7days" onPeriodChange={() => {}} />);
    
    // Recharts 모킹 컨테이너가 렌더링되었는지 비동기적으로 대기 및 검사
    const responsiveContainer = await screen.findByTestId('responsive-container');
    expect(responsiveContainer).toBeInTheDocument();

    // piggy-analytics.tsx 파일 내부에 recharts와 PieChart 임포트 구문이 다시 존재해야 함
    const fileContent = fs.readFileSync(
      path.resolve(__dirname, './piggy-analytics.tsx'),
      'utf8'
    );
    expect(fileContent).toContain('recharts');
    expect(fileContent).toContain('PieChart');
  });

  it('3. [Red Test] 5색 플랫 파스텔 배색 및 하단 피드백 돔 연동 검증', async () => {
    render(<PiggyAnalytics stats={mockStats} period="7days" onPeriodChange={() => {}} />);

    // 하단 글래스모피즘 피드백 보드가 정상 렌더링되었는지 비동기적으로 대기 및 확인
    const feedbackArea = await screen.findByTestId('satisfaction-detail-feedback');
    expect(feedbackArea).toBeInTheDocument();

    // 디폴트 뷰로서 가장 높은 횟수(5점)의 피드백("최고의 맛")이 노출되는지 확인
    expect(feedbackArea.textContent).toContain('최고의 맛');
    
    // 수평 막대 차트 컴포넌트는 완전히 제거되어 더 이상 DOM 상에 없어야 함
    const spectrumBar = screen.queryByTestId('satisfaction-spectrum-bar');
    expect(spectrumBar).toBeNull();
  });
});
