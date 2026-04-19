import { db } from '@/db';
import { posts, likes, comments, profiles } from '@/db/schema';
import { desc, eq, sql, gt } from 'drizzle-orm';
import Link from 'next/link';
import { SectionHeader, Button } from '@/app/components/ui/core';
import DashboardList from '@/app/components/dashboard-list';
import { createClient } from '@/utils/supabase/server';

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

  // 1. 최신 소식 (Recent Posts)
  const recentPosts = await db.query.posts.findMany({
    orderBy: [desc(posts.createdAt)],
    limit: 5,
  });

  // 2. 인기 게시글 (Top Liked - 최근 30일 게시글 중)
  const topLikedPosts = await db
    .select({
      id: posts.id,
      title: posts.title,
      authorName: posts.authorName,
      createdAt: posts.createdAt,
      count: sql<number>`count(${likes.id})`.mapWith(Number),
    })
    .from(posts)
    .leftJoin(likes, eq(posts.id, likes.postId))
    .where(gt(posts.createdAt, recentThreshold))
    .groupBy(posts.id)
    .orderBy(desc(sql`count(${likes.id})`), desc(posts.createdAt))
    .limit(5);

  // 3. 활발한 논의 (Most Commented - 최근 30일 게시글 중)
  const topCommentedPosts = await db
    .select({
      id: posts.id,
      title: posts.title,
      authorName: posts.authorName,
      createdAt: posts.createdAt,
      count: sql<number>`count(${comments.id})`.mapWith(Number),
    })
    .from(posts)
    .leftJoin(comments, eq(posts.id, comments.postId))
    .where(gt(posts.createdAt, recentThreshold))
    .groupBy(posts.id)
    .orderBy(desc(sql`count(${comments.id})`), desc(posts.createdAt))
    .limit(5);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-10">
      <div className="mb-10">
        <SectionHeader 
          title="YOPI LAND"
          description="최신 기술 실험과 소통이 함께하는 개인 개발 실험실입니다."
          label="Dashboard"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
        <DashboardList 
          title="최근 소식" 
          icon="🆕" 
          items={recentPosts} 
          type="recent" 
          currentUserId={user?.id}
          currentUserName={profile?.nickname}
        />
        <DashboardList 
          title="인기 게시글" 
          icon="🔥" 
          items={topLikedPosts} 
          type="like" 
          currentUserId={user?.id}
          currentUserName={profile?.nickname}
        />
        <DashboardList 
          title="활발한 논의" 
          icon="💬" 
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
