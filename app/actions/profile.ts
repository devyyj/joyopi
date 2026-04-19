'use server'

import { createClient } from '@/utils/supabase/server'
import { db } from '@/db'
import { profiles } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function getProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  return await db.query.profiles.findFirst({
    where: eq(profiles.id, user.id)
  })
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('로그인이 필요합니다.')
  }

  const nickname = (formData.get('nickname') as string)?.trim()
  const bio = (formData.get('bio') as string)?.trim()

  if (!nickname) {
    throw new Error('닉네임을 입력해주세요.')
  }

  try {
    await db.update(profiles)
      .set({ 
        nickname, 
        bio,
        updatedAt: new Date()
      })
      .where(eq(profiles.id, user.id))
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === '23505') {
      throw new Error('이미 사용 중인 닉네임입니다.')
    }
    throw error
  }

  revalidatePath('/profile')
  revalidatePath('/board')
}

export async function deleteAccount() {
  const supabase = await createClient()
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  
  if (sessionError || !session?.user) {
    throw new Error('로그인 세션이 만료되었거나 찾을 수 없습니다.')
  }

  try {
    // 보안 강화: 앱에서 관리자 키를 사용하지 않고 격리된 Edge Function을 호출합니다.
    // 구글 소셜 연동 해제를 위해 세션에서 provider_token을 추출하여 전달합니다.
    const googleToken = session.provider_token
    
    const { error: functionError } = await supabase.functions.invoke('withdraw-user', {
      body: { googleToken }
    })
    
    if (functionError) {
      console.error('[Withdrawal] Edge Function 호출 실패:', functionError)
      throw new Error('회원 탈퇴 처리 중 오류가 발생했습니다.')
    }

    console.log('[Withdrawal] User successfully withdrawn via Edge Function')

    // 세션 파기는 성공 시에만 수행
    await supabase.auth.signOut()

  } catch (error) {
    // redirect()가 던지는 내부 에러는 그대로 다시 던져야 합니다.
    if (error instanceof Error && (error.message === 'NEXT_REDIRECT' || error.constructor.name === 'RedirectError')) {
      throw error
    }
    console.error('[Withdrawal] Critical error during withdrawal:', error)
    throw error instanceof Error ? error : new Error('탈퇴 처리 중 예상치 못한 오류가 발생했습니다.')
  }

  // redirect는 반드시 try-catch 블록 외부에서 호출해야 합니다.
  revalidatePath('/', 'layout')
  redirect('/')
}
