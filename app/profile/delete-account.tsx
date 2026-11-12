'use client';

import { deleteAccount } from '@/app/actions/profile';
import { Button } from '@/app/components/ui';
import { useTransition } from 'react';
import { useDialog } from '@/app/components/ui/dialog-provider';

/** 회원 탈퇴 구역. 프로필 화면에 남은 유일한 기능이다. */
export default function DeleteAccount() {
  const { alert, confirm } = useDialog();
  const [isDeleting, startDeleteTransition] = useTransition();

  const handleDeleteAccount = async () => {
    const ok = await confirm('정말로 회원 탈퇴를 하시겠습니까?\n작성하신 문의 글과 댓글은 유지되나 작성자 정보는 삭제(익명화)되어 더 이상 수정이나 삭제가 불가능합니다.', {
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
    <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-6">
      <h2 className="text-sm font-semibold text-red-500">회원 탈퇴</h2>
      <p className="text-xs text-muted mt-1 mb-4">
        회원 탈퇴 시 계정 정보는 즉시 삭제됩니다. 작성하신 문의 글과 댓글은 유지되나 작성자 정보가 제거되어 본인 확인 및 관리가 불가능해집니다.
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
  );
}
