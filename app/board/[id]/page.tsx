import MainHeader from '@/app/components/main-header';
import { db } from '@/db';
import { posts } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { deletePost } from '@/app/actions/board';
import Link from 'next/link';
import { buttonStyles } from '@/app/components/ui/core';

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const postId = parseInt(id, 10);
  
  if (isNaN(postId)) {
    notFound();
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

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const isAuthor = user?.id === post.authorId;
  const deleteAction = deletePost.bind(null, post.id);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <MainHeader />
      
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-16">
        <article className="space-y-12">
          <header className="space-y-8">
            <div className="flex items-center gap-3">
              <Link href="/board" className="text-xs font-bold uppercase tracking-widest text-indigo-500 hover:text-indigo-600 transition-colors">Free Board</Link>
              <span className="text-slate-200">/</span>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-300">Post #{post.id}</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
              {post.title}
            </h1>
            
            <div className="flex items-center justify-between py-6 border-y border-slate-200/50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-400 uppercase">
                  {post.authorName?.substring(0, 1)}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-900">{post.authorName}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{post.createdAt.toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </header>
          
          <div className="text-lg font-medium leading-relaxed text-slate-600 whitespace-pre-wrap min-h-[300px]">
            {post.content}
          </div>

          <footer className="mt-20 pt-10 border-t border-slate-200/50 flex flex-col md:flex-row items-center justify-between gap-8">
            <Link 
              href="/board" 
              className={`${buttonStyles.base} ${buttonStyles.variant.secondary} ${buttonStyles.size.md}`}
            >
              목록으로 돌아가기
            </Link>
            
            {isAuthor && (
              <div className="flex items-center gap-4">
                <Link 
                  href={`/board/${post.id}/edit`} 
                  className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-indigo-500 transition-colors"
                >
                  수정
                </Link>
                <form action={deleteAction}>
                  <button 
                    type="submit" 
                    className="text-xs font-bold uppercase tracking-widest text-slate-300 hover:text-red-500 transition-colors"
                  >
                    삭제
                  </button>
                </form>
              </div>
            )}
          </footer>
        </article>
      </main>
    </div>
  );
}
