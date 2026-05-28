// 기간 선택 UI 상태 타입
export type MealPeriod = '7days' | '14days' | '30days' | 'custom';

// 전역 날짜 범위 상태 (통계 + 타임라인 통합 제어)
export interface DateRange {
  period: MealPeriod;
  from: string; // YYYY-MM-DD
  to: string;   // YYYY-MM-DD
}

// 커서 기반 페이지네이션 결과
export interface PaginatedMeals {
  meals: Meal[];
  nextCursor: number | null; // 마지막 meal.id (null이면 더 이상 없음)
  hasMore: boolean;
}

export interface MealImage {
  id: number;
  mealId: number;
  url: string;
  createdAt: Date;
}

export interface Meal {
  id: number;
  userId: string;
  menuName: string;
  mealType: string;
  satisfaction: number;
  memo: string | null;
  tags: string[] | null;
  eatenAt: string | Date;
  createdAt: Date;
  updatedAt: Date;
  images?: MealImage[];
}

export interface MealStats {
  nightSnackRatio: number;
  count: number;
  mealTypeDistribution: Record<string, number>;
  satisfactionDistribution: Record<number, number>;
  mostEaten: {
    menuName: string;
    count: number;
  };
  longestUnEaten: {
    menuName: string;
    daysAgo: number;
  };
  mostEatenList?: Array<{
    menuName: string;
    count: number;
  }>;
  longestUnEatenList?: Array<{
    menuName: string;
    daysAgo: number;
  }>;
  weeklyDateRange?: {
    start: string;
    end: string;
  };
}
