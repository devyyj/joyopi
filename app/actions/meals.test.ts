import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { createMeal, getMeals, updateMeal, deleteMeal, getMealStats } from './meals';
import { createClient } from '@/utils/supabase/server';
import { db } from '@/db';

vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(),
}));

vi.mock('@/db', () => ({
  db: {
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn().mockResolvedValue([{ id: 1 }]),
      })),
    })),
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn().mockResolvedValue([]),
        leftJoin: vi.fn(() => ({
          where: vi.fn(() => ({
            orderBy: vi.fn().mockResolvedValue([]),
          })),
        })),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => ({
          returning: vi.fn().mockResolvedValue([{ id: 1 }]),
        })),
      })),
    })),
    delete: vi.fn(() => ({
      where: vi.fn(() => ({
        returning: vi.fn().mockResolvedValue([{ id: 1 }]),
      })),
    })),
    transaction: vi.fn((callback) => callback(db)),
    query: {
      meals: {
        findMany: vi.fn(),
      },
    },
  },
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('Meals Server Actions (TDD)', () => {
  const mockUser = { id: 'user-777' };

  beforeEach(() => {
    vi.clearAllMocks();
    (createClient as Mock).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
      },
      storage: {
        from: vi.fn(() => ({
          upload: vi.fn().mockResolvedValue({ data: { path: 'user-777/test.webp' }, error: null }),
          getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'https://supabase.com/test.webp' } })),
          remove: vi.fn().mockResolvedValue({ data: {}, error: null }),
        })),
      },
    });
  });

  describe('createMeal', () => {
    it('로그인한 사용자가 유효한 데이터를 전송하면 식사 기록이 성공적으로 저장되어야 함 (사진 없음)', async () => {
      const formData = new FormData();
      formData.append('menuName', '맛있는 제육볶음');
      formData.append('mealType', 'lunch');
      formData.append('satisfaction', '5');
      formData.append('memo', '팀원들과 다 같이 먹음');
      formData.append('tags', JSON.stringify(['#제육', '#점심']));
      formData.append('eatenAt', '2026-05-27T12:00:00.000Z');

      const result = await createMeal(formData);

      expect(db.transaction).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.mealId).toBe(1);
    });

    it('사진이 있는 경우 스토리지 업로드와 DB 연동이 정상 처리되어야 함', async () => {
      const mockFile = new File(['dummy-image-data-content-more-than-zero'], 'meal.webp', { type: 'image/webp' });
      const formData = new FormData();
      formData.append('menuName', '치킨치킨');
      formData.append('mealType', 'night_snack');
      formData.append('satisfaction', '5');
      formData.append('eatenAt', '2026-05-27T23:00:00.000Z');
      formData.append('images', mockFile);

      const result = await createMeal(formData);

      expect(result.success).toBe(true);
    });

    it('예외 1: 메뉴명(menuName)이 누락되었거나 50자를 초과하면 유효성 검사 에러를 반환해야 함', async () => {
      const formData = new FormData();
      formData.append('menuName', ''); // 누락
      formData.append('mealType', 'lunch');
      formData.append('satisfaction', '5');
      formData.append('eatenAt', '2026-05-27T12:00:00.000Z');

      const result = await createMeal(formData);
      expect(result.success).toBe(false);
      expect(result.message).toContain('메뉴명을 입력');

      const longFormData = new FormData();
      longFormData.append('menuName', 'a'.repeat(51)); // 50자 초과
      longFormData.append('mealType', 'lunch');
      longFormData.append('satisfaction', '5');
      longFormData.append('eatenAt', '2026-05-27T12:00:00.000Z');

      const longResult = await createMeal(longFormData);
      expect(longResult.success).toBe(false);
      expect(longResult.message).toContain('최대 50자');
    });

    it('예외 2: 로그인하지 않은 경우 권한 부족 에러를 반환해야 함', async () => {
      (createClient as Mock).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
        },
      });

      const formData = new FormData();
      formData.append('menuName', '제육');
      formData.append('mealType', 'lunch');
      formData.append('satisfaction', '5');
      formData.append('eatenAt', '2026-05-27T12:00:00.000Z');

      const result = await createMeal(formData);
      expect(result.success).toBe(false);
      expect(result.message).toContain('로그인이 필요');
    });

    it('예외 3: 이미지 저장 과정에서 Storage 에러 발생 시 트랜잭션이 롤백되고 실패를 반환해야 함', async () => {
      (createClient as Mock).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
        storage: {
          from: vi.fn(() => ({
            upload: vi.fn().mockResolvedValue({ data: null, error: new Error('스토리지 에러 발생!') }),
          })),
        },
      });

      const mockFile = new File(['dummy-image-data-content-more-than-zero'], 'meal.webp', { type: 'image/webp' });
      const formData = new FormData();
      formData.append('menuName', '삼겹살');
      formData.append('mealType', 'dinner');
      formData.append('satisfaction', '5');
      formData.append('eatenAt', '2026-05-27T19:00:00.000Z');
      formData.append('images', mockFile);

      const result = await createMeal(formData);
      expect(result.success).toBe(false);
      expect(result.message).toContain('이미지 업로드에 실패');
    });
  });

  describe('getMeals', () => {
    it('해당 날짜에 기록된 사용자의 식사 목록을 반환해야 함', async () => {
      const mockMeals = [
        {
          id: 1,
          menuName: '제육볶음',
          mealType: 'lunch',
          satisfaction: 5,
          memo: '좋음',
          tags: ['#제육'],
          eatenAt: new Date(),
        },
      ];
      (db.query.meals.findMany as Mock).mockResolvedValue(mockMeals);

      const result = await getMeals('2026-05-27');
      expect(result).toEqual(mockMeals);
    });
  });

  describe('updateMeal', () => {
    it('본인의 식사 기록을 정상적으로 수정해야 함', async () => {
      const formData = new FormData();
      formData.append('menuName', '간장불고기');
      formData.append('satisfaction', '4');

      const result = await updateMeal(1, formData);
      expect(result.success).toBe(true);
    });
  });

  describe('deleteMeal', () => {
    it('식사 기록을 정상적으로 삭제해야 함', async () => {
      const result = await deleteMeal(1);
      expect(result.success).toBe(true);
    });
  });

  describe('getMealStats', () => {
    it('최근 일주일 통계 데이터를 성공적으로 집계해야 함', async () => {
      const mockMeals = [
        {
          id: 1,
          menuName: '제육볶음',
          mealType: 'lunch',
          satisfaction: 5,
          eatenAt: new Date('2026-05-27T12:00:00'), // Z를 제외해 로컬 타임존 보장
          tags: ['#혼밥', '#행복'],
        },
        {
          id: 2,
          menuName: '교촌치킨',
          mealType: 'night_snack',
          satisfaction: 5,
          eatenAt: new Date('2026-05-27T23:30:00'), // 로컬 야식(23시) 보장
          tags: ['#스트레스', '#야식'],
        },
        {
          id: 3,
          menuName: '제육볶음',
          mealType: 'dinner',
          satisfaction: 4,
          eatenAt: new Date('2026-05-27T19:00:00'),
          tags: ['#든든함'],
        },
      ];
      (db.query.meals.findMany as Mock).mockResolvedValue(mockMeals);

      const stats = await getMealStats('7days');
      expect(stats).toBeDefined();
      expect(stats.nightSnackRatio).toBe(33); // 3개 중 1개가 22시 이후 (33%)
      expect(stats.character.type).toBe('미식가 황제 돼지');
      expect(stats.mostEaten.menuName).toBe('제육볶음'); // 2회 섭취로 최애
      expect(stats.longestUnEaten.menuName).toBe('제육볶음'); // 최종 19시로 교촌치킨(23:30)보다 오래됨
    });
  });
});
