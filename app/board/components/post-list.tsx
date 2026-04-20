'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getPaginatedPosts, PostWithDetails } from '@/app/actions/board';
import PostItem from './post-item';

interface PostListProps {
  initialPosts: PostWithDetails[];
  currentUserId?: string;
  currentUserName?: string;
}

const PAGE_SIZE = 10;

export default function PostList({ 
  initialPosts, 
  currentUserId, 
  currentUserName 
}: PostListProps) {
  const [posts, setPosts] = useState<PostWithDetails[]>(initialPosts);
  const [prevInitialPosts, setPrevInitialPosts] = useState<PostWithDetails[]>(initialPosts);
  const [offset, setOffset] = useState(PAGE_SIZE);
  const [hasMore, setHasMore] = useState(initialPosts.length === PAGE_SIZE);
  const [isLoading, setIsLoading] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  // 렌더링 도중 프롭 변경 감지 및 상태 갱신 (Key 패턴의 대안)
  if (initialPosts !== prevInitialPosts) {
    setPosts((prev) => {
      // 1. 새로운 초기 데이터(initialPosts)를 맵으로 변환
      const initialMap = new Map(initialPosts.map(p => [p.id, p]));
      
      // 2. 기존 목록 중 초기 데이터에 포함된 것은 업데이트, 나머지는 유지
      const updatedPosts = prev.map(p => initialMap.get(p.id) || p);
      
      // 3. 초기 데이터 중 기존 목록에 없던 게시글(새 글) 필터링
      const prevIds = new Set(prev.map(p => p.id));
      const newPosts = initialPosts.filter(p => !prevIds.has(p.id));
      
      // 4. 새 글은 앞에 추가, 나머지는 업데이트된 상태로 유지
      return [...newPosts, ...updatedPosts];
    });
    setPrevInitialPosts(initialPosts);
    // 오프셋과 더보기 여부는 초기화하지 않음 (기존 무한 스크롤 상태 유지)
  }

  const loadMorePosts = useCallback(async () => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    try {
      const newPosts = await getPaginatedPosts(offset, PAGE_SIZE);
      
      setPosts((prev) => [...prev, ...newPosts]);
      setOffset((prev) => prev + PAGE_SIZE);
      
      if (newPosts.length < PAGE_SIZE) {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Failed to load more posts:', error);
    } finally {
      setIsLoading(false);
    }
  }, [offset, isLoading, hasMore]);

  useEffect(() => {
    const target = observerTarget.current;
    if (!target || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading) {
          void loadMorePosts();
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [loadMorePosts, hasMore, isLoading]);

  return (
    <div className="space-y-4">
      {posts.map((item) => (
        <PostItem 
          key={item.id} 
          item={item} 
          currentUserId={currentUserId} 
          currentUserName={currentUserName}
        />
      ))}

      {/* Trigger Area */}
      {hasMore && (
        <div 
          ref={observerTarget} 
          className="py-10 flex justify-center items-center"
        >
          {isLoading && (
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">불러오는 중...</p>
            </div>
          )}
        </div>
      )}

      {!hasMore && posts.length > 0 && (
        <div className="py-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/30 border border-border/40">
            <div className="w-1 h-1 rounded-full bg-primary/40" />
            <p className="text-[10px] text-muted font-bold uppercase tracking-wider">모든 소식을 확인했습니다</p>
            <div className="w-1 h-1 rounded-full bg-primary/40" />
          </div>
        </div>
      )}
    </div>
  );
}
