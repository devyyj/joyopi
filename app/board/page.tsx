import Link from 'next/link';
import { db } from '@/db';
import { posts } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { createClient } from '@/utils/supabase/server';
import { SectionHeader, Card } from '@/app/components/ui/core';
import { deletePost } from '@/app/actions/board';

export const revalidate = 0;

export default async function BoardPage() {
  let allPosts: typeof posts.$inferSelect[] = [];
  try {
    allPosts = await db.select().from(posts).orderBy(desc(posts.createdAt));
  } catch (error) {
    console.error("DB connection error:", error);
  }
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <header className="mb-8">
        <SectionHeader 
          label="Community"
          title="자유게시판"
          description="무슨 일이 일어나고 있나요? 자유롭게 이야기를 나누세요."
        />
      </header>

      {/* Write Action (Twitter style prompt) */}
      <Card className="mb-6 p-4">
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center text-xs font-bold text-muted uppercase shrink-0">
            {user ? (user.user_metadata?.full_name?.[0] || user.email?.[0] || 'U') : '?'}
          </div>
          <div className="flex-1">
            {user ? (
              <Link href="/board/write">
                <div className="w-full bg-secondary/50 border border-border rounded-md px-4 py-2 text-muted text-sm hover:bg-secondary transition-colors cursor-pointer">
                  새로운 이야기를 들려주세요...
                </div>
              </Link>
            ) : (
              <div className="text-sm text-muted py-2">
                로그인 후 이야기를 공유할 수 있습니다.
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Feed List */}
      <div className="space-y-4">
        {allPosts.length > 0 ? (
          allPosts.map((post) => {
            const isAuthor = user?.id === post.authorId;
            const deleteAction = deletePost.bind(null, post.id);

            return (
              <Card key={post.id} className="p-0 overflow-hidden hover:border-border/80 transition-colors">
                {/* Post Header */}
                <div className="px-4 py-3 border-b border-border bg-secondary/30 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center text-[10px] font-bold text-muted uppercase">
                      {post.authorName?.substring(0, 1)}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-foreground">{post.authorName}</span>
                      <span className="text-[10px] text-muted">{post.createdAt.toLocaleDateString()}</span>
                    </div>
                  </div>
                  {isAuthor && (
                    <div className="flex gap-2">
                      <Link href={`/board/${post.id}/edit`}>
                        <span className="text-xs text-muted hover:text-primary cursor-pointer">수정</span>
                      </Link>
                      <form action={deleteAction}>
                        <button type="submit" className="text-xs text-muted hover:text-red-500 cursor-pointer">
                          삭제
                        </button>
                      </form>
                    </div>
                  )}
                </div>

                {/* Post Content */}
                <div className="p-4">
                  {post.title && (
                    <h3 className="text-base font-bold text-foreground mb-2">{post.title}</h3>
                  )}
                  <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap font-sans">
                    {post.content}
                  </div>
                </div>

                {/* Post Footer (Interactions Placeholder) */}
                <div className="px-4 py-2 border-t border-border flex gap-6">
                  <button className="flex items-center gap-1.5 text-muted hover:text-primary transition-colors cursor-pointer group">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:fill-primary/10">
                      <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/>
                    </svg>
                    <span className="text-xs font-medium">답글</span>
                  </button>
                  <button className="flex items-center gap-1.5 text-muted hover:text-red-500 transition-colors cursor-pointer group">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:fill-red-500/10">
                      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                    </svg>
                    <span className="text-xs font-medium">좋아요</span>
                  </button>
                </div>
              </Card>
            );
          })
        ) : (
          <div className="py-24 text-center border border-dashed border-border rounded-md">
            <span className="text-3xl mb-4 block">💬</span>
            <p className="text-sm text-muted font-medium">아직 게시글이 없습니다. 첫 번째 소식을 전해보세요!</p>
          </div>
        )}
      </div>
    </div>
  );
}
