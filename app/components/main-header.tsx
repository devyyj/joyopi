import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { signInWithGoogle } from '@/app/actions/auth';
import { Button } from './ui/core';
import UserProfileButton from './user-profile-button';
import LogoutButton from './logout-button';
import NavigationMenu from './navigation-menu';
import BrandLogo from './brand/brand-logo';

const MainHeader = async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-50 w-full bg-secondary border-b border-border">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" aria-label="조요피 홈" className="flex items-center transition-opacity hover:opacity-80 active:scale-95">
            <BrandLogo className="h-5 w-auto" />
          </Link>
          <div className="ml-2">
            <NavigationMenu />
          </div>
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
