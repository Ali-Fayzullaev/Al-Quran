"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, Play, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useJuz } from "@/lib/hooks";
import { useQuranStore } from "@/lib/store";
import { useLocale } from "@/context/LocaleContext";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface JuzNavigationProps {
  currentJuz?: number;
}

export default function JuzNavigation({ currentJuz = 1 }: JuzNavigationProps) {
  const { locale } = useLocale();
  const { readingSessions } = useQuranStore();
  const [selectedJuz, setSelectedJuz] = useState(currentJuz);
  const [isClient, setIsClient] = useState(false);
  const [juzProgress, setJuzProgress] = useState<Record<number, number>>({});

  // Проверяем, что мы на клиенте
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Создаем список всех 30 джузов
  const juzList = Array.from({ length: 30 }, (_, i) => i + 1);

  // Точное количество аятов в каждом джузе
  const juzVerseCounts = {
    1: 148, 2: 111, 3: 126, 4: 131, 5: 124, 6: 110, 7: 149, 8: 142, 9: 159, 10: 127,
    11: 135, 12: 160, 13: 163, 14: 154, 15: 170, 16: 150, 17: 160, 18: 142, 19: 160, 20: 171,
    21: 147, 22: 170, 23: 154, 24: 172, 25: 177, 26: 146, 27: 170, 28: 139, 29: 170, 30: 564
  };

  // Загружаем прогресс только на клиенте
  useEffect(() => {
    if (!isClient) return;

    const loadProgress = () => {
      const progressData: Record<number, number> = {};
      
      juzList.forEach(juzNumber => {
        try {
          const savedProgress = localStorage.getItem(`juz-${juzNumber}-progress`);
          if (!savedProgress) {
            progressData[juzNumber] = 0;
            return;
          }
          
          const { versesRead } = JSON.parse(savedProgress);
          if (!versesRead || !Array.isArray(versesRead)) {
            progressData[juzNumber] = 0;
            return;
          }
          
          const totalVerses = juzVerseCounts[juzNumber as keyof typeof juzVerseCounts] || 150;
          const readVersesCount = versesRead.length;
          const percentage = Math.min(100, (readVersesCount / totalVerses) * 100);
          
          progressData[juzNumber] = percentage;
        } catch (error) {
          console.error(`Ошибка при получении прогресса джуза ${juzNumber}:`, error);
          progressData[juzNumber] = 0;
        }
      });
      
      setJuzProgress(progressData);
    };

    loadProgress();
  }, [isClient]);

  // Получаем прогресс джуза (безопасно)
  const getJuzProgress = (juzNumber: number) => {
    return juzProgress[juzNumber] || 0;
  };

  // Показываем скелетон пока не загрузились данные
  if (!isClient) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4 animate-pulse max-w-md mx-auto"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse max-w-2xl mx-auto"></div>
        </div>
        
        <div className="rounded-2xl p-6 mb-8 border bg-gray-100 dark:bg-gray-800 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg mb-2 w-32"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-48"></div>
            </div>
            <div className="text-right">
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full w-32 mb-2"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-40"></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-6 gap-4">
          {juzList.map((juzNumber) => (
            <div key={juzNumber} className="aspect-square rounded-2xl bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text-primary">
          {locale === 'en' ? 'Juz Navigation' : 'Навигация по Джузам'}
        </h1>
        <p className="text-xl max-w-2xl mx-auto" style={{ color: 'var(--fixed-text-secondary)' }}>
          {locale === 'en' 
            ? 'The Quran is divided into 30 Juz (parts) for easier reading and memorization'
            : 'Коран разделен на 30 джузов (частей) для более легкого чтения и запоминания'}
        </p>
      </div>

      {/* Current Juz Info */}
      <div className="rounded-2xl p-6 mb-8 border" style={{
        background: 'linear-gradient(135deg, var(--verse-background) 0%, var(--color-secondary) 100%)',
        borderColor: 'var(--color-primary)'
      }}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-primary)' }}>
              {locale === 'en' ? `Juz ${selectedJuz}` : `Джуз ${selectedJuz}`}
            </h2>
            <p style={{ color: 'var(--fixed-text-secondary)' }}>
              {locale === 'en' ? 'Reading Progress' : 'Прогресс чтения'}: {getJuzProgress(selectedJuz).toFixed(0)}%
            </p>
          </div>
          
          <div className="text-right">
            <Progress 
              value={getJuzProgress(selectedJuz)} 
              className="w-32 mb-2" 
            />
            <Link href={`/juz/${selectedJuz}`}>
              <Button className="theme-btn-primary">
                {locale === 'en' ? 'Continue Reading' : 'Продолжить чтение'}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Juz Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-6 gap-4">
        {juzList.map((juzNumber) => {
          const progress = getJuzProgress(juzNumber);
          const isCompleted = progress >= 90;
          const isSelected = juzNumber === selectedJuz;
          
          return (
            <motion.div
              key={juzNumber}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: juzNumber * 0.02 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <button
                onClick={() => setSelectedJuz(juzNumber)}
                className="relative w-full aspect-square rounded-2xl border-2 transition-all duration-300 group overflow-hidden"
                style={{
                  borderColor: isSelected ? 'var(--color-primary)' : 'var(--color-border)',
                  backgroundColor: isSelected ? 'var(--verse-background)' : 'var(--verse-background)',
                  boxShadow: isSelected ? '0 10px 25px rgba(0,0,0,0.1)' : 'none',
                  ...(isCompleted && { outline: '2px solid var(--color-primary)', outlineOffset: '2px' })
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.borderColor = 'var(--color-primary)';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.borderColor = 'var(--color-border)';
                }}
              >
                {/* Background Progress */}
                <div 
                  className="absolute inset-0 transition-all duration-300"
                  style={{ 
                    background: `linear-gradient(to top, var(--color-secondary), transparent)`,
                    opacity: progress / 200 
                  }}
                />
                
                {/* Content */}
                <div className="relative z-10 flex flex-col items-center justify-center h-full p-3">
                  {isCompleted && (
                    <CheckCircle className="absolute top-2 right-2 w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                  )}
                  
                  <div className="text-2xl font-bold mb-1" style={{ color: 'var(--fixed-text)' }}>
                    {juzNumber}
                  </div>
                  
                  <div className="text-xs text-center mb-2" style={{ color: 'var(--fixed-text-secondary)' }}>
                    {locale === 'en' ? 'Juz' : 'Джуз'}
                  </div>
                  
                  {/* Progress Circle */}
                  <div className="w-8 h-8 relative">
                    <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 32 32">
                      <circle
                        cx="16"
                        cy="16"
                        r="12"
                        fill="none"
                        stroke="var(--color-border)"
                        strokeWidth="2"
                      />
                      <circle
                        cx="16"
                        cy="16"
                        r="12"
                        fill="none"
                        stroke="var(--color-primary)"
                        strokeWidth="2"
                        strokeDasharray={`${progress * 0.75} 75`}
                        className="transition-all duration-500"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold" style={{ color: 'var(--fixed-text-secondary)' }}>
                      {Math.round(progress)}
                    </span>
                  </div>
                </div>
                
                {/* Hover Effect */}
                <div className="absolute inset-0 theme-bg-primary-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mt-12 flex flex-wrap gap-4 justify-center">
        <Link href="/quran">
          <Button variant="outline" className="gap-2">
            <BookOpen className="w-4 h-4" />
            {locale === 'en' ? 'Other Reading Modes' : 'Другие режимы чтения'}
          </Button>
        </Link>
        
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => {
            // Найти следующий незавершенный джуз
            const nextIncomplete = juzList.find(juz => getJuzProgress(juz) < 90);
            if (nextIncomplete) {
              setSelectedJuz(nextIncomplete);
            }
          }}
        >
          <Play className="w-4 h-4" />
          {locale === 'en' ? 'Continue Learning' : 'Продолжить обучение'}
        </Button>
        
        <Button
          variant="outline"
          className="gap-2"
        >
          <Clock className="w-4 h-4" />
          {locale === 'en' ? 'Reading History' : 'История чтения'}
        </Button>
      </div>

      {/* Statistics */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {juzList.filter(juz => getJuzProgress(juz) >= 90).length}
          </div>
          <div className="text-gray-600 dark:text-gray-300">
            {locale === 'en' ? 'Completed Juz' : 'Завершенных джузов'}
          </div>
        </div>
        
        <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {Math.round(juzList.reduce((acc, juz) => acc + getJuzProgress(juz), 0) / 30)}%
          </div>
          <div className="text-gray-600 dark:text-gray-300">
            {locale === 'en' ? 'Overall Progress' : 'Общий прогресс'}
          </div>
        </div>
        
        <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {readingSessions.length}
          </div>
          <div className="text-gray-600 dark:text-gray-300">
            {locale === 'en' ? 'Reading Sessions' : 'Сессий чтения'}
          </div>
        </div>
      </div>
    </div>
  );
}