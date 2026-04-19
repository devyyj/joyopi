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
      <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-xs text-primary overflow-hidden border border-border/50">
        {profile.avatarUrl ? (
          <img src={profile.avatarUrl} alt={profile.nickname} className="w-full h-full object-cover" />
        ) : (
          profile.nickname[0]
        )}
      </div>
      {profile.nickname}
    </Link>
  );
};

export default UserProfileButton;
