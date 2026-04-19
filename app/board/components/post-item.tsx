'use client';

import { useState, useTransition, useOptimistic } from 'react';
import { Card, UserNickname, UserAvatar } from '@/app/components/ui/core';
import LikeButton from './like-button';
import CommentSection from './comment-section';
import UserProfileModal from '@/app/components/user-profile-modal';
import { deletePost, updatePost, PostWithDetails } from '@/app/actions/board';
import { useDialog } from '@/app/components/ui/dialog-provider';

interface PostItemProps {
  item: PostWithDetails;
  currentUserId?: string;
  currentUserName?: string;
}

const MAX_TITLE = 50;
const MAX_CONTENT = 5000;

export default function PostItem({ item, currentUserId, currentUserName }: PostItemProps) {
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [editTitle, setEditTitle] = useState(item.title);
  const [editContent, setEditContent] = useState(item.content);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const { alert, confirm } = useDialog();

  // 낙관적 업데이트 설정
  const [optimisticPost, setOptimisticPost] = useOptimistic(
    { title: item.title, content: item.content },
    (state, newPost: { title: string, content: string }) => ({
      ...state,
      ...newPost
    })
  );

  const handleDelete = async () => {
    const ok = await confirm('정말로 이 게시글을 삭제하시겠습니까? 삭제된 글은 복구할 수 없습니다.', {
      title: '게시글 삭제',
      variant: 'danger',
      confirmText: '삭제'
    });

    if (ok) {
      startTransition(async () => {
        const result = await deletePost(item.id);
        if (!result.success) {
          alert(result.message || '삭제 중 오류가 발생했습니다.');
        }
      });
    }
  };

  const handleUpdate = async () => {
    const trimmedTitle = editTitle.trim();
    const trimmedContent = editContent.trim();

    if (!trimmedTitle || !trimmedContent) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }

    if (trimmedTitle.length > MAX_TITLE || trimmedContent.length > MAX_CONTENT) {
      alert('글자 수 제한을 초과했습니다.');
      return;
    }

    startTransition(async () => {
      // UI 즉시 반영
      setOptimisticPost({ title: trimmedTitle, content: trimmedContent });
      setIsEditing(false);

      const formData = new FormData();
      formData.append('title', trimmedTitle);
      formData.append('content', trimmedContent);
      const result = await updatePost(item.id, formData);
      
      if (!result.success) {
        setIsEditing(true); // 편집 모드 다시 활성화
        alert(result.message || '수정 중 오류가 발생했습니다.');
      }
    });
  };

  const handleCancel = () => {
    setEditTitle(item.title);
    setEditContent(item.content);
    setIsEditing(false);
  };

  const formattedDate = new Date(item.createdAt).toLocaleDateString() + ' ' + 
                       new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handleUserClick = () => {
    if (item.authorId) {
      setSelectedUserId(item.authorId);
    } else {
      alert('탈퇴하거나 정보가 없는 사용자입니다.');
    }
  };

  return (
    <article className="space-y-1">
      <Card className="p-0 overflow-hidden shadow-sm border-border/60">
        {/* 1. Identity Bar (Avatar + ID + Actions) */}
        <div className="px-4 py-2 bg-secondary/40 border-b border-border/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UserAvatar 
              url={item.author?.avatarUrl} 
              name={item.authorName} 
              size="md" 
              onClick={handleUserClick}
            />
            <UserNickname 
              name={item.authorName}
              size="md"
              onClick={handleUserClick}
              className="hover:text-primary transition-colors"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-1.5 shrink-0 items-center">
            {item.isAuthor && !isEditing && (
              <>
                <button 
                  onClick={() => setIsEditing(true)} 
                  className="text-[10px] text-muted-foreground hover:text-foreground transition-colors px-0.5"
                >
                  수정
                </button>
                <button 
                  onClick={handleDelete} 
                  disabled={isPending}
                  className="text-[10px] text-red-500/70 hover:text-red-600 transition-colors px-0.5 disabled:opacity-50"
                >
                  삭제
                </button>
              </>
            )}
            {isEditing && (
              <>
                <button 
                  onClick={handleUpdate} 
                  disabled={isPending}
                  className="text-[10px] text-primary font-bold hover:opacity-80 transition-opacity px-0.5 disabled:opacity-50"
                >
                  저장
                </button>
                <button 
                  onClick={handleCancel} 
                  disabled={isPending}
                  className="text-[10px] text-muted-foreground hover:text-foreground transition-colors px-0.5 disabled:opacity-50"
                >
                  취소
                </button>
              </>
            )}
          </div>
        </div>

        {/* 2. Content Meta (Title) */}
        <header className="px-4 py-4 bg-card">
          {isEditing ? (
            <div className="space-y-1">
              <div className="flex justify-end">
                <span className={`text-[9px] ${editTitle.length > MAX_TITLE ? 'text-red-500 font-bold' : 'text-muted'}`}>
                  제목: {editTitle.length} / {MAX_TITLE}
                </span>
              </div>
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                maxLength={MAX_TITLE}
                className="w-full text-base sm:text-lg font-bold bg-background border border-primary/30 rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-primary"
                autoFocus
              />
            </div>
          ) : (
            <h2 className="text-lg sm:text-xl font-bold text-foreground leading-tight tracking-tight line-clamp-2">
              {optimisticPost.title}
            </h2>
          )}
        </header>

        {/* Post Content */}
        <div className="px-4 pb-5 pt-0 text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap border-b border-border/20">
          {!isEditing && (
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/50 font-medium mb-3" suppressHydrationWarning>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-60">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              {formattedDate}
            </div>
          )}

          {isEditing ? (
            <div className="space-y-1">
              <div className="flex justify-end">
                <span className={`text-[9px] ${editContent.length > MAX_CONTENT ? 'text-red-500 font-bold' : 'text-muted'}`}>
                  내용: {editContent.length} / {MAX_CONTENT}
                </span>
              </div>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                maxLength={MAX_CONTENT}
                className="w-full min-h-[150px] bg-background border border-primary/30 rounded px-2 py-2 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <div className={isExpanded ? "" : "line-clamp-5"}>
                {optimisticPost.content}
              </div>
              {!isExpanded && (optimisticPost.content.length > 300 || optimisticPost.content.split('\n').length > 5) && (
                <button 
                  onClick={() => setIsExpanded(true)}
                  className="text-xs font-bold text-primary hover:underline transition-colors"
                >
                  더보기
                </button>
              )}
              {isExpanded && (
                <button 
                  onClick={() => setIsExpanded(false)}
                  className="text-xs font-bold text-muted hover:text-foreground transition-colors"
                >
                  접기
                </button>
              )}
            </div>
          )}
        </div>

        {/* Post Actions (Likes) */}
        {!isEditing && (
          <div className="px-4 py-1.5 bg-secondary/10 border-t border-border/40">
            <LikeButton 
              postId={item.id} 
              initialLiked={item.isLiked} 
              likeCount={item.likeCount} 
            />
          </div>
        )}
      </Card>

      {/* Comment Section */}
      {!isEditing && (
        <div className="pl-4 md:pl-6">
          <CommentSection 
            postId={item.id} 
            comments={item.comments} 
            currentUserId={currentUserId} 
            currentUserName={currentUserName}
            onNicknameClick={(uid) => setSelectedUserId(uid)}
          />
        </div>
      )}
      
      <div className="pt-2 border-b border-border/20 last:border-0" />

      {/* Modals */}
      <UserProfileModal 
        userId={selectedUserId}
        onClose={() => setSelectedUserId(null)}
      />
    </article>
  );
}
