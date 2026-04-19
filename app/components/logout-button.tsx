'use client';

import { signOut } from '@/app/actions/auth';
import { useTransition } from 'react';

const LogoutButton = () => {
  const [isPending, startTransition] = useTransition();

  const handleLogout = async () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      startTransition(async () => {
        await signOut();
      });
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isPending}
      className="text-xs font-medium text-muted hover:text-foreground transition-colors cursor-pointer disabled:opacity-50"
    >
      {isPending ? '로그아웃 중...' : '로그아웃'}
    </button>
  );
};

export default LogoutButton;
