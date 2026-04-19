'use client';

import { updateProfile, deleteAccount } from '@/app/actions/profile';
import { Button } from '@/app/components/ui/core';
import { useActionState, useTransition } from 'react';

interface ProfileFormProps {
  initialData: {
    nickname: string;
    bio: string | null;
  };
}

export default function ProfileForm({ initialData }: ProfileFormProps) {
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

  const handleDeleteAccount = () => {
    if (window.confirm('정말로 회원 탈퇴를 하시겠습니까?\n모든 데이터가 삭제되며 복구할 수 없습니다.')) {
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
          <label htmlFor="nickname" className="text-sm font-medium">
            닉네임
          </label>
          <input
            id="nickname"
            name="nickname"
            type="text"
            defaultValue={initialData.nickname}
            required
            className="w-full px-3 py-2 bg-secondary border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="bio" className="text-sm font-medium">
            자기소개
          </label>
          <textarea
            id="bio"
            name="bio"
            defaultValue={initialData.bio || ''}
            rows={4}
            className="w-full px-3 py-2 bg-secondary border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            placeholder="자신을 한 줄로 소개해보세요."
          />
        </div>

        {state.error && (
          <p className="text-xs text-red-500 font-medium">{state.error}</p>
        )}

        <div className="flex justify-end">
          <Button type="submit" isLoading={isPending}>
            저장하기
          </Button>
        </div>
      </form>

      <div className="pt-8 border-t border-border">
        <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-6">
          <h2 className="text-sm font-semibold text-red-500">위험 구역</h2>
          <p className="text-xs text-muted mt-1 mb-4">
            회원 탈퇴 시 모든 게시글과 정보가 삭제되며 복구할 수 없습니다.
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
