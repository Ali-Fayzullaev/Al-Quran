export interface MuallamSaniProfile {
  userId: string;
  profile: {
    name: string;
    avatar: string;
    joinedDate: Date;
    dailyGoal: number; // минут в день
    preferredTime: 'morning' | 'afternoon' | 'evening';
  };
  
  progress: {
    currentLevel: string;
    completedLessons: string[];
    unlockedLevels?: string[]; // Разблокированные уровни
    scores: {
      [lessonId: string]: {
        attempts: number;
        bestScore: number;
        lastScore: number;
        timeSpent: number;
      };
    };
    achievements: string[];
    streak: number; // дней подряд
    lastStudyDate: Date;
    totalPoints?: number;
    levelProgress?: { [levelId: string]: number };
  };
  
  settings: {
    language: 'ru' | 'en' | 'uz';
    audioEnabled: boolean;
    animations: boolean;
    difficulty: 'easy' | 'medium' | 'hard';
    vibrationEnabled: boolean;
  };
}

export interface LearningLevel {
  id: string;
  nameRu: string;
  nameEn: string;
  nameUz: string;
  description: string;
  icon: string;
  color: string;
  lessons: Lesson[];
  order: number;
  isLocked: boolean;
  pdfPath?: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  pdfUrl: string;
  audioUrl?: string;
  duration: number; // минуты
  difficulty: number; // 1-5
  prerequisites: string[];
  isCompleted: boolean;
  lastAccessed?: Date;
  quiz: Quiz;
}

export interface Quiz {
  id: string;
  levelId: string;
  questions: Question[];
  passingScore: number;
  timeLimit?: number; // минуты
  attempts?: QuizAttempt[];
  createdAt?: Date;
}

export interface Question {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'fill-blank';
  text: string;
  audioUrl?: string;
  imageUrl?: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  difficulty: number;
  points: number;
}

export interface QuizAttempt {
  id: string;
  startTime: Date;
  endTime: Date;
  score: number;
  answers: QuestionAnswer[];
  timeSpent: number;
}

export interface QuestionAnswer {
  questionId: string;
  userAnswer: string | string[];
  isCorrect: boolean;
  timeSpent: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  condition: string;
  points: number;
  isUnlocked: boolean;
  unlockedDate?: Date;
}

export interface AchievementNotification {
  id: string;
  achievement: Achievement;
  message: string;
  praise: string;
  points: number;
  timestamp: Date;
}

export interface StudyStats {
  totalTimeSpent: number;
  lessonsCompleted: number;
  averageScore: number;
  currentStreak: number;
  bestStreak: number;
  totalQuizzes: number;
  perfectScores: number;
  weeklyProgress: number[];
}