"use client";

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Trophy, Star, Sparkles, X } from 'lucide-react';

interface CompletionNotificationProps {
  isVisible: boolean;
  message: string;
  type: 'dua' | 'category';
  onClose: () => void;
  duration?: number;
}

const CompletionNotification: React.FC<CompletionNotificationProps> = ({
  isVisible,
  message,
  type,
  onClose,
  duration = 5000
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const getIcon = () => {
    if (type === 'category') {
      return <Trophy className="w-8 h-8 text-yellow-500" />;
    }
    return <Check className="w-6 h-6 text-green-500" />;
  };

  const getBackgroundColor = () => {
    if (type === 'category') {
      return 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)';
    }
    return 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div 
        className={`
          relative max-w-md w-full rounded-2xl shadow-2xl p-6 text-white text-center
          transform transition-all duration-500 ease-out
          ${isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
        `}
        style={{
          background: getBackgroundColor(),
        }}
      >
        {/* Close Button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 text-white hover:bg-white hover:bg-opacity-20"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>

        {/* Decorative Elements */}
        <div className="absolute -top-2 -left-2 text-yellow-300 animate-spin">
          <Sparkles className="w-6 h-6" />
        </div>
        <div className="absolute -top-1 -right-3 text-yellow-200 animate-pulse">
          <Star className="w-5 h-5" />
        </div>
        <div className="absolute -bottom-2 -left-1 text-yellow-200 animate-bounce">
          <Star className="w-4 h-4" />
        </div>

        {/* Main Icon */}
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-white bg-opacity-20 rounded-full animate-pulse">
            {getIcon()}
          </div>
        </div>

        {/* Message */}
        <div className="mb-6">
          <p className="text-lg font-bold mb-2">
            {message}
          </p>
          <p className="text-sm opacity-90">
            {type === 'category' 
              ? 'Машаллах! Вы завершили всю категорию дуа!' 
              : 'Баракаллаху фикум за ваше усердие!'
            }
          </p>
        </div>

        {/* Action Button */}
        <Button
          onClick={onClose}
          className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white border border-white border-opacity-30"
        >
          Продолжить
        </Button>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-white bg-opacity-30 rounded-b-2xl overflow-hidden">
          <div 
            className="h-full bg-white transition-all duration-300 ease-linear"
            style={{
              width: isVisible ? '0%' : '100%',
              animation: isVisible ? `shrink ${duration}ms linear` : 'none'
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default CompletionNotification;