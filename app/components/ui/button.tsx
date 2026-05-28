import React from "react";
import { cn } from "@/utils/cn";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 rounded-md disabled:opacity-50 disabled:pointer-events-none border cursor-pointer gap-2 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring";
    
    const variants = {
      primary: "bg-primary text-primary-foreground border-primary hover:opacity-90 active:scale-[0.98] shadow-sm",
      secondary: "bg-secondary text-secondary-foreground border-border hover:bg-border/30 active:scale-[0.98] shadow-sm",
      ghost: "border-transparent text-muted hover:text-foreground hover:bg-secondary",
      outline: "border-border bg-transparent hover:bg-secondary text-foreground active:scale-[0.98] shadow-sm",
      danger: "bg-red-600 border-red-600 text-white hover:bg-red-700 active:scale-[0.98] shadow-sm"
    };

    const sizes = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base"
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={isLoading || disabled}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin h-4 w-4 shrink-0" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";


