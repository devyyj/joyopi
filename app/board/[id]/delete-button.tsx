'use client';

import { deletePost } from '@/app/actions/board';
import { Button } from '@/app/components/ui/core';
import { useTransition } from 'react';

interface DeletePostButtonProps {
  postId: number;
}

export default function DeletePostButton({ postId }: DeletePostButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      startTransition(async () => {
        try {
          await deletePost(postId);
        } catch (error) {
          alert(error instanceof Error ? error.message : '알 수 없는 에러가 발생했습니다.');
        }
      });
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={handleDelete}
      isLoading={isPending}
      className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
    >
      삭제
    </Button>
  );
}
