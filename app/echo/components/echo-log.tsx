'use client';

import { useEffect, useRef } from 'react';
import { Card } from '@/app/components/ui';

export interface LogEntry {
  id: string;
  timestamp: Date;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  userId?: string;
}

interface EchoLogProps {
  logs: LogEntry[];
  currentUserId?: string;
}

export function EchoLog({ logs, currentUserId }: EchoLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <Card className="w-full max-w-2xl mt-8 bg-black/5 dark:bg-white/5 border-none">
      <div className="p-3 border-b border-border/50 flex justify-between items-center">
        <div className="flex flex-col gap-0.5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">실시간 이벤트 로그</h3>
          {currentUserId && (
            <div className="text-[10px] text-primary/70 font-mono">
              내 ID: <span className="font-bold">{currentUserId.slice(0, 8)}...</span>
            </div>
          )}
        </div>
        <span className="text-[10px] text-muted">{logs.length}개의 이벤트</span>
      </div>
      <div 
        ref={scrollRef}
        className="h-48 overflow-y-auto p-3 space-y-1 font-mono text-[11px] leading-relaxed"
      >
        {logs.length === 0 ? (
          <div className="text-muted italic text-center py-4">대기 중...</div>
        ) : (
          logs.map((log) => {
            const isMe = currentUserId && log.userId === currentUserId;
            return (
              <div key={log.id} className={`flex gap-2 ${isMe ? 'bg-primary/5 -mx-1 px-1 rounded' : ''}`}>
                <span className="text-muted shrink-0">
                  [{log.timestamp.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]
                </span>
                <span className={
                  log.type === 'success' ? 'text-green-500' :
                  log.type === 'warning' ? 'text-yellow-500' :
                  log.type === 'error' ? 'text-red-500' :
                  'text-foreground'
                }>
                  {log.userId && (
                    <span className={`mr-1 ${isMe ? 'text-primary font-bold' : 'text-primary/60'}`}>
                      [{log.userId.slice(0, 4)}]
                    </span>
                  )}
                  {log.message}
                </span>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
