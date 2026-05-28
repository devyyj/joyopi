'use server';

import { db } from '@/db';
import { meals, mealImages } from '@/db/schema';
import { createClient } from '@/utils/supabase/server';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

// 입력값 검증 도우미 (가격 및 포만감 검증 코드 제거)
function validateMealData(menuName: string, mealType: string, satisfaction: number, eatenAtStr: string) {
  if (!menuName || menuName.trim() === '') {
    return { valid: false, message: '메뉴명을 입력해주세요.' };
  }
  if (menuName.length > 50) {
    return { valid: false, message: '메뉴명은 최대 50자까지 입력 가능합니다.' };
  }
  const validMealTypes = ['breakfast', 'lunch', 'dinner', 'snack', 'night_snack'];
  if (!validMealTypes.includes(mealType)) {
    return { valid: false, message: '올바르지 않은 식사 구분입니다.' };
  }
  if (satisfaction < 1 || satisfaction > 5) {
    return { valid: false, message: '만족도는 1에서 5 사이여야 합니다.' };
  }
  if (!eatenAtStr || isNaN(Date.parse(eatenAtStr))) {
    return { valid: false, message: '올바른 식사 일시를 입력해주세요.' };
  }
  return { valid: true };
}

// 1. 식사 기록 생성
export async function createMeal(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, message: '로그인이 필요합니다.' };
    }

    const menuName = formData.get('menuName') as string;
    const mealType = formData.get('mealType') as string;
    const satisfaction = parseInt(formData.get('satisfaction') as string || '3', 10);
    const memo = formData.get('memo') as string || null;
    const tagsRaw = formData.get('tags') as string;
    const eatenAtStr = formData.get('eatenAt') as string;

    // 검증
    const validation = validateMealData(menuName, mealType, satisfaction, eatenAtStr);
    if (!validation.valid) {
      return { success: false, message: validation.message };
    }

    const tags = tagsRaw ? JSON.parse(tagsRaw) as string[] : [];
    const eatenAt = new Date(eatenAtStr);

    // 사진 파일 수집
    const imageFiles = formData.getAll('images') as File[];
    const validImages = imageFiles.filter((file) => file.size > 0);

    // DB 트랜잭션 시작 (이미지 업로드 실패 시 DB도 롤백)
    const result = await db.transaction(async (tx) => {
      // 1. Meals 테이블 삽입
      const [newMeal] = await tx.insert(meals).values({
        userId: user.id,
        menuName,
        mealType,
        satisfaction,
        memo,
        tags,
        eatenAt,
      }).returning({ id: meals.id });

      // 2. 이미지 업로드 및 저장
      if (validImages.length > 0) {
        for (const file of validImages) {
          const extension = file.name.split('.').pop() || 'webp';
          const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${extension}`;

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('meal-images')
            .upload(fileName, file, { contentType: file.type });

          if (uploadError || !uploadData) {
            console.error('Storage Upload Error:', uploadError);
            throw new Error('이미지 업로드에 실패했습니다. (Storage Error)');
          }

          const { data: { publicUrl } } = supabase.storage
            .from('meal-images')
            .getPublicUrl(fileName);

          await tx.insert(mealImages).values({
            mealId: newMeal.id,
            url: publicUrl,
          });
        }
      }

      return newMeal;
    });

    revalidatePath('/meals');
    return { success: true, mealId: result.id, message: '식사가 기록되었습니다.' };
  } catch (error) {
    console.error('[createMeal Error]:', error);
    const msg = error instanceof Error ? error.message : '식사 기록 중 에러가 발생했습니다.';
    return { success: false, message: msg };
  }
}

// 2. 식사 기록 조회 (커서 기반 페이지네이션)
export async function getMeals(params: {
  from: string;    // YYYY-MM-DD
  to: string;      // YYYY-MM-DD
  mealType?: string; // 식사 구분 필터 (breakfast, lunch, dinner, snack, night_snack)
  cursor?: number; // 마지막으로 받은 meal.id (없으면 첫 페이지)
  limit?: number;  // 기본값 10
}) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { meals: [], nextCursor: null, hasMore: false };

    const { from, to, mealType, cursor, limit = 10 } = params;

    // KST 기준 날짜 범위 (from 시작 00:00 ~ to 종료 23:59:59)
    const startOfFrom = new Date(`${from}T00:00:00+09:00`);
    const endOfTo = new Date(`${to}T23:59:59+09:00`);

    // 필터 조건 배열 구성
    const conditions = [
      eq(meals.userId, user.id),
      gte(meals.eatenAt, startOfFrom),
      lte(meals.eatenAt, endOfTo)
    ];

    if (mealType && mealType !== 'all') {
      conditions.push(eq(meals.mealType, mealType));
    }

    if (cursor) {
      conditions.push(lte(meals.id, cursor - 1)); // id < cursor (DESC 정렬)
    }

    const list = await db.query.meals.findMany({
      where: and(...conditions),
      with: { images: true },
      orderBy: [desc(meals.eatenAt), desc(meals.id)],
      limit: limit + 1, // 1개 더 가져와서 hasMore 판단
    });

    const hasMore = list.length > limit;
    const resultMeals = hasMore ? list.slice(0, limit) : list;
    const nextCursor = hasMore ? (resultMeals.at(-1)?.id ?? null) : null;

    return { meals: resultMeals, nextCursor, hasMore };
  } catch (error) {
    console.error('[getMeals Error]:', error);
    return { meals: [], nextCursor: null, hasMore: false };
  }
}

// 3. 식사 기록 수정
export async function updateMeal(mealId: number, formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, message: '로그인이 필요합니다.' };
    }

    const menuName = formData.get('menuName') as string | null;
    const satisfactionRaw = formData.get('satisfaction');
    const satisfaction = satisfactionRaw ? parseInt(satisfactionRaw as string, 10) : undefined;
    const memo = formData.get('memo') as string | null;
    const tagsRaw = formData.get('tags') as string | null;
    const tags = tagsRaw ? JSON.parse(tagsRaw) as string[] : undefined;

    const updateFields: Partial<typeof meals.$inferInsert> = {};
    if (menuName !== null && menuName !== undefined) {
      if (menuName.length > 50) return { success: false, message: '메뉴명은 최대 50자까지입니다.' };
      updateFields.menuName = menuName;
    }
    if (satisfaction !== undefined) updateFields.satisfaction = satisfaction;
    if (memo !== null && memo !== undefined) updateFields.memo = memo;
    if (tags !== undefined) updateFields.tags = tags;
    updateFields.updatedAt = new Date();

    const [updated] = await db.update(meals)
      .set(updateFields)
      .where(and(eq(meals.id, mealId), eq(meals.userId, user.id)))
      .returning();

    if (!updated) {
      return { success: false, message: '수정 권한이 없거나 식사 기록을 찾을 수 없습니다.' };
    }

    // 신규 추가 사진 처리
    const imageFiles = formData.getAll('images') as File[];
    const validImages = imageFiles.filter((file) => file.size > 0);
    if (validImages.length > 0) {
      for (const file of validImages) {
        const extension = file.name.split('.').pop() || 'webp';
        const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${extension}`;

        await supabase.storage
          .from('meal-images')
          .upload(fileName, file, { contentType: file.type });

        const { data: { publicUrl } } = supabase.storage
          .from('meal-images')
          .getPublicUrl(fileName);

        await db.insert(mealImages).values({
          mealId,
          url: publicUrl,
        });
      }
    }

    // 기존 삭제 요청된 사진 처리
    const deleteImageUrlsRaw = formData.get('deleteImageUrls') as string | null;
    if (deleteImageUrlsRaw) {
      const deleteUrls = JSON.parse(deleteImageUrlsRaw) as string[];
      for (const url of deleteUrls) {
        // storage에서 실제 파일명 파싱 (예: url에서 버킷 뒷 경로 파싱)
        const parts = url.split('/meal-images/');
        if (parts.length > 1) {
          const filePath = parts[1];
          await supabase.storage.from('meal-images').remove([filePath]);
        }
        await db.delete(mealImages).where(and(eq(mealImages.mealId, mealId), eq(mealImages.url, url)));
      }
    }

    revalidatePath('/meals');
    return { success: true, message: '기록이 수정되었습니다.' };
  } catch (error) {
    console.error('[updateMeal Error]:', error);
    const msg = error instanceof Error ? error.message : '식사 수정 중 에러가 발생했습니다.';
    return { success: false, message: msg };
  }
}

