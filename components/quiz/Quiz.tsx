// src/components/quiz/Quiz.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Flag, Pause, Play, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuestionCard } from './QuestionCard';
import { useQuizStore } from '@/lib/quizStore';
import { useLocale } from '@/context/LocaleContext';
import { useQuranStore } from '@/lib/store';
import type { UserAnswer } from '@/lib/quizTypes';

export function Quiz() {
  const { locale, t } = useLocale();
  const customButtonColor = "var(--color-primary)";
  const {
    questions,
    currentQuestionIndex,
    config,
    isPaused,
    questionStartTime,
    nextQuestion,
    previousQuestion,
    submitAnswer,
    finishQuiz,
    pauseQuiz,
    resumeQuiz,
  } = useQuizStore();
  
  const [canProceed, setCanProceed] = useState(false);
  
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  
  useEffect(() => {
    setCanProceed(false);
  }, [currentQuestionIndex]);
  
  if (!currentQuestion || !config) {
    return null;
  }
  
  const handleAnswer = (answer: string, isCorrect: boolean, timeSpent: number) => {
    const userAnswer: UserAnswer = {
      questionId: currentQuestion.id,
      selectedAnswer: answer,
      isCorrect,
      timeSpent,
      timestamp: Date.now(),
    };
    
    submitAnswer(userAnswer);
    setCanProceed(true);
  };
  
  const handleNext = () => {
    if (isLastQuestion) {
      finishQuiz();
    } else {
      nextQuestion();
    }
  };
  
  return (
    <div className="min-h-screen py-8" style={{
      backgroundColor: 'var(--fixed-background)',
      color: 'var(--fixed-text)'
    }}>
      {/* Progress Bar */}
      <div className="max-w-4xl mx-auto mb-8 px-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
              {t('quiz.quizInProgress')}
            </h2>
            <p className="text-sm mt-1" style={{ color: 'var(--fixed-text-secondary)' }}>
              {t('quiz.answerAllQuestions')}
            </p>
          </div>
          <Button
            variant="outline"
            size="lg"
            onClick={isPaused ? resumeQuiz : pauseQuiz}
            className="shadow-lg"
          >
            {isPaused ? (
              <>
                <Play className="w-5 h-5 mr-2" />
                {t('resume')}
              </>
            ) : (
              <>
                <Pause className="w-5 h-5 mr-2" />
                {t('pauseQuiz')}
              </>
            )}
          </Button>
        </div>
        
        {/* Progress Bar */}
        <div className="relative">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
            <motion.div
              className="h-full"
              style={{ 
                background: customButtonColor || 'linear-gradient(to right, #10b981, #14b8a6)',
              }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          <p className="text-xs font-medium mt-2 text-right" style={{ color: 'var(--fixed-text-secondary)' }}>
            {currentQuestionIndex + 1} / {questions.length} {t('completed')}
          </p>
        </div>
      </div>
      
      {/* Pause Overlay */}
      <AnimatePresence>
        {isPaused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="rounded-3xl p-10 max-w-md mx-4 shadow-2xl text-center"
              style={{
                backgroundColor: 'var(--fixed-background)',
              }}
            >
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 shadow-xl"
                style={{
                  background: customButtonColor || 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)',
                }}
              >
                <Pause className="w-10 h-10 text-white" />
              </motion.div>
              <h3 className="text-3xl font-bold mb-4" style={{ color: 'var(--fixed-text)' }}>
                {t('quiz.pauseQuiz')}
              </h3>
              <p className="mb-8 text-lg" style={{ color: 'var(--fixed-text-secondary)' }}>
                {t('quiz.pauseMessage')}
              </p>
              <Button 
                onClick={resumeQuiz} 
                size="lg"
                className="w-full py-6 text-lg font-bold text-white shadow-xl hover:shadow-2xl transition-all"
                style={{
                  background: customButtonColor || 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)',
                }}
              >
                <Play className="w-5 h-5 mr-2" />
                {t('quiz.resumeQuiz')}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Question Card */}
      <div className="mb-12">
        <AnimatePresence mode="wait">
          <QuestionCard
            key={currentQuestion.id}
            question={currentQuestion}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={questions.length}
            onAnswer={handleAnswer}
            timeLimit={config.timePerQuestion}
          />
        </AnimatePresence>
      </div>
      
      {/* Navigation */}
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={previousQuestion}
            disabled={currentQuestionIndex === 0}
            className="shadow-lg"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            {t('quiz.back')}
          </Button>
          
          {/* Progress Dots */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {questions.map((_, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Circle
                  className={`w-3 h-3 transition-all ${
                    index === currentQuestionIndex
                      ? 'fill-current scale-125'
                      : index < currentQuestionIndex
                      ? 'fill-current opacity-50'
                      : ''
                  }`}
                  style={{ 
                    color: index <= currentQuestionIndex 
                      ? customButtonColor || '#10b981' 
                      : 'var(--color-border)',
                  }}
                />
              </motion.div>
            ))}
          </div>
          
          {canProceed && (
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Button
                onClick={handleNext}
                size="lg"
                className="shadow-2xl hover:shadow-3xl transition-all font-bold text-white"
                style={{
                  background: customButtonColor || 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)',
                }}
              >
                {isLastQuestion ? (
                  <>
                    <Flag className="w-5 h-5 mr-2" />
                    {t('quiz.finishQuiz')}
                  </>
                ) : (
                  <>
                    {t('quiz.next')}
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
