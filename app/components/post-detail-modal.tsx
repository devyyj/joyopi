'use client';

import { useState, useEffect } from 'react';
import { getPostDetail } from '@/app/actions/board';
import { Modal, Card, UserNickname, UserAvatar } from './ui/core';
import LikeButton from '@/app/board/components/like-button';
import CommentSection from '@/app/board/components/comment-section';
import UserProfileModal from './user-profile-modal';
import { useDialog } from './ui/dialog-provider';

interface CommentWithLikes {
  id: number;
  postId: number;
  authorId: string | null;
  authorName: string;
  author?: { avatarUrl: string | null } | null;
  content: string;
  createdAt: Date;
  likeCount: number;
  isLiked: boolean;
}

interface PostWithDetails {
  id: number;
  title: string;
  content: string;
  authorId: string | null;
  authorName: string;
  author?: { avatarUrl: string | null } | null;
  createdAt: Date;
  updatedAt: Date;
  comments: CommentWithLikes[];
  likeCount: number;
  isLiked: boolean;
  isAuthor: boolean;
}

interface PostDetailModalProps {
  postId: number | null;
  onClose: () => void;
  currentUserId?: string;
  currentUserName?: string;
}

export default function PostDetailModal({ 
  postId, 
  onClose, 
  currentUserId,
  currentUserName 
}: PostDetailModalProps) {
  const [postData, setPostData] = useState<PostWithDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const { alert } = useDialog();

  useEffect(() => {
    let isCancelled = false;

    const loadData = async (id: number | null) => {
      if (!id) {
        setPostData(null);
        return;
      }

      setLoading(true);
      try {
        const data = await getPostDetail(id);
        if (!isCancelled) {
          setPostData(data as unknown as PostWithDetails);
        }
      } catch (error) {
        console.error('Failed to fetch post details:', error);
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    loadData(postId);

    return () => { isCancelled = true; };
  }, [postId]);

  const handleDataChange = async () => {
    if (postId) {
      try {
        const data = await getPostDetail(postId);
        setPostData(data as unknown as PostWithDetails);
      } catch (error) {
        console.error('Failed to refresh post details:', error);
      }
    }
  };

  return (
    <>
      <Modal 
        isOpen={!!postId} 
        onClose={onClose} 
        title={postData?.title || '게시글 상세'}
      >
        {loading ? (
          <div className="py-20 text-center text-muted-foreground animate-pulse text-sm">
            데이터를 불러오는 중입니다...
          </div>
        ) : postData ? (
          <div className="space-y-4">
            <Card className="p-0 overflow-hidden shadow-none border-border/40">
              {/* 1. Identity Bar (Avatar + ID) */}
              <div className="px-4 py-2.5 bg-secondary/40 border-b border-border/40 flex items-center gap-3">
                <UserAvatar 
                  url={postData.author?.avatarUrl} 
                  name={postData.authorName} 
                  size="md" 
                  onClick={() => {
                    if (postData.authorId) {
                      setSelectedUserId(postData.authorId);
                    } else {
                      alert('탈퇴하거나 정보가 없는 사용자입니다.');
                    }
                  }}
                />
                <UserNickname 
                  name={postData.authorName}
                  size="md"
                  onClick={() => {
                    if (postData.authorId) {
                      setSelectedUserId(postData.authorId);
                    } else {
                      alert('탈퇴하거나 정보가 없는 사용자입니다.');
                    }
                  }}
                  className="hover:text-primary transition-colors"
                />
              </div>

              {/* 2. Content Info (Title) */}
              <header className="px-4 py-4 bg-card">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground leading-tight tracking-tight">
                  {postData.title}
                </h2>
              </header>
              
              <div className="px-4 pb-6 pt-0 text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap border-b border-border/20">
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/50 font-medium mb-4" suppressHydrationWarning>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-60">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  {new Date(postData.createdAt).toLocaleDateString()} {new Date(postData.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                {postData.content}
              </div>
              <div className="px-4 py-2 bg-secondary/10 border-t border-border/40">
                <LikeButton 
                  postId={postData.id} 
                  initialLiked={postData.isLiked} 
                  likeCount={postData.likeCount} 
                  onSuccess={handleDataChange}
                />
              </div>
            </Card>

            <CommentSection 
              postId={postData.id} 
              comments={postData.comments} 
              currentUserId={currentUserId}
              currentUserName={currentUserName}
              onNicknameClick={(uid) => setSelectedUserId(uid)}
              onSuccess={handleDataChange}
            />
          </div>
        ) : (
          <div className="py-10 text-center text-red-500 text-sm font-medium">
            게시글을 찾을 수 없습니다.
          </div>
        )}
      </Modal>

      <UserProfileModal 
        userId={selectedUserId}
        onClose={() => setSelectedUserId(null)}
      />
    </>
  );
}
