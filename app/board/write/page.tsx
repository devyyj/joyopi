import MainHeader from '@/app/components/main-header';
import { createPost } from '@/app/actions/board';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { SectionHeader, buttonStyles } from '@/app/components/ui/core';

export default async function WritePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/board');
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <MainHeader />
      
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-16">
        <header className="mb-12">
          <SectionHeader 
            label="Write"
            title="이야기 남기기"
            description="들려주고 싶은 이야기가 있나요? 무엇이든 좋습니다."
          />
        </header>

        <form action={createPost} className="space-y-8">
          <div className="space-y-3">
            <label htmlFor="title" className="text-xs font-bold uppercase tracking-widest text-slate-400 block ml-1">제목</label>
            <input 
              type="text" 
              name="title" 
              id="title"
              required 
              className="w-full bg-card border border-slate-200 rounded-2xl px-6 py-4 text-xl font-bold tracking-tight focus:outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/5 transition-all placeholder:text-slate-200" 
              placeholder="멋진 제목을 지어주세요"
            />
          </div>

          <div className="space-y-3">
            <label htmlFor="content" className="text-xs font-bold uppercase tracking-widest text-slate-400 block ml-1">내용</label>
            <textarea 
              name="content" 
              id="content"
              required 
              rows={10}
              className="w-full bg-card border border-slate-200 rounded-2xl p-6 text-base font-medium leading-relaxed focus:outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/5 transition-all resize-none placeholder:text-slate-200" 
              placeholder="여기에 내용을 작성해보세요."
            />
          </div>

          <div className="flex justify-between items-center pt-8">
            <Link href="/board" className="text-xs font-bold uppercase tracking-widest text-slate-300 hover:text-slate-900 transition-colors">
              돌아가기
            </Link>
            <button 
              type="submit" 
              className={`${buttonStyles.base} ${buttonStyles.variant.primary} ${buttonStyles.size.lg}`}
            >
              등록하기
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
