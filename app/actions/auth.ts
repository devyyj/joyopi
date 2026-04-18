'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export async function signInWithGoogle() {
  const supabase = await createClient()
  
  const headersList = await headers()
  const forwardedHost = headersList.get('x-forwarded-host')
  const host = headersList.get('host')
  
  // 프록시 호스트가 있으면 우선 사용, 없으면 일반 호스트 사용
  const activeHost = forwardedHost || host
  const protocol = headersList.get('x-forwarded-proto') || (activeHost?.includes('localhost') ? 'http' : 'https')
  const origin = `${protocol}://${activeHost}`

  console.log('--- Auth Debug ---')
  console.log('Forwarded Host:', forwardedHost)
  console.log('Host:', host)
  console.log('Protocol:', protocol)
  console.log('Final Origin:', origin)
  console.log('------------------')

  const { data } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
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
