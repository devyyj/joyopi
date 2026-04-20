'use client';

import { useState, useTransition } from 'react';
import { createComment, deleteComment, updateComment, toggleCommentLike, CommentWithDetails } from '@/app/actions/board';
import { Button, Card, UserNickname, UserAvatar } from '@/app/components/ui/core';
import { useDialog } from '@/app/components/ui/dialog-provider';

interface CommentSectionProps {
  postId: number;
  comments: CommentWithDetails[];
  currentUserId?: string;
  currentUserName?: string;
  onNicknameClick?: (userId: string) => void;
  onSuccess?: () => void;
}

const MAX_COMMENT_LENGTH = 200;

export default function CommentSection({ 
  postId, 
  comments, 
  currentUserId, 
  onNicknameClick,
  onSuccess
}: CommentSectionProps) {
  const [content, setContent] = useState('');
  const [editingId, setEditId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { alert, confirm } = useDialog();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;
    
    startTransition(async () => {
      const result = await createComment(postId, trimmed);
      if (!result.success) {
        alert(result.message || '댓글 작성 중 오류가 발생했습니다.');
      } else {
        setContent('');
        onSuccess?.();
      }
    });
  };

  const handleDelete = (commentId: number) => {
    confirm('댓글을 삭제하시겠습니까?', { variant: 'danger' }).then(ok => {
      if (ok) {
        startTransition(async () => {
          const result = await deleteComment(commentId);
          if (!result.success) {
            alert(result.message || '삭제 중 오류가 발생했습니다.');
          } else {
            onSuccess?.();
          }
        });
      }
    });
  };

  const handleUpdate = (commentId: number) => {
    const trimmed = editContent.trim();
    if (!trimmed) return;

    startTransition(async () => {
      const result = await updateComment(commentId, trimmed);
      if (!result.success) {
        alert(result.message || '수정 중 오류가 발생했습니다.');
      } else {
        setEditId(null);
        onSuccess?.();
      }
    });
  };

  const handleToggleLike = (commentId: number) => {
    startTransition(async () => {
      const result = await toggleCommentLike(commentId);
      if (!result.success) {
        alert(result.message || '오류가 발생했습니다.');
      } else {
        onSuccess?.();
      }
    });
  };

  if (!showComments) {
    return (
      <div className="mt-2">
        <button 
          onClick={() => setShowComments(true)}
          className="text-[11px] text-muted-foreground hover:text-primary font-medium flex items-center gap-1 transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          답글 보기 {comments.length > 0 && <span>({comments.length})</span>}
        </button>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      <div className="flex justify-between items-center border-b border-border pb-1">
        <h3 className="text-sm font-semibold">
          답글 <span className="text-muted font-normal">{comments.length}</span>
        </h3>
        <button 
          onClick={() => setShowComments(false)}
          className="text-[10px] text-muted-foreground hover:text-foreground"
        >
          접기
        </button>
      </div>

      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <div className="mt-0.5">
              <UserAvatar 
                url={comment.author?.avatarUrl} 
                name={comment.authorName} 
                size="md" 
                onClick={() => comment.authorId && onNicknameClick?.(comment.authorId)}
              />
            </div>
            <Card className={`flex-1 p-2 px-3 border-border/60 bg-secondary/5 min-w-0 transition-opacity ${isPending ? 'opacity-60' : ''}`}>
              <div className="flex justify-between items-center mb-1 gap-4">
                <div className="flex items-center gap-2 overflow-hidden">
                  <UserNickname 
                    name={comment.authorName}
                    size="sm"
                    onClick={() => comment.authorId && onNicknameClick?.(comment.authorId)}
                    className="text-muted-foreground/80 hover:text-primary transition-colors font-semibold"
                  />
                  <span className="text-muted/30 text-[9px]">|</span>
                  <span className="text-[9px] text-muted-foreground/50 shrink-0 font-medium" suppressHydrationWarning>
                    {new Date(comment.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {currentUserId && comment.authorId === currentUserId && editingId !== comment.id && (
                    <div className="flex gap-1.5">
                      <button 
                        onClick={() => { setEditId(comment.id); setEditContent(comment.content); }}
                        className="text-[10px] text-muted-foreground hover:text-foreground"
                      >
                        수정
                      </button>
                      <button 
                        onClick={() => handleDelete(comment.id)}
                        className="text-[10px] text-red-500/70 hover:text-red-600"
                      >
                        삭제
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {editingId === comment.id ? (
                <div className="space-y-1.5 py-1">
                  <div className="relative">
                    <input
                      type="text"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleUpdate(comment.id);
                        if (e.key === 'Escape') setEditId(null);
                      }}
                      maxLength={MAX_COMMENT_LENGTH}
                      className="w-full px-2 py-1 bg-background border border-border rounded text-[12px] focus:outline-none focus:ring-1 focus:ring-primary pr-12"
                      autoFocus
                    />
                  </div>
                  <div className="flex justify-end gap-1.5">
                    <button onClick={() => setEditId(null)} className="text-[10px] text-muted-foreground">취소</button>
                    <button 
                      onClick={() => handleUpdate(comment.id)} 
                      className="text-[10px] text-primary font-bold disabled:opacity-50"
                    >
                      저장
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-4 overflow-hidden">
                  <div className="text-[12px] leading-relaxed break-words flex-1 text-foreground/90">
                    {comment.content}
                  </div>
                  <div className="shrink-0 mt-0.5">
                    <button 
                      onClick={() => handleToggleLike(comment.id)}
                      disabled={isPending}
                      className={`flex items-center gap-1 text-[10px] transition-colors ${
                        comment.isLiked ? 'text-red-500' : 'text-muted-foreground hover:text-red-400'
                      }`}
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill={comment.isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                      </svg>
                      {comment.likeCount > 0 && <span>{comment.likeCount}</span>}
                    </button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        ))}
      </div>

      {currentUserId ? (
        <form onSubmit={handleSubmit} className="mt-4 space-y-1">
          <div className="relative">
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={MAX_COMMENT_LENGTH}
              placeholder="답글을 남겨보세요... (최대 200자)"
              className="w-full px-3 py-2 bg-secondary/20 border border-border rounded-md text-[13px] focus:outline-none focus:ring-1 focus:ring-primary pr-16"
              disabled={isPending}
            />
          </div>
          <div className="flex justify-end">
            <Button 
              type="submit" 
              size="sm" 
              isLoading={isPending} 
              disabled={!content.trim() || content.length > MAX_COMMENT_LENGTH} 
              className="h-8 text-[11px]"
            >
              답글 달기
            </Button>
          </div>
        </form>
      ) : (
        <Card className="p-4 text-center bg-secondary/10 border-dashed">
          <p className="text-[11px] text-muted">로그인 후 답글을 남길 수 있습니다.</p>
        </Card>
      )}
    </div>
  );
}
