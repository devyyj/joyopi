import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { signInWithGoogle, signOut } from '@/app/actions/auth';

const MainHeader = async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-50 w-full bg-background/90 backdrop-blur-xl border-b border-slate-300/50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold tracking-tight hover:text-indigo-500 transition-colors">
          YOPI LAND
        </Link>

        <nav className="flex items-center gap-6">
          {user ? (
            <div className="flex items-center gap-6">
              <span className="text-sm font-bold text-slate-400">
                {user.user_metadata?.full_name || user.user_metadata?.name || '사용자'}
              </span>
              <form action={signOut}>
                <button
                  type="submit"
                  className="text-sm font-bold text-slate-600 hover:text-indigo-500 transition-colors"
                >
                  로그아웃
                </button>
              </form>
            </div>
          ) : (
            <form action={signInWithGoogle}>
              <button
                type="submit"
                className="inline-flex items-center justify-center px-5 py-2 rounded-xl bg-indigo-500 text-white text-sm font-bold hover:bg-indigo-600 transition-all active:scale-95 shadow-lg shadow-indigo-100"
              >
                Sign In
              </button>
            </form>
          )}
        </nav>
      </div>
    </header>
  );
};

export default MainHeader;
