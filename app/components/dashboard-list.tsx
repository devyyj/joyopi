'use client';

import { useState } from 'react';
import PostDetailModal from './post-detail-modal';

interface DashboardItem {
  id: number;
  title: string;
  authorName: string;
  createdAt: Date;
  count?: number;
}

interface DashboardListProps {
  title: string;
  icon: string;
  items: DashboardItem[];
  type: 'recent' | 'like' | 'comment';
  currentUserId?: string;
  currentUserName?: string;
}

export default function DashboardList({ 
  title, 
  icon, 
  items, 
  type,
  currentUserId,
  currentUserName
}: DashboardListProps) {
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center gap-2 border-b border-border pb-2">
          <span className="text-lg">{icon}</span>
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
                    {(type === 'like' || type === 'comment') && item.count !== undefined && (
                      <span className="bg-secondary px-1.5 py-0.5 rounded-sm font-bold text-primary">
                        {item.count}
                      </span>
                    )}
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
