'use client';

import { useState, useTransition, useOptimistic } from 'react';
import { Card, Button, UserNickname } from '@/app/components/ui/core';
import LikeButton from './like-button';
import CommentSection from './comment-section';
import UserProfileModal from '@/app/components/user-profile-modal';
import { deletePost, updatePost } from '@/app/actions/board';
import { useDialog } from '@/app/components/ui/dialog-provider';

interface CommentWithLikes {
  id: number;
  postId: number;
  authorId: string | null;
  authorName: string;
  content: string;
  createdAt: Date;
  likeCount: number;
  isLiked: boolean;
}

interface PostItemData {
  id: number;
  title: string;
  content: string;
  authorId: string | null;
  authorName: string;
  createdAt: Date;
  comments: CommentWithLikes[];
  likeCount: number;
  isLiked: boolean;
  isAuthor: boolean;
}

interface PostItemProps {
  item: PostItemData;
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
        try {
          await deletePost(item.id);
        } catch (error) {
          alert(error instanceof Error ? error.message : '삭제 중 오류가 발생했습니다.');
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
      // 1. UI 즉시 반영
      setOptimisticPost({ title: trimmedTitle, content: trimmedContent });
      setIsEditing(false);

      try {
        // 2. 서버 데이터 업데이트
        const formData = new FormData();
        formData.append('title', trimmedTitle);
        formData.append('content', trimmedContent);
        await updatePost(item.id, formData);
      } catch (error) {
        // 3. 실패 시 원래 상태로 복구 및 알림
        setIsEditing(true); // 편집 모드 다시 활성화
        alert(error instanceof Error ? error.message : '수정 중 오류가 발생했습니다.');
      }
    });
  };

  const handleCancel = () => {
    setEditTitle(item.title);
    setEditContent(item.content);
    setIsEditing(false);
  };

  return (
    <article className="space-y-2">
      <Card className="p-0 overflow-hidden shadow-sm border-border/60">
        {/* Post Header */}
        <header className="bg-secondary/30 px-4 py-2 border-b border-border/50 flex justify-between items-start">
          <div className="space-y-1.5 flex-1 mr-4">
            <div className="flex items-center gap-2 text-[11px] text-muted">
              <UserNickname 
                name={item.authorName}
                size="lg"
                onClick={() => {
                  if (item.authorId) {
                    setSelectedUserId(item.authorId);
                  } else {
                    alert('탈퇴하거나 정보가 없는 사용자입니다.');
                  }
                }}
              />
              <span>·</span>
              <span suppressHydrationWarning>
                {new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            
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
                  className="w-full text-lg font-bold bg-background border border-primary/30 rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-primary"
                  autoFocus
                />
              </div>
            ) : (
              <h2 className="text-lg font-bold text-foreground leading-tight line-clamp-2">
                {optimisticPost.title}
              </h2>
            )}
          </div>

          <div className="flex gap-1">
            {item.isAuthor && !isEditing && (
              <>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 px-2 text-[10px]"
                  onClick={() => setIsEditing(true)}
                >
                  수정
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleDelete}
                  isLoading={isPending}
                  className="text-red-500/70 hover:text-red-600 h-7 px-2 text-[10px]"
                >
                  삭제
                </Button>
              </>
            )}
            {isEditing && (
              <>
                <Button 
                  variant="primary" 
                  size="sm" 
                  className="h-7 px-2 text-[10px]"
                  onClick={handleUpdate}
                  isLoading={isPending}
                  disabled={editTitle.length > MAX_TITLE || editContent.length > MAX_CONTENT}
                >
                  저장
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 px-2 text-[10px]"
                  onClick={handleCancel}
                  disabled={isPending}
                >
                  취소
                </Button>
              </>
            )}
          </div>
        </header>

        {/* Post Content */}
        <div className="px-4 py-4 text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
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
      
      <div className="pt-4 border-b border-border/20 last:border-0" />

      {/* Modals */}
      <UserProfileModal 
        userId={selectedUserId}
        onClose={() => setSelectedUserId(null)}
      />
    </article>
  );
}
