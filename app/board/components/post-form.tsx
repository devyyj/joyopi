'use client';

import { createPost, updatePost } from '@/app/actions/board';
import { Button, Card } from '@/app/components/ui/core';
import { useActionState } from 'react';
import Link from 'next/link';

interface PostFormProps {
  initialData?: {
    id: number;
    title: string;
    content: string;
  };
  userInitial: string;
}

export default function PostForm({ initialData, userInitial }: PostFormProps) {
  const [state, action, isPending] = useActionState(async (_prevState: unknown, formData: FormData) => {
    try {
      if (initialData) {
        await updatePost(initialData.id, formData);
      } else {
        await createPost(formData);
      }
      return { success: true, error: null };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '알 수 없는 에러가 발생했습니다.' 
      };
    }
  }, { success: false, error: null });

  return (
    <form action={action}>
      <Card className="p-0 overflow-hidden border-primary/20 shadow-lg shadow-primary/5">
        <div className="bg-secondary/50 px-4 py-2 border-b border-border flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
            {userInitial}
          </div>
          <span className="text-xs font-semibold text-muted uppercase tracking-wider">
            {initialData ? 'Edit Post' : 'Post Editor'}
          </span>
        </div>
        <div className="p-6 space-y-4">
          <div className="space-y-1">
            <input 
              type="text" 
              name="title" 
              id="title"
              defaultValue={initialData?.title}
              required 
              className="w-full bg-transparent border-none p-0 text-xl font-bold focus:ring-0 placeholder:text-muted/30" 
              placeholder="제목을 입력하세요"
            />
          </div>

          <div className="space-y-1">
            <textarea 
              name="content" 
              id="content"
              defaultValue={initialData?.content}
              required 
              rows={8}
              className="w-full bg-transparent border-none p-0 text-base focus:ring-0 resize-none placeholder:text-muted/30 font-sans" 
              placeholder="무슨 일이 일어나고 있나요?"
            />
          </div>
          
          {state.error && (
            <p className="text-xs text-red-500 font-medium">{state.error}</p>
          )}
        </div>
        <div className="bg-secondary/30 px-6 py-4 border-t border-border flex justify-between items-center">
          <Link href="/board" className="text-sm font-medium text-muted hover:text-foreground">
            취소
          </Link>
          <Button type="submit" size="md" isLoading={isPending}>
            {initialData ? '수정 완료' : '게시하기'}
          </Button>
        </div>
      </Card>
    </form>
  );
}
