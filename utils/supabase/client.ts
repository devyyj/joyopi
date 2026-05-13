import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!

// HMR 및 중복 생성 방지를 위한 싱글톤 패턴
const createSupabaseClient = () => {
  return createBrowserClient(
    supabaseUrl,
    supabaseKey
  )
}

declare global {
  var supabase: ReturnType<typeof createSupabaseClient> | undefined
}

export function createClient() {
  if (typeof window === 'undefined') return createSupabaseClient()
  
  if (!globalThis.supabase) {
    globalThis.supabase = createSupabaseClient()
  }
  
  return globalThis.supabase
}
