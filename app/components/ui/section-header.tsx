import React from "react";
import { cn } from "@/utils/cn";

export interface SectionHeaderProps {
  label?: string;
  title: string;
  description?: string;
  className?: string;
}

export const SectionHeader = ({
  label,
  title,
  description,
  className,
}: SectionHeaderProps) => (
  <header className={cn("space-y-4", className)}>
    {label && (
      <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-secondary border border-border">
        <span className="text-xs font-medium text-muted">
          {label}
        </span>
      </div>
    )}
    <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
      {title}
    </h1>
    {description && (
      <p className="text-base text-muted max-w-2xl leading-relaxed">
        {description}
      </p>
    )}
  </header>
);


