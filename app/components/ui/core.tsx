import React from 'react';
import Image from 'next/image';

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

export const Modal = ({ isOpen, onClose, children, title }: { 
  isOpen: boolean; 
  onClose: () => void; 
  children: React.ReactNode;
  title?: string;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
      />
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card border border-border rounded-lg shadow-xl animate-in fade-in zoom-in duration-200">
        <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm border-b border-border px-4 py-3 flex justify-between items-center">
          <h3 className="text-sm font-bold truncate">{title}</h3>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-secondary rounded-md text-muted-foreground transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message,
  confirmText = "확인",
  cancelText,
  variant = "primary"
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void; 
  title: string; 
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "primary" | "danger";
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-6 py-2">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {message}
        </p>
        <div className="flex justify-end gap-2">
          {cancelText && (
            <Button variant="outline" size="sm" onClick={onClose}>
              {cancelText}
            </Button>
          )}
          <Button 
            variant={variant === "danger" ? "primary" : "primary"} // 현재 primary가 가장 강조됨
            className={variant === "danger" ? "bg-red-600 border-red-600 hover:bg-red-700 text-white" : ""}
            size="sm" 
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export const UserAvatar = ({ 
  url, 
  name, 
  size = "md", 
  onClick,
  className = ""
}: { 
  url?: string | null; 
  name: string; 
  size?: "sm" | "md" | "lg" | "xl";
  onClick?: () => void;
  className?: string;
}) => {
  const [hasError, setHasError] = React.useState(false);
  
  const sizeClasses = {
    sm: "w-6 h-6 text-[10px]", // 24px
    md: "w-8 h-8 text-xs",     // 32px
    lg: "w-10 h-10 text-sm",    // 40px
    xl: "w-20 h-20 text-2xl"    // 80px
  };

  const showFallback = !url || hasError;

  const content = (
    <div className={`
      relative ${sizeClasses[size]} rounded-full overflow-hidden shrink-0 border border-border/50 shadow-sm
      ${showFallback ? 'bg-primary/10 text-primary flex items-center justify-center font-bold' : ''}
      ${className}
    `}>
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
        <div className="w-full h-full flex items-center justify-center bg-primary/5 uppercase">
          {name[0]}
        </div>
      )}
    </div>
  );

  if (onClick) {
    return (
      <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClick(); }} className="hover:opacity-80 transition-opacity cursor-pointer block">
        {content}
      </button>
    );
  }

  return content;
};

export const UserNickname = ({ 
  name, 
  onClick, 
  className = "", 
  size = "md" 
}: { 
  name: string; 
  onClick: () => void; 
  className?: string;
  size?: "sm" | "md" | "lg";
}) => {
  const sizeClasses = {
    sm: "text-[12px]", // 11px -> 12px
    md: "text-[14px]", // 13px -> 14px
    lg: "text-base"
  };

  return (
    <button 
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      className={`
        font-bold text-foreground hover:text-primary transition-colors cursor-pointer
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {name}
    </button>
  );
};
