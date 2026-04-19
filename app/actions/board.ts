'use server';

import { createClient } from '@/utils/supabase/server';
import { db } from '@/db';
import { posts, comments, likes, profiles, commentLikes } from '@/db/schema';
import { revalidatePath } from 'next/cache';
import { eq, and, desc } from 'drizzle-orm';

// 공통 결과 타입
export type ActionResult<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
};

// 공통 인증 및 프로필 확인 헬퍼
async function getAuthUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

async function getUserProfile(userId: string) {
  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.id, userId)
  });
  return profile;
}

// --- 게시글 (Posts) ---

export async function createPost(formData: FormData): Promise<ActionResult<{ id: number }>> {
  try {
    const user = await getAuthUser();
    if (!user) return { success: false, message: '로그인이 필요합니다.' };

    const profile = await getUserProfile(user.id);
    if (!profile) return { success: false, message: '프로필을 찾을 수 없습니다.' };

    const title = (formData.get('title') as string)?.trim();
    const content = (formData.get('content') as string)?.trim();

    if (!title || !content) return { success: false, message: '제목과 내용을 입력해주세요.' };
    if (title.length > 50) return { success: false, message: '제목은 최대 50자까지 가능합니다.' };
    if (content.length > 5000) return { success: false, message: '내용은 최대 5,000자까지 가능합니다.' };

    const [newPost] = await db.insert(posts).values({
      title,
      content,
      authorId: user.id,
      authorName: profile.nickname,
    }).returning();

    // /board 페이지만 갱신하여 응답 속도 향상
    revalidatePath('/board');
    return { success: true, data: { id: newPost.id } };
  } catch (error) {
    console.error(error);
    return { success: false, message: '게시글 작성 중 오류가 발생했습니다.' };
  }
}

export async function updatePost(id: number, formData: FormData): Promise<ActionResult> {
  try {
    const user = await getAuthUser();
    if (!user) return { success: false, message: '로그인이 필요합니다.' };

    const title = (formData.get('title') as string)?.trim();
    const content = (formData.get('content') as string)?.trim();

    if (!title || !content) return { success: false, message: '제목과 내용을 입력해주세요.' };
    if (title.length > 50) return { success: false, message: '제목은 최대 50자까지 가능합니다.' };
    if (content.length > 5000) return { success: false, message: '내용은 최대 5,000자까지 가능합니다.' };

    const existing = await db.query.posts.findFirst({ where: eq(posts.id, id) });
    if (!existing || existing.authorId !== user.id) return { success: false, message: '수정 권한이 없습니다.' };

    await db.update(posts)
      .set({ title, content, updatedAt: new Date() })
      .where(and(eq(posts.id, id), eq(posts.authorId, user.id)));

    revalidatePath('/board');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, message: '수정 중 오류가 발생했습니다.' };
  }
}

export async function deletePost(id: number): Promise<ActionResult> {
  try {
    const user = await getAuthUser();
    if (!user) return { success: false, message: '로그인이 필요합니다.' };

    const existing = await db.query.posts.findFirst({ where: eq(posts.id, id) });
    if (!existing || existing.authorId !== user.id) return { success: false, message: '삭제 권한이 없습니다.' };

    await db.delete(posts).where(and(eq(posts.id, id), eq(posts.authorId, user.id)));
    
    revalidatePath('/board');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, message: '삭제 중 오류가 발생했습니다.' };
  }
}

// --- 댓글 (Comments) ---

export async function createComment(postId: number, content: string): Promise<ActionResult> {
  try {
    const user = await getAuthUser();
    if (!user) return { success: false, message: '로그인이 필요합니다.' };

    const profile = await getUserProfile(user.id);
    if (!profile) return { success: false, message: '프로필을 찾을 수 없습니다.' };

    const trimmedContent = content.trim();
    if (!trimmedContent) return { success: false, message: '댓글 내용을 입력해주세요.' };
    if (trimmedContent.length > 200) return { success: false, message: '댓글은 최대 200자까지 가능합니다.' };
    if (trimmedContent.includes('\n') || trimmedContent.includes('\r')) {
      return { success: false, message: '댓글은 한 줄로만 작성 가능합니다.' };
    }

    await db.insert(comments).values({
      postId,
      authorId: user.id,
      authorName: profile.nickname,
      content: trimmedContent,
    });

    // 특정 경로만 타겟팅하여 재검증 속도 향상
    revalidatePath('/board');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, message: '댓글 작성 중 오류가 발생했습니다.' };
  }
}

