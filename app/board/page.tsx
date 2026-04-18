import MainHeader from '@/app/components/main-header';
import Link from 'next/link';
import { db } from '@/db';
import { posts } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { createClient } from '@/utils/supabase/server';
import { SectionHeader, buttonStyles } from '@/app/components/ui/core';

export const revalidate = 0;

export default async function BoardPage() {
  let allPosts: typeof posts.$inferSelect[] = [];
  try {
    allPosts = await db.select().from(posts).orderBy(desc(posts.createdAt));
  } catch (error) {
    console.error("DB 연결 오류:", error);
  }
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col min-h-screen bg-background selection:bg-indigo-50">
      <MainHeader />
      
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-16">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <SectionHeader 
            label="Community"
            title="자유게시판"
            description="가벼운 인사부터 진지한 고민까지, 자유롭게 이야기를 나누는 공간입니다."
          />
          
          <div className="flex-shrink-0">
            {user ? (
              <Link 
                href="/board/write" 
                className={`${buttonStyles.base} ${buttonStyles.variant.primary} ${buttonStyles.size.md}`}
              >
                새 글 쓰기
              </Link>
            ) : (
              <div className="text-xs font-bold uppercase tracking-widest text-slate-400 bg-slate-100/50 px-6 py-4 rounded-xl">
                로그인 후 작성 가능
              </div>
            )}
          </div>
        </header>

        {/* 게시글 목록 */}
        <div className="space-y-4">
          {allPosts.length > 0 ? (
            <ul className="grid grid-cols-1 gap-4">
              {allPosts.map((post) => (
                <li key={post.id}>
                  <Link 
                    href={`/board/${post.id}`} 
                    className="flex flex-col md:flex-row md:items-center justify-between p-8 rounded-2xl bg-card border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 group"
                  >
                    <div className="space-y-3">
                      <h3 className="text-xl font-bold tracking-tight group-hover:text-indigo-600 transition-colors text-slate-900">
                        {post.title}
                      </h3>
                      <div className="flex items-center gap-4 text-xs font-bold text-slate-300 uppercase tracking-widest">
                        <span className="text-slate-400">{post.authorName}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                        <span>{post.createdAt.toLocaleDateString('ko-KR')}</span>
                      </div>
                    </div>
                    
                    <div className="mt-6 md:mt-0 flex items-center gap-2 text-indigo-400 opacity-0 group-hover:opacity-100 transition-all">
                      <span className="text-xs font-bold uppercase tracking-widest">읽어보기</span>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-32 text-center rounded-2xl border-2 border-dashed border-slate-100">
              <span className="text-4xl mb-4 block">💬</span>
              <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">첫 번째 대화를 시작해보세요.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
