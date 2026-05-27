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
  character: {
    type: string;
    description: string;
  };
  mostEaten: {
    menuName: string;
    count: number;
  };
  longestUnEaten: {
    menuName: string;
    daysAgo: number;
  };
}
