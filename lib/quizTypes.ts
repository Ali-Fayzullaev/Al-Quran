// 🎯 Quiz Configuration and Type Definitions

export type QuestionType = 
  | 'guess-surah'
  | 'continue-ayah'
  | 'missing-word'
  | 'surah-description'
  | 'ayah-order';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface QuizConfig {
  questionCount: 1 | 3 | 5 | 10;
  difficulty: Difficulty;
  questionTypes: QuestionType[];
  timePerQuestion?: number; // in seconds, undefined means no time limit
  specificSurahs?: number[];
  showTranslation: boolean;
}

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  difficulty: Difficulty;
  surahNumber: number;
  surahName: string;
  options: QuestionOption[];
  correctAnswer: string;
  explanation: string;
  verseReference?: string;
  points: number;
}

export interface GuessSurahQuestion extends BaseQuestion {
  type: 'guess-surah';
  ayahText: string;
  ayahNumber: number;
}

export interface ContinueAyahQuestion extends BaseQuestion {
  type: 'continue-ayah';
  ayahStart: string;
  ayahNumber: number;
}

export interface MissingWordQuestion extends BaseQuestion {
  type: 'missing-word';
  ayahText: string;
  missingWord: string;
  ayahNumber: number;
}

export interface SurahDescriptionQuestion extends BaseQuestion {
  type: 'surah-description';
  description: string;
}

export interface AyahOrderQuestion extends BaseQuestion {
  type: 'ayah-order';
  ayahs: Array<{ text: string; correctOrder: number }>;
}

export type Question = 
  | GuessSurahQuestion 
  | ContinueAyahQuestion 
  | MissingWordQuestion 
  | SurahDescriptionQuestion 
  | AyahOrderQuestion;

export interface UserAnswer {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  timeSpent: number; // in seconds
  timestamp: number;
}

export interface QuizResult {
  quizId: string;
  config: QuizConfig;
  questions: Question[];
  answers: UserAnswer[];
  score: number;
  totalPoints: number;
  percentage: number;
  timeSpent: number; // total time in seconds
  completedAt: number;
  performance: {
    byType: Record<QuestionType, { correct: number; total: number }>;
    byDifficulty: Record<Difficulty, { correct: number; total: number }>;
    averageTimePerQuestion: number;
  };
}

export interface QuizStats {
  totalQuizzesTaken: number;
  averageScore: number;
  bestScore: number;
  totalTimeSpent: number;
  favoriteQuestionType?: QuestionType;
  weakestQuestionType?: QuestionType;
  streak: number;
  lastQuizDate?: number;
}

export interface IslamicMotivation {
  type: 'dua' | 'hadith' | 'ayah';
  arabic: string;
  translation: string;
  reference: string;
}

export interface PerformanceLevel {
  level: 'excellent' | 'good' | 'average' | 'needs-improvement';
  title: string;
  message: string;
  motivation: IslamicMotivation;
  recommendations: string[];
}
