// Типы для системы Quran Journey

export type SurahStatus = 'locked' | 'available' | 'completed' | 'perfect';

export interface SurahProgress {
  surahNumber: number;
  status: SurahStatus;
  bestScore: number; // 0-100
  attempts: number;
  firstCompletedAt?: string; // ISO date string — переживает JSON persist/hydrate без потери типа
  lastAttemptedAt?: string; // ISO date string
  totalTimeSpent: number; // в секундах
  isPerfect: boolean; // 100% результат
}

export interface JourneyStats {
  completedSurahs: number;
  totalProgress: number; // 0-100
  currentJuz: number;
  achievementsUnlocked: number;
  totalTimeSpent: number;
  averageScore: number;
  perfectSurahs: number;
}

export type AchievementId = 
  | 'first_step'
  | 'meccan_master'
  | 'medinan_master'
  | 'speed_runner'
  | 'perfectionist'
  | 'complete_collection'
  | 'juz_1_complete'
  | 'juz_10_complete'
  | 'juz_20_complete'
  | 'juz_30_complete'
  | 'all_juz_complete'
  | 'ten_surahs'
  | 'fifty_surahs'
  | 'hundred_surahs'
  | 'night_owl'
  | 'early_bird'
  | 'week_streak'
  | 'month_streak';

export interface Achievement {
  id: AchievementId;
  title: { en: string; ru: string };
  description: { en: string; ru: string };
  icon: string;
  unlockedAt?: string; // ISO date string
  progress?: number; // 0-100 для прогресс-ачивок
  requirement?: number;
}

export interface SurahInfo {
  number: number;
  name: string;
  englishName: string;
  arabicName: string;
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan';
  juz: number;
  meaningEn: string;
  meaningRu: string;
  order: number; // порядок ниспослания
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface QuizQuestion {
  id: string;
  surahNumber: number;
  question: { en: string; ru: string };
  options: Array<{ en: string; ru: string }>;
  correctAnswer: number;
  explanation?: { en: string; ru: string };
  type: 'name' | 'ayahs' | 'revelation' | 'meaning' | 'content';
}

export interface QuizResult {
  surahNumber: number;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  completedAt: Date;
  answers: Array<{
    questionId: string;
    userAnswer: number;
    correctAnswer: number;
    isCorrect: boolean;
  }>;
}
