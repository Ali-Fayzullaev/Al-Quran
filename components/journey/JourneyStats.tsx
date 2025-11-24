"use client";

import { useJourneyStore } from '@/lib/journeyStore';
import { useQuranStore } from '@/lib/store';
import { useLocale } from '@/context/LocaleContext';
import { BarChart3, Clock, Star, Target, TrendingUp, Zap, Trophy, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

export default function JourneyStats() {
  const { locale, t } = useLocale();

  const { stats, streakDays, surahProgress } = useJourneyStore();

  const primaryColor = "var(--color-primary)";

  // Отладочная информация
  useEffect(() => {
    console.log('JourneyStats - Current stats:', stats);
    console.log('JourneyStats - Surah progress:', Object.keys(surahProgress).length, 'surahs');
    console.log('JourneyStats - Completed surahs:', Object.values(surahProgress).filter(p => 
      p.status === 'completed' || p.status === 'perfect'
    ).map(p => p.surahNumber));
  }, [stats, surahProgress]);

  const statCards = [
    {
      icon: <Target className="w-6 h-6" />,
      label: t('journey.completedSurahs'),
      value: `${stats.completedSurahs}/114`,
      color: primaryColor,
      progress: (stats.completedSurahs / 114) * 100,
    },
    {
      icon: <Trophy className="w-6 h-6" />,
      label: t('journey.perfectSurahs'),
      value: stats.perfectSurahs.toString(),
      color: '#f59e0b',
      progress: (stats.perfectSurahs / stats.completedSurahs) * 100 || 0,
    },
    {
      icon: <Star className="w-6 h-6" />,
      label: t('journey.averageScore'),
      value: `${stats.averageScore}%`,
      color: '#8b5cf6',
      progress: stats.averageScore,
    },
    {
      icon: <Flame className="w-6 h-6" />,
      label: t('journey.dayStreak'),
      value: streakDays.toString(),
      color: '#ef4444',
      progress: Math.min((streakDays / 30) * 100, 100),
    },
    {
      icon: <Clock className="w-6 h-6" />,
      label: t('journey.timeSpent'),
      value: formatTime(stats.totalTimeSpent),
      color: '#06b6d4',
      progress: Math.min((stats.totalTimeSpent / 36000) * 100, 100), // 10 часов макс
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      label: t('journey.totalProgress'),
      value: `${stats.totalProgress}%`,
      color: '#10b981',
      progress: stats.totalProgress,
    },
  ];

  function formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}${t('journey.hourShort')} ${minutes}${t('journey.minuteShort')}`;
    }
    return `${minutes}${t('journey.minuteLong')}`;
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center gap-3">
        <BarChart3 className="w-7 h-7" style={{ color: primaryColor }} />
        <h2 className="text-2xl font-bold" style={{ color: 'var(--fixed-text)' }}>
          {t('yourJourneyStatistics')}
        </h2>
      </div>

      {/* Сетка статистики */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="group relative overflow-hidden rounded-2xl border-2 p-6 transition-all hover:scale-105 hover:shadow-xl"
            style={{
              backgroundColor: 'var(--fixed-background)',
              borderColor: 'var(--color-border)',
            }}
          >
            {/* Фоновый градиент */}
            <div
              className="absolute inset-0 opacity-5 transition-opacity group-hover:opacity-10"
              style={{
                background: `linear-gradient(135deg, ${stat.color} 0%, ${stat.color}80 100%)`,
              }}
            />

            {/* Иконка */}
            <div
              className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4"
              style={{
                backgroundColor: `${stat.color}20`,
                color: stat.color,
              }}
            >
              {stat.icon}
            </div>

            {/* Значение */}
            <div className="space-y-1 mb-3">
              <p className="text-3xl font-bold" style={{ color: 'var(--fixed-text)' }}>
                {stat.value}
              </p>
              <p className="text-sm" style={{ color: 'var(--fixed-text-secondary)' }}>
                {stat.label}
              </p>
            </div>

            {/* Прогресс бар */}
            <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-border)' }}>
              <div
                className="h-full transition-all duration-1000 ease-out rounded-full"
                style={{
                  width: `${Math.min(stat.progress, 100)}%`,
                  backgroundColor: stat.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Общий прогресс-бар */}
      <div
        className="p-6 rounded-2xl border-2"
        style={{
          backgroundColor: 'var(--fixed-background)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--fixed-text)' }}>
            {t('journey.overallJourneyProgress')}
          </h3>
          <span className="text-2xl font-bold" style={{ color: primaryColor }}>
            {stats.totalProgress}%
          </span>
        </div>
        
        <div className="h-4 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-border)' }}>
          <div
            className="h-full transition-all duration-1000 ease-out relative overflow-hidden"
            style={{
              width: `${stats.totalProgress}%`,
              backgroundColor: primaryColor,
            }}
          >
            {/* Анимированный блеск */}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
                animation: 'shimmer 2s infinite',
              }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 text-sm" style={{ color: 'var(--fixed-text-secondary)' }}>
          <span>{stats.completedSurahs} {t('journey.completed')}</span>
          <span>{114 - stats.completedSurahs} {t('journey.remaining')}</span>
        </div>
      </div>

      {/* Milestone indicators */}
      <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
        {[
          { milestone: 25, label: '25%', icon: '🌱' },
          { milestone: 50, label: '50%', icon: '🌿' },
          { milestone: 75, label: '75%', icon: '🌳' },
          { milestone: 100, label: '100%', icon: '👑' },
        ].map(({ milestone, label, icon }) => {
          const achieved = stats.totalProgress >= milestone;
          return (
            <div
              key={milestone}
              className={cn(
                "p-4 rounded-xl border-2 text-center transition-all",
                achieved ? "scale-105" : "opacity-50"
              )}
              style={{
                backgroundColor: achieved ? `${primaryColor}10` : 'var(--fixed-background)',
                borderColor: achieved ? primaryColor : 'var(--color-border)',
              }}
            >
              <div className="text-3xl mb-2">{icon}</div>
              <div className="text-sm font-medium" style={{ color: achieved ? primaryColor : 'var(--fixed-text-secondary)' }}>
                {label}
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
