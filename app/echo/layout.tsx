import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { isEchoAllowedEmail } from '@/utils/echo-access';

// 메뉴에는 없고 주소를 아는 허용 계정만 들어온다. 검색엔진에도 나오지 않게 한다.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// 메아리 전체(/echo, /echo/speaker, /echo/sender)의 접근을 서버에서 한 번에 검증한다
export default async function EchoLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!isEchoAllowedEmail(user?.email)) {
    redirect('/');
  }

  return children;
}
