'use server';

import { db } from '@/db';
import { nameRanks, profiles } from '@/db/schema';
import { createClient } from '@/utils/supabase/server';
import { eq, asc, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

// 권한 룰 정의: 아빠 선호도는 devyyj만, 엄마 선호도는 notice(지우츄)만 변경 가능
const DAD_USER_EMAIL = 'devyyj@gmail.com';
const MOM_USER_EMAIL = 'noticeably34@gmail.com';

/**
 * 호출한 사용자가 로그인 상태이며, 관리자(admin) 권한을 지니고 있는지 검증합니다.
 */
async function verifyAdmin(): Promise<{ id: string; email: string }> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error('Unauthorized');
  }

  // profiles 테이블에서 권한(role) 확인
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1);

  if (!profile || profile.role !== 'admin') {
    throw new Error('Forbidden: Admin role required');
  }

  return { id: user.id, email: user.email || '' };
}

/**
 * 성별 역할('dad' | 'mom')에 따라 변경 요청자가 해당 사용자(devyyj / noticeably34)인지 검증합니다.
 */
function verifyRolePermission(userEmail: string, role: 'dad' | 'mom') {
  if (role === 'dad' && userEmail !== DAD_USER_EMAIL) {
    throw new Error('Forbidden: Only dad user can manage dad list');
  }
  if (role === 'mom' && userEmail !== MOM_USER_EMAIL) {
    throw new Error('Forbidden: Only mom user can manage mom list');
  }
}

/**
 * 특정 역할('dad' | 'mom')의 아기 이름 목록을 순위(rank) 오름차순으로 조회합니다.
 */
export async function getBabyNames(role: 'dad' | 'mom') {
  await verifyAdmin(); // 조회는 두 관리자 모두 가능

  try {
    const list = await db
      .select()
      .from(nameRanks)
      .where(eq(nameRanks.role, role))
      .orderBy(asc(nameRanks.rank));

    return list;
  } catch (error) {
    console.error('getBabyNames error:', error);
    throw new Error('이름 목록을 가져오는 중 오류가 발생했습니다.');
  }
}

/**
 * 신규 아기 이름 후보를 등록합니다.
 */
export async function createBabyName(name: string, role: 'dad' | 'mom') {
  const user = await verifyAdmin();
  verifyRolePermission(user.email, role);

  if (!name || name.trim() === '') {
    throw new Error('이름을 입력해주세요.');
  }

  try {
    // 현재 역할의 이름 목록을 불러와 최대 rank를 계산
    const currentList = await db
      .select()
      .from(nameRanks)
      .where(eq(nameRanks.role, role))
      .orderBy(asc(nameRanks.rank));

    const nextRank = currentList.length > 0 
      ? Math.max(...currentList.map(item => item.rank)) + 1 
      : 1;

    const [inserted] = await db
      .insert(nameRanks)
      .values({
        name: name.trim(),
        role,
        rank: nextRank,
      })
      .returning();

    revalidatePath('/name-rank');
    return { success: true, data: inserted };
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Forbidden')) {
      throw error;
    }
    console.error('createBabyName error:', error);
    throw new Error('이름을 추가하는 중 오류가 발생했습니다.');
  }
}

/**
 * 아기 이름 후보명을 수정합니다.
 */
export async function updateBabyName(id: string, name: string) {
  const user = await verifyAdmin();

  if (!name || name.trim() === '') {
    throw new Error('이름을 입력해주세요.');
  }

  try {
    // 수정 대상을 찾아 역할(role) 확인
    const [target] = await db
      .select()
      .from(nameRanks)
      .where(eq(nameRanks.id, id))
      .limit(1);

    if (!target) {
      throw new Error('수정할 대상을 찾을 수 없습니다.');
    }

    verifyRolePermission(user.email, target.role as 'dad' | 'mom');

    const [updated] = await db
      .update(nameRanks)
      .set({
        name: name.trim(),
        updatedAt: new Date(),
      })
      .where(eq(nameRanks.id, id))
      .returning();

    revalidatePath('/name-rank');
    return { success: true, data: updated };
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Forbidden')) {
      throw error;
    }
    console.error('updateBabyName error:', error);
    throw new Error('이름을 수정하는 중 오류가 발생했습니다.');
  }
}

/**
 * 아기 이름을 삭제하고, 해당 그룹의 나머지 이름 순위(rank)를 1부터 순차적으로 재정렬합니다.
 */
export async function deleteBabyName(id: string) {
  const user = await verifyAdmin();

  try {
    // 1. 삭제할 아이템 조회
    const [target] = await db
      .select()
      .from(nameRanks)
      .where(eq(nameRanks.id, id))
      .limit(1);

    if (!target) {
      throw new Error('삭제할 대상을 찾을 수 없습니다.');
    }

    const role = target.role as 'dad' | 'mom';
    verifyRolePermission(user.email, role);

    // 2. 트랜잭션을 사용하여 삭제 및 순위 재조정
    await db.transaction(async (tx) => {
      // 대상 삭제
      await tx.delete(nameRanks).where(eq(nameRanks.id, id));

      // 남은 항목 조회
      const remaining = await tx
        .select()
        .from(nameRanks)
        .where(eq(nameRanks.role, role))
        .orderBy(asc(nameRanks.rank));

      // 순위 순차적으로 재부여
      for (let i = 0; i < remaining.length; i++) {
        await tx
          .update(nameRanks)
          .set({ rank: i + 1 })
          .where(eq(nameRanks.id, remaining[i].id));
      }
    });

    revalidatePath('/name-rank');
    return { success: true };
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Forbidden')) {
      throw error;
    }
    console.error('deleteBabyName error:', error);
    throw new Error('이름을 삭제하는 중 오류가 발생했습니다.');
  }
}

/**
 * 드래그 앤 드롭 등으로 순위가 바뀌었을 때 전체 순서(ID 배열)를 기반으로 rank를 일괄 재부여합니다.
 */
export async function reorderBabyNames(role: 'dad' | 'mom', orderedIds: string[]) {
  const user = await verifyAdmin();
  verifyRolePermission(user.email, role);

  try {
    await db.transaction(async (tx) => {
      for (let i = 0; i < orderedIds.length; i++) {
        await tx
          .update(nameRanks)
          .set({ rank: i + 1 })
          .where(and(eq(nameRanks.id, orderedIds[i]), eq(nameRanks.role, role)));
      }
    });

    revalidatePath('/name-rank');
    return { success: true };
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Forbidden')) {
      throw error;
    }
    console.error('reorderBabyNames error:', error);
    throw new Error('순위를 변경하는 중 오류가 발생했습니다.');
  }
}
