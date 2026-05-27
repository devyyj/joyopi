'use server';

import { db } from '@/db';
import { meals, mealImages } from '@/db/schema';
import { createClient } from '@/utils/supabase/server';
import { eq, and, gte, lte, desc, SQL } from 'drizzle-orm';
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

// 2. 식사 기록 조회
export async function getMeals(dateStr?: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    let dateQuery: SQL | undefined = eq(meals.userId, user.id);
    if (dateStr) {
      const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);
      const endOfDay = new Date(`${dateStr}T23:59:59.999Z`);
      dateQuery = and(
        eq(meals.userId, user.id),
        gte(meals.eatenAt, startOfDay),
        lte(meals.eatenAt, endOfDay)
      );
    }

    // findMany 또는 leftJoin 사용
    const list = await db.query.meals.findMany({
      where: dateQuery,
      with: {
        images: true,
      },
      orderBy: [desc(meals.eatenAt)],
    });

    return list;
  } catch (error) {
    console.error('[getMeals Error]:', error);
    return [];
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
export async function getMealStats(period: '7days' | '30days') {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return {
        nightSnackRatio: 0,
        count: 0,
        mealTypeDistribution: {},
        character: { type: '소식 웰빙 돼지', description: '기록된 식사 정보가 없습니다.' },
        mostEaten: { menuName: '없음', count: 0 },
        longestUnEaten: { menuName: '없음', daysAgo: 0 },
      };
    }

    const days = period === '7days' ? 7 : 30;
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);

    // 최근 n일 식사 리스트 조회
    const list = await db.query.meals.findMany({
      where: and(eq(meals.userId, user.id), gte(meals.eatenAt, sinceDate))
    });

    const count = list.length;
    if (count === 0) {
      return {
        nightSnackRatio: 0,
        count: 0,
        mealTypeDistribution: {},
        character: { type: '소식 웰빙 돼지', description: '식사 일기가 텅 비어 있습니다. 오늘 먹은 맛있는 식사부터 기록해 보세요!' },
        mostEaten: { menuName: '없음', count: 0 },
        longestUnEaten: { menuName: '없음', daysAgo: 0 },
      };
    }

    let satisfactionSum = 0;
    let nightSnackCount = 0;

    const mealTypeCounts: Record<string, number> = {};

    list.forEach((meal) => {
      satisfactionSum += meal.satisfaction;

      // 식사 타입 분포
      mealTypeCounts[meal.mealType] = (mealTypeCounts[meal.mealType] || 0) + 1;

      // 야식 여부 판정 (22:00 ~ 04:00)
      const eatenHour = new Date(meal.eatenAt).getHours();
      if (eatenHour >= 22 || eatenHour < 4) {
        nightSnackCount++;
      }
    });

    const avgSatisfaction = satisfactionSum / count;
    const nightSnackRatio = Math.round((nightSnackCount / count) * 100);

    // 1. 가장 자주 먹은 음식 집계 (전체 식사 기준)
    const allMeals = await db.query.meals.findMany({
      where: eq(meals.userId, user.id),
      orderBy: [desc(meals.eatenAt)],
    });

    let mostEaten = { menuName: '없음', count: 0 };
    let longestUnEaten = { menuName: '없음', daysAgo: 0 };

    if (allMeals.length > 0) {
      const menuCounts: Record<string, number> = {};
      allMeals.forEach((m) => {
        const name = m.menuName.trim();
        menuCounts[name] = (menuCounts[name] || 0) + 1;
      });

      let maxCount = 0;
      let maxMenu = '';
      Object.entries(menuCounts).forEach(([menu, cnt]) => {
        if (cnt > maxCount) {
          maxCount = cnt;
          maxMenu = menu;
        }
      });

      if (maxCount >= 2) {
        mostEaten = { menuName: maxMenu, count: maxCount };
      } else {
        mostEaten = { menuName: allMeals[0].menuName, count: 1 };
      }

      // 2. 안 먹은 지 가장 오래된 음식 집계 (최소 2개 이상의 서로 다른 메뉴가 있어야 비교 가능)
      const menuLastEaten: Record<string, Date> = {};
      allMeals.forEach((m) => {
        const name = m.menuName.trim();
        const mealDate = new Date(m.eatenAt);
        if (!menuLastEaten[name] || mealDate > menuLastEaten[name]) {
          menuLastEaten[name] = mealDate;
        }
      });

      const menuNames = Object.keys(menuLastEaten);
      if (menuNames.length > 1) {
        let oldestDate = new Date();
        let oldestMenu = '';

        menuNames.forEach((name) => {
          const lastDate = menuLastEaten[name];
          if (lastDate < oldestDate) {
            oldestDate = lastDate;
            oldestMenu = name;
          }
        });

        if (oldestMenu) {
          const diffTime = Math.abs(new Date().getTime() - oldestDate.getTime());
          const daysAgo = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          longestUnEaten = { menuName: oldestMenu, daysAgo };
        }
      }
    }

    // 캐릭터 진단 로직 (가격 및 포만감 제거에 따라 만족도, 선호 반복 빈도, 식사 시간대 기준으로 전면 개편)
    let charType = '평범한 미식가 돼지';
    let charDesc = '건강하고 무난하게 먹방 연구소를 즐기고 있는 표준형 요피 연구원 돼지입니다.';

    const snackCount = mealTypeCounts['snack'] || 0;
    const snackRatio = snackCount / count;

    if (nightSnackRatio >= 40) {
      charType = '야식 파이터 돼지';
      charDesc = '밤이 되면 진정한 파워를 발휘하는 올빼미 돼지! 밤 10시 이후에 먹은 꿀맛 야식의 마력에 푹 빠져 있으시군요.';
    } else if (avgSatisfaction >= 4.3) {
      charType = '미식가 황제 돼지';
      charDesc = '매 끼니마다 맛의 천국을 경험하며 황홀한 즐거움을 누리는 초미식가 돼지! 당신에게 밥이란 단순한 영양 섭취가 아니라 예술이자 축제입니다.';
    } else if (snackRatio >= 0.3 || (avgSatisfaction >= 3.0 && avgSatisfaction <= 4.0 && nightSnackRatio < 15)) {
      charType = '소식 웰빙 돼지';
      charDesc = '만족도 폭발보다는 단정하고 고른 식사 밸런스를 중시하는 웰빙 요가 돼지! 정갈하게 즐기는 라이트 식단의 귀재입니다.';
    } else if (mostEaten.count >= 3) {
      charType = '가성비 요정 돼지'; // 기획서 캐릭터 일관성 유지를 위해 칭호 유지하되 '단골집 매니아'로 설명
      charDesc = '좋아하는 특정 최애 단골 메뉴를 3번 이상 집요하게 조지는 진정한 한우물 돼지! 질리지 않는 명작 음식을 귀신같이 골라냅니다.';
    }

    return {
      nightSnackRatio,
      count,
      mealTypeDistribution: mealTypeCounts,
      character: {
        type: charType,
        description: charDesc,
      },
      mostEaten,
      longestUnEaten,
    };
  } catch (error) {
    console.error('[getMealStats Error]:', error);
    return {
      nightSnackRatio: 0,
      count: 0,
      mealTypeDistribution: {},
      character: { type: '소식 웰빙 돼지', description: '통계 집계 중 알 수 없는 에러가 발생했습니다.' },
      mostEaten: { menuName: '없음', count: 0 },
      longestUnEaten: { menuName: '없음', daysAgo: 0 },
    };
  }
}
