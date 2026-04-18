import React from 'react';

interface SectionHeaderProps {
  label: string;
  title: string;
  description?: string;
  className?: string;
}

export const SectionHeader = ({ label, title, description, className = "" }: SectionHeaderProps) => (
  <header className={`space-y-4 ${className}`}>
    <div className="inline-flex items-center px-3 py-1 rounded-full bg-slate-200/50 border border-slate-200">
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
        {label}
      </span>
    </div>
    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
      {title}
    </h1>
    {description && (
      <p className="text-base md:text-lg font-medium text-slate-400 max-w-lg leading-relaxed">
        {description}
      </p>
    )}
  </header>
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export const buttonStyles = {
  base: "inline-flex items-center justify-center font-bold transition-all active:scale-95 rounded-xl",
  variant: {
    primary: "bg-indigo-500 text-white hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-100",
    secondary: "bg-slate-100 text-slate-600 hover:bg-slate-200",
    ghost: "text-slate-400 hover:text-indigo-500",
    outline: "border-2 border-slate-100 text-slate-600 hover:border-indigo-100 hover:text-indigo-500"
  },
  size: {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base"
  }
};

export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = "", 
  ...props 
}: ButtonProps) => {
  return (
    <button 
      className={`${buttonStyles.base} ${buttonStyles.variant[variant]} ${buttonStyles.size[size]} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};
