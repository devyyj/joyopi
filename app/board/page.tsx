import { eq } from 'drizzle-orm';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { db } from '@/db';
import { profiles } from '@/db/schema';
import { Button } from '@/app/components/ui/core';
import { getPaginatedPosts } from '@/app/actions/board';
import PostList from './components/post-list';

export const revalidate = 0;

export default async function BoardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 초기 10개의 게시글과 사용자 프로필을 병렬로 조회
  const [initialPosts, currentUserProfile] = await Promise.all([
    getPaginatedPosts(0, 10),
    user ? db.query.profiles.findFirst({
      where: eq(profiles.id, user.id)
    }) : Promise.resolve(null)
  ]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 relative min-h-[calc(100vh-10rem)]">
      {initialPosts.length > 0 ? (
        <PostList 
          initialPosts={initialPosts} 
          currentUserId={user?.id} 
          currentUserName={currentUserProfile?.nickname}
        />
      ) : (
        <div className="p-20 text-center border border-dashed border-border rounded-xl bg-secondary/5">
          <p className="text-muted text-sm mb-6 font-medium">아직 작성된 게시글이 없습니다.</p>
          {user ? (
            <Link href="/board/write">
              <Button variant="outline" className="rounded-full px-6">첫 번째 소식 전하기</Button>
            </Link>
          ) : (
            <p className="text-xs text-muted-foreground/60">로그인하여 첫 번째 소식을 전해보세요!</p>
          )}
        </div>
      )}

      {/* Floating Action Button */}
      {user && (
        <Link 
          href="/board/write" 
          className="fixed bottom-8 right-8 z-50 flex items-center justify-center w-14 h-14 bg-[#e2ff00] text-[#1f2328] rounded-full shadow-[0_8px_30px_rgb(226,255,0,0.3)] hover:shadow-[0_8px_30px_rgb(226,255,0,0.5)] hover:scale-110 active:scale-95 transition-all duration-200 group"
          aria-label="글쓰기"
        >
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M12 20h9"></path>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
          </svg>
          
          <span className="absolute right-16 bg-[#1f2328] text-[#e2ff00] text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-md">
            소식 전하기
          </span>
        </Link>
      )}
    </div>
  );
}
