'use client';

import { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Card } from '@/app/components/ui/core';
import Link from 'next/link';

export default function EchoLandingPage() {
  const [counts, setCounts] = useState({ total: 0, speaker: 0, sender: 0 });
  const supabase = useMemo(() => createClient(), []);

  const presenceId = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const saved = sessionStorage.getItem('echo-presence-id');
    if (saved) return saved;
    const id = crypto.randomUUID();
    sessionStorage.setItem('echo-presence-id', id);
    return id;
  }, []);

  useEffect(() => {
    if (!presenceId) return;

    const channel = supabase.channel('echo-room', {
      config: {
        presence: {
          key: presenceId,
        },
      },
    });

    interface EchoPresence {
      role: string;
      joinedAt: string;
    }

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const userIds = Object.keys(state);
        
        setCounts({
          total: userIds.length,
          speaker: userIds.filter(id => 
            (state[id] as unknown as EchoPresence[]).some(p => p.role === 'speaker')
          ).length,
          sender: userIds.filter(id => 
            (state[id] as unknown as EchoPresence[]).some(p => p.role === 'sender')
          ).length,
        });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ 
            role: 'landing', 
            joinedAt: new Date().toISOString() 
          });
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [supabase, presenceId]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] p-4">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">메아리에 참여하세요</h1>
        <p className="text-sm text-muted">
          현재 {counts.total}명이 접속 중입니다. 
          {counts.speaker > 0 && ` (스피커: ${counts.speaker}명, 샌더: ${counts.sender}명)`}
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
        <Link href="/echo/speaker" className="contents">
          <Card className="p-8 flex flex-col items-center gap-4 cursor-pointer hover:border-primary transition-colors">
            <div className="text-4xl">🔊</div>
            <h2 className="text-xl font-semibold">스피커로 참여</h2>
            <p className="text-sm text-center text-muted">
              샌더들의 요청을 받아<br />소리를 재생합니다.
            </p>
          </Card>
        </Link>
        <Link href="/echo/sender" className="contents">
          <Card className="p-8 flex flex-col items-center gap-4 cursor-pointer hover:border-primary transition-colors">
            <div className="text-4xl">🔘</div>
            <h2 className="text-xl font-semibold">샌더로 참여</h2>
            <p className="text-sm text-center text-muted">
              스피커에게 신호를 보내<br />시간을 연장시킵니다.
            </p>
          </Card>
        </Link>
      </div>
    </div>
  );
}
