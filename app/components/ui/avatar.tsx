"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/utils/cn";

export interface UserAvatarProps {
  url?: string | null;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  onClick?: () => void;
  className?: string;
}

export const UserAvatar = ({
  url,
  name,
  size = "md",
  onClick,
  className = "",
}: UserAvatarProps) => {
  const [hasError, setHasError] = React.useState(false);

  const sizeClasses = {
    sm: "w-6 h-6 text-[10px]",
    md: "w-8 h-8 text-xs",
    lg: "w-10 h-10 text-sm",
    xl: "w-20 h-20 text-2xl",
  };

  const showFallback = !url || hasError;

  const content = (
    <div
      className={cn(
        "relative rounded-full overflow-hidden shrink-0 border border-border/50 shadow-sm transition-all duration-300 hover:scale-105",
        sizeClasses[size],
        showFallback ? "bg-primary/10 text-primary flex items-center justify-center font-bold" : "",
        className
      )}
    >
      {!showFallback ? (
        <Image
          src={url!}
          alt={name}
          fill
          className="object-cover"
          onError={() => setHasError(true)}
          sizes="(max-width: 80px) 100vw, 80px"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-primary/5 uppercase font-bold tracking-wider">
          {name[0]}
        </div>
      )}
    </div>
  );

  if (onClick) {
    return (
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClick();
        }}
        className="hover:opacity-90 transition-opacity cursor-pointer block focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring rounded-full"
      >
        {content}
      </button>
    );
  }

  return content;
};

export interface UserNicknameProps {
  name: string;
  onClick: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const UserNickname = ({
  name,
  onClick,
  className = "",
  size = "md",
}: UserNicknameProps) => {
  const sizeClasses = {
    sm: "text-[12px]",
    md: "text-[14px]",
    lg: "text-base",
  };

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        "font-bold text-foreground hover:text-primary transition-colors cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring rounded-sm px-0.5",
        sizeClasses[size],
        className
      )}
    >
      {name}
    </button>
  );
};


