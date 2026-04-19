import { createClient } from '@/utils/supabase/server';
import { db } from '@/db';
import { posts } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { redirect, notFound } from 'next/navigation';
import { SectionHeader } from '@/app/components/ui/core';
import PostForm from '../../components/post-form';

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const postId = parseInt(id, 10);
  
  if (isNaN(postId)) {
    notFound();
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/board');
  }

  let postList: typeof posts.$inferSelect[] = [];
  try {
    postList = await db.select().from(posts).where(eq(posts.id, postId));
  } catch(e) {
    console.error("DB connection error", e);
  }

  const post = postList[0];

  if (!post) {
    notFound();
  }

  if (post.authorId !== user.id) {
    redirect(`/board/${postId}`);
  }

  const userInitial = user.user_metadata?.full_name?.[0] || user.email?.[0] || '?';

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <header className="mb-8">
        <SectionHeader 
          label="Community"
          title="Edit Post"
          description={`Editing post #${post.id}`}
        />
      </header>

      <PostForm 
        initialData={{
          id: post.id,
          title: post.title,
          content: post.content
        }} 
        userInitial={userInitial} 
      />
    </div>
  );
}
