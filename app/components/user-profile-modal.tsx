'use client';

import { useState, useEffect } from 'react';
import { getPublicProfile } from '@/app/actions/profile';
import { Modal, Card } from './ui/core';

interface PublicProfile {
  nickname: string;
  bio: string | null;
  createdAt: Date;
}

interface UserProfileModalProps {
  userId: string | null;
  onClose: () => void;
}

export default function UserProfileModal({ userId, onClose }: UserProfileModalProps) {
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    async function fetchProfile() {
      if (!userId) {
        setProfile(null);
        return;
      }

      setLoading(true);
      try {
        const data = await getPublicProfile(userId);
        if (!isCancelled) {
          setProfile(data as PublicProfile | null);
        }
      } catch (error) {
        console.error('Failed to fetch public profile:', error);
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    fetchProfile();
    return () => { isCancelled = true; };
  }, [userId]);

  return (
    <Modal 
      isOpen={!!userId} 
      onClose={onClose} 
      title="사용자 정보"
    >
      {loading ? (
        <div className="py-12 text-center text-muted-foreground animate-pulse text-xs">
          정보를 불러오고 있습니다...
        </div>
      ) : profile ? (
        <div className="space-y-4 py-2">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary border border-primary/20">
              {profile.nickname.substring(0, 1)}
            </div>
            <div>
              <h4 className="text-base font-bold text-foreground">{profile.nickname}</h4>
              <p className="text-[10px] text-muted-foreground">
                가입일: <span suppressHydrationWarning>{new Date(profile.createdAt).toLocaleDateString()}</span>
              </p>
            </div>
          </div>
          
          <Card className="p-3 bg-secondary/10 border-border/40">
            <p className="text-xs leading-relaxed text-foreground/80 whitespace-pre-wrap">
              {profile.bio || "등록된 자기소개가 없습니다."}
            </p>
          </Card>
        </div>
      ) : (
        <div className="py-6 text-center text-red-500 text-xs">
          사용자 정보를 찾을 수 없습니다.
        </div>
      )}
    </Modal>
  );
}
