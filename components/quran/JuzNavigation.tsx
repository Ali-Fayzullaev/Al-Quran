"use client";

import { useState } from "react";
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

  // Создаем список всех 30 джузов
  const juzList = Array.from({ length: 30 }, (_, i) => i + 1);

  // Вычисляем прогресс чтения для каждого джуза
  const getJuzProgress = (juzNumber: number) => {
    const juzSessions = readingSessions.filter(session => {
      // Приблизительное сопоставление джуза с сурами
      const juzSurahRanges = [
        [1, 2], [2, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 11],
        [11, 12], [12, 14], [15, 16], [17, 18], [19, 20], [21, 22], [23, 25], [26, 27], [28, 29], [30, 33],
        [34, 36], [37, 39], [40, 42], [43, 45], [46, 51], [52, 57], [58, 66], [67, 77], [78, 87], [88, 114]
      ];
      
      const range = juzSurahRanges[juzNumber - 1];
      return session.surahNumber >= range[0] && session.surahNumber <= range[1];
    });

    return Math.min(100, (juzSessions.length / 20) * 100); // Примерно 20 аятов за сессию
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
          {locale === 'en' ? 'Juz Navigation' : 'Навигация по Джузам'}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          {locale === 'en' 
            ? 'The Quran is divided into 30 Juz (parts) for easier reading and memorization'
            : 'Коран разделен на 30 джузов (частей) для более легкого чтения и запоминания'}
        </p>
      </div>

      {/* Current Juz Info */}
      <div className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-2">
              {locale === 'en' ? `Juz ${selectedJuz}` : `Джуз ${selectedJuz}`}
            </h2>
            <p className="text-green-600 dark:text-green-300">
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
                className={cn(
                  "relative w-full aspect-square rounded-2xl border-2 transition-all duration-300 group overflow-hidden",
                  isSelected 
                    ? "border-green-500 bg-green-50 dark:bg-green-900/30 shadow-lg"
                    : "border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 bg-white dark:bg-gray-800",
                  isCompleted && "ring-2 ring-green-400"
                )}
              >
                {/* Background Progress */}
                <div 
                  className="absolute inset-0 bg-gradient-to-t from-green-200/30 to-transparent transition-all duration-300"
                  style={{ opacity: progress / 100 }}
                />
                
                {/* Content */}
                <div className="relative z-10 flex flex-col items-center justify-center h-full p-3">
                  {isCompleted && (
                    <CheckCircle className="absolute top-2 right-2 w-5 h-5 text-green-600" />
                  )}
                  
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {juzNumber}
                  </div>
                  
                  <div className="text-xs text-gray-600 dark:text-gray-300 text-center mb-2">
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
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-gray-300 dark:text-gray-600"
                      />
                      <circle
                        cx="16"
                        cy="16"
                        r="12"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeDasharray={`${progress * 0.75} 75`}
                        className="text-green-500 transition-all duration-500"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-gray-700 dark:text-gray-300">
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
        <Link href="/surahs">
          <Button variant="outline" className="gap-2">
            <BookOpen className="w-4 h-4" />
            {locale === 'en' ? 'Browse by Surahs' : 'Просмотр по сурам'}
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