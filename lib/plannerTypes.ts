// Типы данных для планировщика изучения Корана

export interface UserProfile {
  id: string;
  name: string;
  createdAt: string;
  preferences: {
    language: string;
    theme: string;
    notifications: boolean;
    reminderTime?: string;
  };
}

export interface StudyGoal {
  type: 'surah' | 'juz' | 'multiple_surahs' | 'complete_quran';
  surahs?: number[]; // ID сур для изучения
  juzs?: number[]; // ID джузов для изучения
  specificAyahs?: {
    surah: number;
    fromAyah: number;
    toAyah: number;
  }[];
}

export interface StudySchedule {
  ayahsPerDay: number; // 1-10 аятов в день
  daysPerWeek: number; // 3-7 дней в неделю
  activeDays: number[]; // 0=Воскресенье, 1=Понедельник, и т.д.
  startDate: string;
  estimatedEndDate: string;
}

export interface DailyTask {
  date: string; // YYYY-MM-DD
  surahNumber: number;
  fromAyah: number;
  toAyah: number;
  ayahCount: number;
  completed: boolean;
  completedAt?: string;
  timeSpent?: number; // в минутах
  notes?: string;
  skipped: boolean;
}

export interface StudyPlan {
  id: string;
  userId: string;
  title: string;
  description?: string;
  goal: StudyGoal;
  schedule: StudySchedule;
  tasks: DailyTask[];
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  currentStreak: number;
  longestStreak: number;
  totalDaysCompleted: number;
  completionPercentage: number;
}

export interface ProgressStats {
  totalPlans: number;
  completedPlans: number;
  activePlans: number;
  totalAyahsRead: number;
  totalTimeSpent: number; // в минутах
  currentStreak: number;
  longestStreak: number;
  averageSessionTime: number;
  weeklyProgress: {
    week: string; // YYYY-WW
    completedDays: number;
    totalAyahs: number;
  }[];
  monthlyProgress: {
    month: string; // YYYY-MM
    completedDays: number;
    totalAyahs: number;
  }[];
}

export interface Achievement {
  id: string;
  type: 'streak' | 'completion' | 'milestone' | 'consistency';
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  requirements: {
    streak?: number;
    plansCompleted?: number;
    ayahsRead?: number;
    daysConsistent?: number;
  };
}

export interface MotivationalMessage {
  type: 'encouragement' | 'celebration' | 'reminder' | 'milestone';
  title: string;
  message: string;
  triggeredBy: 'streak' | 'completion' | 'missed_day' | 'milestone';
}

export interface CalendarDay {
  date: string;
  status: 'completed' | 'skipped' | 'pending' | 'future';
  ayahsRead?: number;
  timeSpent?: number;
  tasks: DailyTask[];
}

export interface StudySession {
  planId: string;
  taskDate: string;
  startTime: string;
  endTime?: string;
  ayahsCompleted: number;
  notes?: string;
  rating?: number; // 1-5 звезд
}

// Типы для API Корана
export interface QuranSurah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan';
}

export interface QuranAyah {
  number: number;
  text: string;
  surah: {
    number: number;
    name: string;
  };
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean;
}

export interface QuranJuz {
  number: number;
  ayahs: QuranAyah[];
}

export interface QuranEdition {
  identifier: string;
  language: string;
  name: string;
  englishName: string;
  format: string;
  type: string;
}

// Типы для хранения в localStorage
export interface LocalStorageData {
  version: string;
  userProfile: UserProfile;
  studyPlans: StudyPlan[];
  progressStats: ProgressStats;
  achievements: Achievement[];
  lastBackup?: string;
}

// Типы для экспорта/импорта данных
export interface ExportData extends LocalStorageData {
  exportedAt: string;
  appVersion: string;
}

// Утилитарные типы
export type PlanStatus = StudyPlan['status'];
export type GoalType = StudyGoal['type'];
export type TaskStatus = 'completed' | 'pending' | 'skipped' | 'overdue';

// Константы
export const STORAGE_KEYS = {
  USER_PROFILE: 'quran_planner_profile',
  STUDY_PLANS: 'quran_planner_plans',
  PROGRESS_STATS: 'quran_planner_progress',
  ACHIEVEMENTS: 'quran_planner_achievements',
  SETTINGS: 'quran_planner_settings',
} as const;

export const DEFAULT_AYAHS_PER_DAY = 3;
export const DEFAULT_DAYS_PER_WEEK = 5;
export const MAX_AYAHS_PER_DAY = 10;
export const MIN_AYAHS_PER_DAY = 1;
export const MAX_DAYS_PER_WEEK = 7;
export const MIN_DAYS_PER_WEEK = 3;

// Данные о Коране
export const QURAN_META = {
  TOTAL_SURAHS: 114,
  TOTAL_AYAHS: 6236,
  TOTAL_JUZ: 30,
  TOTAL_PAGES: 604,
  TOTAL_MANZILS: 7,
  TOTAL_RUKUS: 556,
  TOTAL_HIZB_QUARTERS: 240,
} as const;

// Информация о сурах (сокращенная версия для планирования)
export const SURAH_INFO = [
  { number: 1, name: 'الفاتحة', englishName: 'Al-Fatiha', ayahs: 7, type: 'Meccan' },
  { number: 2, name: 'البقرة', englishName: 'Al-Baqarah', ayahs: 286, type: 'Medinan' },
  { number: 3, name: 'آل عمران', englishName: 'Aal-E-Imran', ayahs: 200, type: 'Medinan' },
  // ... остальные суры будут загружены из API
] as const;