'use server'

import { createClient } from '@/utils/supabase/server'
import { db } from '@/db'
import { profiles } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { ActionResult } from './board'

export async function getProfile() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    return await db.query.profiles.findFirst({
      where: eq(profiles.id, user.id)
    })
  } catch (error) {
    console.error(error)
    return null
  }
}

export async function updateProfile(formData: FormData): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, message: '로그인이 필요합니다.' };

    const nickname = (formData.get('nickname') as string)?.trim()
    const bio = (formData.get('bio') as string)?.trim()

    if (!nickname) return { success: false, message: '닉네임을 입력해주세요.' };
    if (nickname.length > 10) return { success: false, message: '닉네임은 최대 10자까지 가능합니다.' };
    if (bio && bio.length > 100) return { success: false, message: '자기소개는 최대 100자까지 가능합니다.' };

    await db.update(profiles)
      .set({ 
        nickname, 
        bio,
        updatedAt: new Date()
      })
      .where(eq(profiles.id, user.id))
      
    revalidatePath('/profile')
    return { success: true };
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === '23505') {
      return { success: false, message: '이미 사용 중인 닉네임입니다.' };
    }
    console.error(error);
    return { success: false, message: '프로필 저장 중 오류가 발생했습니다.' };
  }
}

export async function getPublicProfile(userId: string) {
  try {
    return await db.query.profiles.findFirst({
      where: eq(profiles.id, userId),
      columns: {
        nickname: true,
        bio: true,
        createdAt: true,
      }
    })
  } catch (error) {
    console.error(error)
    return null
  }
}

export async function deleteAccount(): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session?.user) {
      return { success: false, message: '로그인 세션이 만료되었습니다.' };
    }

    const googleToken = session.provider_token
    const { error: functionError } = await supabase.functions.invoke('withdraw-user', {
      body: { googleToken }
    })
    
    if (functionError) {
      console.error('[Withdrawal] Edge Function error:', functionError)
      return { success: false, message: '회원 탈퇴 처리 중 오류가 발생했습니다.' };
    }

    await supabase.auth.signOut()
    
    // 전체 레이아웃 대신 필요한 부분만 재검증
    revalidatePath('/')
  } catch (error) {
    if (error instanceof Error && (error.message === 'NEXT_REDIRECT' || error.constructor.name === 'RedirectError')) {
      throw error
    }
    console.error('[Withdrawal] Error:', error)
    return { success: false, message: '탈퇴 처리 중 예상치 못한 오류가 발생했습니다.' };
  }

  redirect('/')
}
