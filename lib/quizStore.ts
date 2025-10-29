import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  QuizConfig, 
  Question, 
  UserAnswer, 
  QuizResult, 
  QuizStats,
  Difficulty 
} from './quizTypes';
import { generateQuizQuestions, generateJourneyQuizQuestions } from './quizGenerator';

interface JourneyQuizConfig {
  surahNumbers: number[];
  questionsPerSurah: number;
  totalQuestions: number;
  difficulty: Difficulty;
  timeLimit: number;
}

interface QuizState {
  // Configuration
  config: QuizConfig | null;
  
  // Quiz session
  questions: Question[];
  currentQuestionIndex: number;
  answers: UserAnswer[];
  startTime: number | null;
  questionStartTime: number | null;
  isQuizActive: boolean;
  isPaused: boolean;
  
  // Results
  currentResult: QuizResult | null;
  quizHistory: QuizResult[];
  stats: QuizStats;
  
  // Actions
  setConfig: (config: QuizConfig) => void;
  startQuiz: (questions: Question[]) => void;
  startJourneyQuiz: (config: JourneyQuizConfig) => Promise<void>;
  nextQuestion: () => void;
  previousQuestion: () => void;
  goToQuestion: (index: number) => void;
  submitAnswer: (answer: UserAnswer) => void;
  finishQuiz: () => void;
  resetQuiz: () => void;
  pauseQuiz: () => void;
  resumeQuiz: () => void;
  
  // Stats management
  updateStats: () => void;
  clearHistory: () => void;
}

const initialStats: QuizStats = {
  totalQuizzesTaken: 0,
  averageScore: 0,
  bestScore: 0,
  totalTimeSpent: 0,
  streak: 0,
};

