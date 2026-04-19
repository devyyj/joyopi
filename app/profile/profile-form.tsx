'use client';

import { updateProfile, deleteAccount } from '@/app/actions/profile';
import { Button } from '@/app/components/ui/core';
import { useActionState, useTransition, useState } from 'react';
import { useDialog } from '@/app/components/ui/dialog-provider';
import { ActionResult } from '@/app/actions/board';

interface ProfileFormProps {
  initialData: {
    nickname: string;
    bio: string | null;
    avatarUrl: string | null;
  };
}

const MAX_NICKNAME = 10;
const MAX_BIO = 100;
const AVATAR_SIZE = 300;

export default function ProfileForm({ initialData }: ProfileFormProps) {
  const { alert, confirm } = useDialog();
  const [nickname, setNickname] = useState(initialData.nickname);
  const [bio, setBio] = useState(initialData.bio || '');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialData.avatarUrl);
  const [avatarBlob, setAvatarBlob] = useState<Blob | null>(null);

  const [state, action, isPending] = useActionState(async (_prevState: ActionResult | null, formData: FormData) => {
    if (avatarBlob) {
      formData.set('avatar', avatarBlob, 'avatar.webp');
    }
    const result = await updateProfile(formData);
    if (result.success) {
      alert('프로필이 성공적으로 저장되었습니다.');
      setAvatarBlob(null);
    }
    return result;
  }, { success: false });

  const [isDeleting, startDeleteTransition] = useTransition();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB 이하여야 합니다.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > AVATAR_SIZE) {
            height *= AVATAR_SIZE / width;
            width = AVATAR_SIZE;
          }
        } else {
          if (height > AVATAR_SIZE) {
            width *= AVATAR_SIZE / height;
            height = AVATAR_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (blob) {
            setAvatarBlob(blob);
            setAvatarPreview(URL.createObjectURL(blob));
          }
        }, 'image/webp', 0.8);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteAccount = async () => {
    const ok = await confirm('정말로 회원 탈퇴를 하시겠습니까?\n작성하신 게시글과 댓글은 유지되나 작성자 정보는 삭제(익명화)되어 더 이상 수정이나 삭제가 불가능합니다.', {
      variant: 'danger',
      confirmText: '탈퇴하기'
    });

    if (ok) {
      startDeleteTransition(async () => {
        const result = await deleteAccount();
        if (!result.success) {
          alert(result.message || '회원 탈퇴 중 오류가 발생했습니다.');
        }
      });
    }
  };

  return (
    <div className="space-y-8">
      <form action={action} className="space-y-6">
        <div className="flex flex-col items-center space-y-4 pb-4">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-secondary border-2 border-border group-hover:border-primary transition-colors shadow-sm">
              {avatarPreview ? (
                <img src={avatarPreview} alt="프로필" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </div>
            <label 
              htmlFor="avatar" 
              className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-opacity text-xs font-medium"
            >
              변경
            </label>
            <input
              id="avatar"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
          <p className="text-[10px] text-muted text-center">
            이미지는 300x300 크기로 자동 조정되어 저장됩니다.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <label htmlFor="nickname" className="text-sm font-medium">
              닉네임
            </label>
            <span className={`text-[10px] ${nickname.length > MAX_NICKNAME ? 'text-red-500 font-bold' : 'text-muted'}`}>
              {nickname.length} / {MAX_NICKNAME}
            </span>
          </div>
          <input
            id="nickname"
            name="nickname"
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={MAX_NICKNAME}
            required
            className="w-full px-3 py-2 bg-secondary border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <label htmlFor="bio" className="text-sm font-medium">
              한줄 자기소개
            </label>
            <span className={`text-[10px] ${bio.length > MAX_BIO ? 'text-red-500 font-bold' : 'text-muted'}`}>
              {bio.length} / {MAX_BIO}
            </span>
          </div>
          <input
            id="bio"
            name="bio"
            type="text"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={MAX_BIO}
            className="w-full px-3 py-2 bg-secondary border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="자신을 한 줄로 소개해보세요."
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.preventDefault(); // 엔터 키 입력 방지 (폼 제출 방지는 아님)
            }}
          />
        </div>

        {state.message && (
          <p className={`text-xs ${state.success ? 'text-green-500' : 'text-red-500'} font-medium`}>
            {state.message}
          </p>
        )}

        <div className="flex justify-end">
          <Button 
            type="submit" 
            isLoading={isPending}
            disabled={nickname.length > MAX_NICKNAME || bio.length > MAX_BIO}
          >
            저장하기
          </Button>
        </div>
      </form>

      <div className="pt-8 border-t border-border">
        <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-6">
          <h2 className="text-sm font-semibold text-red-500">위험 구역</h2>
          <p className="text-xs text-muted mt-1 mb-4">
            회원 탈퇴 시 프로필 정보는 즉시 삭제됩니다. 작성하신 게시글과 댓글은 유지되나 작성자 정보가 제거되어 본인 확인 및 관리가 불가능해집니다.
          </p>
          <Button 
            type="button"
            variant="outline" 
            onClick={handleDeleteAccount}
            isLoading={isDeleting}
            className="text-red-500 border-red-500/20 hover:bg-red-500/10 hover:text-red-600"
          >
            회원 탈퇴
          </Button>
        </div>
      </div>
    </div>
  );
}
