'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Flag, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { QuestionCard } from './QuestionCard';
import { useQuizStore } from '@/lib/quizStore';
import { useLocale } from '@/context/LocaleContext';
import type { UserAnswer } from '@/lib/quizTypes';

export function Quiz() {
  const { t } = useLocale();
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
    <div className="min-h-screen p-6">
      {/* Progress Bar */}
      <div className="max-w-3xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">
            {t('quiz')}
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={isPaused ? resumeQuiz : pauseQuiz}
          >
            {isPaused ? (
              <>
                <Play className="w-4 h-4 mr-2" />
                {t('resumeQuiz')}
              </>
            ) : (
              <>
                <Pause className="w-4 h-4 mr-2" />
                {t('pause')}
              </>
            )}
          </Button>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
      
      {/* Pause Overlay */}
      <AnimatePresence>
        {isPaused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-background rounded-lg p-8 max-w-md mx-4"
            >
              <h3 className="text-2xl font-bold mb-4">{t('quizPaused')}</h3>
              <p className="text-muted-foreground mb-6">
                {t('pauseMessage')}
              </p>
              <Button onClick={resumeQuiz} className="w-full">
                <Play className="w-4 h-4 mr-2" />
                {t('resumeQuiz')}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Question Card */}
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
      
      {/* Navigation */}
      <div className="max-w-3xl mx-auto mt-8 flex justify-between items-center">
        <Button
          variant="outline"
          onClick={previousQuestion}
          disabled={currentQuestionIndex === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          {t('previous')}
        </Button>
        
        <div className="flex items-center gap-2">
          {questions.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentQuestionIndex
                  ? 'bg-emerald-500'
                  : index < currentQuestionIndex
                  ? 'bg-emerald-300'
                  : 'bg-muted'
              }`}
            />
          ))}
        </div>
        
        {canProceed && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Button
              onClick={handleNext}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
            >
              {isLastQuestion ? (
                <>
                  <Flag className="w-4 h-4 mr-2" />
                  {t('finishQuiz')}
                </>
              ) : (
                <>
                  {t('next')}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
