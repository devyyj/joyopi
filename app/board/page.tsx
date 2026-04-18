import MainHeader from '@/app/components/main-header';
import Link from 'next/link';
import { db } from '@/db';
import { posts } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { createClient } from '@/utils/supabase/server';

export const revalidate = 0; // 항상 최신 데이터 로드

export default async function BoardPage() {
  // DB에서 게시글 목록을 최신순으로 가져옵니다.
  // DB 연결이 안 된 초기 상태일 경우 오류 방지를 위해 try-catch 처리
  let allPosts: typeof posts.$inferSelect[] = [];
  try {
    allPosts = await db.select().from(posts).orderBy(desc(posts.createdAt));
  } catch (error) {
    console.error("DB 연결 오류:", error);
  }
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col min-h-screen bg-[#F4F6FF]">
      <MainHeader />
      
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-[#1E1B4B]">자유게시판</h2>
            <p className="text-slate-400 font-medium">실험실의 첫 번째 소통 공간입니다.</p>
          </div>
          
          {user ? (
            <Link href="/board/write" className="px-6 py-2.5 rounded-2xl bg-[#4F46E5] text-white font-bold hover:shadow-lg hover:shadow-indigo-100 transition-all active:scale-95">
              글쓰기
            </Link>
          ) : (
            <div className="text-sm font-bold text-slate-400 bg-slate-100 px-4 py-2 rounded-xl">
              글쓰기는 로그인 후 가능합니다
            </div>
          )}
        </div>

        {/* 게시글 목록 */}
        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
          {allPosts.length > 0 ? (
            <ul className="divide-y divide-slate-50">
              {allPosts.map((post) => (
                <li key={post.id}>
                  <Link href={`/board/${post.id}`} className="block p-6 hover:bg-slate-50/50 transition-colors group">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold group-hover:text-[#4F46E5] transition-colors text-[#1E1B4B]">
                        {post.title}
                      </h3>
                      <span className="text-sm text-slate-300 font-medium">
                        {post.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 mt-1 font-medium">{post.authorName}</p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-20 text-center flex flex-col items-center">
              <span className="text-4xl mb-4">📭</span>
              <p className="text-slate-400 font-bold">아직 게시글이 없습니다.</p>
              <p className="text-sm text-slate-300 mt-2">첫 번째 글의 주인공이 되어보세요!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
