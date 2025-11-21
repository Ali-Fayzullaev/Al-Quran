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
      {/* Progress Bar Container */}
      <div className="relative w-full h-2 rounded-full overflow-hidden" style={{
        backgroundColor: 'var(--color-background-secondary)'
      }}>
        {/* Progress Fill */}
        <div 
          className={`h-full transition-all duration-500 ease-out rounded-full ${
            isCompleted ? 'animate-pulse' : ''
          }`}
          style={{
            width: `${progress}%`,
            backgroundColor: isCompleted 
              ? 'var(--color-success, #10b981)' 
              : 'var(--color-primary)',
            transform: 'translateZ(0)', // Force GPU acceleration
          }}
        />
        
        {/* Shimmer effect for active progress */}
        {!isCompleted && progress > 0 && (
          <div 
            className="absolute top-0 h-full w-8 -skew-x-12 animate-shimmer"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
              left: `${progress - 10}%`,
              animation: progress > 10 ? 'shimmer 2s infinite' : 'none'
            }}
          />
        )}
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
      
      {/* Completion Indicator */}
      {isCompleted && (
        <div className="flex items-center gap-1 mt-1 animate-bounce">
          <span className="text-green-500 text-sm">✓</span>
          <span className="text-xs font-medium text-green-600">
            Завершено!
          </span>
        </div>
      )}
    </div>
  );
};

export default DuaProgressBar;