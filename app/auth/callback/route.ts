import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { headers } from 'next/headers'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/'

  // Vercel 등 프록시 환경에서도 유연하게 동작하도록 origin 감지
  const headersList = await headers()
  const host = headersList.get('x-forwarded-host') || headersList.get('host') || requestUrl.host
  const protocol = headersList.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https')
  const origin = `${protocol}://${host}`

  if (code) {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && user) {
      // 프로필 존재 여부 확인 및 생성
      const { db } = await import('@/db')
      const { profiles } = await import('@/db/schema')
      const { eq } = await import('drizzle-orm')
      const { generateRandomNickname } = await import('@/utils/nickname')

      const existingProfile = await db.query.profiles.findFirst({
        where: eq(profiles.id, user.id)
      })

      if (!existingProfile) {
        await db.insert(profiles).values({
          id: user.id,
          email: user.email!,
          nickname: generateRandomNickname(),
        })
      } else if (existingProfile.email !== user.email) {
        // 이메일이 변경된 경우 업데이트 (보안 및 데이터 정합성)
        await db.update(profiles)
          .set({ email: user.email! })
          .where(eq(profiles.id, user.id))
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // 오류 발생 시 메인으로 리다이렉트
  return NextResponse.redirect(`${origin}/?error=auth`)
}
