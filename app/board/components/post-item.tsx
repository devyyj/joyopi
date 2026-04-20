'use client';

import { useState, useTransition } from 'react';
import { Card, UserNickname, UserAvatar } from '@/app/components/ui/core';
import LikeButton from './like-button';
import CommentSection from './comment-section';
import SafeImage from './safe-image';
import ImageViewer from './image-viewer';
import UserProfileModal from '@/app/components/user-profile-modal';
import { deletePost, updatePost, PostWithDetails } from '@/app/actions/board';
import { useDialog } from '@/app/components/ui/dialog-provider';

interface PostItemProps {
  item: PostWithDetails;
  currentUserId?: string;
  currentUserName?: string;
  onSuccess?: () => void;
}

const MAX_TITLE = 50;
const MAX_CONTENT = 5000;

export default function PostItem({ item, currentUserId, onSuccess }: PostItemProps) {
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [editTitle, setEditTitle] = useState(item.title);
  const [editContent, setEditContent] = useState(item.content);
  
  // 이미지 뷰어 상태
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  // 편집 시 이미지 상태 관리
  const [removedImageIds, setRemovedImageIds] = useState<number[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<{ id: string; url: string; blob: Blob }[]>([]);

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const { alert, confirm } = useDialog();

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

    startTransition(async () => {
      setIsEditing(false);

      const formData = new FormData();
      formData.append('title', trimmedTitle);
      formData.append('content', trimmedContent);
      
      removedImageIds.forEach(id => formData.append('removedImageIds', id.toString()));
      newImagePreviews.forEach(item => {
        formData.append('images', item.blob, `image-${item.id}.webp`);
      });

      const result = await updatePost(item.id, formData);
      
      if (!result.success) {
        setIsEditing(true);
        alert(result.message || '수정 중 오류가 발생했습니다.');
      } else {
        setRemovedImageIds([]);
        newImagePreviews.forEach(img => URL.revokeObjectURL(img.url));
        setNewImagePreviews([]);
        onSuccess?.();
      }
    });
  };

  const handleCancel = () => {
    setEditTitle(item.title);
    setEditContent(item.content);
    setRemovedImageIds([]);
    newImagePreviews.forEach(img => URL.revokeObjectURL(img.url));
    setNewImagePreviews([]);
    setIsEditing(false);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const currentTotal = item.images.length - removedImageIds.length + newImagePreviews.length;
    if (currentTotal + files.length > 10) {
      alert('사진은 최대 10장까지 가능합니다.');
      return;
    }

    const processFile = (file: File): Promise<{ id: string; url: string; blob: Blob }> => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_SIZE = 1200;
            let width = img.width;
            let height = img.height;
            if (width > height) { if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; } }
            else { if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; } }
            canvas.width = width; canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);
            canvas.toBlob((blob) => {
              if (blob) resolve({ id: crypto.randomUUID(), url: URL.createObjectURL(blob), blob });
            }, 'image/webp', 0.8);
          };
          img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
      });
    };

    const newProcessedImages = await Promise.all(files.map(processFile));
    setNewImagePreviews(prev => [...prev, ...newProcessedImages]);
    e.target.value = '';
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
        {/* Identity Bar (Top) */}
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

          <div className="flex gap-1.5 shrink-0 items-center">
            {item.isAuthor && !isEditing && (
              <>
                <button onClick={() => setIsEditing(true)} className="text-[10px] text-muted-foreground hover:text-foreground px-0.5 transition-colors">수정</button>
                <button onClick={handleDelete} disabled={isPending} className="text-[10px] text-red-500/70 hover:text-red-600 px-0.5 disabled:opacity-50 transition-colors">삭제</button>
              </>
            )}
            {isEditing && (
              <>
                <button onClick={handleUpdate} disabled={isPending} className="text-[10px] text-primary font-bold hover:opacity-80 px-0.5 disabled:opacity-50 transition-opacity">저장</button>
                <button onClick={handleCancel} disabled={isPending} className="text-[10px] text-muted-foreground hover:text-foreground px-0.5 disabled:opacity-50 transition-colors">취소</button>
              </>
            )}
          </div>
        </div>

        {/* 1. Title */}
        <header className="px-4 pt-4 bg-card">
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
              {item.title}
            </h2>
          )}
        </header>

        {/* 2. Date */}
        {!isEditing && (
          <div className="px-4 py-2 flex items-center gap-1.5 text-[10px] text-muted-foreground/60 font-medium" suppressHydrationWarning>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-60">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            {formattedDate}
          </div>
        )}

        {/* 3. Photos (Images) */}
        {!isEditing && item.images && item.images.length > 0 && (
          <div className={`px-4 pb-4 mt-2 grid gap-1 ${
            item.images.length === 1 ? 'grid-cols-1' : 
            item.images.length === 2 ? 'grid-cols-2' : 
            'grid-cols-2 sm:grid-cols-3'
          }`}>
            {item.images.map((img, index) => (
              <button 
                key={img.id} 
                onClick={() => setViewerIndex(index)}
                className={`relative overflow-hidden rounded-md border border-border/40 hover:opacity-95 transition-opacity cursor-pointer ${
                  item.images.length === 1 ? 'aspect-[4/3] w-full' : 'aspect-square'
                }`}
              >
                <SafeImage src={img.url} alt="게시글 사진" />
              </button>
            ))}
          </div>
        )}

        {/* Editing Photos */}
        {isEditing && (
          <div className="px-4 py-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-medium text-muted">사진 관리 ({item.images.length - removedImageIds.length + newImagePreviews.length} / 10)</span>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {item.images.filter(img => !removedImageIds.includes(img.id)).map(img => (
                <div key={img.id} className="relative aspect-square rounded overflow-hidden border border-border group">
                  <SafeImage src={img.url} alt="기존" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setRemovedImageIds(prev => [...prev, img.id])} className="absolute top-0.5 right-0.5 p-0.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"></path></svg>
                  </button>
                </div>
              ))}
              {newImagePreviews.map(img => (
                <div key={img.id} className="relative aspect-square rounded overflow-hidden border border-primary/30 group">
                  <SafeImage src={img.url} alt="신규" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setNewImagePreviews(prev => prev.filter(i => i.id !== img.id))} className="absolute top-0.5 right-0.5 p-0.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"></path></svg>
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-primary/80 text-[7px] text-white text-center py-0.5 uppercase">NEW</div>
                </div>
              ))}
              {(item.images.length - removedImageIds.length + newImagePreviews.length) < 10 && (
                <label className="aspect-square flex flex-col items-center justify-center border border-dashed border-border rounded cursor-pointer hover:bg-secondary transition-colors">
                  <svg className="w-5 h-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              )}
            </div>
          </div>
        )}

        {/* 4. Body (Content) */}
        <div className="px-4 pb-5 pt-0 text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap border-b border-border/20">
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
            <div className="space-y-2 pt-2">
              <div className={isExpanded ? "" : "line-clamp-5"}>
                {item.content}
              </div>
              {!isExpanded && (item.content.length > 300 || item.content.split('\n').length > 5) && (
                <button onClick={() => setIsExpanded(true)} className="text-xs font-bold text-primary hover:underline transition-colors">더보기</button>
              )}
              {isExpanded && (
                <button onClick={() => setIsExpanded(false)} className="text-xs font-bold text-muted hover:text-foreground transition-colors">접기</button>
              )}
            </div>
          )}
        </div>

        {/* Like Button */}
        {!isEditing && (
          <div className="px-4 py-1.5 bg-secondary/10 border-t border-border/40">
            <LikeButton 
              postId={item.id} 
              initialLiked={item.isLiked} 
              likeCount={item.likeCount} 
              onSuccess={onSuccess}
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
            onNicknameClick={(uid) => setSelectedUserId(uid)}
            onSuccess={onSuccess}
          />
        </div>
      )}

      <div className="pt-2 border-b border-border/20 last:border-0" />

      {/* Modals */}
      <UserProfileModal userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
      
      {/* Image Viewer Lightbox */}
      {viewerIndex !== null && (
        <ImageViewer 
          images={item.images} 
          initialIndex={viewerIndex} 
          onClose={() => setViewerIndex(null)} 
        />
      )}
    </article>
  );
}
