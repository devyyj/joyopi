'use client';

import { updateProfile, deleteAccount } from '@/app/actions/profile';
import { Button } from '@/app/components/ui/core';
import { useActionState, useTransition, useState } from 'react';
import { useDialog } from '@/app/components/ui/dialog-provider';

interface ProfileFormProps {
  initialData: {
    nickname: string;
    bio: string | null;
  };
}

const MAX_NICKNAME = 10;
const MAX_BIO = 100;

export default function ProfileForm({ initialData }: ProfileFormProps) {
  const { alert, confirm } = useDialog();
  const [nickname, setNickname] = useState(initialData.nickname);
  const [bio, setBio] = useState(initialData.bio || '');

  const [state, action, isPending] = useActionState(async (_prevState: unknown, formData: FormData) => {
    try {
      await updateProfile(formData);
      alert('프로필이 성공적으로 저장되었습니다.');
      return { success: true, error: null };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '알 수 없는 에러가 발생했습니다.' 
      };
    }
  }, { success: false, error: null });

  const [isDeleting, startDeleteTransition] = useTransition();

  const handleDeleteAccount = async () => {
    const ok = await confirm('정말로 회원 탈퇴를 하시겠습니까?\n작성하신 게시글과 댓글은 유지되나 작성자 정보는 삭제(익명화)되어 더 이상 수정이나 삭제가 불가능합니다.', {
      variant: 'danger',
      confirmText: '탈퇴하기'
    });

    if (ok) {
      startDeleteTransition(async () => {
        try {
          await deleteAccount();
        } catch (error) {
          // NEXT_REDIRECT 에러는 정상적인 흐름이므로 무시합니다.
          if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
            return;
          }
          alert(error instanceof Error ? error.message : '알 수 없는 에러가 발생했습니다.');
        }
      });
    }
  };

  return (
    <div className="space-y-8">
      <form action={action} className="space-y-6">
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
              자기소개
            </label>
            <span className={`text-[10px] ${bio.length > MAX_BIO ? 'text-red-500 font-bold' : 'text-muted'}`}>
              {bio.length} / {MAX_BIO}
            </span>
          </div>
          <textarea
            id="bio"
            name="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={MAX_BIO}
            rows={4}
            className="w-full px-3 py-2 bg-secondary border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            placeholder="자신을 한 줄로 소개해보세요."
          />
        </div>

        {state.error && (
          <p className="text-xs text-red-500 font-medium">{state.error}</p>
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
