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
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user

  if (!user) {
    throw new Error('로그인이 필요합니다.')
  }

  // 1. 사전 검증: 어드민 클라이언트 생성이 가능한지 가장 먼저 확인
  let adminClient;
  try {
    const { createAdminClient } = await import('@/utils/supabase/admin')
    adminClient = await createAdminClient()
  } catch (error) {
    console.error('어드민 클라이언트 생성 실패:', error)
    throw new Error('서버 설정 오류로 회원 탈퇴를 완료할 수 없습니다. 관리자에게 문의하세요.')
  }

  try {
    // 2. 소셜 측(Google) 서비스 연결 해제
    const providerToken = session.provider_token
    if (providerToken) {
      await fetch(`https://oauth2.googleapis.com/revoke?token=${providerToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }).catch(err => console.error('구글 토큰 취소 실패(무시됨):', err))
    }

    // 3. Supabase Auth에서 사용자 완전 삭제 (가장 중요한 작업)
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id)
    if (deleteError) {
      throw new Error(`인증 계정 삭제 중 오류가 발생했습니다: ${deleteError.message}`)
    }

    // 4. DB 데이터 삭제 (CASCADE가 설정되어 있어도 명시적으로 한 번 더 처리)
    await db.delete(profiles).where(eq(profiles.id, user.id))

  } catch (error) {
    console.error('회원 탈퇴 프로세스 중 에러:', error)
    // 계정 삭제 중 에러가 발생하더라도 로그아웃은 시도하여 세션은 파기함
    await supabase.auth.signOut()
    throw error
  }

  // 5. 성공적인 로그아웃 및 리다이렉트
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}
