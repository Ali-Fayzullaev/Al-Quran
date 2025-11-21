"use client";

import React from 'react';
import { Flame, Target, Trophy } from 'lucide-react';

interface MiniProgressToastProps {
  remainingCount: number;
  totalCount: number;
  isVisible: boolean;
}

const MiniProgressToast: React.FC<MiniProgressToastProps> = ({ 
  remainingCount, 
  totalCount, 
  isVisible 
}) => {
  if (!isVisible || remainingCount === 0) return null;

  const getMessage = () => {
    if (remainingCount === 1) {
      return "🎯 Последнее дуа! Вы почти у цели!";
    }
    if (remainingCount <= 3) {
      return `🔥 Осталось всего ${remainingCount} дуа до завершения!`;
    }
    return null;
  };

  const message = getMessage();
  if (!message) return null;

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 md:left-auto md:right-4 md:transform-none z-40 animate-slide-in-bottom">
      <div 
        className="p-3 md:p-4 rounded-xl shadow-lg border-l-4 max-w-xs md:max-w-sm mx-2"
        style={{
          backgroundColor: 'var(--color-background)',
          borderLeftColor: remainingCount === 1 ? 'var(--color-success, #10b981)' : 'var(--color-warning, #f59e0b)',
          borderStyle: 'solid',
          borderWidth: '1px',
          borderColor: 'var(--color-border)'
        }}
      >
        <div className="flex items-center gap-2">
          {remainingCount === 1 ? (
            <Trophy className="w-4 h-4 md:w-5 md:h-5 text-yellow-500" />
          ) : (
            <Flame className="w-4 h-4 md:w-5 md:h-5 text-orange-500" />
          )}
          <div>
            <p className="text-xs md:text-sm font-medium leading-tight" style={{ color: 'var(--color-text)' }}>
              {message}
            </p>
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              {totalCount - remainingCount}/{totalCount} завершено
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiniProgressToast;