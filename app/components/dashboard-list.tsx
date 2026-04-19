'use client';

import { useState } from 'react';
import PostDetailModal from './post-detail-modal';

export interface DashboardItem {
  id: number;
  title: string;
  authorName: string;
  createdAt: Date;
  likeCount?: number;
  commentCount?: number;
}

interface DashboardListProps {
  title: string;
  icon: React.ReactNode;
  items: DashboardItem[];
  type: 'recent' | 'like' | 'comment';
  currentUserId?: string;
  currentUserName?: string;
}

export default function DashboardList({ 
  title, 
  icon, 
  items, 
  currentUserId,
  currentUserName
}: DashboardListProps) {
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center gap-2 border-b border-border pb-2">
          <div>{icon}</div>
          <h2 className="text-sm font-bold uppercase tracking-wider">{title}</h2>
        </div>
        <div className="divide-y divide-border/40">
          {items.length > 0 ? (
            items.map((item) => (
              <button 
                key={item.id} 
                onClick={() => setSelectedPostId(item.id)}
                className="group w-full text-left py-2 hover:bg-secondary/20 transition-colors"
              >
                <div className="flex flex-col gap-0.5">
                  <h3 className="text-[13px] font-semibold text-foreground group-hover:text-primary truncate">
                    {item.title}
                  </h3>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-foreground/70">{item.authorName}</span>
                      <span>·</span>
                      <span suppressHydrationWarning>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.likeCount !== undefined && item.likeCount > 0 && (
                        <div className="flex items-center gap-0.5 text-red-400">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                          </svg>
                          <span className="font-bold">{item.likeCount}</span>
                        </div>
                      )}
                      {item.commentCount !== undefined && item.commentCount > 0 && (
                        <div className="flex items-center gap-0.5 text-primary">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                          </svg>
                          <span className="font-bold">{item.commentCount}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))
          ) : (
            <p className="py-4 text-[11px] text-muted text-center italic">표시할 내용이 없습니다.</p>
          )}
        </div>
      </div>

      <PostDetailModal 
        postId={selectedPostId} 
        onClose={() => setSelectedPostId(null)}
        currentUserId={currentUserId}
        currentUserName={currentUserName}
      />
    </>
  );
}
