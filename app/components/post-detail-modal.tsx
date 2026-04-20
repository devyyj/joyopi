'use client';

import { useState, useEffect } from 'react';
import { Modal } from './ui/core';
import PostItem from '@/app/board/components/post-item';
import { getPostDetail, PostWithDetails } from '@/app/actions/board';

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
          setPostData(data);
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

  const refreshData = async () => {
    if (!postId) return;
    try {
      const data = await getPostDetail(postId);
      setPostData(data);
    } catch (error) {
      console.error('Failed to refresh post details:', error);
    }
  };

  return (
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
        <div className="pt-2">
          <PostItem 
            item={postData} 
            currentUserId={currentUserId} 
            currentUserName={currentUserName} 
            onSuccess={refreshData}
          />
        </div>
      ) : (
        <div className="py-10 text-center text-red-500 text-sm font-medium">
          게시글을 찾을 수 없습니다.
        </div>
      )}
    </Modal>
  );
}
