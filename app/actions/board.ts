'use server';

import { createClient } from '@/utils/supabase/server';
import { db } from '@/db';
import { posts, comments, likes, profiles, commentLikes, postImages } from '@/db/schema';
import { revalidatePath } from 'next/cache';
import { eq, and, desc, inArray } from 'drizzle-orm';

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
    const images = formData.getAll('images') as File[];

    if (!title || !content) return { success: false, message: '제목과 내용을 입력해주세요.' };
    if (title.length > 50) return { success: false, message: '제목은 최대 50자까지 가능합니다.' };
    if (content.length > 5000) return { success: false, message: '내용은 최대 5,000자까지 가능합니다.' };

    // 1. 게시글 저장
    const [newPost] = await db.insert(posts).values({
      title,
      content,
      authorId: user.id,
      authorName: profile.nickname,
    }).returning();

    // 2. 이미지 업로드 및 DB 저장
    if (images.length > 0) {
      const supabase = await createClient();
      const imageRecords: { postId: number; url: string }[] = [];

      for (const file of images) {
        if (file.size === 0) continue;
        
        const fileName = `${newPost.id}/${crypto.randomUUID()}.webp`;
        const { data, error } = await supabase.storage
          .from('post-images')
          .upload(fileName, file, { contentType: 'image/webp' });

        if (error) {
          console.error('Image upload error:', error);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('post-images')
          .getPublicUrl(data.path);

        imageRecords.push({
          postId: newPost.id,
          url: publicUrl
        });
      }

      if (imageRecords.length > 0) {
        await db.insert(postImages).values(imageRecords);
      }
    }

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
    const newImages = formData.getAll('images') as File[];
    const removedImageIds = formData.getAll('removedImageIds').map(id => parseInt(id as string));

    if (!title || !content) return { success: false, message: '제목과 내용을 입력해주세요.' };
    if (title.length > 50) return { success: false, message: '제목은 최대 50자까지 가능합니다.' };
    if (content.length > 5000) return { success: false, message: '내용은 최대 5,000자까지 가능합니다.' };

    const existing = await db.query.posts.findFirst({ 
      where: eq(posts.id, id),
      with: { images: true }
    });
    if (!existing || existing.authorId !== user.id) return { success: false, message: '수정 권한이 없습니다.' };

    const supabase = await createClient();

    // 1. 이미지 삭제 처리
    if (removedImageIds.length > 0) {
      const imagesToDelete = existing.images.filter(img => removedImageIds.includes(img.id));
      
      for (const img of imagesToDelete) {
        const path = img.url.split('/').slice(-2).join('/'); // post-id/uuid.webp 형식 추출
        await supabase.storage.from('post-images').remove([path]);
      }

      await db.delete(postImages).where(and(
        eq(postImages.postId, id),
        inArray(postImages.id, removedImageIds)
      ));
    }

    // 2. 새 이미지 추가 처리
    if (newImages.length > 0) {
      const imageRecords: { postId: number; url: string }[] = [];

      for (const file of newImages) {
        if (file.size === 0) continue;
        
        const fileName = `${id}/${crypto.randomUUID()}.webp`;
        const { data, error } = await supabase.storage
          .from('post-images')
          .upload(fileName, file, { contentType: 'image/webp' });

        if (!error) {
          const { data: { publicUrl } } = supabase.storage
            .from('post-images')
            .getPublicUrl(data.path);

          imageRecords.push({ postId: id, url: publicUrl });
        }
      }

      if (imageRecords.length > 0) {
        await db.insert(postImages).values(imageRecords);
      }
    }

    // 3. 게시글 정보 업데이트
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

    const existing = await db.query.posts.findFirst({ 
      where: eq(posts.id, id),
      with: { images: true }
    });
    if (!existing || existing.authorId !== user.id) return { success: false, message: '삭제 권한이 없습니다.' };

    const supabase = await createClient();

    // 1. 스토리지 파일 삭제
    if (existing.images.length > 0) {
      const paths = existing.images.map(img => img.url.split('/').slice(-2).join('/'));
      await supabase.storage.from('post-images').remove(paths);
      
      // 폴더(게시글 ID 기반) 자체를 비우는 기능은 Supabase에서 명시적인 API가 없으므로 파일 단위 삭제 권장
    }

    // 2. DB 삭제 (CASCADE 설정으로 postImages도 자동 삭제됨)
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

// --- 게시글 조회 (Fetch) ---

export interface CommentWithDetails {
  id: number;
  postId: number;
  authorId: string | null;
  authorName: string;
  author?: { avatarUrl: string | null } | null;
  content: string;
  createdAt: Date;
  likeCount: number;
  isLiked: boolean;
}

export interface PostImage {
  id: number;
  url: string;
}

export interface PostWithDetails {
  id: number;
  title: string;
  content: string;
  authorId: string | null;
  authorName: string;
  author?: { avatarUrl: string | null } | null;
  createdAt: Date;
  comments: CommentWithDetails[];
  images: PostImage[];
  likeCount: number;
  isLiked: boolean;
  isAuthor: boolean;
}

export async function getPaginatedPosts(offset: number = 0, limit: number = 10): Promise<PostWithDetails[]> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const data = await db.query.posts.findMany({
      orderBy: [desc(posts.createdAt)],
      limit,
      offset,
      with: {
        author: {
          columns: {
            avatarUrl: true
          }
        },
        likes: true,
        images: true,
        comments: {
          orderBy: [desc(comments.createdAt)],
          with: {
            author: {
              columns: {
                avatarUrl: true
              }
            },
            likes: true
          }
        }
      }
    });

    return data.map((post) => {
      const commentsWithLikes = post.comments.map((comment) => ({
        ...comment,
        likeCount: comment.likes.length,
        isLiked: user ? comment.likes.some(cl => cl.userId === user.id) : false
      }));
      
      return {
        ...post,
        comments: commentsWithLikes,
        images: post.images,
        likeCount: post.likes.length,
        isLiked: user ? post.likes.some(l => l.userId === user.id) : false,
        isAuthor: user?.id === post.authorId
      };
    });
  } catch (error) {
    console.error('[getPaginatedPosts] Error:', error);
    throw error; // 에러를 숨기지 않고 상위로 던짐
  }
}

export async function getPostDetail(postId: number): Promise<PostWithDetails | null> {
  try {
    const [supabase, post] = await Promise.all([
      createClient(),
      db.query.posts.findFirst({
        where: eq(posts.id, postId),
        with: {
          author: {
            columns: {
              avatarUrl: true
            }
          },
          likes: true,
          images: true,
          comments: {
            orderBy: [desc(comments.createdAt)],
            with: {
              author: {
                columns: {
                  avatarUrl: true
                }
              },
              likes: true
            }
          }
        }
      })
    ]);

    if (!post) return null;

    const { data: { user } } = await supabase.auth.getUser();

    const commentsWithLikes = post.comments.map((comment) => ({
      ...comment,
      likeCount: comment.likes.length,
      isLiked: user ? comment.likes.some(cl => cl.userId === user.id) : false,
    }));

    return {
      ...post,
      comments: commentsWithLikes,
      images: post.images,
      likeCount: post.likes.length,
      isLiked: user ? post.likes.some(l => l.userId === user.id) : false,
      isAuthor: user?.id === post.authorId,
    };
  } catch (error) {
    console.error('[getPostDetail] Error:', error);
    throw error;
  }
}
