'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, AlertCircle, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocale } from '@/context/LocaleContext';
import { useQuranStore } from '@/lib/store';
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
  const { locale } = useLocale();
  const { customButtonColor } = useQuranStore();
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
            <p className="text-sm font-medium" style={{ color: 'var(--fixed-text-secondary)' }}>
              {locale === 'en' ? 'Which Surah is this ayah from?' : 'Из какой суры этот аят?'}
            </p>
            <div className="p-8 rounded-3xl shadow-2xl" style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(20, 184, 166, 0.15) 100%)',
              borderLeft: `4px solid ${customButtonColor || '#10b981'}`,
            }}>
              <p className="text-2xl md:text-3xl text-right leading-loose font-arabic" style={{
                color: 'var(--quran-arabic-color, #1C1E21)',
              }}>
                {question.ayahText}
              </p>
            </div>
          </div>
        );
      
      case 'continue-ayah':
        return (
          <div className="space-y-4">
            <p className="text-sm font-medium" style={{ color: 'var(--fixed-text-secondary)' }}>
              {locale === 'en' ? 'How does this ayah continue?' : 'Как продолжается этот аят?'}
            </p>
            <div className="p-8 rounded-3xl shadow-2xl" style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(6, 182, 212, 0.15) 100%)',
              borderLeft: '4px solid #3b82f6',
            }}>
              <p className="text-2xl md:text-3xl text-right leading-loose font-arabic" style={{
                color: 'var(--quran-arabic-color, #1C1E21)',
              }}>
                {question.ayahStart}
              </p>
            </div>
          </div>
        );
      
      case 'missing-word':
        return (
          <div className="space-y-4">
            <p className="text-sm font-medium" style={{ color: 'var(--fixed-text-secondary)' }}>
              {locale === 'en' ? 'Fill in the missing word' : 'Заполните пропущенное слово'}
            </p>
            <div className="p-8 rounded-3xl shadow-2xl" style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(236, 72, 153, 0.15) 100%)',
              borderLeft: '4px solid #8b5cf6',
            }}>
              <p className="text-2xl md:text-3xl text-right leading-loose font-arabic" style={{
                color: 'var(--quran-arabic-color, #1C1E21)',
              }}>
                {question.ayahText}
              </p>
            </div>
          </div>
        );
      
      case 'surah-description':
        return (
          <div className="space-y-4">
            <p className="text-sm font-medium" style={{ color: 'var(--fixed-text-secondary)' }}>
              {locale === 'en' ? 'Which Surah matches this description?' : 'Какая сура соответствует этому описанию?'}
            </p>
            <div className="p-8 rounded-3xl shadow-2xl" style={{
              background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(239, 68, 68, 0.15) 100%)',
              borderLeft: '4px solid #f97316',
            }}>
              <p className="text-xl md:text-2xl leading-relaxed" style={{ color: 'var(--fixed-text)' }}>
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
      className="w-full max-w-4xl mx-auto px-4"
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--fixed-text-secondary)' }}>
              {locale === 'en' ? 'Question' : 'Вопрос'} {questionNumber} {locale === 'en' ? 'of' : 'из'} {totalQuestions}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <div className="h-2 w-32 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full"
                  style={{ backgroundColor: customButtonColor || '#10b981' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={cn(
              "text-xs px-4 py-2 rounded-full font-bold shadow-lg",
              question.difficulty === 'easy' && "bg-gradient-to-r from-green-400 to-green-600 text-white",
              question.difficulty === 'medium' && "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white",
              question.difficulty === 'hard' && "bg-gradient-to-r from-red-400 to-red-600 text-white"
            )}>
              {locale === 'en' 
                ? question.difficulty.toUpperCase() 
                : question.difficulty === 'easy' ? 'ЛЕГКИЙ' : 
                  question.difficulty === 'medium' ? 'СРЕДНИЙ' : 'СЛОЖНЫЙ'}
            </span>
            <span className="text-lg font-bold px-4 py-2 rounded-full shadow-lg" style={{
              backgroundColor: customButtonColor || '#10b981',
              color: 'white',
            }}>
              {question.points} {locale === 'en' ? 'pts' : 'оч.'}
            </span>
          </div>
        </div>
        
        {/* Timer */}
        {timeLimit && (
          <div className="mt-4">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
              <motion.div
                className={cn(
                  "h-full transition-colors duration-300",
                  timePercentage > 50 && "bg-gradient-to-r from-green-400 to-green-600",
                  timePercentage <= 50 && timePercentage > 20 && "bg-gradient-to-r from-yellow-400 to-yellow-600",
                  timePercentage <= 20 && "bg-gradient-to-r from-red-400 to-red-600"
                )}
                initial={{ width: '100%' }}
                animate={{ width: `${timePercentage}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs font-medium" style={{ color: 'var(--fixed-text-secondary)' }}>
                {locale === 'en' ? 'Time remaining' : 'Осталось времени'}
              </p>
              <p className={cn(
                "text-sm font-bold",
                timePercentage > 20 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
              )}>
                {timeRemaining}s
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Question Content */}
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {getQuestionContent()}
      </motion.div>
      
      {/* Options */}
      <div className="space-y-4">
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
                  "w-full p-6 rounded-2xl border-2 text-left transition-all duration-300 shadow-lg hover:shadow-2xl",
                  "hover:scale-[1.02] active:scale-[0.98]",
                  !hasAnswered && "hover:border-emerald-400 dark:hover:border-emerald-500",
                  !hasAnswered && !isSelected && "border-gray-200 dark:border-gray-700",
                  !hasAnswered && isSelected && "border-emerald-500 shadow-2xl scale-[1.02]",
                  showCorrect && "border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 shadow-2xl scale-[1.02]",
                  showWrong && "border-red-500 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/30 dark:to-pink-900/30 shadow-2xl",
                  hasAnswered && !isSelected && !option.isCorrect && "opacity-40"
                )}
                style={{
                  backgroundColor: !hasAnswered && isSelected 
                    ? 'rgba(16, 185, 129, 0.05)' 
                    : 'var(--fixed-background)',
                }}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all",
                      !hasAnswered && "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
                      !hasAnswered && isSelected && "bg-emerald-500 text-white",
                      showCorrect && "bg-green-500 text-white",
                      showWrong && "bg-red-500 text-white"
                    )}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="flex-1 text-lg font-medium" style={{ color: 'var(--fixed-text)' }}>
                      {option.text}
                    </span>
                  </div>
                  {showCorrect && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center"
                    >
                      <Check className="w-6 h-6 text-white" strokeWidth={3} />
                    </motion.div>
                  )}
                  {showWrong && (
                    <motion.div
                      initial={{ scale: 0, rotate: 180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center"
                    >
                      <X className="w-6 h-6 text-white" strokeWidth={3} />
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
          initial={{ opacity: 0, height: 0, y: -10 }}
          animate={{ opacity: 1, height: 'auto', y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 p-6 rounded-2xl border-2 shadow-xl"
          style={{
            backgroundColor: 'var(--fixed-background)',
            borderColor: '#3b82f6',
          }}
        >
          <div className="flex items-start gap-3 mb-3">
            <Lightbulb className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <p className="text-base font-bold text-blue-600 dark:text-blue-400 mb-2">
                {locale === 'en' ? 'Explanation' : 'Объяснение'}
              </p>
              <p className="text-base leading-relaxed" style={{ color: 'var(--fixed-text)' }}>
                {question.explanation}
              </p>
            </div>
          </div>
          {question.verseReference && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
              <AlertCircle className="w-4 h-4 text-blue-500" />
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                {locale === 'en' ? 'Reference:' : 'Ссылка:'} {question.verseReference}
              </p>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
