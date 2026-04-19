import { getProfile } from '@/app/actions/profile';
import { redirect } from 'next/navigation';
import ProfileForm from './profile-form';

export default async function ProfilePage() {
  const profile = await getProfile();

  if (!profile) {
    redirect('/');
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">프로필 설정</h1>
          <p className="text-sm text-muted mt-1">
            닉네임과 자기소개를 설정하여 자신을 표현해보세요.
          </p>
        </div>

        <ProfileForm initialData={{
          nickname: profile.nickname,
          bio: profile.bio
        }} />
      </div>
    </div>
  );
}