// 4. 식사 기록 삭제
export async function deleteMeal(mealId: number) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, message: '로그인이 필요합니다.' };
    }

    // 관련된 이미지들 먼저 storage에서 삭제하기 위해 조회
    const imgs = await db.select().from(mealImages).where(eq(mealImages.mealId, mealId));
    for (const img of imgs) {
      const parts = img.url.split('/meal-images/');
      if (parts.length > 1) {
        const filePath = parts[1];
        await supabase.storage.from('meal-images').remove([filePath]);
      }
    }

    const [deleted] = await db.delete(meals)
      .where(and(eq(meals.id, mealId), eq(meals.userId, user.id)))
      .returning();

    if (!deleted) {
      return { success: false, message: '삭제 권한이 없거나 식사 기록을 찾을 수 없습니다.' };
    }

    revalidatePath('/meals');
    return { success: true, message: '식사 기록이 삭제되었습니다.' };
  } catch (error) {
    console.error('[deleteMeal Error]:', error);
    const msg = error instanceof Error ? error.message : '식사 삭제 중 에러가 발생했습니다.';
    return { success: false, message: msg };
  }
}

// 5. 식생활 통계 집계
export async function getMealStats(from: string, to: string, mealType?: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // from/to 기반 날짜 필터 (KST 기준)
    const startDate = new Date(`${from}T00:00:00+09:00`);
    const endDate = new Date(`${to}T23:59:59+09:00`);

    if (!user) {
      return {
        nightSnackRatio: 0,
        count: 0,
        mealTypeDistribution: {},
        satisfactionDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        mostEaten: { menuName: '없음', count: 0 },
        longestUnEaten: { menuName: '없음', daysAgo: 0 },
        mostEatenList: [],
        longestUnEatenList: [],
      };
    }

    // 필터 조건 구성
    const conditions = [
      eq(meals.userId, user.id),
      gte(meals.eatenAt, startDate),
      lte(meals.eatenAt, endDate)
    ];

    if (mealType && mealType !== 'all') {
      conditions.push(eq(meals.mealType, mealType));
    }

    // 선택 기간 내 식사 리스트 조회
    const list = await db.query.meals.findMany({
      where: and(...conditions)
    });

    const count = list.length;
    if (count === 0) {
      return {
        nightSnackRatio: 0,
        count: 0,
        mealTypeDistribution: {},
        satisfactionDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        mostEaten: { menuName: '없음', count: 0 },
        longestUnEaten: { menuName: '없음', daysAgo: 0 },
        mostEatenList: [],
        longestUnEatenList: [],
      };
    }

    let nightSnackCount = 0;

    const mealTypeCounts: Record<string, number> = {};
    const satisfactionCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    list.forEach((meal) => {
      // 식사 타입 분포
      mealTypeCounts[meal.mealType] = (mealTypeCounts[meal.mealType] || 0) + 1;

      // 만족도 분포 집계
      if (meal.satisfaction >= 1 && meal.satisfaction <= 5) {
        satisfactionCounts[meal.satisfaction] = (satisfactionCounts[meal.satisfaction] || 0) + 1;
      }

      // 야식 여부 판정 (22:00 ~ 04:00)
      const eatenHour = new Date(meal.eatenAt).getHours();
      if (eatenHour >= 22 || eatenHour < 4) {
        nightSnackCount++;
      }
    });

    const nightSnackRatio = Math.round((nightSnackCount / count) * 100);

    // 최애/그리운 맛 집계는 선택 기간 내 데이터 기준
    const allMeals = list;

    let mostEaten = { menuName: '없음', count: 0 };
    let longestUnEaten = { menuName: '없음', daysAgo: 0 };
    let mostEatenList: Array<{ menuName: string; count: number }> = [];
    let longestUnEatenList: Array<{ menuName: string; daysAgo: number }> = [];

    if (allMeals.length > 0) {
      // 메뉴별 횟수 집계
      const menuCounts: Record<string, number> = {};
      allMeals.forEach((m) => {
        const name = m.menuName.trim();
        menuCounts[name] = (menuCounts[name] || 0) + 1;
      });

      // 최애 메뉴 TOP 5 (횟수 내림차순)
      mostEatenList = Object.entries(menuCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([menuName, cnt]) => ({ menuName, count: cnt }));

      const [topMenu] = mostEatenList;
      if (topMenu && topMenu.count >= 2) {
        mostEaten = { menuName: topMenu.menuName, count: topMenu.count };
      } else {
        mostEaten = { menuName: allMeals[0].menuName, count: 1 };
      }

      // 메뉴별 마지막 먹은 날짜 집계
      const menuLastEaten: Record<string, Date> = {};
      allMeals.forEach((m) => {
        const name = m.menuName.trim();
        const mealDate = new Date(m.eatenAt);
        if (!menuLastEaten[name] || mealDate > menuLastEaten[name]) {
          menuLastEaten[name] = mealDate;
        }
      });

      const now = new Date();
      const menuNames = Object.keys(menuLastEaten);

      // 그리운 맛 TOP 5 (마지막으로 먹은 날이 오래된 순)
      if (menuNames.length > 1) {
        longestUnEatenList = menuNames
          .map((name) => {
            const diffTime = Math.abs(now.getTime() - menuLastEaten[name].getTime());
            const daysAgo = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            return { menuName: name, daysAgo };
          })
          .sort((a, b) => b.daysAgo - a.daysAgo)
          .slice(0, 5);

        const [oldest] = longestUnEatenList;
        if (oldest && oldest.daysAgo > 0) {
          longestUnEaten = { menuName: oldest.menuName, daysAgo: oldest.daysAgo };
        }
      }
    }

    return {
      nightSnackRatio,
      count,
      mealTypeDistribution: mealTypeCounts,
      satisfactionDistribution: satisfactionCounts,
      mostEaten,
      longestUnEaten,
      mostEatenList,
      longestUnEatenList,
    };
  } catch (error) {
    console.error('[getMealStats Error]:', error);
    return {
      nightSnackRatio: 0,
      count: 0,
      mealTypeDistribution: {},
      satisfactionDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      mostEaten: { menuName: '없음', count: 0 },
      longestUnEaten: { menuName: '없음', daysAgo: 0 },
      mostEatenList: [],
      longestUnEatenList: [],
    };
  }
}
