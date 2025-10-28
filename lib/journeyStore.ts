import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  SurahProgress, 
  JourneyStats, 
  Achievement, 
  AchievementId, 
  QuizResult,
  SurahStatus 
} from './journeyTypes';

// Данные о сурах
export const SURAHS_DATA = [
  { number: 1, name: "Al-Fatihah", arabicName: "الفاتحة", ayahs: 7, revelation: "Meccan", juz: 1, meaningEn: "The Opening", meaningRu: "Открывающая", order: 5, difficulty: "easy" },
  { number: 2, name: "Al-Baqarah", arabicName: "البقرة", ayahs: 286, revelation: "Medinan", juz: 1, meaningEn: "The Cow", meaningRu: "Корова", order: 87, difficulty: "hard" },
  { number: 3, name: "Ali 'Imran", arabicName: "آل عمران", ayahs: 200, revelation: "Medinan", juz: 3, meaningEn: "Family of Imran", meaningRu: "Семейство Имрана", order: 89, difficulty: "hard" },
  { number: 4, name: "An-Nisa", arabicName: "النساء", ayahs: 176, revelation: "Medinan", juz: 4, meaningEn: "The Women", meaningRu: "Женщины", order: 92, difficulty: "hard" },
  { number: 5, name: "Al-Ma'idah", arabicName: "المائدة", ayahs: 120, revelation: "Medinan", juz: 6, meaningEn: "The Table Spread", meaningRu: "Трапеза", order: 112, difficulty: "medium" },
  // ... добавим остальные суры динамически
] as const;

// Список всех достижений
const ACHIEVEMENTS_LIST: Achievement[] = [
  {
    id: 'first_step',
    title: { en: 'First Step', ru: 'Первый шаг' },
    description: { en: 'Complete your first surah', ru: 'Завершите первую суру' },
    icon: '🎯',
  },
  {
    id: 'meccan_master',
    title: { en: 'Meccan Master', ru: 'Знаток Мекки' },
    description: { en: 'Complete all Meccan surahs', ru: 'Завершите все мекканские суры' },
    icon: '🕋',
  },
  {
    id: 'medinan_master',
    title: { en: 'Medinan Master', ru: 'Мастер Медины' },
    description: { en: 'Complete all Medinan surahs', ru: 'Завершите все мединские суры' },
    icon: '🕌',
  },
  {
    id: 'speed_runner',
    title: { en: 'Speed Runner', ru: 'Скоростник' },
    description: { en: 'Complete 10 surahs in one day', ru: 'Завершите 10 сур за один день' },
    icon: '⚡',
  },
  {
    id: 'perfectionist',
    title: { en: 'Perfectionist', ru: 'Перфекционист' },
    description: { en: 'Get 100% on 10 surahs', ru: 'Получите 100% по 10 сурам' },
    icon: '💯',
  },
  {
    id: 'complete_collection',
    title: { en: 'Complete Collection', ru: 'Полное собрание' },
    description: { en: 'Unlock all 114 surahs', ru: 'Откройте все 114 сур' },
    icon: '👑',
  },
  {
    id: 'ten_surahs',
    title: { en: '10 Surahs', ru: '10 сур' },
    description: { en: 'Complete 10 surahs', ru: 'Завершите 10 сур' },
    icon: '🌟',
  },
  {
    id: 'fifty_surahs',
    title: { en: '50 Surahs', ru: '50 сур' },
    description: { en: 'Complete 50 surahs', ru: 'Завершите 50 сур' },
    icon: '⭐',
  },
  {
    id: 'week_streak',
    title: { en: 'Week Streak', ru: 'Неделя подряд' },
    description: { en: 'Study for 7 days in a row', ru: 'Учитесь 7 дней подряд' },
    icon: '🔥',
  },
];

interface JourneyStore {
  // State
  surahProgress: Record<number, SurahProgress>;
  achievements: Record<AchievementId, Achievement>;
  stats: JourneyStats;
  currentSurah: number | null;
  lastPlayedDate: string | null;
  streakDays: number;
  
  // Actions
  initializeJourney: () => void;
  completeSurahQuiz: (result: QuizResult) => void;
  getSurahStatus: (surahNumber: number) => SurahStatus;
  getUnlockedSurahs: () => number[];
  unlockAchievement: (achievementId: AchievementId) => void;
  checkAchievements: () => void;
  updateStreak: () => void;
  resetJourney: () => void;
}

