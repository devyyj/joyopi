import { cn } from "@/utils/cn";

export interface UserAvatarProps {
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

/** 닉네임 첫 글자를 보여 주는 원형 표시. 프로필 사진은 받지 않는다. */
export const UserAvatar = ({
  name,
  size = "md",
  className = "",
}: UserAvatarProps) => {
  const sizeClasses = {
    sm: "w-6 h-6 text-[10px]",
    md: "w-8 h-8 text-xs",
    lg: "w-10 h-10 text-sm",
    xl: "w-20 h-20 text-2xl",
  };

  return (
    <div
      className={cn(
        "rounded-full shrink-0 border border-border/50 shadow-sm bg-primary/10 text-primary flex items-center justify-center font-bold uppercase tracking-wider",
        sizeClasses[size],
        className
      )}
    >
      {name[0]}
    </div>
  );
};

export interface UserNicknameProps {
  name: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const UserNickname = ({
  name,
  className = "",
  size = "md",
}: UserNicknameProps) => {
  const sizeClasses = {
    sm: "text-[12px]",
    md: "text-[14px]",
    lg: "text-base",
  };

  return (
    <span className={cn("font-bold text-foreground px-0.5", sizeClasses[size], className)}>
      {name}
    </span>
  );
};
