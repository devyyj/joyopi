import { db } from '@/db';
import { posts, profiles } from '@/db/schema';
import { desc, eq, gt } from 'drizzle-orm';
import Link from 'next/link';
import { Button, Card } from '@/app/components/ui';
import DashboardList from '@/app/components/dashboard-list';
import { createClient } from '@/utils/supabase/server';
import { getMeals, getMealStats } from '@/app/actions/meals';

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

  // 돼지 일기 퀵 정보 획득 (오늘 날짜 및 최근 7일 캐릭터)
  let todayMealsCount = 0;
  let piggyCharacter = null;

  if (user) {
    try {
      const d = new Date();
      // KST(UTC+9) 날짜 구하기
      const offset = d.getTimezoneOffset() * 60000;
      const todayStr = new Date(d.getTime() - offset).toISOString().split('T')[0];
      
      const mealsTodayResult = await getMeals({
        from: todayStr,
        to: todayStr,
        limit: 50,
      });
      todayMealsCount = mealsTodayResult.meals.length;

      const fromDate = new Date(d.getTime() - offset);
      fromDate.setDate(fromDate.getDate() - 6);
      const fromStr = fromDate.toISOString().split('T')[0];

      const stats = await getMealStats(fromStr, todayStr);
      if (stats && stats.count > 0) {
        piggyCharacter = stats.character;
      }
    } catch (err) {
      console.error('Failed to load dashboard meals data:', err);
    }
  }

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
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-10 space-y-12">
      {/* 🐖 돼지 일기 퀵 인사이트 카드 배너 */}
      <Card className="p-6 bg-gradient-to-r from-orange-950/20 via-background to-secondary/15 border border-primary/20 rounded-xl relative overflow-hidden group">
        {/* 아우라 효과 */}
        <div className="absolute right-6 bottom-[-20px] text-8xl opacity-15 pointer-events-none select-none group-hover:scale-110 transition-transform duration-500">
          🐖
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-[10px] font-bold">
              <span>NEW</span> 웰니스 마이크로 서비스
            </div>
            <h3 className="text-lg md:text-xl font-bold tracking-tight text-foreground">
              오늘 먹은 끼니와 기분을 분석하는 <span className="text-primary font-extrabold">돼지 일기</span>
            </h3>
            
            {user ? (
              <div className="text-xs text-muted-foreground font-semibold space-y-1">
                <p>
                  오늘의 식사 기록: <span className="text-foreground font-bold">{todayMealsCount}회</span>
                </p>
                {piggyCharacter ? (
                  <p>
                    최근 7일 나의 먹방 성향: <span className="text-primary font-bold">✨ {piggyCharacter.type}</span>
                  </p>
                ) : (
                  <p className="text-[11px] italic">
                    ※ 7일 이내에 식사 일지를 작성하면 맛있는 성향 캐릭터 분석 카드가 나타납니다!
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground font-medium max-w-xl">
                내가 매일 먹은 식사와 기분, 만족도를 간편히 기록해 귀여운 성향 캐릭터를 만나보세요. 
                로그인 후 지금 즉시 시작할 수 있습니다.
              </p>
            )}
          </div>

          <Link href="/meals" className="shrink-0 w-full md:w-auto">
            <Button variant="primary" size="md" className="w-full md:w-auto font-bold flex items-center justify-center gap-1.5">
              {user ? '나의 식사 일기장 가기' : '돼지 일기 시작하기'}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Button>
          </Link>
        </div>
      </Card>

      {/* 3단 대시보드 */}
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

      <div className="flex justify-center">
        <Link href="/board">
          <Button variant="outline" className="px-8 py-2 rounded-full text-xs font-bold gap-2">
            전체 피드 둘러보기
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Button>
        </Link>
      </div>

      <div className="pt-6 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-muted-foreground">
        <p className="text-[10px]">
          &copy; {new Date().getFullYear()} <strong>YOPI LAB</strong>. Built with Next.js 15.
        </p>
      </div>
    </div>
  );
}

