import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { signInWithGoogle, signOut } from '@/app/actions/auth';

const MainHeader = async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-black tracking-tighter hover:opacity-70 transition-opacity">
          YOPI LAND
        </Link>

        <nav className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-slate-600">
                {user.user_metadata?.full_name || user.user_metadata?.name || '사용자'}님
              </span>
              <form action={signOut}>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-full bg-slate-100 text-slate-600 text-sm font-bold hover:bg-slate-200 transition-all active:scale-95"
                >
                  로그아웃
                </button>
              </form>
            </div>
          ) : (
            <form action={signInWithGoogle}>
              <button
                type="submit"
                className="px-4 py-2 rounded-full bg-[#1E1B4B] text-white text-sm font-bold hover:bg-opacity-90 transition-all active:scale-95"
              >
                구글 로그인
              </button>
            </form>
          )}
        </nav>
      </div>
    </header>
  );
};

export default MainHeader;
