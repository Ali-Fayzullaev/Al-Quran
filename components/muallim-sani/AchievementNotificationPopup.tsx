'use client';

import React from 'react';
import { AchievementNotification } from '@/types/muallim-sani';
import { Award, Star } from 'lucide-react';

interface AchievementNotificationPopupProps {
  notification: AchievementNotification;
  onClose: () => void;
}

const AchievementNotificationPopup: React.FC<AchievementNotificationPopupProps> = ({
  notification,
  onClose
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 transform animate-slideIn"
        style={{ 
          borderTop: `4px solid ${notification.achievement.color}`,
        }}
      >
        {/* Иконка достижения */}
        <div className="text-center mb-6">
          <div 
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl"
            style={{ backgroundColor: `${notification.achievement.color}20` }}
          >
            <Award className="w-10 h-10" style={{ color: notification.achievement.color }} />
          </div>
          
          <h3 className="text-2xl font-bold mb-2" style={{ color: notification.achievement.color }}>
            🎉 {notification.achievement.name}
          </h3>
          
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {notification.achievement.description}
          </p>
        </div>

        {/* Похвала */}
        <div className="text-center mb-6 p-4 rounded-lg bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20">
          <p className="text-lg font-medium text-amber-800 dark:text-amber-200">
            {notification.praise}
          </p>
        </div>

        {/* Баллы */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Star className="w-6 h-6 text-yellow-500 fill-current" />
            <span className="text-xl font-bold text-yellow-600">
              +{notification.points} баллов
            </span>
            <Star className="w-6 h-6 text-yellow-500 fill-current" />
          </div>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Продолжайте в том же духе!
          </p>

          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg font-medium transition-colors"
            style={{ 
              backgroundColor: notification.achievement.color,
              color: 'white'
            }}
          >
            Продолжить
          </button>
        </div>
      </div>

      {/* CSS анимации */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateY(-100px) scale(0.8);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
        
        .animate-slideIn {
          animation: slideIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AchievementNotificationPopup;