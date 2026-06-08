import { createClient } from '@/utils/supabase/server'
import { db } from '@/db'
import { profiles } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'

export type UserRole = 'admin' | 'user' | 'guest'

/**
 * 현재 로그인한 유저의 정보를 가져옵니다.
 */
export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

/**
 * 현재 로그인한 유저의 역할(Role)을 DB에서 조회합니다.
 * 로그인되지 않았거나 프로필이 없는 경우 'guest'를 반환합니다.
 */
export async function getCurrentUserRole(): Promise<UserRole> {
  const user = await getCurrentUser()
  if (!user) return 'guest'

  try {
    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.id, user.id),
      columns: {
        role: true,
      },
    })

    if (!profile) return 'guest'
    return (profile.role as UserRole) || 'user'
  } catch (error) {
    console.error('Failed to fetch user role:', error)
    return 'guest'
  }
}

/**
 * 현재 유저가 관리자(admin)인지 확인합니다.
 */
export async function isAdmin(): Promise<boolean> {
  const role = await getCurrentUserRole()
  return role === 'admin'
}

/**
 * 특정 역할 목록 중 하나에 해당하는지 검증하고,
 * 권한이 없으면 지정된 경로로 리다이렉트합니다.
 * 
 * @param allowedRoles 허용되는 역할 목록
 * @param redirectTo 권한이 없을 시 이동할 경로 (기본값: '/')
 */
export async function requireRole(allowedRoles: UserRole[], redirectTo: string = '/') {
  const role = await getCurrentUserRole()
  
  if (!allowedRoles.includes(role)) {
    redirect(redirectTo)
  }
}
