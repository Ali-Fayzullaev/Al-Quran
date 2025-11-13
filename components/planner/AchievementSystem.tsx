'use client';

import { useState, useEffect } from 'react';
import { Achievement, ProgressStats } from '../../lib/plannerTypes';
import { MotivationSystem } from '../../lib/motivationSystem';
import { useLocale } from '../../context/LocaleContext';

interface AchievementSystemProps {
  stats: ProgressStats;
  onAchievementUnlock?: (achievement: Achievement) => void;
}

export default function AchievementSystem({ stats, onAchievementUnlock }: AchievementSystemProps) {
  const { locale, t } = useLocale();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [showDetails, setShowDetails] = useState<string | null>(null);

  useEffect(() => {
    // Проверяем новые достижения
    const newlyUnlocked = MotivationSystem.checkAchievements(stats);
    
    // Уведомляем о новых достижениях
    newlyUnlocked.forEach(achievement => {
      onAchievementUnlock?.(achievement);
    });

    // Получаем все достижения
    const allAchievements = MotivationSystem.getAllAchievements();
    setAchievements(allAchievements);
  }, [stats, onAchievementUnlock]);

  const unlockedAchievements = achievements.filter(a => a.unlockedAt);
  const lockedAchievements = achievements.filter(a => !a.unlockedAt);

  const getProgressForAchievement = (achievement: Achievement): number => {
    switch (achievement.type) {
      case 'streak':
        if (achievement.requirements.streak) {
          return Math.min(100, (stats.currentStreak / achievement.requirements.streak) * 100);
        }
        break;
      case 'completion':
        if (achievement.requirements.plansCompleted) {
          return Math.min(100, (stats.completedPlans / achievement.requirements.plansCompleted) * 100);
        }
        break;
      case 'milestone':
        if (achievement.requirements.ayahsRead) {
          return Math.min(100, (stats.totalAyahsRead / achievement.requirements.ayahsRead) * 100);
        }
        break;
      case 'consistency':
        if (achievement.requirements.daysConsistent) {
          return Math.min(100, (stats.currentStreak / achievement.requirements.daysConsistent) * 100);
        }
        break;
    }
    return 0;
  };

  const getRequirementText = (achievement: Achievement): string => {
    switch (achievement.type) {
      case 'streak':
        return `${achievement.requirements.streak} ${t('achievementSystem.requirements.streakDays')}`;
      case 'completion':
        return `${achievement.requirements.plansCompleted} ${t('achievementSystem.requirements.completedPlans')}`;
      case 'milestone':
        return `${achievement.requirements.ayahsRead} ${t('achievementSystem.requirements.ayahsRead')}`;
      case 'consistency':
        return `${achievement.requirements.daysConsistent} ${t('achievementSystem.requirements.daysConsistent')}`;
      default:
        return '';
    }
  };

  const getCurrentProgress = (achievement: Achievement): string => {
    switch (achievement.type) {
      case 'streak':
        return `${stats.currentStreak}/${achievement.requirements.streak}`;
      case 'completion':
        return `${stats.completedPlans}/${achievement.requirements.plansCompleted}`;
      case 'milestone':
        return `${stats.totalAyahsRead}/${achievement.requirements.ayahsRead}`;
      case 'consistency':
        return `${stats.currentStreak}/${achievement.requirements.daysConsistent}`;
      default:
        return '';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t('achievementSystem.title')}
        </h3>
        <div className="text-sm text-gray-500">
          {unlockedAchievements.length}/{achievements.length} {t('achievementSystem.unlockedCount')}
        </div>
      </div>

      {/* Прогресс к следующему достижению */}
      {(() => {
        const nextProgress = MotivationSystem.getNextAchievementProgress(stats);
        if (nextProgress) {
          return (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-2xl">{nextProgress.achievement.icon}</span>
                <div>
                  <div className="font-medium text-blue-800 dark:text-blue-200">
                    {t('achievementSystem.nextAchievement')}
                  </div>
                  <div className="text-sm text-blue-600 dark:text-blue-300">
                    {nextProgress.achievement.title}
                  </div>
                </div>
              </div>
              <div className="mb-2">
                <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${nextProgress.progress}%` }}
                  />
                </div>
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-300">
                Осталось: {nextProgress.remaining} • Прогресс: {nextProgress.progress.toFixed(1)}%
              </div>
            </div>
          );
        }
        return null;
      })()}

      {/* Разблокированные достижения */}
      {unlockedAchievements.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">
            🏆 {t('achievementSystem.unlockedAchievements')} ({unlockedAchievements.length})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {unlockedAchievements.map((achievement) => (
              <div 
                key={achievement.id}
                className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                onClick={() => setShowDetails(showDetails === achievement.id ? null : achievement.id)}
              >
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">{achievement.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-green-800 dark:text-green-200 truncate">
                      {achievement.title}
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-300">
                      {achievement.unlockedAt && 
                        new Date(achievement.unlockedAt).toLocaleDateString('ru-RU')
                      }
                    </div>
                  </div>
                </div>
                
                {showDetails === achievement.id && (
                  <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-700">
                    <p className="text-sm text-green-700 dark:text-green-300">
                      {achievement.description}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Заблокированные достижения */}
      {lockedAchievements.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">
            🔒 {t('achievementSystem.lockedAchievements')} ({lockedAchievements.length})
          </h4>
          <div className="space-y-3">
            {lockedAchievements
              .sort((a, b) => getProgressForAchievement(b) - getProgressForAchievement(a))
              .map((achievement) => {
                const progress = getProgressForAchievement(achievement);
                return (
                  <div 
                    key={achievement.id}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                    onClick={() => setShowDetails(showDetails === achievement.id ? null : achievement.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl opacity-50">{achievement.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {achievement.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {getCurrentProgress(achievement)}
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {getRequirementText(achievement)}
                        </div>
                        
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mb-2">
                          <div 
                            className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        
                        <div className="text-xs text-gray-500">
                          {progress.toFixed(1)}% {t('achievementSystem.progress')}
                        </div>
                      </div>
                    </div>
                    
                    {showDetails === achievement.id && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {achievement.description}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Мотивационное сообщение */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4">
          <div className="text-center">
            <div className="text-2xl mb-2">💎</div>
            <div className="font-medium text-purple-800 dark:text-purple-200 mb-1">
              Факт о Коране
            </div>
            <div className="text-sm text-purple-700 dark:text-purple-300">
              {MotivationSystem.getQuranFact()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Компонент уведомления о новом достижении
interface AchievementNotificationProps {
  achievement: Achievement;
  onClose: () => void;
}

export function AchievementNotification({ achievement, onClose }: AchievementNotificationProps) {
  const { t } = useLocale();
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className="bg-white dark:bg-gray-800 border border-green-200 dark:border-green-700 rounded-lg shadow-lg p-6 max-w-sm">
        <div className="flex items-start space-x-3">
          <span className="text-3xl">{achievement.icon}</span>
          <div className="flex-1">
            <div className="font-semibold text-green-800 dark:text-green-200 mb-1">
              🎉 {t('achievementSystem.congratulations')}
            </div>
            <div className="font-medium text-gray-900 dark:text-white mb-1">
              {achievement.title}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {achievement.description}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}