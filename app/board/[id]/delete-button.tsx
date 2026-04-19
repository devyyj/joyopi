'use client';

import { deletePost } from '@/app/actions/board';
import { Button } from '@/app/components/ui/core';
import { useTransition } from 'react';
import { useDialog } from '@/app/components/ui/dialog-provider';

interface DeletePostButtonProps {
  postId: number;
}

export default function DeletePostButton({ postId }: DeletePostButtonProps) {
  const [isPending, startTransition] = useTransition();
  const { alert, confirm } = useDialog();

  const handleDelete = async () => {
    const ok = await confirm('정말로 이 게시글을 삭제하시겠습니까?', {
      variant: 'danger',
      confirmText: '삭제하기'
    });
    
    if (!ok) return;

    startTransition(async () => {
      try {
        await deletePost(postId);
      } catch (error) {
        alert(error instanceof Error ? error.message : '삭제 중 오류가 발생했습니다.');
      }
    });
  };

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={handleDelete}
      isLoading={isPending}
      className="text-red-500/70 hover:text-red-600 h-7 px-2 text-[10px]"
    >
      삭제
    </Button>
  );
}
