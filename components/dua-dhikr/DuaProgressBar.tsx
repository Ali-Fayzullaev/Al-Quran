"use client";

import React from 'react';
import { calculateProgress } from '@/lib/duaCounter';

interface DuaProgressBarProps {
  current: number;
  target: number;
  className?: string;
}

const DuaProgressBar: React.FC<DuaProgressBarProps> = ({ 
  current, 
  target, 
  className = "" 
}) => {
  const progress = calculateProgress(current, target);
  const isCompleted = current >= target;

  return (
    <div className={`w-full ${className}`}>
      {/* Progress Bar Container - Mobile Optimized */}
      <div className="relative w-full h-2 rounded-full overflow-hidden" style={{
        backgroundColor: 'var(--color-background-secondary)'
      }}>
        {/* Progress Fill - Simplified animation for mobile */}
        <div 
          className="h-full transition-all duration-300 md:duration-500 ease-out rounded-full"
          style={{
            width: `${progress}%`,
            backgroundColor: isCompleted 
              ? 'var(--color-success, #10b981)' 
              : 'var(--color-primary)'
          }}
        />
      </div>
      
      {/* Progress Text */}
      <div className="flex justify-between items-center mt-1">
        <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
          {current} из {target}
        </span>
        <span className="text-xs font-bold" style={{ 
          color: isCompleted ? 'var(--color-success, #10b981)' : 'var(--color-primary)' 
        }}>
          {progress}%
        </span>
      </div>
    </div>
  );
};

export default DuaProgressBar;