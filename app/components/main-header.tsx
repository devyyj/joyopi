import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { signInWithGoogle } from '@/app/actions/auth';
import { Button } from './ui/core';
import UserProfileButton from './user-profile-button';
import LogoutButton from './logout-button';

const MainHeader = async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-50 w-full bg-secondary border-b border-border">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm font-semibold tracking-tight hover:text-primary transition-colors flex items-center gap-2">
            <span className="w-6 h-6 bg-foreground rounded-full" />
            <span className="hidden sm:inline">YOPI LAND</span>
          </Link>
          <nav className="flex items-center gap-4 ml-2">
            <Link href="/board" className="text-xs sm:text-sm font-medium text-muted hover:text-foreground">
              게시판
            </Link>
          </nav>
        </div>

        <nav className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <UserProfileButton />
              <LogoutButton />
            </div>
          ) : (
            <form action={signInWithGoogle}>
              <Button type="submit" variant="outline" size="sm">
                로그인
              </Button>
            </form>
          )}
        </nav>
      </div>
    </header>
  );
};

export default MainHeader;
