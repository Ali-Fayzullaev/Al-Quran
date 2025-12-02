'use client';

import React, { useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/context/LocaleContext';
import { MuallamSaniProfile, LearningLevel } from '@/types/muallim-sani';
import { muallamSaniStore } from '@/lib/muallamSaniStore';
import { BookOpen, FileText, Waves, Music, RefreshCw, GraduationCap, User, Trophy, Flame, BarChart3, Lock, PlayCircle, CheckCircle, Clock, Target, Star, TrendingUp, Award, Zap } from 'lucide-react';

interface DashboardScreenProps {
  profile: MuallamSaniProfile;
  onScreenChange: (screen: string, data?: any) => void;
  onProfileUpdate: (profile: MuallamSaniProfile) => void;
}

// Маппинг уровней к PDF файлам
const LEVEL_PDF_MAPPING: Record<string, { fileName: string; title: string; icon: React.ReactNode }> = {
  'alifba': { 
    fileName: 'alifba_end.pdf', 
    title: 'Алифба - Основы',
    icon: <BookOpen className="w-6 h-6" />
  },
  'all-letters': { 
    fileName: 'all_letters_end.pdf', 
    title: 'Все буквы',
    icon: <FileText className="w-6 h-6" />
  },
  'mad-tabii': { 
    fileName: 'mad_tabiy_end.pdf', 
    title: 'Мад Табии',
    icon: <Waves className="w-6 h-6" />
  },
  'tanvin': { 
    fileName: 'letters_with_tanvin_end.pdf', 
    title: 'Буквы с танвином',
    icon: <Music className="w-6 h-6" />
  },
  'tashdid': { 
    fileName: 'letters_with_tashdid_end.pdf', 
    title: 'Буквы с ташдидом',
    icon: <RefreshCw className="w-6 h-6" />
  },
  'complete': { 
    fileName: 'all_muallim_sani_end.pdf', 
    title: 'Полный курс Muallim Sani',
    icon: <GraduationCap className="w-6 h-6" />
  }
};

const DashboardScreen: React.FC<DashboardScreenProps> = React.memo(({ profile, onScreenChange, onProfileUpdate }) => {
  const router = useRouter();
  
  // Мемоизируем статические данные
  const levels = useMemo(() => muallamSaniStore.getLearningLevels(), []);
  const stats = useMemo(() => muallamSaniStore.getStats(), [profile]);

  // Мемоизированные функции для оптимизации
  const getProgressPercentage = useCallback((level: LearningLevel): number => {
    return muallamSaniStore.getLessonProgress(level.id);
  }, []);

  const getLevelStats = useCallback((level: LearningLevel) => {
    return muallamSaniStore.getLessonStats(level.id);
  }, []);

  // Мемоизация сложных вычислений
  const levelProgresses = useMemo(() => {
    const progresses: { [key: string]: number } = {};
    levels.forEach(level => {
      progresses[level.id] = getProgressPercentage(level);
    });
    return progresses;
  }, [levels, profile.progress.scores]);

  const levelStats = useMemo(() => {
    const stats: { [key: string]: any } = {};
    levels.forEach(level => {
      stats[level.id] = getLevelStats(level);
    });
    return stats;
  }, [levels, profile.progress.scores]);

  const overallProgress = useMemo(() => {
    const totalProgress = Object.values(levelProgresses).reduce((sum, progress) => sum + progress, 0);
    return Math.round(totalProgress / levels.length);
  }, [levelProgresses, levels.length]);

  const getNextLesson = () => {
    for (const level of levels) {
      if (level.isLocked) continue;
      
      const isCompleted = profile.progress.completedLessons.includes(level.id);
      if (!isCompleted) {
        return { level, lesson: { id: level.id, title: level.nameRu } };
      }
    }
    return null;
  };

  const nextLesson = getNextLesson();

  // Функция для обработки результатов теста
  const handleQuizResult = (quizLevelId: string, passed: boolean) => {
    if (passed) {
      // Обновляем прогресс после успешного теста
      const updatedProfile = { ...profile };
      if (!updatedProfile.progress.completedLessons.includes(quizLevelId)) {
        updatedProfile.progress.completedLessons.push(quizLevelId);
      }
      
      // Разблокируем следующий уровень
      const nextLevelToUnlock = getNextLevel(quizLevelId);
      if (nextLevelToUnlock && updatedProfile.progress.unlockedLevels) {
        if (!updatedProfile.progress.unlockedLevels.includes(nextLevelToUnlock.id)) {
          updatedProfile.progress.unlockedLevels.push(nextLevelToUnlock.id);
        }
      }
      
      onProfileUpdate(updatedProfile);
      
      // Автоматически открываем следующий урок или переходим к дашборду
      if (nextLevelToUnlock) {
        setTimeout(() => {
          const currentLevel = muallamSaniStore.getLearningLevels().find(l => l.id === quizLevelId);
          if (currentLevel) {
            handleOpenPDF(nextLevelToUnlock, true);
          }
        }, 1000);
      } else {
        // Возвращаемся на главную страницу если это последний урок
        setTimeout(() => {
          onScreenChange('dashboard');
        }, 1000);
      }
    } else {
      // Если тест не пройден - возвращаемся к чтению
      const currentLevel = muallamSaniStore.getLearningLevels().find(l => l.id === quizLevelId);
      if (currentLevel) {
        setTimeout(() => {
          handleOpenPDF(currentLevel);
        }, 1000);
      } else {
        onScreenChange('dashboard');
      }
    }
  };

  // Функция для получения следующего уровня
  const getNextLevel = (currentLevelId: string): LearningLevel | null => {
    const allLevels = muallamSaniStore.getLearningLevels();
    const levelOrder = ['alifba', 'all-letters', 'mad-tabii', 'tanvin', 'tashdid', 'complete'];
    const currentIndex = levelOrder.indexOf(currentLevelId);
    
    if (currentIndex >= 0 && currentIndex < levelOrder.length - 1) {
      const nextLevelId = levelOrder[currentIndex + 1];
      return allLevels.find((level: LearningLevel) => level.id === nextLevelId) || null;
    }
    return null;
  };

  // Мемоизированная функция для прямого перехода к PDF
  const handleOpenPDF = useCallback((level: LearningLevel, fromCompletion = false) => {
    const pdfData = LEVEL_PDF_MAPPING[level.id];
    if (pdfData) {
      const nextLevelForProps = getNextLevel(level.id);
      onScreenChange('pdf-viewer', {
        pdfPath: `/muallim_sani/${pdfData.fileName}`,
        pdfTitle: pdfData.title,
        bookId: level.id,
        nextLevel: nextLevelForProps,
        onCompletion: (completedLevelId: string) => {
          // После завершения чтения PDF переходим к тесту
          onScreenChange('quiz', { 
            quizId: completedLevelId
          });
        }
        });
    }
  }, [onScreenChange]);  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = profile.profile.name;
    
    if (hour < 12) {
      return `Доброе утро, ${name}!`;
    } else if (hour < 18) {
      return `Добрый день, ${name}!`;
    } else {
      return `Добрый вечер, ${name}!`;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Заголовок и приветствие */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-primary)' }}>
          📚 Муаллим Сани
        </h1>
        <p className="text-xl" style={{ color: 'var(--color-text)' }}>
          {getGreeting()}
        </p>
      </div>

      {/* Быстрые действия */}
      <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <button
          onClick={() => router.push('/muallim-sani/books')}
          className="p-4 rounded-xl text-center hover:opacity-90 transition-opacity"
          style={{ 
            backgroundColor: 'var(--color-background-secondary)',
            borderColor: 'var(--color-border)',
            borderWidth: '1px'
          }}
        >
          <div className="flex justify-center mb-2" style={{ color: 'var(--color-primary)' }}>
            <BookOpen className="w-8 h-8" />
          </div>
          <div className="font-semibold" style={{ color: 'var(--color-text)' }}>
            PDF Книги
          </div>
        </button>

        <button
          onClick={() => onScreenChange('profile')}
          className="p-4 rounded-xl text-center hover:opacity-90 transition-opacity"
          style={{ 
            backgroundColor: 'var(--color-background-secondary)',
            borderColor: 'var(--color-border)',
            borderWidth: '1px'
          }}
        >
          <div className="flex justify-center mb-2" style={{ color: 'var(--color-primary)' }}>
            <User className="w-8 h-8" />
          </div>
          <div className="font-semibold" style={{ color: 'var(--color-text)' }}>
            Профиль
          </div>
        </button>

        <button
          onClick={() => onScreenChange('achievements')}
          className="p-4 rounded-xl text-center hover:opacity-90 transition-opacity"
          style={{ 
            backgroundColor: 'var(--color-background-secondary)',
            borderColor: 'var(--color-border)',
            borderWidth: '1px'
          }}
        >
          <div className="flex justify-center mb-2" style={{ color: 'var(--color-primary)' }}>
            <Trophy className="w-8 h-8" />
          </div>
          <div className="font-semibold" style={{ color: 'var(--color-text)' }}>
            Достижения
          </div>
          <div className="text-sm" style={{ color: 'var(--color-primary)' }}>
            {profile.progress.achievements.length}
          </div>
        </button>

        <div 
          className="p-4 rounded-xl text-center"
          style={{ 
            backgroundColor: 'var(--color-background-secondary)',
            borderColor: 'var(--color-border)',
            borderWidth: '1px'
          }}
        >
          <div className="flex justify-center mb-2" style={{ color: 'var(--color-primary)' }}>
            <Flame className="w-8 h-8" />
          </div>
          <div className="font-semibold" style={{ color: 'var(--color-text)' }}>
            Серия
          </div>
          <div className="text-sm" style={{ color: 'var(--color-primary)' }}>
            {profile.progress.streak} дней
          </div>
        </div>

        <div 
          className="p-4 rounded-xl text-center"
          style={{ 
            backgroundColor: 'var(--color-background-secondary)',
            borderColor: 'var(--color-border)',
            borderWidth: '1px'
          }}
        >
          <div className="flex justify-center mb-2" style={{ color: 'var(--color-primary)' }}>
            <BarChart3 className="w-8 h-8" />
          </div>
          <div className="font-semibold" style={{ color: 'var(--color-text)' }}>
            Прогресс
          </div>
          <div className="text-sm" style={{ color: 'var(--color-primary)' }}>
            {stats.lessonsCompleted} уроков
          </div>
        </div>
      </div>

      {/* Статистика */}
      <div 
        className="rounded-2xl p-6 mb-8"
        style={{ 
          backgroundColor: 'var(--color-background-secondary)',
          borderColor: 'var(--color-border)',
          borderWidth: '1px'
        }}
      >
        <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-primary)' }}>
          📊 Ваша статистика
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-4 rounded-xl gpu-accelerated hover:scale-105 transition-transform duration-200" 
               style={{ backgroundColor: 'var(--color-background)' }}>
            <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {overallProgress}%
            </div>
            <div className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              Общий прогресс
            </div>
          </div>
          
          <div className="text-center p-4 rounded-xl gpu-accelerated hover:scale-105 transition-transform duration-200" 
               style={{ backgroundColor: 'var(--color-background)' }}>
            <div className="text-4xl font-bold mb-2" style={{ color: 'var(--color-primary)' }}>
              {Math.floor(stats.totalTimeSpent / 60)}
            </div>
            <div className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              Часов изучено
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold mb-1" style={{ color: 'var(--color-primary)' }}>
              {stats.averageScore}%
            </div>
            <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Средний балл
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold mb-1" style={{ color: 'var(--color-primary)' }}>
              {stats.perfectScores}
            </div>
            <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Идеальных оценок
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold mb-1" style={{ color: 'var(--color-primary)' }}>
              {stats.totalQuizzes}
            </div>
            <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Тестов пройдено
            </div>
          </div>
        </div>
      </div>

      {/* Уровни обучения */}
      <div>
        <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-primary)' }}>
          🎓 Уровни обучения
        </h2>
        
        <div className="space-y-4">
          {levels.map((level, index) => {
            const progress = levelProgresses[level.id];
            const stats = levelStats[level.id];
            const isCurrentLevel = profile.progress.currentLevel === level.id;
            const isUnlocked = index === 0 || (profile.progress.unlockedLevels && profile.progress.unlockedLevels.includes(level.id));
            const isCompleted = stats.completed;
            const canAccess = isUnlocked;
            
            return (
              <div
                key={level.id}
                className={`rounded-xl p-6 border-2 gpu-accelerated smooth-transition animate-fade-scale ${
                  canAccess ? 'cursor-pointer hover:shadow-xl hover:scale-105' : 'opacity-50 cursor-not-allowed'
                }`}
                style={{ 
                  backgroundColor: 'var(--color-background-secondary)',
                  borderColor: isCompleted ? '#10B981' : (isCurrentLevel ? level.color : 'var(--color-border)'),
                  boxShadow: isCompleted ? '0 4px 20px rgba(16, 185, 129, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}
                onClick={() => {
                  if (canAccess) {
                    handleOpenPDF(level);
                  }
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-xl" style={{ backgroundColor: level.color + '20', color: level.color }}>
                      {LEVEL_PDF_MAPPING[level.id]?.icon || <BookOpen className="w-6 h-6" />}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-1 flex items-center gap-2" style={{ color: level.color }}>
                        {level.nameRu}
                        {isCurrentLevel && (
                          <span className="text-sm px-2 py-1 rounded-full" 
                                style={{ backgroundColor: level.color, color: 'white' }}>
                            Текущий
                          </span>
                        )}
                        {!isUnlocked && (
                          <Lock className="w-4 h-4 text-gray-400" />
                        )}
                      </h3>
                      <p className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                        {level.description}
                      </p>
                      <div className="text-sm" style={{ color: 'var(--color-text)' }}>
                        Уроков: {level.lessons.length} • Прогресс: {progress}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="w-20 h-2 rounded-full mb-2" 
                         style={{ backgroundColor: 'var(--color-border)' }}>
                      <div 
                        className="h-full rounded-full transition-all"
                        style={{ 
                          width: `${progress}%`,
                          backgroundColor: level.color
                        }}
                      />
                    </div>
                    <div className="text-sm font-semibold" style={{ color: level.color }}>
                      {progress}%
                    </div>
                  </div>
                </div>
                
                {/* Показываем что это PDF книга */}
                {LEVEL_PDF_MAPPING[level.id] && (
                  <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
                    <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-primary)' }}>
                      <BookOpen className="w-4 h-4" />
                      <span>PDF Книга доступна</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Последние достижения */}
      {profile.progress.achievements.length > 0 && (
        <div 
          className="rounded-2xl p-6"
          style={{ 
            backgroundColor: 'var(--color-background-secondary)',
            borderColor: 'var(--color-border)',
            borderWidth: '1px'
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
              🏆 Последние достижения
            </h2>
            <button
              onClick={() => onScreenChange('achievements')}
              className="text-sm px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
              style={{ 
                backgroundColor: 'var(--color-primary)',
                color: 'white'
              }}
            >
              Все достижения
            </button>
          </div>
          
          <div className="flex space-x-4 overflow-x-auto">
            {profile.progress.achievements.slice(-3).map((achievementId, index) => {
              const achievement = muallamSaniStore.getAvailableAchievements()
                .find(a => a.id === achievementId);
              
              if (!achievement) return null;
              
              return (
                <div 
                  key={index}
                  className="flex-shrink-0 p-4 rounded-lg text-center min-w-[120px]"
                  style={{ backgroundColor: 'var(--color-background)' }}
                >
                  <div className="text-3xl mb-2">{achievement.icon}</div>
                  <div className="text-sm font-semibold" style={{ color: achievement.color }}>
                    {achievement.name}
                  </div>
                  <div className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                    +{achievement.points} очков
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
});

DashboardScreen.displayName = 'DashboardScreen';
export default DashboardScreen;