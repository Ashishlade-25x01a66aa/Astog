import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-card-bg border border-card-border rounded-xl p-6 shadow-lg overflow-hidden transition-all duration-300 ${
        onClick ? 'cursor-pointer hover:border-astog-green hover:shadow-[0_0_20px_var(--color-astog-green-glow)]' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}
