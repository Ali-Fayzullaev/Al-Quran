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
    <div className="fixed top-20 right-4 z-40 animate-slide-in-bottom">
      <div 
        className="p-3 rounded-xl shadow-lg border-l-4 max-w-sm"
        style={{
          backgroundColor: 'var(--color-background)',
          borderColor: remainingCount === 1 ? 'var(--color-success, #10b981)' : 'var(--color-warning, #f59e0b)',
          border: '1px solid var(--color-border)'
        }}
      >
        <div className="flex items-center gap-2">
          {remainingCount === 1 ? (
            <Trophy className="w-5 h-5 text-yellow-500 animate-bounce" />
          ) : (
            <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
          )}
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
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