export async function deleteComment(commentId: number): Promise<ActionResult> {
  try {
    const user = await getAuthUser();
    if (!user) return { success: false, message: '로그인이 필요합니다.' };

    const existing = await db.query.comments.findFirst({ where: eq(comments.id, commentId) });
    if (!existing || existing.authorId !== user.id) return { success: false, message: '권한이 없습니다.' };

    await db.delete(comments).where(and(eq(comments.id, commentId), eq(comments.authorId, user.id)));

    revalidatePath('/board');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, message: '삭제 중 오류가 발생했습니다.' };
  }
}

export async function updateComment(commentId: number, content: string): Promise<ActionResult> {
  try {
    const user = await getAuthUser();
    if (!user) return { success: false, message: '로그인이 필요합니다.' };

    const trimmedContent = content.trim();
    if (!trimmedContent) return { success: false, message: '내용을 입력해주세요.' };
    if (trimmedContent.length > 200) return { success: false, message: '댓글은 최대 200자까지 가능합니다.' };

    const existing = await db.query.comments.findFirst({ where: eq(comments.id, commentId) });
    if (!existing || existing.authorId !== user.id) return { success: false, message: '권한이 없습니다.' };

    await db.update(comments)
      .set({ content: trimmedContent })
      .where(and(eq(comments.id, commentId), eq(comments.authorId, user.id)));

    revalidatePath('/board');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, message: '수정 중 오류가 발생했습니다.' };
  }
}

// --- 좋아요 (Likes) ---

export async function toggleLike(postId: number): Promise<ActionResult> {
  try {
    const user = await getAuthUser();
    if (!user) return { success: false, message: '로그인이 필요합니다.' };

    const existing = await db.query.likes.findFirst({
      where: and(eq(likes.postId, postId), eq(likes.userId, user.id))
    });

    if (existing) {
      await db.delete(likes).where(and(eq(likes.postId, postId), eq(likes.userId, user.id)));
    } else {
      await db.insert(likes).values({ postId, userId: user.id });
    }

    revalidatePath('/board');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, message: '오류가 발생했습니다.' };
  }
}

export async function toggleCommentLike(commentId: number): Promise<ActionResult> {
  try {
    const user = await getAuthUser();
    if (!user) return { success: false, message: '로그인이 필요합니다.' };

    const existing = await db.query.commentLikes.findFirst({
      where: and(eq(commentLikes.commentId, commentId), eq(commentLikes.userId, user.id))
    });

    if (existing) {
      await db.delete(commentLikes).where(and(eq(commentLikes.commentId, commentId), eq(commentLikes.userId, user.id)));
    } else {
      await db.insert(commentLikes).values({ commentId, userId: user.id });
    }

    revalidatePath('/board');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, message: '오류가 발생했습니다.' };
  }
}

export async function getPostDetail(postId: number) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const post = await db.query.posts.findFirst({
      where: eq(posts.id, postId),
    });

    if (!post) return null;

    // 쿼리 병렬 처리로 DB 왕복 횟수 감소
    const [postLikes, postComments] = await Promise.all([
      db.select().from(likes).where(eq(likes.postId, postId)),
      db.query.comments.findMany({
        where: eq(comments.postId, postId),
        orderBy: [desc(comments.createdAt)],
      })
    ]);

    const commentsWithLikes = await Promise.all(postComments.map(async (comment) => {
      const cLikes = await db.select().from(commentLikes).where(eq(commentLikes.commentId, comment.id));
      return {
        ...comment,
        likeCount: cLikes.length,
        isLiked: user ? cLikes.some(cl => cl.userId === user.id) : false,
      };
    }));

    return {
      ...post,
      comments: commentsWithLikes,
      likeCount: postLikes.length,
      isLiked: user ? postLikes.some(l => l.userId === user.id) : false,
      isAuthor: user?.id === post.authorId,
    };
  } catch (error) {
    console.error(error);
    return null;
  }
}
