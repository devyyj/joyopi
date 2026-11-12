import { getProfile } from '@/app/actions/profile';
import { redirect } from 'next/navigation';
import DeleteAccount from './delete-account';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const profile = await getProfile();

  if (!profile) {
    redirect('/');
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">내 계정</h1>
          <p className="text-sm text-muted mt-1">
            문의 게시판에는 <strong className="text-foreground">{profile.nickname}</strong>(으)로 표시됩니다. 가입할 때 무작위로 정해진 이름이며 실명은 받지 않습니다.
          </p>
        </div>

        <DeleteAccount />
      </div>
    </div>
  );
}
