import MainHeader from '@/app/components/main-header';
import { db } from '@/db';
import { posts } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { deletePost } from '@/app/actions/board';
import Link from 'next/link';

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const postId = parseInt(id, 10);
  
  if (isNaN(postId)) {
    notFound();
  }

  // DB에서 게시글 조회
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

  // 현재 로그인한 사용자가 글 작성자인지 확인
  const isAuthor = user?.id === post.authorId;
  const deleteAction = deletePost.bind(null, post.id);

  return (
    <div className="flex flex-col min-h-screen bg-[#F4F6FF]">
      <MainHeader />
      
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-12">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="border-b border-slate-100 pb-6 mb-6">
            <h1 className="text-3xl font-black tracking-tight mb-4 text-[#1E1B4B]">{post.title}</h1>
            <div className="flex items-center justify-between text-sm font-medium text-slate-400">
              <span className="text-slate-600 font-bold">{post.authorName}</span>
              <span>{post.createdAt.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="prose max-w-none text-[#1E1B4B] font-medium leading-relaxed whitespace-pre-wrap min-h-[200px]">
            {post.content}
          </div>

          <div className="mt-12 flex items-center justify-between border-t border-slate-100 pt-6">
            <Link href="/board" className="px-6 py-2.5 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
              목록으로
            </Link>
            
            {isAuthor && (
              <div className="flex items-center gap-2">
                <Link href={`/board/${post.id}/edit`} className="px-6 py-2.5 rounded-xl font-bold text-[#4F46E5] hover:bg-indigo-50 transition-colors">
                  수정하기
                </Link>
                <form action={deleteAction}>
                  <button type="submit" className="px-6 py-2.5 rounded-xl font-bold text-red-500 hover:bg-red-50 transition-colors">
                    삭제하기
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
