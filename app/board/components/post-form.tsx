'use client';

import { createPost, updatePost } from '@/app/actions/board';
import { Button, Card } from '@/app/components/ui/core';
import { useActionState, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface PostFormProps {
  initialData?: {
    id: number;
    title: string;
    content: string;
  };
}

const MAX_TITLE = 50;
const MAX_CONTENT = 5000;

export default function PostForm({ initialData }: PostFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');

  const [state, action, isPending] = useActionState(async (_prevState: unknown, formData: FormData) => {
    try {
      if (initialData) {
        await updatePost(initialData.id, formData);
      } else {
        await createPost(formData);
      }
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : '오류가 발생했습니다.' };
    }
  }, { success: false, error: null });

  // 성공 시 목록으로 이동
  useEffect(() => {
    if (state.success) {
      router.push('/board');
      router.refresh();
    }
  }, [state.success, router]);

  return (
    <form action={action}>
      <Card className="p-6 space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <label htmlFor="title" className="text-sm font-medium">제목</label>
            <span className={`text-[10px] ${title.length > MAX_TITLE ? 'text-red-500 font-bold' : 'text-muted'}`}>
              {title.length} / {MAX_TITLE}
            </span>
          </div>
          <input 
            type="text" 
            name="title" 
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={MAX_TITLE}
            required 
            className="w-full px-3 py-2 bg-secondary border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" 
            placeholder="제목을 입력하세요"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <label htmlFor="content" className="text-sm font-medium">내용</label>
            <span className={`text-[10px] ${content.length > MAX_CONTENT ? 'text-red-500 font-bold' : 'text-muted'}`}>
              {content.length} / {MAX_CONTENT}
            </span>
          </div>
          <textarea 
            name="content" 
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={MAX_CONTENT}
            required 
            rows={15}
            className="w-full px-3 py-2 bg-secondary border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none" 
            placeholder="내용을 입력하세요"
          />
        </div>
        
        {state.error && <p className="text-xs text-red-500">{state.error}</p>}

        <div className="flex justify-between items-center pt-4 border-t border-border">
          <Link href="/board" className="text-sm text-muted hover:text-foreground">취소</Link>
          <Button 
            type="submit" 
            isLoading={isPending}
            disabled={title.length > MAX_TITLE || content.length > MAX_CONTENT}
          >
            {initialData ? '수정 완료' : '게시하기'}
          </Button>
        </div>
      </Card>
    </form>
  );
}
