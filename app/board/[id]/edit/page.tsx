import { db } from '@/db';
import { posts } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import PostForm from '../../components/post-form';
import { SectionHeader } from '@/app/components/ui/core';

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const postId = parseInt(id, 10);
  
  if (isNaN(postId)) notFound();

  const post = await db.query.posts.findFirst({ where: eq(posts.id, postId) });
  if (!post) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 소유권 확인 (서버 사이드)
  if (!user || user.id !== post.authorId) {
    redirect(`/board/${postId}`);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <SectionHeader 
        title="게시글 수정"
        description="게시글의 내용을 수정합니다."
        className="mb-8"
      />
      <PostForm initialData={{ id: post.id, title: post.title, content: post.content }} />
    </div>
  );
}