export const useJourneyStore = create<JourneyStore>()(
  persist(
    (set, get) => ({
      surahProgress: {},
      achievements: ACHIEVEMENTS_LIST.reduce((acc, achievement) => {
        acc[achievement.id] = achievement;
        return acc;
      }, {} as Record<AchievementId, Achievement>),
      stats: {
        completedSurahs: 0,
        totalProgress: 0,
        currentJuz: 1,
        achievementsUnlocked: 0,
        totalTimeSpent: 0,
        averageScore: 0,
        perfectSurahs: 0,
      },
      currentSurah: null,
      lastPlayedDate: null,
      streakDays: 0,

      initializeJourney: () => {
        const { surahProgress } = get();
        
        // Если пустой, инициализируем
        if (Object.keys(surahProgress).length === 0) {
          const initialProgress: Record<number, SurahProgress> = {};
          
          // Первые 5 сур открыты сразу (Аль-Фатиха + 4 короткие)
          const initialUnlockedSurahs = [1, 109, 110, 111, 112];
          
          for (let i = 1; i <= 114; i++) {
            initialProgress[i] = {
              surahNumber: i,
              status: initialUnlockedSurahs.includes(i) ? 'available' : 'locked',
              bestScore: 0,
              attempts: 0,
              totalTimeSpent: 0,
              isPerfect: false,
            };
          }
          
          set({ surahProgress: initialProgress });
        }
      },

      completeSurahQuiz: (result: QuizResult) => {
        const { surahProgress, stats } = get();
        const { surahNumber, score, correctAnswers, totalQuestions, timeSpent } = result;
        
        console.log('completeSurahQuiz called:', { surahNumber, score, correctAnswers, totalQuestions });
        
        const currentProgress = surahProgress[surahNumber] || {
          surahNumber,
          status: 'available' as SurahStatus,
          bestScore: 0,
          attempts: 0,
          totalTimeSpent: 0,
          isPerfect: false,
        };

        const isFirstCompletion = currentProgress.bestScore === 0;
        const isPerfect = score === 100;
        const isCompleted = score >= 70;

        const updatedProgress: SurahProgress = {
          ...currentProgress,
          bestScore: Math.max(currentProgress.bestScore, score),
          attempts: currentProgress.attempts + 1,
          totalTimeSpent: currentProgress.totalTimeSpent + timeSpent,
          isPerfect: isPerfect || currentProgress.isPerfect,
          status: isPerfect ? 'perfect' : isCompleted ? 'completed' : currentProgress.status,
          lastAttemptedAt: new Date(),
          firstCompletedAt: isFirstCompletion && isCompleted ? new Date() : currentProgress.firstCompletedAt,
        };

        const updatedSurahProgress = {
          ...surahProgress,
          [surahNumber]: updatedProgress,
        };

        // Разблокируем следующие суры
        if (isCompleted) {
          // Разблокируем следующую суру
          if (surahNumber < 114 && surahProgress[surahNumber + 1]?.status === 'locked') {
            updatedSurahProgress[surahNumber + 1] = {
              ...updatedSurahProgress[surahNumber + 1],
              status: 'available',
            };
          }
        }

        // Обновляем статистику
        const completedCount = Object.values(updatedSurahProgress).filter(p => 
          p.status === 'completed' || p.status === 'perfect'
        ).length;
        
        const perfectCount = Object.values(updatedSurahProgress).filter(p => 
          p.isPerfect
        ).length;

        const totalScore = Object.values(updatedSurahProgress).reduce((sum, p) => sum + p.bestScore, 0);
        const avgScore = completedCount > 0 ? totalScore / completedCount : 0;

        const updatedStats: JourneyStats = {
          completedSurahs: completedCount,
          totalProgress: Math.round((completedCount / 114) * 100),
          currentJuz: Math.ceil(surahNumber / 4),
          achievementsUnlocked: stats.achievementsUnlocked,
          totalTimeSpent: stats.totalTimeSpent + timeSpent,
          averageScore: Math.round(avgScore),
          perfectSurahs: perfectCount,
        };

        console.log('Updated stats:', updatedStats);
        console.log('Updated progress for surah', surahNumber, ':', updatedProgress);

        set({ 
          surahProgress: updatedSurahProgress,
          stats: updatedStats,
          currentSurah: surahNumber,
        });

        // Проверяем достижения
        get().checkAchievements();
        get().updateStreak();
      },

      getSurahStatus: (surahNumber: number) => {
        const { surahProgress } = get();
        return surahProgress[surahNumber]?.status || 'locked';
      },

      getUnlockedSurahs: () => {
        const { surahProgress } = get();
        return Object.values(surahProgress)
          .filter(p => p.status !== 'locked')
          .map(p => p.surahNumber)
          .sort((a, b) => a - b);
      },

      unlockAchievement: (achievementId: AchievementId) => {
        const { achievements, stats } = get();
        
        if (!achievements[achievementId].unlockedAt) {
          set({
            achievements: {
              ...achievements,
              [achievementId]: {
                ...achievements[achievementId],
                unlockedAt: new Date(),
              },
            },
            stats: {
              ...stats,
              achievementsUnlocked: stats.achievementsUnlocked + 1,
            },
          });
        }
      },

      checkAchievements: () => {
        const { surahProgress, stats, unlockAchievement } = get();
        
        // First Step
        if (stats.completedSurahs >= 1) {
          unlockAchievement('first_step');
        }

        // 10, 50 Surahs
        if (stats.completedSurahs >= 10) {
          unlockAchievement('ten_surahs');
        }
        if (stats.completedSurahs >= 50) {
          unlockAchievement('fifty_surahs');
        }

        // Complete Collection
        if (stats.completedSurahs >= 114) {
          unlockAchievement('complete_collection');
        }

        // Perfectionist
        if (stats.perfectSurahs >= 10) {
          unlockAchievement('perfectionist');
        }

        // Week Streak
        const { streakDays } = get();
        if (streakDays >= 7) {
          unlockAchievement('week_streak');
        }
      },

      updateStreak: () => {
        const { lastPlayedDate, streakDays } = get();
        const today = new Date().toDateString();
        
        if (lastPlayedDate !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const isConsecutive = lastPlayedDate === yesterday.toDateString();
          
          set({
            lastPlayedDate: today,
            streakDays: isConsecutive ? streakDays + 1 : 1,
          });
        }
      },

      resetJourney: () => {
        set({
          surahProgress: {},
          stats: {
            completedSurahs: 0,
            totalProgress: 0,
            currentJuz: 1,
            achievementsUnlocked: 0,
            totalTimeSpent: 0,
            averageScore: 0,
            perfectSurahs: 0,
          },
          currentSurah: null,
          lastPlayedDate: null,
          streakDays: 0,
        });
        get().initializeJourney();
      },
    }),
    {
      name: 'quran-journey-storage',
    }
  )
);
