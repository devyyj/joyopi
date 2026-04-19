'use client';

import { useState, useEffect } from 'react';
import { getPostDetail } from '@/app/actions/board';
import { Modal, Card, UserNickname } from './ui/core';
import LikeButton from '@/app/board/components/like-button';
import CommentSection from '@/app/board/components/comment-section';
import UserProfileModal from './user-profile-modal';
import { useDialog } from './ui/dialog-provider';

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

interface PostWithDetails {
  id: number;
  title: string;
  content: string;
  authorId: string | null;
  authorName: string;
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

    async function fetchDetail() {
      if (!postId) {
        setPostData(null);
        return;
      }

      setLoading(true);
      try {
        const data = await getPostDetail(postId);
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
    }

    fetchDetail();
    return () => { isCancelled = true; };
  }, [postId]);

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
              <header className="bg-secondary/30 px-4 py-2 border-b border-border/50">
                <div className="flex items-center gap-2 text-[11px] text-muted">
                  <UserNickname 
                    name={postData.authorName}
                    size="lg"
                    onClick={() => {
                      if (postData.authorId) {
                        setSelectedUserId(postData.authorId);
                      } else {
                        alert('탈퇴하거나 정보가 없는 사용자입니다.');
                      }
                    }}
                  />
                  <span>·</span>
                  <span suppressHydrationWarning>
                    {new Date(postData.createdAt).toLocaleDateString()} {new Date(postData.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </header>
              <div className="px-4 py-4 text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                {postData.content}
              </div>
              <div className="px-4 py-2 bg-secondary/10 border-t border-border/40">
                <LikeButton 
                  postId={postData.id} 
                  initialLiked={postData.isLiked} 
                  likeCount={postData.likeCount} 
                />
              </div>
            </Card>

            <CommentSection 
              postId={postData.id} 
              comments={postData.comments} 
              currentUserId={currentUserId}
              currentUserName={currentUserName}
              onNicknameClick={(uid) => setSelectedUserId(uid)}
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
