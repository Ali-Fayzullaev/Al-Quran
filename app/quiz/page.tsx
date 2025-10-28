'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { QuizConfiguration } from '@/components/quiz/QuizConfiguration';
import { Quiz } from '@/components/quiz/Quiz';
import { QuizResults } from '@/components/quiz/QuizResults';
import { useQuizStore } from '@/lib/quizStore';
import { useJourneyStore } from '@/lib/journeyStore';
import { generateQuizQuestions } from '@/lib/quizGenerator';
import type { QuizConfig } from '@/lib/quizTypes';

type QuizPhase = 'config' | 'quiz' | 'results';

export default function QuizPage() {
  const searchParams = useSearchParams();
  const surahNumber = searchParams?.get('surah');
  
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
        questionTypes: ['guess-surah', 'continue-ayah', 'missing-word'],
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
