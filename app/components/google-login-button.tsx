'use client';

import { createClient } from '@/utils/supabase/client';

export default function GoogleLoginButton() {
  const handleLogin = async () => {
    const supabase = createClient();
    
    // 브라우저의 현재 origin (host 포함)을 직접 가져옴
    const origin = window.location.origin;
    const redirectTo = `${origin}/auth/callback`;

    console.log('--- [DEBUG] Browser Google Login Started ---');
    console.log('Browser Origin:', origin);
    console.log('RedirectTo:', redirectTo);
    console.log('-------------------------------------------');

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
      },
    });

    if (error) {
      console.error('Login Error:', error.message);
      alert('로그인 중 오류가 발생했습니다.');
    }
  };

  return (
    <button
      onClick={handleLogin}
      className="px-4 py-2 rounded-full bg-[#1E1B4B] text-white text-sm font-bold hover:bg-opacity-90 transition-all active:scale-95"
    >
      구글 로그인
    </button>
  );
}
