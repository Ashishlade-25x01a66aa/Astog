import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  ...props
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center rounded-lg border font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'border-transparent text-white bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:opacity-90 hover:shadow-[0_0_20px_rgba(124,58,237,0.45)] focus:ring-purple-500',
    gradient: 'border-transparent text-white bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:opacity-90 hover:shadow-[0_0_25px_rgba(124,58,237,0.6)] focus:ring-purple-500',
    secondary: 'border-card-border text-foreground hover:bg-card-bg hover:border-purple-500/50 hover:shadow-[0_0_15px_rgba(124,58,237,0.2)] focus:ring-purple-500',
    danger: 'border-red-500/40 text-red-400 hover:bg-red-500/10 hover:shadow-[0_0_15px_rgba(239,68,68,0.5)] focus:ring-red-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
