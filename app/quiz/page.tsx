'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { Loader2, Brain, BookOpen, Target } from 'lucide-react';
import { useLocale } from '@/context/LocaleContext';

// Компонент загрузки для генерации квиза
function QuizGenerationLoader({ surahNumber }: { surahNumber?: string }) {
  const { locale, t } = useLocale();
  
  return (
    <div className="min-h-screen flex items-center justify-center" 
         style={{ backgroundColor: 'var(--fixed-background)' }}>
      <div className="text-center max-w-md mx-auto p-8">
        {/* Анимированная иконка */}
        <div className="relative mb-8">
          <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center"
               style={{ 
                 background: 'linear-gradient(135deg, var(--color-primary) 0%, #059669 100%)',
                 boxShadow: '0 10px 40px rgba(16, 185, 129, 0.3)'
               }}>
            <Brain className="w-10 h-10 text-white" />
          </div>
          <div className="absolute inset-0 w-20 h-20 mx-auto rounded-full border-4 border-transparent"
               style={{ 
                 borderTopColor: 'var(--color-primary)',
                 animation: 'spin 2s linear infinite'
               }} />
        </div>

        {/* Заголовок */}
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--fixed-text)' }}>
          {t('generatingQuizQuestions')}
        </h2>

        {/* Подзаголовок с информацией о суре */}
        {surahNumber && (
          <p className="text-lg mb-6" style={{ color: 'var(--color-primary)' }}>
            {t('surah')} {surahNumber}
          </p>
        )}

        {/* Описание процесса */}
        <div className="space-y-3 mb-8">
          <div className="flex items-center gap-3 text-left">
            <div className="w-8 h-8 rounded-full flex items-center justify-center"
                 style={{ backgroundColor: 'var(--color-primary)' }}>
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span style={{ color: 'var(--fixed-text-secondary)' }}>
              {t('analyzingVerses')}
            </span>
          </div>
          
          <div className="flex items-center gap-3 text-left">
            <div className="w-8 h-8 rounded-full flex items-center justify-center"
                 style={{ backgroundColor: 'var(--color-primary)' }}>
              <Target className="w-4 h-4 text-white" />
            </div>
            <span style={{ color: 'var(--fixed-text-secondary)' }}>
              {t('preparingQuizFormat')}
            </span>
          </div>
        </div>

        {/* Прогресс индикатор */}
        <div className="w-full h-2 rounded-full overflow-hidden mb-4"
             style={{ backgroundColor: 'var(--color-border)' }}>
          <div className="h-full rounded-full animate-pulse"
               style={{ 
                 background: 'linear-gradient(90deg, var(--color-primary), transparent, var(--color-primary))',
                 animation: 'shimmer 2s infinite'
               }} />
        </div>

        <p className="text-sm" style={{ color: 'var(--fixed-text-secondary)', opacity: 0.7 }}>
          {t('usuallyTakesFewSeconds')}
        </p>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// Lazy loading компонентов квиза для лучшей производительности
const QuizConfiguration = dynamic(() => 
  import('@/components/quiz/QuizConfiguration').then(mod => ({ default: mod.QuizConfiguration })),
  { 
    loading: () => <div className="flex items-center justify-center p-8">Loading quiz settings...</div>,
    ssr: false 
  }
);

const Quiz = dynamic(() => 
  import('@/components/quiz/Quiz').then(mod => ({ default: mod.Quiz })),
  { 
    loading: () => <div className="flex items-center justify-center p-8">Loading quiz...</div>,
    ssr: false 
  }
);

const QuizResults = dynamic(() => 
  import('@/components/quiz/QuizResults').then(mod => ({ default: mod.QuizResults })),
  { 
    loading: () => <div className="flex items-center justify-center p-8">Loading results...</div>,
    ssr: false 
  }
);
import { useQuizStore } from '@/lib/quizStore';
import { useJourneyStore } from '@/lib/journeyStore';
import { generateQuizQuestions } from '@/lib/quizGenerator';
import type { QuizConfig } from '@/lib/quizTypes';

type QuizPhase = 'config' | 'quiz' | 'results';

function QuizPageContent() {
  const searchParams = useSearchParams();
  const surahNumber = searchParams?.get('surah');
  const { t } = useLocale();
  
  const [phase, setPhase] = useState<QuizPhase>('config');
  const [isGenerating, setIsGenerating] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  
  const {
    setConfig,
    startQuiz,
    resetQuiz,
    currentResult,
    isQuizActive,
    config,
  } = useQuizStore();
  
  const { completeSurahQuiz } = useJourneyStore();
  
  // Автозапуск квиза для конкретной суры из Journey
  useEffect(() => {
    if (surahNumber && phase === 'config') {
      const journeyConfig: QuizConfig = {
        difficulty: 'medium',
        questionCount: 5,
        specificSurahs: [parseInt(surahNumber)],
        questionTypes: ['continue-ayah', 'missing-word'],
        showTranslation: true,
      };
      handleStartQuiz(journeyConfig);
    }
  }, [surahNumber, phase]);
  
  const handleStartQuiz = async (quizConfig: QuizConfig) => {
    try {
      setIsGenerating(true);
      setConfig(quizConfig);
      
      // Generate questions based on configuration
      const questions = await generateQuizQuestions(quizConfig);
      
      if (questions.length === 0) {
        throw new Error('Failed to generate questions');
      }
      
      startQuiz(questions);
      setStartTime(Date.now());
      setPhase('quiz');
    } catch (error) {
      console.error('Error generating quiz:', error);
      alert('Failed to generate quiz. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleRetry = () => {
    resetQuiz();
    setPhase('config');
  };
  
  const handleHome = () => {
    resetQuiz();
    setPhase('config');
    window.location.href = '/';
  };
  
  // Check if quiz is finished and save to Journey
  useEffect(() => {
    if (!isQuizActive && currentResult && phase === 'quiz') {
      // Сохраняем результат в Journey, если это был квиз по конкретной суре
      if (surahNumber) {
        const timeSpent = Math.floor((Date.now() - startTime) / 1000);
        
        // Подсчет правильных ответов
        const correctAnswers = currentResult.answers.filter(a => a.isCorrect).length;
        const totalQuestions = currentResult.answers.length;
        const score = Math.round((correctAnswers / totalQuestions) * 100);
        
        console.log('Saving quiz result:', {
          surahNumber: parseInt(surahNumber),
          score,
          correctAnswers,
          totalQuestions,
        });
        
        completeSurahQuiz({
          surahNumber: parseInt(surahNumber),
          score,
          totalQuestions,
          correctAnswers,
          timeSpent,
          completedAt: new Date(),
          answers: currentResult.answers.map((answer) => {
            const question = currentResult.questions.find(q => q.id === answer.questionId);
            const correctAnswerStr = question?.correctAnswer || '0';
            return {
              questionId: answer.questionId,
              userAnswer: answer.selectedAnswer ? parseInt(answer.selectedAnswer) : -1,
              correctAnswer: parseInt(correctAnswerStr),
              isCorrect: answer.isCorrect,
            };
          }),
        });
      }
      
      setPhase('results');
    }
  }, [isQuizActive, currentResult, phase, surahNumber, startTime, completeSurahQuiz]);

  // Показываем лоадер генерации если идет процесс генерации
  if (isGenerating) {
    return <QuizGenerationLoader surahNumber={surahNumber || undefined} />;
  }
  
  return (
    <div className="min-h-screen" style={{ 
      backgroundColor: 'var(--fixed-background)',
      color: 'var(--fixed-text)'
    }}>
      <AnimatePresence mode="wait">
        {phase === 'config' && !surahNumber && (
          <motion.div
            key="config"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <QuizConfiguration
              onStart={handleStartQuiz}
              isLoading={isGenerating}
            />
          </motion.div>
        )}
        
        {phase === 'quiz' && (
          <motion.div
            key="quiz"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Quiz />
          </motion.div>
        )}
        
        {phase === 'results' && currentResult && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
          >
            <QuizResults
              result={currentResult}
              onRetry={handleRetry}
              onHome={handleHome}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Загрузка квиза...</p>
        </div>
      </div>
    }>
      <QuizPageContent />
    </Suspense>
  );
}
