import { db } from '@/db';
import { posts, comments, likes, profiles, commentLikes } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { SectionHeader, Button } from '@/app/components/ui/core';
import PostItem from './components/post-item';

export const revalidate = 0;

export default async function BoardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 모든 게시글 조회
  const allPosts = await db.select().from(posts).orderBy(desc(posts.createdAt));

  // 현재 사용자 프로필 (닉네임용)
  const currentUserProfile = user ? await db.query.profiles.findFirst({
    where: eq(profiles.id, user.id)
  }) : null;

  // 각 게시글별 상세 정보(좋아요, 댓글) 통합 로드
  const feedItems = await Promise.all(allPosts.map(async (post) => {
    const postLikes = await db.select().from(likes).where(eq(likes.postId, post.id));
    const postComments = await db.query.comments.findMany({
      where: eq(comments.postId, post.id),
      orderBy: [desc(comments.createdAt)]
    });

    // 댓글별 좋아요 정보 로드
    const commentsWithLikes = await Promise.all(postComments.map(async (comment) => {
      const cLikes = await db.select().from(commentLikes).where(eq(commentLikes.commentId, comment.id));
      return {
        ...comment,
        likeCount: cLikes.length,
        isLiked: user ? cLikes.some(cl => cl.userId === user.id) : false
      };
    }));
    
    return {
      ...post,
      comments: commentsWithLikes,
      likeCount: postLikes.length,
      isLiked: user ? postLikes.some(l => l.userId === user.id) : false,
      isAuthor: user?.id === post.authorId
    };
  }));

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex justify-between items-end mb-6 gap-4">
        <SectionHeader 
          title="자유게시판"
          description="자유롭게 소통하는 공간입니다."
          label="Feed"
        />
        <Link href="/board/write">
          <Button size="sm">글쓰기</Button>
        </Link>
      </div>

      <div className="space-y-6">
        {feedItems.length > 0 ? (
          feedItems.map((item) => (
            <PostItem 
              key={item.id} 
              item={item} 
              currentUserId={user?.id} 
              currentUserName={currentUserProfile?.nickname}
            />
          ))
        ) : (
          <div className="p-12 text-center border border-dashed border-border rounded-md">
            <p className="text-muted mb-4">아직 작성된 게시글이 없습니다.</p>
            <Link href="/board/write">
              <Button variant="outline">첫 번째 소식 전하기</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
