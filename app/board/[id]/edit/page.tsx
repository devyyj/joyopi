import MainHeader from '@/app/components/main-header';
import { updatePost } from '@/app/actions/board';
import { createClient } from '@/utils/supabase/server';
import { db } from '@/db';
import { posts } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { SectionHeader, buttonStyles } from '@/app/components/ui/core';

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const postId = parseInt(id, 10);
  
  if (isNaN(postId)) {
    notFound();
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/board');
  }

  let postList: typeof posts.$inferSelect[] = [];
  try {
    postList = await db.select().from(posts).where(eq(posts.id, postId));
  } catch(e) {
    console.error("DB 연결 오류", e);
  }

  const post = postList[0];

  if (!post) {
    notFound();
  }

  if (post.authorId !== user.id) {
    redirect(`/board/${postId}`);
  }

  const updateAction = updatePost.bind(null, post.id);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <MainHeader />
      
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-16">
        <header className="mb-12">
          <SectionHeader 
            label="Edit"
            title="기록 수정하기"
            description="내용을 정성스럽게 고쳐볼까요?"
          />
        </header>

        <form action={updateAction} className="space-y-8">
          <div className="space-y-3">
            <label htmlFor="title" className="text-xs font-bold uppercase tracking-widest text-slate-400 block ml-1">제목</label>
            <input 
              type="text" 
              name="title" 
              id="title"
              required 
              defaultValue={post.title}
              className="w-full bg-card border border-slate-200 rounded-2xl px-6 py-4 text-xl font-bold tracking-tight focus:outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/5 transition-all placeholder:text-slate-200" 
              placeholder="제목을 입력하세요"
            />
          </div>

          <div className="space-y-3">
            <label htmlFor="content" className="text-xs font-bold uppercase tracking-widest text-slate-400 block ml-1">내용</label>
            <textarea 
              name="content" 
              id="content"
              required 
              rows={10}
              defaultValue={post.content}
              className="w-full bg-card border border-slate-200 rounded-2xl p-6 text-base font-medium leading-relaxed focus:outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/5 transition-all resize-none placeholder:text-slate-200" 
              placeholder="자유롭게 글을 작성해보세요"
            />
          </div>

          <div className="flex justify-between items-center pt-8">
            <Link href={`/board/${post.id}`} className="text-xs font-bold uppercase tracking-widest text-slate-300 hover:text-slate-900 transition-colors">
              취소하고 돌아가기
            </Link>
            <button 
              type="submit" 
              className={`${buttonStyles.base} ${buttonStyles.variant.primary} ${buttonStyles.size.lg}`}
            >
              수정 완료
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
