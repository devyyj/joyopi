import { db } from '@/db';
import { posts } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { Button, Card } from '@/app/components/ui/core';
import DeletePostButton from './delete-button';

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const postId = parseInt(id, 10);
  
  if (isNaN(postId)) {
    notFound();
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

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const isAuthor = user?.id === post.authorId;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Post Header (GitHub Issue Header Style) */}
      <header className="mb-6 space-y-3 pb-6 border-b border-border">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <h1 className="text-3xl font-semibold text-foreground leading-tight">
            {post.title} <span className="text-muted font-light">#{post.id}</span>
          </h1>
          <div className="flex gap-2">
            {isAuthor && (
              <>
                <Link href={`/board/${post.id}/edit`}>
                  <Button variant="outline" size="sm">수정</Button>
                </Link>
                <DeletePostButton postId={post.id} />
              </>
            )}
            <Link href="/board/write">
              <Button size="sm">글쓰기</Button>
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-green-600 text-white text-xs font-semibold flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"></path><path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z"></path>
            </svg>
            공개됨
          </span>
          <span className="text-sm text-muted">
            <span className="font-semibold text-foreground">{post.authorName}</span>님이 {post.createdAt.toLocaleDateString()}에 작성함
          </span>
        </div>
      </header>
      
      {/* Post Content (GitHub Comment Style) */}
      <div className="flex gap-4">
        <div className="hidden md:block">
          <div className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center text-xs font-bold text-muted uppercase">
            {post.authorName?.substring(0, 1)}
          </div>
        </div>
        <Card className="flex-1 p-0 overflow-hidden">
          <div className="bg-secondary px-4 py-2 border-b border-border flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">{post.authorName}</span>
              <span className="text-sm text-muted">댓글 남김 · {post.createdAt.toLocaleDateString()}</span>
            </div>
            {isAuthor && (
              <span className="text-[10px] font-medium border border-border px-1.5 py-0.5 rounded-full text-muted">
                작성자
              </span>
            )}
          </div>
          <div className="p-4 text-sm text-foreground leading-relaxed whitespace-pre-wrap min-h-[200px] font-sans">
            {post.content}
          </div>
        </Card>
      </div>

      <div className="mt-8 flex justify-center">
        <Link href="/board">
          <Button variant="outline">목록으로 돌아가기</Button>
        </Link>
      </div>
    </div>
  );
}
