'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/app/components/ui/core';
import { RealtimeChannel } from '@supabase/supabase-js';
import Link from 'next/link';

export default function SpeakerPage() {
  const [remainingTime, setRemainingTime] = useState(0);
  const [connectedUsers, setConnectedUsers] = useState<number>(0);
  const [speakerCount, setSpeakerCount] = useState<number>(0);
  
  const isPlaying = remainingTime > 0;
  
  const supabase = useMemo(() => createClient(), []);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 사운드 초기화 및 클린업
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('/footsteps.mp3');
      audioRef.current.loop = true;
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // 오디오 재생 및 타이머 동기화 로직
  useEffect(() => {
    if (isPlaying) {
      audioRef.current?.play().catch(console.error);
    } else {
      audioRef.current?.pause();
      if (audioRef.current) audioRef.current.currentTime = 0;
    }

    if (isPlaying && !timerRef.current) {
      timerRef.current = setInterval(() => {
        setRemainingTime((prev) => {
          const next = Math.max(0, prev - 1);
          channelRef.current?.send({
            type: 'broadcast',
            event: 'ECHO_SYNC',
            payload: { remainingTime: next },
          });
          return next;
        });
      }, 1000);
    } else if (!isPlaying && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [isPlaying]);

  const presenceId = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const saved = sessionStorage.getItem('echo-presence-id');
    if (saved) return saved;
    const id = crypto.randomUUID();
    sessionStorage.setItem('echo-presence-id', id);
    return id;
  }, []);

  // 실시간 채널 설정
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
        
        setConnectedUsers(userIds.length);
        setSpeakerCount(userIds.filter(id => 
          (state[id] as unknown as EchoPresence[]).some(p => p.role === 'speaker')
        ).length);
      })
      .on('broadcast', { event: 'ECHO_REQUEST' }, () => {
        setRemainingTime((prev) => prev + 60);
      })
      .on('broadcast', { event: 'ECHO_STOP' }, () => {
        setRemainingTime(0);
        audioRef.current?.pause();
        if (audioRef.current) audioRef.current.currentTime = 0;
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ 
            role: 'speaker', 
            joinedAt: new Date().toISOString() 
          });
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
  }, [supabase, presenceId]);

  const handleStopEcho = () => {
    channelRef.current?.send({
      type: 'broadcast',
      event: 'ECHO_STOP',
      payload: { triggeredBy: 'speaker' },
    });
    setRemainingTime(0);
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.currentTime = 0;
  };

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
            📢 스피커 모드
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
