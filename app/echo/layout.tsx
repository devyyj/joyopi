import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { isEchoAllowedEmail } from '@/utils/echo-access';

// 메아리 전체(/echo, /echo/speaker, /echo/sender)의 접근을 서버에서 한 번에 검증한다
export default async function EchoLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!isEchoAllowedEmail(user?.email)) {
    redirect('/');
  }

  return children;
}
