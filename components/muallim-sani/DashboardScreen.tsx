'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/context/LocaleContext';
import { MuallamSaniProfile, LearningLevel } from '@/types/muallim-sani';
import { muallamSaniStore } from '@/lib/muallamSaniStore';
import { BookOpen, FileText, Waves, Music, RefreshCw, GraduationCap, User, Trophy, Flame, BarChart3, Lock } from 'lucide-react';

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

export default function DashboardScreen({ profile, onScreenChange, onProfileUpdate }: DashboardScreenProps) {
  const router = useRouter();
  const levels = muallamSaniStore.getLearningLevels();
  const stats = muallamSaniStore.getStats();

  const getProgressPercentage = (level: LearningLevel): number => {
    // Простая проверка - если уровень пройден
    const isCompleted = profile.progress.completedLessons.includes(level.id);
    return isCompleted ? 100 : 0;
  };

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

  // Функция для прямого перехода к PDF
  const handleOpenPDF = (level: LearningLevel, fromCompletion = false) => {
    const pdfData = LEVEL_PDF_MAPPING[level.id];
    if (pdfData) {
      const nextLevelForProps = getNextLevel(level.id);
      onScreenChange('pdf-viewer', {
        pdfPath: `/muallim_sani/${pdfData.fileName}`,
        pdfTitle: pdfData.title,
        bookId: level.id,
        nextLevel: nextLevelForProps,
        onCompletion: (completedLevelId: string) => {
          // Обновляем прогресс текущего уровня
          const updatedProfile = { ...profile };
          if (!updatedProfile.progress.completedLessons.includes(completedLevelId)) {
            updatedProfile.progress.completedLessons.push(completedLevelId);
          }
          
          // Разблокируем следующий уровень
          const nextLevelToUnlock = getNextLevel(completedLevelId);
          if (nextLevelToUnlock && updatedProfile.progress.unlockedLevels) {
            if (!updatedProfile.progress.unlockedLevels.includes(nextLevelToUnlock.id)) {
              updatedProfile.progress.unlockedLevels.push(nextLevelToUnlock.id);
            }
          }
          
          // Автоматически переходим к следующему уроку
          if (nextLevelToUnlock && !fromCompletion) {
            setTimeout(() => {
              handleOpenPDF(nextLevelToUnlock, true);
            }, 1500);
          } else {
            // Возвращаемся на главную страницу если это последний урок
            onScreenChange('dashboard');
          }
          
          onProfileUpdate(updatedProfile);
        }
      });
    }
  };

  const getGreeting = () => {
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
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold mb-1" style={{ color: 'var(--color-primary)' }}>
              {Math.floor(stats.totalTimeSpent / 60)}
            </div>
            <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
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
            const progress = getProgressPercentage(level);
            const isCurrentLevel = profile.progress.currentLevel === level.id;
            const isUnlocked = index === 0 || (profile.progress.unlockedLevels && profile.progress.unlockedLevels.includes(level.id));
            const canAccess = isUnlocked;
            
            return (
              <div
                key={level.id}
                className={`rounded-xl p-6 border-2 transition-all ${
                  canAccess ? 'cursor-pointer hover:opacity-90 hover:scale-105' : 'opacity-50 cursor-not-allowed'
                }`}
                style={{ 
                  backgroundColor: 'var(--color-background-secondary)',
                  borderColor: isCurrentLevel ? level.color : 'var(--color-border)'
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
}