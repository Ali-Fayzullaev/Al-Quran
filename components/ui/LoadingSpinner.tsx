'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  text = 'Загрузка...', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      <div className="relative">
        <Loader2 
          className={`${sizeClasses[size]} animate-spin`}
          style={{ color: 'var(--color-primary)' }}
        />
        <div 
          className="absolute inset-0 rounded-full animate-ping opacity-20"
          style={{ backgroundColor: 'var(--color-primary)' }}
        />
      </div>
      
      {text && (
        <p 
          className={`${textSizeClasses[size]} font-medium animate-pulse`}
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;