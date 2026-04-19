'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export async function signInWithGoogle() {
  const supabase = await createClient()
  const headersList = await headers()
  
  // Next.js에서 권장하는 표준적인 호스트 및 프로토콜 감지
  const host = headersList.get('host')
  const protocol = headersList.get('x-forwarded-proto') || (host?.includes('localhost') ? 'http' : 'https')
  const origin = `${protocol}://${host}`

  const { data } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
      // 개인정보(email, profile) 요청을 제외하고 최소한의 신원 확인(openid)만 수행합니다.
      queryParams: {
        scope: 'openid',
      },
    },
  })

  if (data.url) {
    redirect(data.url)
  }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}
