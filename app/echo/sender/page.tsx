'use client';

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/app/components/ui/core';
import { RealtimeChannel } from '@supabase/supabase-js';
import Link from 'next/link';

export default function SenderPage() {
  const [remainingTime, setRemainingTime] = useState(0);
  const [connectedUsers, setConnectedUsers] = useState<number>(0);
  const [speakerCount, setSpeakerCount] = useState<number>(0);
  
  const isPlaying = remainingTime > 0;
  
  const supabase = useMemo(() => createClient(), []);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // 실시간 채널 설정
  useEffect(() => {
    const channel = supabase.channel('echo-room', {
      config: {
        presence: {
          key: 'sender',
        },
      },
    });

    interface PresenceState {
      [key: string]: { role: string; joinedAt: string }[];
    }

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState() as unknown as PresenceState;
        const users = Object.values(state).flat().length;
        const speakers = state.speaker ? state.speaker.length : 0;
        setConnectedUsers(users);
        setSpeakerCount(speakers);
      })
      .on('broadcast', { event: 'ECHO_SYNC' }, ({ payload }) => {
        setRemainingTime(payload.remainingTime);
      })
      .on('broadcast', { event: 'ECHO_STOP' }, () => {
        setRemainingTime(0);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ role: 'sender', joinedAt: new Date().toISOString() });
        }
      });

    channelRef.current = channel;

    const handleLeave = () => {
      if (channelRef.current) {
        channelRef.current.untrack();
        channelRef.current.unsubscribe();
      }
    };

    window.addEventListener('pagehide', handleLeave);

    return () => {
      window.removeEventListener('pagehide', handleLeave);
      handleLeave();
    };
  }, [supabase]);

  const handleSendEcho = useCallback(() => {
    // 1. 낙관적 업데이트: 로컬 타이머를 즉시 연장
    setRemainingTime((prev) => prev + 60);

    // 2. 스피커에게 신호 전송
    channelRef.current?.send({
      type: 'broadcast',
      event: 'ECHO_REQUEST',
      payload: { senderId: 'me' },
    });
  }, []);

  const handleStopEcho = useCallback(() => {
    channelRef.current?.send({
      type: 'broadcast',
      event: 'ECHO_STOP',
      payload: { triggeredBy: 'sender' },
    });
    setRemainingTime(0);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] p-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-2">
          <div className="inline-block px-3 py-1 rounded-full bg-secondary text-xs font-medium border border-border">
            🔘 샌더 모드
          </div>
          <div className="text-sm text-muted">
            접속 중인 사용자: {connectedUsers}명 (스피커: {speakerCount}명)
          </div>
        </div>

        <div className="relative py-12">
          <div className={`text-7xl font-mono font-bold tracking-tighter ${isPlaying ? 'text-primary animate-pulse' : 'text-muted'}`}>
            {formatTime(remainingTime)}
          </div>
          {isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center -z-10">
              <div className="w-48 h-48 bg-primary/10 rounded-full animate-ping" />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4">
          <Button 
            size="lg" 
            className="h-20 text-xl font-bold" 
            onClick={handleSendEcho}
            disabled={speakerCount === 0}
          >
            {speakerCount > 0 ? '메아리 보내기 (+1분)' : '스피커가 없습니다'}
          </Button>
          
          <Button 
            variant="outline" 
            size="lg" 
            className="h-14 text-destructive border-destructive/20 hover:bg-destructive/10"
            onClick={handleStopEcho}
            disabled={remainingTime === 0}
          >
            즉시 중지
          </Button>
        </div>

        <div className="pt-8">
          <Link href="/echo">
            <Button variant="ghost" size="sm">
              나가기
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
