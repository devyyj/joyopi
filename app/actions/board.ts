'use server';

import { createClient } from '@/utils/supabase/server';
import { db } from '@/db';
import { posts, comments, likes, profiles, commentLikes } from '@/db/schema';
import { revalidatePath } from 'next/cache';
import { eq, and, desc } from 'drizzle-orm';

// 공통 인증 및 프로필 확인 헬퍼
async function getAuthUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('로그인이 필요합니다.');
  return user;
}

async function getUserProfile(userId: string) {
  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.id, userId)
  });
  if (!profile) throw new Error('프로필을 찾을 수 없습니다.');
  return profile;
}

// --- 게시글 (Posts) ---

export async function createPost(formData: FormData) {
  const user = await getAuthUser();
  const profile = await getUserProfile(user.id);

  const title = (formData.get('title') as string)?.trim();
  const content = (formData.get('content') as string)?.trim();

  if (!title || !content) throw new Error('제목과 내용을 입력해주세요.');
  if (title.length > 50) throw new Error('제목은 최대 50자까지 가능합니다.');
  if (content.length > 5000) throw new Error('내용은 최대 5,000자까지 가능합니다.');

  const [newPost] = await db.insert(posts).values({
    title,
    content,
    authorId: user.id,
    authorName: profile.nickname,
  }).returning();

  revalidatePath('/board');
  revalidatePath('/');
  return { id: newPost.id };
}

export async function updatePost(id: number, formData: FormData) {
  const user = await getAuthUser();
  const title = (formData.get('title') as string)?.trim();
  const content = (formData.get('content') as string)?.trim();

  if (!title || !content) throw new Error('제목과 내용을 입력해주세요.');
  if (title.length > 50) throw new Error('제목은 최대 50자까지 가능합니다.');
  if (content.length > 5000) throw new Error('내용은 최대 5,000자까지 가능합니다.');

  // 소유권 검증
  const existing = await db.query.posts.findFirst({ where: eq(posts.id, id) });
  if (!existing || existing.authorId !== user.id) throw new Error('수정 권한이 없습니다.');

  await db.update(posts)
    .set({ title, content, updatedAt: new Date() })
    .where(and(eq(posts.id, id), eq(posts.authorId, user.id)));

  revalidatePath(`/board/${id}`);
  revalidatePath('/board');
}

export async function deletePost(id: number) {
  const user = await getAuthUser();

  // 소유권 검증
  const existing = await db.query.posts.findFirst({ where: eq(posts.id, id) });
  if (!existing || existing.authorId !== user.id) throw new Error('삭제 권한이 없습니다.');

  await db.delete(posts).where(and(eq(posts.id, id), eq(posts.authorId, user.id)));
  
  revalidatePath('/board');
  revalidatePath('/');
}

// --- 댓글 (Comments) ---

export async function createComment(postId: number, content: string) {
  const user = await getAuthUser();
  const profile = await getUserProfile(user.id);

  const trimmedContent = content.trim();
  if (!trimmedContent) throw new Error('댓글 내용을 입력해주세요.');
  if (trimmedContent.length > 200) throw new Error('댓글은 최대 200자까지 작성 가능합니다.');
  if (trimmedContent.includes('\n') || trimmedContent.includes('\r')) {
    throw new Error('댓글은 한 줄로만 작성 가능합니다.');
  }

  const [newComment] = await db.insert(comments).values({
    postId,
    authorId: user.id,
    authorName: profile.nickname,
    content: trimmedContent,
  }).returning();

  revalidatePath(`/board/${postId}`);
  return newComment;
}

export async function deleteComment(commentId: number, _postId: number) {
  const user = await getAuthUser();

  // 소유권 검증
  const existing = await db.query.comments.findFirst({ where: eq(comments.id, commentId) });
  if (!existing || existing.authorId !== user.id) throw new Error('댓글 삭제 권한이 없습니다.');

  await db.delete(comments).where(and(eq(comments.id, commentId), eq(comments.authorId, user.id)));

  revalidatePath(`/board`);
}

export async function updateComment(commentId: number, content: string) {
  const user = await getAuthUser();

  const trimmedContent = content.trim();
  if (!trimmedContent) throw new Error('댓글 내용을 입력해주세요.');
  if (trimmedContent.length > 200) throw new Error('댓글은 최대 200자까지 작성 가능합니다.');
  if (trimmedContent.includes('\n') || trimmedContent.includes('\r')) {
    throw new Error('댓글은 한 줄로만 작성 가능합니다.');
  }

  // 소유권 검증
  const existing = await db.query.comments.findFirst({ where: eq(comments.id, commentId) });
  if (!existing || existing.authorId !== user.id) throw new Error('댓글 수정 권한이 없습니다.');

  await db.update(comments)
    .set({ content: content.trim() })
    .where(and(eq(comments.id, commentId), eq(comments.authorId, user.id)));

  revalidatePath(`/board`);
}

// --- 좋아요 (Likes) ---

export async function toggleLike(postId: number) {
  const user = await getAuthUser();

  const existing = await db.query.likes.findFirst({
    where: and(eq(likes.postId, postId), eq(likes.userId, user.id))
  });

  if (existing) {
    await db.delete(likes).where(and(eq(likes.postId, postId), eq(likes.userId, user.id)));
  } else {
    await db.insert(likes).values({ postId, userId: user.id });
  }

  revalidatePath(`/board`);
  revalidatePath('/');
}

export async function toggleCommentLike(commentId: number) {
  const user = await getAuthUser();

  const existing = await db.query.commentLikes.findFirst({
    where: and(eq(commentLikes.commentId, commentId), eq(commentLikes.userId, user.id))
  });

  if (existing) {
    await db.delete(commentLikes).where(and(eq(commentLikes.commentId, commentId), eq(commentLikes.userId, user.id)));
  } else {
    await db.insert(commentLikes).values({ commentId, userId: user.id });
  }

  revalidatePath(`/board`);
}

export async function getPostDetail(postId: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const post = await db.query.posts.findFirst({
    where: eq(posts.id, postId),
  });

  if (!post) return null;

  const postLikes = await db.select().from(likes).where(eq(likes.postId, postId));
  const postComments = await db.query.comments.findMany({
    where: eq(comments.postId, postId),
    orderBy: [desc(comments.createdAt)],
  });

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
}
