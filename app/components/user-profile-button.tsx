import Link from 'next/link';
import Image from 'next/image';
import { getProfile } from '@/app/actions/profile';

const UserProfileButton = async () => {
  const profile = await getProfile();

  if (!profile) return null;

  return (
    <Link 
      href="/profile" 
      className="text-xs font-medium text-muted hover:text-foreground transition-colors flex items-center gap-2"
    >
      <div className="relative w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-xs text-primary overflow-hidden border border-border/50">
        {profile.avatarUrl ? (
          <Image 
            src={profile.avatarUrl} 
            alt={profile.nickname} 
            fill
            className="object-cover" 
            sizes="32px"
          />
        ) : (
          profile.nickname[0]
        )}
      </div>
      {profile.nickname}
    </Link>
  );
};

export default UserProfileButton;
