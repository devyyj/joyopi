'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button, Card } from '@/app/components/ui/core';
import { RealtimeChannel } from '@supabase/supabase-js';

type Role = 'speaker' | 'sender' | null;

export default function EchoPage() {
  const [role, setRole] = useState<Role>(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const [connectedUsers, setConnectedUsers] = useState<number>(0);
  const [speakerCount, setSpeakerCount] = useState<number>(0);
  
  // 파생 상태
  const isPlaying = remainingTime > 0;
  
  const supabase = createClient();
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

  // 오디오 재생 및 타이머 동기화 로직 (스피커 전용)
  useEffect(() => {
    if (role !== 'speaker') return;

    // 사운드 재생 제어
    if (remainingTime > 0) {
      audioRef.current?.play().catch(console.error);
    } else {
      audioRef.current?.pause();
      if (audioRef.current) audioRef.current.currentTime = 0;
    }

    // 타이머 설정
    if (remainingTime > 0 && !timerRef.current) {
      timerRef.current = setInterval(() => {
        setRemainingTime((prev) => {
          const next = Math.max(0, prev - 1);
          // 모든 사용자에게 남은 시간 동기화
          channelRef.current?.send({
            type: 'broadcast',
            event: 'ECHO_SYNC',
            payload: { remainingTime: next },
          });
          return next;
        });
      }, 1000);
    } else if (remainingTime === 0 && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, remainingTime > 0]);

  // 실시간 채널 설정
  useEffect(() => {
    if (!role) return;

    const channel = supabase.channel('echo-room', {
      config: {
        presence: {
          key: role,
        },
      },
    });

    interface PresenceState {
      [key: string]: { role: Role; joinedAt: string }[];
    }

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState() as unknown as PresenceState;
        const users = Object.keys(state).length;
        const speakers = state.speaker ? state.speaker.length : 0;
        setConnectedUsers(users);
        setSpeakerCount(speakers);
      })
      .on('broadcast', { event: 'ECHO_REQUEST' }, () => {
        if (role === 'speaker') {
          setRemainingTime((prev) => prev + 60);
        }
      })
      .on('broadcast', { event: 'ECHO_SYNC' }, ({ payload }) => {
        if (role === 'sender') {
          setRemainingTime(payload.remainingTime);
        }
      })
      .on('broadcast', { event: 'ECHO_STOP' }, () => {
        setRemainingTime(0);
        if (role === 'speaker') {
          audioRef.current?.pause();
          if (audioRef.current) audioRef.current.currentTime = 0;
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ role, joinedAt: new Date().toISOString() });
        }
      });

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  }, [role, supabase]);

  const handleSendEcho = useCallback(() => {
    if (role === 'sender') {
      // 1. 낙관적 업데이트: 로컬 타이머를 즉시 연장
      setRemainingTime((prev) => prev + 60);

      // 2. 스피커에게 신호 전송
      channelRef.current?.send({
        type: 'broadcast',
        event: 'ECHO_REQUEST',
        payload: { senderId: 'me' },
      });
    }
  }, [role]);

  const handleStopEcho = useCallback(() => {
    // 1. 다른 참여자들에게 중지 알림 전송
    channelRef.current?.send({
      type: 'broadcast',
      event: 'ECHO_STOP',
      payload: { triggeredBy: role },
    });

    // 2. 본인의 로컬 상태도 즉시 초기화 (브로트캐스트는 본인에게 오지 않음)
    setRemainingTime(0);
    if (role === 'speaker') {
      audioRef.current?.pause();
      if (audioRef.current) audioRef.current.currentTime = 0;
    }
  }, [role]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!role) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] p-4">
        <h1 className="text-2xl font-bold mb-8">메아리에 참여하세요</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
          <div onClick={() => setRole('speaker')} className="contents">
            <Card className="p-8 flex flex-col items-center gap-4 cursor-pointer hover:border-primary transition-colors">
              <div className="text-4xl">🔊</div>
              <h2 className="text-xl font-semibold">스피커로 참여</h2>
              <p className="text-sm text-center text-muted">
                샌더들의 요청을 받아<br />소리를 재생합니다.
              </p>
            </Card>
          </div>
          <div onClick={() => setRole('sender')} className="contents">
            <Card className="p-8 flex flex-col items-center gap-4 cursor-pointer hover:border-primary transition-colors">
              <div className="text-4xl">🔘</div>
              <h2 className="text-xl font-semibold">샌더로 참여</h2>
              <p className="text-sm text-center text-muted">
                스피커에게 신호를 보내<br />시간을 연장시킵니다.
              </p>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] p-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-2">
          <div className="inline-block px-3 py-1 rounded-full bg-secondary text-xs font-medium border border-border">
            {role === 'speaker' ? '📢 스피커 모드' : '🔘 샌더 모드'}
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
          {role === 'sender' && (
            <Button 
              size="lg" 
              className="h-20 text-xl font-bold" 
              onClick={handleSendEcho}
              disabled={speakerCount === 0}
            >
              {speakerCount > 0 ? '메아리 보내기 (+1분)' : '스피커가 없습니다'}
            </Button>
          )}
          
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
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              setRole(null);
              setRemainingTime(0);
            }}
          >
            역할 다시 선택하기
          </Button>
        </div>
      </div>
    </div>
  );
}
