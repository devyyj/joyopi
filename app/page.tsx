import { db } from '@/db';
import { posts, profiles } from '@/db/schema';
import { desc, eq, gt } from 'drizzle-orm';
import Link from 'next/link';
import { Button } from '@/app/components/ui/core';
import DashboardList from '@/app/components/dashboard-list';
import { createClient } from '@/utils/supabase/server';

interface PostWithCounts {
  id: number;
  title: string;
  authorName: string;
  createdAt: Date;
  likes: { id: number }[];
  comments: { id: number }[];
}

export const revalidate = 60; // 1분마다 캐시 갱신

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 현재 사용자 프로필 (닉네임용)
  const profile = user ? await db.query.profiles.findFirst({
    where: eq(profiles.id, user.id)
  }) : null;

  // '최근' 기준: 최근 30일
  const recentThreshold = new Date();
  recentThreshold.setDate(recentThreshold.getDate() - 30);

  // 1. 최신 소식 (Recent Posts) - 좋아요/댓글 포함
  const recentPostsRaw = await db.query.posts.findMany({
    orderBy: [desc(posts.createdAt)],
    limit: 5,
    with: {
      likes: true,
      comments: true,
    }
  }) as unknown as PostWithCounts[];

  // 2. 인기 게시글 (Top Liked - 최근 30일 게시글 중)
  const topLikedPostsRaw = await db.query.posts.findMany({
    where: gt(posts.createdAt, recentThreshold),
    with: {
      likes: true,
      comments: true,
    },
    limit: 10, // 충분히 가져온 후 메모리에서 정렬 (인기 게시글 계산용)
  }) as unknown as PostWithCounts[];

  // 데이터 가공 헬퍼
  const formatItems = (items: PostWithCounts[]) => items.map(post => ({
    id: post.id,
    title: post.title,
    authorName: post.authorName,
    createdAt: post.createdAt,
    likeCount: post.likes?.length || 0,
    commentCount: post.comments?.length || 0,
  }));

  const recentPosts = formatItems(recentPostsRaw);

  const topLikedPosts = formatItems(topLikedPostsRaw)
    .sort((a, b) => b.likeCount - a.likeCount || b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);

  const topCommentedPosts = formatItems(topLikedPostsRaw) // 같은 범위 데이터 재사용
    .sort((a, b) => b.commentCount - a.commentCount || b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
        <DashboardList 
          title="최근 소식" 
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500">
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
              <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
            </svg>
          } 
          items={recentPosts} 
          type="recent" 
          currentUserId={user?.id}
          currentUserName={profile?.nickname}
        />
        <DashboardList 
          title="인기 게시글" 
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500">
              <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
            </svg>
          } 
          items={topLikedPosts} 
          type="like" 
          currentUserId={user?.id}
          currentUserName={profile?.nickname}
        />
        <DashboardList 
          title="활발한 논의" 
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-500">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          } 
          items={topCommentedPosts} 
          type="comment" 
          currentUserId={user?.id}
          currentUserName={profile?.nickname}
        />
      </div>

      <div className="mt-12 flex justify-center">
        <Link href="/board">
          <Button variant="outline" className="px-8 py-2 rounded-full text-xs font-bold gap-2">
            전체 피드 둘러보기
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Button>
        </Link>
      </div>

      <div className="mt-20 pt-6 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-muted-foreground">
        <p className="text-[10px]">
          &copy; {new Date().getFullYear()} <strong>YOPI LAND</strong>. Built with Next.js 15.
        </p>
      </div>
    </div>
  );
}
