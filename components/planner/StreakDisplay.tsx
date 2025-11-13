'use client';

import { useState, useEffect } from 'react';
import { ProgressStats, StudyPlan } from '../../lib/plannerTypes';
import { useLocale } from '../../context/LocaleContext';

interface StreakDisplayProps {
  stats: ProgressStats;
  plans: StudyPlan[];
}

export default function StreakDisplay({ stats, plans }: StreakDisplayProps) {
  const { locale, t } = useLocale();
  const [streakHistory, setStreakHistory] = useState<number[]>([]);

  useEffect(() => {
    // Генерируем историю серий для визуализации
    generateStreakHistory();
  }, [plans]);

  const generateStreakHistory = () => {
    // Создаем массив последних 30 дней для визуализации
    const today = new Date();
    const history: number[] = [];
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Проверяем, была ли активность в этот день
      const hasActivity = plans.some(plan => 
        plan.tasks.some(task => task.date === dateStr && task.completed)
      );
      
      history.push(hasActivity ? 1 : 0);
    }
    
    setStreakHistory(history);
  };

  const getStreakMessage = () => {
    if (stats.currentStreak === 0) {
      return {
        title: t('streakDisplay.messages.start.title'),
        message: t('streakDisplay.messages.start.message'),
        color: "text-gray-600 dark:text-gray-400"
      };
    } else if (stats.currentStreak === 1) {
      return {
        title: t('streakDisplay.messages.firstDay.title'),
        message: t('streakDisplay.messages.firstDay.message'),
        color: "text-orange-600 dark:text-orange-400"
      };
    } else if (stats.currentStreak < 7) {
      return {
        title: t('streakDisplay.messages.growing.title'),
        message: t('streakDisplay.messages.growing.message').replace('{days}', stats.currentStreak.toString()),
        color: "text-orange-600 dark:text-orange-400"
      };
    } else if (stats.currentStreak < 30) {
      return {
        title: t('streakDisplay.messages.strong.title'),
        message: t('streakDisplay.messages.strong.message').replace('{days}', stats.currentStreak.toString()),
        color: "text-green-600 dark:text-green-400"
      };
    } else {
      return {
        title: t('streakDisplay.messages.master.title'),
        message: t('streakDisplay.messages.master.message').replace('{days}', stats.currentStreak.toString()),
        color: "text-blue-600 dark:text-blue-400"
      };
    }
  };

  const getStreakIcon = () => {
    if (stats.currentStreak === 0) return "💤";
    if (stats.currentStreak < 7) return "🔥";
    if (stats.currentStreak < 30) return "⚡";
    return "🌟";
  };

  const streakMsg = getStreakMessage();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        {t('streakDisplay.title')}
      </h3>

      {/* Главная информация о серии */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-lg p-6 mb-6">
        <div className="text-center">
          <div className="text-4xl mb-2">{getStreakIcon()}</div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {stats.currentStreak}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {stats.currentStreak === 1 ? t('streakDisplay.daysSingular') : t('streakDisplay.daysPlural')}
          </div>
          <div className={`${streakMsg.color} font-medium`}>
            {streakMsg.title}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {streakMsg.message}
          </div>
        </div>
      </div>

      {/* Сравнение с лучшей серией */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {stats.currentStreak}
          </div>
          <div className="text-sm text-blue-600 dark:text-blue-400">{t('streakDisplay.currentStreak')}</div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {stats.longestStreak}
          </div>
          <div className="text-sm text-purple-600 dark:text-purple-400">{t('streakDisplay.longestStreak')}</div>
        </div>
      </div>

      {/* Визуализация последних 30 дней */}
      <div>
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          {t('streakDisplay.last30Days')}
        </div>
        <div className="flex space-x-1 mb-2">
          {streakHistory.map((day, index) => {
            const isToday = index === streakHistory.length - 1;
            return (
              <div
                key={index}
                className={`w-3 h-3 rounded-sm ${
                  day === 1 
                    ? 'bg-green-500' 
                    : 'bg-gray-200 dark:bg-gray-600'
                } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
                title={`День ${index + 1}`}
              />
            );
          })}
        </div>
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>30 дней назад</span>
          <span>Сегодня</span>
        </div>
      </div>

      {/* Мотивационные цели */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Цели серий
        </div>
        
        <div className="space-y-3">
          {[
            { days: 7, title: "Неделя дисциплины", reward: "🎯" },
            { days: 30, title: "Месяц постоянства", reward: "🏅" },
            { days: 100, title: "Сто дней мастерства", reward: "👑" },
            { days: 365, title: "Год преданности", reward: "🌟" }
          ].map((goal) => {
            const achieved = stats.longestStreak >= goal.days;
            const current = stats.currentStreak >= goal.days;
            
            return (
              <div key={goal.days} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-lg">
                    {achieved ? goal.reward : "🔒"}
                  </div>
                  <div>
                    <div className={`font-medium ${
                      achieved ? "text-green-600 dark:text-green-400" : "text-gray-600 dark:text-gray-400"
                    }`}>
                      {goal.title}
                    </div>
                    <div className="text-xs text-gray-500">
                      {goal.days} дней подряд
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  {achieved ? (
                    <div className="text-green-600 dark:text-green-400 text-sm font-medium">
                      ✓ Достигнуто
                    </div>
                  ) : (
                    <div className="text-gray-400 text-sm">
                      {stats.currentStreak}/{goal.days}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}