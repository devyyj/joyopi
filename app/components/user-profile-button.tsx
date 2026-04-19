import Link from 'next/link';
import { getProfile } from '@/app/actions/profile';

const UserProfileButton = async () => {
  const profile = await getProfile();

  if (!profile) return null;

  return (
    <Link 
      href="/profile" 
      className="text-xs font-medium text-muted hover:text-foreground transition-colors flex items-center gap-2"
    >
      <div className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center text-[10px] text-primary">
        {profile.nickname[0]}
      </div>
      {profile.nickname}
    </Link>
  );
};

export default UserProfileButton;
