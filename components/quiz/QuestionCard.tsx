'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Question, QuestionOption } from '@/lib/quizTypes';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (answer: string, isCorrect: boolean, timeSpent: number) => void;
  showFeedback?: boolean;
  timeLimit?: number;
}

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  showFeedback = true,
  timeLimit,
}: QuestionCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime] = useState(Date.now());
  
  useEffect(() => {
    if (hasAnswered || !timeLimit) return;
    
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setTimeSpent(elapsed);
      
      if (elapsed >= timeLimit) {
        handleAnswer('');
      }
    }, 100);
    
    return () => clearInterval(interval);
  }, [hasAnswered, timeLimit, startTime]);
  
  const handleAnswer = (answerId: string) => {
    if (hasAnswered) return;
    
    const option = question.options.find((o) => o.id === answerId);
    const isCorrect = option?.isCorrect || false;
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    
    setSelectedAnswer(answerId);
    setHasAnswered(true);
    setTimeSpent(elapsed);
    
    onAnswer(answerId, isCorrect, elapsed);
  };
  
  const getQuestionContent = () => {
    switch (question.type) {
      case 'guess-surah':
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Which Surah is this ayah from?</p>
            <div className="p-6 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 border border-emerald-200 dark:border-emerald-800">
              <p className="text-xl text-right leading-relaxed arabic-text">
                {question.ayahText}
              </p>
            </div>
          </div>
        );
      
      case 'continue-ayah':
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">How does this ayah continue?</p>
            <div className="p-6 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 border border-emerald-200 dark:border-emerald-800">
              <p className="text-xl text-right leading-relaxed arabic-text">
                {question.ayahStart}
              </p>
            </div>
          </div>
        );
      
      case 'missing-word':
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Fill in the missing word</p>
            <div className="p-6 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 border border-emerald-200 dark:border-emerald-800">
              <p className="text-xl text-right leading-relaxed arabic-text">
                {question.ayahText}
              </p>
            </div>
          </div>
        );
      
      case 'surah-description':
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Which Surah matches this description?</p>
            <div className="p-6 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 border border-emerald-200 dark:border-emerald-800">
              <p className="text-lg">
                {question.description}
              </p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };
  
  const timeRemaining = timeLimit ? Math.max(0, timeLimit - timeSpent) : null;
  const timePercentage = timeLimit ? (timeRemaining! / timeLimit) * 100 : 100;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full max-w-3xl mx-auto"
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-muted-foreground">
            Question {questionNumber} of {totalQuestions}
          </span>
          <span className={cn(
            "text-xs px-3 py-1 rounded-full font-medium",
            question.difficulty === 'easy' && "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
            question.difficulty === 'medium' && "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300",
            question.difficulty === 'hard' && "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
          )}>
            {question.difficulty} • {question.points} pts
          </span>
        </div>
        
        {/* Timer */}
        {timeLimit && (
          <div className="mt-2">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className={cn(
                  "h-full",
                  timePercentage > 50 && "bg-green-500",
                  timePercentage <= 50 && timePercentage > 20 && "bg-yellow-500",
                  timePercentage <= 20 && "bg-red-500"
                )}
                initial={{ width: '100%' }}
                animate={{ width: `${timePercentage}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p className="text-xs text-muted-foreground text-right mt-1">
              {timeRemaining}s remaining
            </p>
          </div>
        )}
      </div>
      
      {/* Question Content */}
      <div className="mb-6">
        {getQuestionContent()}
      </div>
      
      {/* Options */}
      <div className="space-y-3">
        <AnimatePresence>
          {question.options.map((option, index) => {
            const isSelected = selectedAnswer === option.id;
            const showCorrect = hasAnswered && option.isCorrect;
            const showWrong = hasAnswered && isSelected && !option.isCorrect;
            
            return (
              <motion.button
                key={option.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleAnswer(option.id)}
                disabled={hasAnswered}
                className={cn(
                  "w-full p-4 rounded-lg border-2 text-left transition-all",
                  "hover:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500",
                  !hasAnswered && "border-border",
                  !hasAnswered && isSelected && "border-emerald-500 bg-emerald-50 dark:bg-emerald-950",
                  showCorrect && "border-green-500 bg-green-50 dark:bg-green-950",
                  showWrong && "border-red-500 bg-red-50 dark:bg-red-950",
                  hasAnswered && !isSelected && !option.isCorrect && "opacity-50"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="flex-1">{option.text}</span>
                  {showCorrect && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-2"
                    >
                      <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </motion.div>
                  )}
                  {showWrong && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-2"
                    >
                      <X className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </motion.div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>
      
      {/* Explanation */}
      {hasAnswered && showFeedback && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800"
        >
          <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
            Explanation
          </p>
          <p className="text-sm text-blue-800 dark:text-blue-200">
            {question.explanation}
          </p>
          {question.verseReference && (
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
              Reference: {question.verseReference}
            </p>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
