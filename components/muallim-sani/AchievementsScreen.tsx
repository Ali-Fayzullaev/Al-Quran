'use client';

import React from 'react';
import { useLocale } from '@/context/LocaleContext';
import { MuallamSaniProfile, Achievement } from '@/types/muallim-sani';
import { muallamSaniStore } from '@/lib/muallamSaniStore';

interface AchievementsScreenProps {
  profile: MuallamSaniProfile;
  onScreenChange: (screen: string) => void;
}

export default function AchievementsScreen({ profile, onScreenChange }: AchievementsScreenProps) {
  const { t, locale } = useLocale();
  const allAchievements = muallamSaniStore.getAvailableAchievements();
  
  const unlockedAchievements = allAchievements.filter(achievement => 
    profile.progress.achievements.includes(achievement.id)
  );
  
  const lockedAchievements = allAchievements.filter(achievement => 
    !profile.progress.achievements.includes(achievement.id)
  );

  const totalPoints = unlockedAchievements.reduce((sum, achievement) => sum + achievement.points, 0);
  const completionPercentage = (unlockedAchievements.length / allAchievements.length) * 100;

  const getAchievementProgress = (achievement: Achievement): { progress: number; description: string } => {
    switch (achievement.id) {
      case 'first-lesson':
        return {
          progress: profile.progress.completedLessons.length > 0 ? 100 : 0,
          description: `Завершите свой первый урок`
        };
      case 'perfect-score':
        const perfectScores = Object.values(profile.progress.scores).filter(score => score.bestScore === 100).length;
        return {
          progress: perfectScores > 0 ? 100 : 0,
          description: `Получите 100% за любой экзамен`
        };
      case 'week-streak':
        return {
          progress: Math.min((profile.progress.streak / 7) * 100, 100),
          description: `Учитесь ${profile.progress.streak}/7 дней подряд`
        };
      case 'alifba-master':
        const alifbaLessons = muallamSaniStore.getLearningLevels().find(l => l.id === 'alifba')?.lessons.length || 1;
        const alifbaCompleted = profile.progress.completedLessons.filter(lessonId => 
          lessonId.includes('alifba')
        ).length;
        return {
          progress: (alifbaCompleted / alifbaLessons) * 100,
          description: `Завершите уровень Алифба (${alifbaCompleted}/${alifbaLessons})`
        };
      case 'tajwid-expert':
        const totalLessons = muallamSaniStore.getLearningLevels().reduce((sum, level) => sum + level.lessons.length, 0);
        return {
          progress: (profile.progress.completedLessons.length / totalLessons) * 100,
          description: `Завершите весь курс (${profile.progress.completedLessons.length}/${totalLessons})`
        };
      default:
        return {
          progress: 0,
          description: achievement.description
        };
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Заголовок */}
      <div className="flex items-center mb-8">
        <button
          onClick={() => onScreenChange('dashboard')}
          className="mr-4 p-2 rounded-lg hover:opacity-70 transition-opacity"
          style={{ backgroundColor: 'var(--color-background-secondary)' }}
        >
          ← Назад
        </button>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>
          🏆 Достижения
        </h1>
      </div>

      {/* Общая статистика */}
      <div 
        className="rounded-2xl p-8 mb-8"
        style={{ 
          backgroundColor: 'var(--color-background-secondary)',
          borderColor: 'var(--color-border)',
          borderWidth: '1px'
        }}
      >
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🏆</div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-primary)' }}>
            Ваши достижения
          </h2>
          <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
            Отслеживайте свой прогресс и получайте награды за обучение
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold mb-2" style={{ color: 'var(--color-primary)' }}>
              {unlockedAchievements.length}
            </div>
            <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Получено
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-4xl font-bold mb-2" style={{ color: 'var(--color-text-secondary)' }}>
              {lockedAchievements.length}
            </div>
            <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Осталось
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-4xl font-bold mb-2" style={{ color: '#F59E0B' }}>
              {totalPoints}
            </div>
            <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Очков получено
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-4xl font-bold mb-2" style={{ color: '#10B981' }}>
              {Math.round(completionPercentage)}%
            </div>
            <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Завершено
            </div>
          </div>
        </div>

        {/* Прогресс бар */}
        <div className="mt-6">
          <div className="w-full h-3 rounded-full" style={{ backgroundColor: 'var(--color-border)' }}>
            <div 
              className="h-full rounded-full transition-all duration-1000"
              style={{ 
                width: `${completionPercentage}%`,
                backgroundColor: 'var(--color-primary)'
              }}
            />
          </div>
          <div className="text-center mt-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {Math.round(completionPercentage)}% от всех достижений
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Полученные достижения */}
        <div>
          <div className="flex items-center mb-6">
            <h2 className="text-2xl font-bold mr-4" style={{ color: '#10B981' }}>
              ✅ Полученные ({unlockedAchievements.length})
            </h2>
          </div>
          
          <div className="space-y-4">
            {unlockedAchievements.length === 0 ? (
              <div 
                className="rounded-xl p-8 text-center"
                style={{ 
                  backgroundColor: 'var(--color-background-secondary)',
                  borderColor: 'var(--color-border)',
                  borderWidth: '1px'
                }}
              >
                <div className="text-4xl mb-4">🎯</div>
                <p className="text-lg" style={{ color: 'var(--color-text)' }}>
                  У вас пока нет достижений
                </p>
                <p className="text-sm mt-2" style={{ color: 'var(--color-text-secondary)' }}>
                  Начните обучение, чтобы получить первую награду!
                </p>
                <button
                  onClick={() => onScreenChange('dashboard')}
                  className="mt-4 px-6 py-2 rounded-lg hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
                >
                  Начать обучение
                </button>
              </div>
            ) : (
              unlockedAchievements.map((achievement, index) => (
                <div 
                  key={achievement.id}
                  className="rounded-xl p-6 border-2 animate-in fade-in duration-500"
                  style={{ 
                    backgroundColor: 'var(--color-background-secondary)',
                    borderColor: achievement.color,
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  <div className="flex items-center">
                    <div className="text-4xl mr-4">{achievement.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-bold" style={{ color: achievement.color }}>
                          {achievement.name}
                        </h3>
                        <div 
                          className="px-3 py-1 rounded-full text-sm font-semibold"
                          style={{ backgroundColor: achievement.color, color: 'white' }}
                        >
                          +{achievement.points} очков
                        </div>
                      </div>
                      <p className="text-sm mb-2" style={{ color: 'var(--color-text)' }}>
                        {achievement.description}
                      </p>
                      <div className="flex items-center text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                        <span className="mr-2">🎉 Получено</span>
                        <span>• Сложность: {'⭐'.repeat(Math.min(5, Math.ceil(achievement.points / 10)))}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Доступные достижения */}
        <div>
          <div className="flex items-center mb-6">
            <h2 className="text-2xl font-bold mr-4" style={{ color: '#6B7280' }}>
              🔒 Доступные ({lockedAchievements.length})
            </h2>
          </div>
          
          <div className="space-y-4">
            {lockedAchievements.map((achievement, index) => {
              const progressInfo = getAchievementProgress(achievement);
              
              return (
                <div 
                  key={achievement.id}
                  className="rounded-xl p-6 border opacity-75 hover:opacity-100 transition-opacity"
                  style={{ 
                    backgroundColor: 'var(--color-background-secondary)',
                    borderColor: 'var(--color-border)',
                    borderWidth: '1px'
                  }}
                >
                  <div className="flex items-center">
                    <div className="text-4xl mr-4 grayscale">{achievement.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
                          {achievement.name}
                        </h3>
                        <div 
                          className="px-3 py-1 rounded-full text-sm font-semibold"
                          style={{ 
                            backgroundColor: 'var(--color-border)',
                            color: 'var(--color-text-secondary)'
                          }}
                        >
                          +{achievement.points} очков
                        </div>
                      </div>
                      <p className="text-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                        {progressInfo.description}
                      </p>
                      
                      {/* Прогресс бар */}
                      <div className="mb-2">
                        <div className="w-full h-2 rounded-full" style={{ backgroundColor: 'var(--color-border)' }}>
                          <div 
                            className="h-full rounded-full transition-all"
                            style={{ 
                              width: `${Math.min(progressInfo.progress, 100)}%`,
                              backgroundColor: achievement.color
                            }}
                          />
                        </div>
                        <div className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                          {Math.round(progressInfo.progress)}% выполнено
                        </div>
                      </div>
                      
                      <div className="flex items-center text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                        <span className="mr-2">
                          {progressInfo.progress >= 100 ? '✅ Готово к получению' : '🔄 В процессе'}
                        </span>
                        <span>• Сложность: {'⭐'.repeat(Math.min(5, Math.ceil(achievement.points / 10)))}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Мотивационный блок */}
      {unlockedAchievements.length > 0 && (
        <div 
          className="rounded-2xl p-8 mt-8 text-center"
          style={{ 
            backgroundColor: 'var(--color-background-secondary)',
            borderColor: '#F59E0B',
            borderWidth: '2px'
          }}
        >
          <div className="text-4xl mb-4">🚀</div>
          <h3 className="text-xl font-bold mb-2" style={{ color: '#F59E0B' }}>
            Продолжайте обучение!
          </h3>
          <p className="mb-4" style={{ color: 'var(--color-text)' }}>
            Вы отлично справляетесь! Следующее достижение уже близко.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onScreenChange('dashboard')}
              className="px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
              style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
            >
              🏠 К дашборду
            </button>
            
            <button
              onClick={() => onScreenChange('profile')}
              className="px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
              style={{ 
                backgroundColor: 'var(--color-background)',
                color: 'var(--color-text)',
                borderColor: 'var(--color-border)',
                borderWidth: '1px'
              }}
            >
              👤 Профиль
            </button>
          </div>
        </div>
      )}
    </div>
  );
}