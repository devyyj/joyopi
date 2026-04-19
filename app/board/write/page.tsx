import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { SectionHeader } from '@/app/components/ui/core';
import PostForm from '../components/post-form';

export default async function WritePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/board');
  }

  const userInitial = user.user_metadata?.full_name?.[0] || user.email?.[0] || '?';

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <header className="mb-8">
        <SectionHeader 
          label="Community"
          title="새로운 소식 전하기"
          description="지금 생각하고 있는 것을 공유해 보세요."
        />
      </header>

      <PostForm userInitial={userInitial} />
    </div>
  );
}
