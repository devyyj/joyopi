'use client';

import { useTransition, useOptimistic } from 'react';
import { toggleLike } from '@/app/actions/board';
import { useDialog } from '@/app/components/ui/dialog-provider';

interface LikeButtonProps {
  postId: number;
  initialLiked: boolean;
  likeCount: number;
}

export default function LikeButton({ postId, initialLiked, likeCount }: LikeButtonProps) {
  const [isPending, startTransition] = useTransition();
  const { alert } = useDialog();
  const [optimisticLike, addOptimisticLike] = useOptimistic(
    { liked: initialLiked, count: likeCount },
    (state, newLiked: boolean) => ({
      liked: newLiked,
      count: state.liked ? (newLiked ? state.count : state.count - 1) : (newLiked ? state.count + 1 : state.count)
    })
  );

  const handleToggle = () => {
    startTransition(async () => {
      addOptimisticLike(!optimisticLike.liked);
      const result = await toggleLike(postId);
      if (!result.success) {
        alert(result.message || '오류가 발생했습니다.');
      }
    });
  };

  return (
    <button 
      onClick={handleToggle}
      disabled={isPending}
      className={`group flex items-center gap-1.5 transition-colors ${
        optimisticLike.liked ? 'text-red-500' : 'text-muted-foreground hover:text-red-400'
      }`}
    >
      <svg 
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        fill={optimisticLike.liked ? 'currentColor' : 'none'} 
        stroke="currentColor" 
        strokeWidth="2"
        strokeLinecap="round" 
        strokeLinejoin="round"
        className="transition-transform group-active:scale-125"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
      {optimisticLike.count > 0 && <span className="text-xs font-medium">{optimisticLike.count}</span>}
    </button>
  );
}
