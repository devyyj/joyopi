'use client';

import { useState, useTransition, useOptimistic } from 'react';
import { createComment, deleteComment, updateComment, toggleCommentLike } from '@/app/actions/board';
import { Button, Card, UserNickname } from '@/app/components/ui/core';
import { useDialog } from '@/app/components/ui/dialog-provider';

interface Comment {
  id: number;
  postId: number;
  authorId: string | null;
  authorName: string;
  content: string;
  createdAt: Date;
  likeCount: number;
  isLiked: boolean;
}

interface CommentSectionProps {
  postId: number;
  comments: Comment[];
  currentUserId?: string;
  currentUserName?: string;
  onNicknameClick?: (userId: string) => void;
}

type OptimisticAction = 
  | { type: 'ADD'; comment: Comment }
  | { type: 'DELETE'; commentId: number }
  | { type: 'UPDATE'; commentId: number; content: string }
  | { type: 'TOGGLE_LIKE'; commentId: number };

const MAX_COMMENT_LENGTH = 200;

export default function CommentSection({ 
  postId, 
  comments, 
  currentUserId, 
  currentUserName = '익명',
  onNicknameClick
}: CommentSectionProps) {
  const [content, setContent] = useState('');
  const [editingId, setEditId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { alert, confirm } = useDialog();

  const [optimisticComments, dispatchOptimistic] = useOptimistic(
    comments,
    (state, action: OptimisticAction) => {
      switch (action.type) {
        case 'ADD': return [action.comment, ...state];
        case 'DELETE': return state.filter(c => c.id !== action.commentId);
        case 'UPDATE': return state.map(c => c.id === action.commentId ? { ...c, content: action.content } : c);
        case 'TOGGLE_LIKE': return state.map(c => {
          if (c.id === action.commentId) {
            const newLiked = !c.isLiked;
            return { ...c, isLiked: newLiked, likeCount: newLiked ? c.likeCount + 1 : c.likeCount - 1 };
          }
          return c;
        });
        default: return state;
      }
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;
    if (trimmed.length > MAX_COMMENT_LENGTH) {
      alert(`답글은 최대 ${MAX_COMMENT_LENGTH}자까지 작성 가능합니다.`);
      return;
    }

    setContent('');

    startTransition(async () => {
      dispatchOptimistic({
        type: 'ADD',
        comment: {
          id: Math.random(),
          postId,
          authorId: currentUserId || null,
          authorName: currentUserName,
          content: trimmed,
          createdAt: new Date(),
          likeCount: 0,
          isLiked: false
        }
      });
      try {
        await createComment(postId, trimmed);
      } catch (error) {
        setContent(trimmed);
        alert(error instanceof Error ? error.message : '댓글 작성 중 오류가 발생했습니다.');
      }
    });
  };

  const handleDelete = (commentId: number) => {
    confirm('댓글을 삭제하시겠습니까?', { variant: 'danger' }).then(ok => {
      if (ok) {
        startTransition(async () => {
          dispatchOptimistic({ type: 'DELETE', commentId });
          try {
            await deleteComment(commentId, postId);
          } catch (error) {
            alert(error instanceof Error ? error.message : '삭제 중 오류가 발생했습니다.');
          }
        });
      }
    });
  };

  const handleUpdate = (commentId: number) => {
    const trimmed = editContent.trim();
    if (!trimmed) return;
    if (trimmed.length > MAX_COMMENT_LENGTH) {
      alert(`답글은 최대 ${MAX_COMMENT_LENGTH}자까지 작성 가능합니다.`);
      return;
    }

    startTransition(async () => {
      dispatchOptimistic({ type: 'UPDATE', commentId, content: trimmed });
      setEditId(null);
      try {
        await updateComment(commentId, trimmed);
      } catch (error) {
        alert(error instanceof Error ? error.message : '수정 중 오류가 발생했습니다.');
      }
    });
  };

  const handleToggleLike = (commentId: number) => {
    startTransition(async () => {
      dispatchOptimistic({ type: 'TOGGLE_LIKE', commentId });
      try {
        await toggleCommentLike(commentId);
      } catch (error) {
        alert(error instanceof Error ? error.message : '오류가 발생했습니다.');
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
          답글 보기 {optimisticComments.length > 0 && <span>({optimisticComments.length})</span>}
        </button>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      <div className="flex justify-between items-center border-b border-border pb-1">
        <h3 className="text-sm font-semibold">
          답글 <span className="text-muted font-normal">{optimisticComments.length}</span>
        </h3>
        <button 
          onClick={() => setShowComments(false)}
          className="text-[10px] text-muted-foreground hover:text-foreground"
        >
          접기
        </button>
      </div>

      <div className="space-y-2">
        {optimisticComments.map((comment) => (
          <div key={comment.id} className="flex gap-2">
            <Card className="flex-1 p-2 px-3 border-border/60 bg-secondary/10">
              <div className="flex justify-between items-center mb-1.5">
                <div className="flex items-center gap-2">
                  <UserNickname 
                    name={comment.authorName}
                    size="md"
                    onClick={() => {
                      if (comment.authorId) {
                        onNicknameClick?.(comment.authorId);
                      } else {
                        alert('탈퇴하거나 정보가 없는 사용자입니다.');
                      }
                    }}
                  />
                  <span className="text-[10px] text-muted" suppressHydrationWarning>
                    {new Date(comment.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
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
                      className="w-full px-2 py-1 bg-background border border-border rounded text-[13px] focus:outline-none focus:ring-1 focus:ring-primary pr-12"
                      autoFocus
                    />
                    <span className={`absolute right-2 top-1.5 text-[10px] font-medium ${editContent.length > MAX_COMMENT_LENGTH ? 'text-red-500' : 'text-muted'}`}>
                      {editContent.length}/{MAX_COMMENT_LENGTH}
                    </span>
                  </div>
                  <div className="flex justify-end gap-1.5">
                    <button onClick={() => setEditId(null)} className="text-[10px] text-muted-foreground">취소</button>
                    <button 
                      onClick={() => handleUpdate(comment.id)} 
                      disabled={!editContent.trim() || editContent.length > MAX_COMMENT_LENGTH}
                      className="text-[10px] text-primary font-bold disabled:opacity-50"
                    >
                      저장
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-[13px] leading-snug truncate">{comment.content}</div>
                  <div className="mt-1.5 flex items-center gap-3">
                    <button 
                      onClick={() => handleToggleLike(comment.id)}
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
                </>
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
            <div className="absolute right-3 top-2.5 flex items-center gap-2">
              <span className={`text-[10px] font-medium ${content.length > MAX_COMMENT_LENGTH ? 'text-red-500' : 'text-muted'}`}>
                {content.length}/{MAX_COMMENT_LENGTH}
              </span>
            </div>
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
