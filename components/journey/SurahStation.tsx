"use client";

import { useState, useEffect } from 'react';
import { useJourneyStore } from '@/lib/journeyStore';
import { useQuranStore } from '@/lib/store';
import { useLocale } from '@/context/LocaleContext';
import { SurahProgress } from '@/lib/journeyTypes';
import { Lock, Star, Trophy, Clock, Target, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SurahStationProps {
  surahNumber: number;
  name: string;
  arabicName: string;
  ayahs: number;
  revelation: 'Meccan' | 'Medinan';
  meaningEn: string;
  meaningRu: string;
  onStart: (surahNumber: number) => void;
}

export default function SurahStation({
  surahNumber,
  name,
  arabicName,
  ayahs,
  revelation,
  meaningEn,
  meaningRu,
  onStart,
}: SurahStationProps) {
  const { locale } = useLocale();
  const { surahProgress, getSurahStatus } = useJourneyStore();
  
  const [isHovered, setIsHovered] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Предотвращаем hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const progress = isMounted ? surahProgress[surahNumber] : undefined;
  const status = isMounted ? getSurahStatus(surahNumber) : 'locked';

  const primaryColor = "var(--color-primary)";

  // Определяем стиль в зависимости от статуса
  const getStatusColor = () => {
    switch (status) {
      case 'perfect':
        return { bg: '#fef3c7', border: '#f59e0b', icon: '#f59e0b', glow: 'rgba(245, 158, 11, 0.3)' };
      case 'completed':
        return { bg: '#d1fae5', border: primaryColor, icon: primaryColor, glow: `${primaryColor}40` };
      case 'available':
        return { bg: 'var(--fixed-background)', border: 'var(--color-border)', icon: 'var(--fixed-text-secondary)', glow: 'transparent' };
      case 'locked':
      default:
        return { bg: 'var(--fixed-background-secondary)', border: 'var(--color-border)', icon: 'var(--fixed-text-muted)', glow: 'transparent' };
    }
  };

  const colors = getStatusColor();

  const getStatusIcon = () => {
    switch (status) {
      case 'perfect':
        return <Trophy className="w-6 h-6" style={{ color: colors.icon }} />;
      case 'completed':
        return <Star className="w-6 h-6" style={{ color: colors.icon }} />;
      case 'available':
        return <Target className="w-6 h-6" style={{ color: colors.icon }} />;
      case 'locked':
      default:
        return <Lock className="w-5 h-5" style={{ color: colors.icon }} />;
    }
  };

  const isClickable = status === 'available' || status === 'completed' || status === 'perfect';

  const handleClick = () => {
    if (isClickable && isMounted) {
      onStart(surahNumber);
    }
  };

  // Показываем скелетон до монтирования
  if (!isMounted) {
    return (
      <div
        className="relative group overflow-hidden rounded-2xl border-2 transition-all duration-300 opacity-50"
        style={{
          backgroundColor: 'var(--fixed-background-secondary)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="relative p-6 pt-12 space-y-3">
          <h3 className="text-3xl font-arabic text-center leading-relaxed" style={{ color: 'var(--fixed-text)' }}>
            {arabicName}
          </h3>
          <div className="text-center space-y-1">
            <p className="font-semibold text-lg" style={{ color: 'var(--fixed-text)' }}>
              {name}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={!isClickable}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "relative group overflow-hidden rounded-2xl border-2 transition-all duration-300",
        isClickable ? "cursor-pointer hover:scale-105 hover:shadow-2xl" : "cursor-not-allowed opacity-60",
        status === 'perfect' && "ring-2 ring-offset-2",
      )}
      style={{
        backgroundColor: colors.bg,
        borderColor: colors.border,
        boxShadow: isHovered && isClickable ? `0 10px 40px ${colors.glow}` : 'none',
        ...(status === 'perfect' && { ringColor: colors.border }),
      }}
    >
      {/* Фоновый градиент для типа откровения */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          background: revelation === 'Meccan' 
            ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)'
            : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
        }}
      />

      {/* Номер суры (большой, на фоне) */}
      <div 
        className="absolute top-2 right-2 text-6xl font-bold opacity-5"
        style={{ color: colors.icon }}
      >
        {surahNumber}
      </div>

      {/* Статус иконка (верхний левый угол) */}
      <div className="absolute top-3 left-3 z-10">
        {getStatusIcon()}
      </div>

      {/* Тип откровения (верхний правый угол) */}
      <div 
        className="absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium"
        style={{
          backgroundColor: revelation === 'Meccan' ? '#fed7aa' : '#bfdbfe',
          color: revelation === 'Meccan' ? '#9a3412' : '#1e3a8a',
        }}
      >
        {revelation === 'Meccan' 
          ? (locale === 'en' ? 'Meccan' : 'Мекка')
          : (locale === 'en' ? 'Medinan' : 'Медина')
        }
      </div>

      {/* Основной контент */}
      <div className="relative p-6 pt-12 space-y-3">
        {/* Арабское название */}
        <h3 className="text-3xl font-arabic text-center leading-relaxed" style={{ color: 'var(--fixed-text)' }}>
          {arabicName}
        </h3>

        {/* Английское название */}
        <div className="text-center space-y-1">
          <p className="font-semibold text-lg" style={{ color: 'var(--fixed-text)' }}>
            {name}
          </p>
          <p className="text-sm" style={{ color: 'var(--fixed-text-secondary)' }}>
            {locale === 'en' ? meaningEn : meaningRu}
          </p>
        </div>

        {/* Количество аятов */}
        <div className="flex items-center justify-center gap-2 text-sm" style={{ color: 'var(--fixed-text-secondary)' }}>
          <span>{ayahs}</span>
          <span>{locale === 'en' ? 'verses' : 'аятов'}</span>
        </div>

        {/* Прогресс (если есть) */}
        {progress && progress.attempts > 0 && (
          <div className="space-y-2 pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-center justify-between text-xs" style={{ color: 'var(--fixed-text-secondary)' }}>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3" />
                <span>{locale === 'en' ? 'Best' : 'Лучший'}: {progress.bestScore}%</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3" />
                <span>{progress.attempts} {locale === 'en' ? 'attempts' : 'попыток'}</span>
              </div>
            </div>

            {/* Прогресс бар */}
            <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-border)' }}>
              <div 
                className="h-full transition-all duration-500 rounded-full"
                style={{ 
                  width: `${progress.bestScore}%`,
                  backgroundColor: status === 'perfect' ? '#f59e0b' : primaryColor,
                }}
              />
            </div>
          </div>
        )}

        {/* Кнопка действия */}
        {isClickable && (
          <div className="pt-2">
            <div 
              className="w-full py-2 px-4 rounded-lg font-medium text-white text-sm transition-all"
              style={{ 
                backgroundColor: status === 'perfect' ? '#f59e0b' : primaryColor,
                opacity: isHovered ? 1 : 0.9,
              }}
            >
              {status === 'available' 
                ? (locale === 'en' ? 'Start Quiz' : 'Начать тест')
                : (locale === 'en' ? 'Retake Quiz' : 'Пройти снова')
              }
            </div>
          </div>
        )}

        {/* Сообщение для заблокированных */}
        {status === 'locked' && (
          <div className="pt-2 text-center">
            <p className="text-xs" style={{ color: 'var(--fixed-text-muted)' }}>
              {locale === 'en' 
                ? 'Complete previous surahs to unlock'
                : 'Завершите предыдущие суры для разблокировки'
              }
            </p>
          </div>
        )}
      </div>

      {/* Эффект сияния для perfect */}
      {status === 'perfect' && (
        <div className="absolute inset-0 pointer-events-none">
          <div 
            className="absolute inset-0 opacity-20 animate-pulse"
            style={{
              background: 'radial-gradient(circle at 50% 50%, #fbbf24, transparent 70%)',
            }}
          />
        </div>
      )}
    </button>
  );
}