export const useQuizStore = create<QuizState>()(
  persist(
    (set, get) => ({
      // Initial state
      config: null,
      questions: [],
      currentQuestionIndex: 0,
      answers: [],
      startTime: null,
      questionStartTime: null,
      isQuizActive: false,
      isPaused: false,
      currentResult: null,
      quizHistory: [],
      stats: initialStats,
      
      // Set quiz configuration
      setConfig: (config) => set({ config }),
      
      // Start quiz with generated questions
      startQuiz: (questions) => set({
        questions,
        currentQuestionIndex: 0,
        answers: [],
        startTime: Date.now(),
        questionStartTime: Date.now(),
        isQuizActive: true,
        isPaused: false,
        currentResult: null,
      }),

      // Start journey quiz with custom config
      startJourneyQuiz: async (journeyConfig) => {
        // Сначала сбросим текущее состояние
        get().resetQuiz();
        
        const config: QuizConfig = {
          questionCount: Math.min(journeyConfig.totalQuestions, 10) as 1 | 3 | 5 | 10,
          difficulty: journeyConfig.difficulty,
          questionTypes: ['continue-ayah', 'missing-word'],
          timePerQuestion: journeyConfig.timeLimit,
          specificSurahs: journeyConfig.surahNumbers,
          showTranslation: true,
        };

        set({ config });
        
        try {
          console.log('Journey quiz config:', config);
          const questions = await generateJourneyQuizQuestions(
            journeyConfig.surahNumbers,
            journeyConfig.totalQuestions,
            journeyConfig.difficulty
          );
          console.log('Generated journey questions:', questions.map(q => ({ type: q.type, id: q.id })));
          
          get().startQuiz(questions);
        } catch (error) {
          console.error('Failed to generate journey quiz questions:', error);
        }
      },
      
      // Navigate to next question
      nextQuestion: () => {
        const { currentQuestionIndex, questions } = get();
        if (currentQuestionIndex < questions.length - 1) {
          set({
            currentQuestionIndex: currentQuestionIndex + 1,
            questionStartTime: Date.now(),
          });
        }
      },
      
      // Navigate to previous question
      previousQuestion: () => {
        const { currentQuestionIndex } = get();
        if (currentQuestionIndex > 0) {
          set({
            currentQuestionIndex: currentQuestionIndex - 1,
            questionStartTime: Date.now(),
          });
        }
      },
      
      // Jump to specific question
      goToQuestion: (index) => {
        const { questions } = get();
        if (index >= 0 && index < questions.length) {
          set({
            currentQuestionIndex: index,
            questionStartTime: Date.now(),
          });
        }
      },
      
      // Submit answer for current question
      submitAnswer: (answer) => {
        const { answers, currentQuestionIndex } = get();
        const updatedAnswers = [...answers];
        const existingIndex = updatedAnswers.findIndex(
          (a) => a.questionId === answer.questionId
        );
        
        if (existingIndex !== -1) {
          updatedAnswers[existingIndex] = answer;
        } else {
          updatedAnswers.push(answer);
        }
        
        set({ answers: updatedAnswers });
      },
      
      // Finish quiz and calculate results
      finishQuiz: () => {
        const { config, questions, answers, startTime, quizHistory } = get();
        
        if (!config || !startTime) return;
        
        const totalTimeSpent = Math.floor((Date.now() - startTime) / 1000);
        const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
        const score = answers
          .filter((a) => a.isCorrect)
          .reduce((sum, a) => {
            const question = questions.find((q) => q.id === a.questionId);
            return sum + (question?.points || 0);
          }, 0);
        
        const percentage = totalPoints > 0 ? (score / totalPoints) * 100 : 0;
        
        // Calculate performance metrics
        const byType: Record<string, { correct: number; total: number }> = {};
        const byDifficulty: Record<string, { correct: number; total: number }> = {};
        
        questions.forEach((question) => {
          const answer = answers.find((a) => a.questionId === question.id);
          
          // By type
          if (!byType[question.type]) {
            byType[question.type] = { correct: 0, total: 0 };
          }
          byType[question.type].total++;
          if (answer?.isCorrect) byType[question.type].correct++;
          
          // By difficulty
          if (!byDifficulty[question.difficulty]) {
            byDifficulty[question.difficulty] = { correct: 0, total: 0 };
          }
          byDifficulty[question.difficulty].total++;
          if (answer?.isCorrect) byDifficulty[question.difficulty].correct++;
        });
        
        const averageTimePerQuestion = answers.length > 0
          ? answers.reduce((sum, a) => sum + a.timeSpent, 0) / answers.length
          : 0;
        
        const result: QuizResult = {
          quizId: `quiz_${Date.now()}`,
          config,
          questions,
          answers,
          score,
          totalPoints,
          percentage,
          timeSpent: totalTimeSpent,
          completedAt: Date.now(),
          performance: {
            byType: byType as any,
            byDifficulty: byDifficulty as any,
            averageTimePerQuestion,
          },
        };
        
        set({
          currentResult: result,
          quizHistory: [...quizHistory, result],
          isQuizActive: false,
        });
        
        get().updateStats();
      },
      
      // Reset quiz to initial state
      resetQuiz: () => set({
        questions: [],
        currentQuestionIndex: 0,
        answers: [],
        startTime: null,
        questionStartTime: null,
        isQuizActive: false,
        isPaused: false,
        currentResult: null,
      }),
      
      // Pause quiz
      pauseQuiz: () => set({ isPaused: true }),
      
      // Resume quiz
      resumeQuiz: () => set({
        isPaused: false,
        questionStartTime: Date.now(),
      }),
      
      // Update overall statistics
      updateStats: () => {
        const { quizHistory } = get();
        
        if (quizHistory.length === 0) {
          set({ stats: initialStats });
          return;
        }
        
        const totalQuizzesTaken = quizHistory.length;
        const averageScore = quizHistory.reduce((sum, r) => sum + r.percentage, 0) / totalQuizzesTaken;
        const bestScore = Math.max(...quizHistory.map((r) => r.percentage));
        const totalTimeSpent = quizHistory.reduce((sum, r) => sum + r.timeSpent, 0);
        
        // Calculate streak (consecutive days with quizzes)
        const sortedQuizzes = [...quizHistory].sort((a, b) => b.completedAt - a.completedAt);
        let streak = 0;
        let lastDate = new Date(sortedQuizzes[0].completedAt).toDateString();
        
        for (const quiz of sortedQuizzes) {
          const quizDate = new Date(quiz.completedAt).toDateString();
          if (quizDate === lastDate) continue;
          
          const dayDiff = Math.floor(
            (new Date(lastDate).getTime() - new Date(quizDate).getTime()) / (1000 * 60 * 60 * 24)
          );
          
          if (dayDiff <= 1) {
            streak++;
            lastDate = quizDate;
          } else {
            break;
          }
        }
        
        // Find favorite and weakest question types
        const typeStats: Record<string, { correct: number; total: number }> = {};
        
        quizHistory.forEach((quiz) => {
          Object.entries(quiz.performance.byType).forEach(([type, stats]) => {
            if (!typeStats[type]) {
              typeStats[type] = { correct: 0, total: 0 };
            }
            typeStats[type].correct += stats.correct;
            typeStats[type].total += stats.total;
          });
        });
        
        let favoriteType: string | undefined;
        let weakestType: string | undefined;
        let bestAccuracy = 0;
        let worstAccuracy = 100;
        
        Object.entries(typeStats).forEach(([type, stats]) => {
          if (stats.total === 0) return;
          const accuracy = (stats.correct / stats.total) * 100;
          
          if (accuracy > bestAccuracy) {
            bestAccuracy = accuracy;
            favoriteType = type;
          }
          
          if (accuracy < worstAccuracy) {
            worstAccuracy = accuracy;
            weakestType = type;
          }
        });
        
        set({
          stats: {
            totalQuizzesTaken,
            averageScore,
            bestScore,
            totalTimeSpent,
            favoriteQuestionType: favoriteType as any,
            weakestQuestionType: weakestType as any,
            streak: streak + 1,
            lastQuizDate: sortedQuizzes[0].completedAt,
          },
        });
      },
      
      // Clear quiz history
      clearHistory: () => set({
        quizHistory: [],
        stats: initialStats,
        currentResult: null,
      }),
    }),
    {
      name: 'quran-quiz-storage',
      partialize: (state) => ({
        quizHistory: state.quizHistory,
        stats: state.stats,
      }),
    }
  )
);
