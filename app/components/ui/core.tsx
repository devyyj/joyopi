import React from 'react';

interface SectionHeaderProps {
  label?: string;
  title: string;
  description?: string;
  className?: string;
}

export const SectionHeader = ({ label, title, description, className = "" }: SectionHeaderProps) => (
  <header className={`space-y-4 ${className}`}>
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

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const buttonStyles = {
  base: "inline-flex items-center justify-center font-medium transition-colors duration-200 rounded-md disabled:opacity-50 disabled:pointer-events-none border cursor-pointer gap-2",
  variant: {
    primary: "bg-primary text-primary-foreground border-primary hover:opacity-90 shadow-sm",
    secondary: "bg-secondary text-secondary-foreground border-border hover:bg-border/50 shadow-sm",
    ghost: "border-transparent text-muted hover:text-foreground hover:bg-secondary",
    outline: "border-border bg-transparent hover:bg-secondary text-foreground shadow-sm"
  },
  size: {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  }
};

export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isLoading = false,
  className = "", 
  disabled,
  ...props 
}: ButtonProps) => {
  return (
    <button 
      className={`${buttonStyles.base} ${buttonStyles.variant[variant]} ${buttonStyles.size[size]} ${className}`} 
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
};

export const Card = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-card border border-border rounded-md shadow-sm ${className}`}>
    {children}
  </div>
);
