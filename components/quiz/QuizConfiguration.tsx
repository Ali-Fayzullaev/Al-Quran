// components/quiz/QuizConfiguration.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Brain, 
  Clock, 
  Settings2, 
  Sparkles,
  Play,
  BookMarked,
  ArrowRight,
  PenLine,
  FileText,
  CheckCircle2,
  XCircle,
  Zap,
  Trophy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/context/LocaleContext';
import { useQuranStore } from '@/lib/store';
import type { QuizConfig, QuestionType, Difficulty } from '@/lib/quizTypes';

const quizConfigSchema = z.object({
  questionCount: z.enum(['1', '3', '5', '10']),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  questionTypes: z.array(z.string()).min(1, 'Select at least one question type'),
  timePerQuestion: z.number().optional(),
  showTranslation: z.boolean(),
});

type QuizConfigForm = z.infer<typeof quizConfigSchema>;

interface QuizConfigurationProps {
  onStart: (config: QuizConfig) => void;
  isLoading?: boolean;
}

export function QuizConfiguration({ onStart, isLoading }: QuizConfigurationProps) {
  const { t, locale } = useLocale();
  const customButtonColor = "var(--color-primary)";
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['guess-surah']);
  const [useTimer, setUseTimer] = useState(false);

  const QUESTION_TYPES: Array<{ 
    value: QuestionType; 
    labelKey: string; 
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    gradient: string;
  }> = [
    { 
      value: 'guess-surah', 
      labelKey: 'guessSurah', 
      icon: BookMarked,
      color: 'emerald',
      gradient: 'from-emerald-500 to-teal-600'
    },
    { 
      value: 'continue-ayah', 
      labelKey: 'continueAyah', 
      icon: ArrowRight,
      color: 'blue',
      gradient: 'from-blue-500 to-cyan-600'
    },
    { 
      value: 'missing-word', 
      labelKey: 'fillMissingWord', 
      icon: PenLine,
      color: 'purple',
      gradient: 'from-purple-500 to-pink-600'
    },
    { 
      value: 'surah-description', 
      labelKey: 'surahDescription', 
      icon: FileText,
      color: 'orange',
      gradient: 'from-orange-500 to-red-600'
    },
  ];
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<QuizConfigForm>({
    resolver: zodResolver(quizConfigSchema),
    defaultValues: {
      questionCount: '5',
      difficulty: 'medium',
      questionTypes: ['guess-surah'],
      showTranslation: true,
    },
  });
  
  const difficulty = watch('difficulty');
  const questionCount = watch('questionCount');
  
  const toggleQuestionType = (type: string) => {
    const newTypes = selectedTypes.includes(type)
      ? selectedTypes.filter((t) => t !== type)
      : [...selectedTypes, type];
    setSelectedTypes(newTypes);
    setValue('questionTypes', newTypes, { shouldValidate: true });
  };
  
  const onSubmit = (data: QuizConfigForm) => {
    const config: QuizConfig = {
      questionCount: parseInt(data.questionCount) as QuizConfig['questionCount'],
      difficulty: data.difficulty as Difficulty,
      questionTypes: data.questionTypes as QuestionType[],
      timePerQuestion: useTimer ? data.timePerQuestion : undefined,
      showTranslation: data.showTranslation,
    };
    onStart(config);
  };
  
  return (
    <div className="min-h-screen py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-24 h-24 rounded-3xl mb-6 shadow-2xl"
            style={{ 
              background: customButtonColor || 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)',
            }}
          >
            <Brain className="w-12 h-12 text-white" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r text-[var(--color-primary)] bg-clip-text ">
            {t('quiz.quranQuiz')}
          </h1>
          <p className="text-lg" style={{ color: 'var(--fixed-text-secondary)' }}>
            {t('quiz.testYourKnowledge')}
          </p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Question Count */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900 dark:to-teal-900">
                <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold" style={{ color: 'var(--fixed-text)' }}>
                {t('quiz.numberOfQuestions')}
              </h3>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {(['1', '3', '5', '10'] as const).map((count) => (
                <label key={count} className="relative cursor-pointer group">
                  <input
                    type="radio"
                    value={count}
                    {...register('questionCount')}
                    className="peer sr-only"
                  />
                  <div 
                    className="p-6 text-center rounded-2xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg peer-checked:border-emerald-500 peer-checked:shadow-xl peer-checked:scale-105"
                    style={{
                      backgroundColor: 'var(--fixed-background)',
                      borderColor: 'var(--color-border)',
                    }}
                  >
                    <span className="text-3xl font-bold text-[var(--color-primary)] bg-clip-text">
                      {count}
                    </span>
                    <CheckCircle2 className="w-5 h-5 mx-auto mt-2 text-emerald-500 opacity-0 peer-checked:opacity-100 transition-opacity" />
                  </div>
                </label>
              ))}
            </div>
          </motion.div>
          
          {/* Difficulty */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900">
                <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold" style={{ color: 'var(--fixed-text)' }}>
                {t('quiz.difficultyLevel')}
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(['easy', 'medium', 'hard'] as const).map((level) => (
                <label key={level} className="relative cursor-pointer group">
                  <input
                    type="radio"
                    value={level}
                    {...register('difficulty')}
                    className="peer sr-only"
                  />
                  <div className={`
                    p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg
                    peer-checked:border-${level === 'easy' ? 'green' : level === 'medium' ? 'yellow' : 'red'}-500 
                    peer-checked:shadow-xl peer-checked:scale-105
                  `}
                  style={{
                    backgroundColor: 'var(--fixed-background)',
                    borderColor: 'var(--color-border)',
                  }}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-bold capitalize" style={{ color: 'var(--fixed-text)' }}>
                        {t(`quiz.${level}Level`)}
                      </span>
                      <Trophy className={`w-6 h-6 ${
                        level === 'easy' ? 'text-green-500' : 
                        level === 'medium' ? 'text-yellow-500' : 
                        'text-red-500'
                      }`} />
                    </div>
                    <div className={`
                      text-sm px-3 py-1 rounded-full inline-block font-semibold
                      ${level === 'easy' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : ''}
                      ${level === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' : ''}
                      ${level === 'hard' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' : ''}
                    `}>
                      {level === 'easy' && `10 ${t('quiz.pointsShort')}`}
                      {level === 'medium' && `20 ${t('quiz.pointsShort')}`}
                      {level === 'hard' && `30 ${t('quiz.pointsShort')}`}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </motion.div>
          
          {/* Question Types */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900">
                <Settings2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold" style={{ color: 'var(--fixed-text)' }}>
                {t('quiz.questionTypes')}
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {QUESTION_TYPES.map((type) => (
                <label
                  key={type.value}
                  className="relative cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes(type.value)}
                    onChange={() => toggleQuestionType(type.value)}
                    className="peer sr-only"
                  />
                  <div className={`
                    p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg
                    peer-checked:shadow-xl peer-checked:scale-105
                  `}
                  style={{
                    backgroundColor: 'var(--fixed-background)',
                    borderColor: selectedTypes.includes(type.value) ? customButtonColor || '#10b981' : 'var(--color-border)',
                  }}>
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${type.gradient}`}>
                        <type.icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-lg" style={{ color: 'var(--fixed-text)' }}>
                          {t(`quiz.${type.labelKey}`)}
                        </p>
                      </div>
                      {selectedTypes.includes(type.value) && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 500 }}
                        >
                          <CheckCircle2 className="w-6 h-6" style={{ color: customButtonColor || '#10b981' }} />
                        </motion.div>
                      )}
                    </div>
                  </div>
                </label>
              ))}
            </div>
            {errors.questionTypes && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-red-500 flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                {errors.questionTypes.message}
              </motion.p>
            )}
          </motion.div>
          
          {/* Timer Option */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900">
                <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold" style={{ color: 'var(--fixed-text)' }}>
                {t('quiz.timeLimitConfig')}
              </h3>
            </div>
            <div className="p-6 rounded-2xl border-2" style={{
              backgroundColor: 'var(--fixed-background)',
              borderColor: 'var(--color-border)',
            }}>
              <label className="flex items-center gap-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useTimer}
                  onChange={(e) => setUseTimer(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
                />
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-orange-500" />
                  <span className="text-base font-medium" style={{ color: 'var(--fixed-text)' }}>
                    {t('quiz.enableTimeLimitPerQuestion')}
                  </span>
                </div>
              </label>
              {useTimer && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4"
                >
                  <input
                    type="number"
                    {...register('timePerQuestion', { valueAsNumber: true })}
                    placeholder={t('quiz.secondsPerQuestionPlaceholder')}
                    min={10}
                    max={120}
                    defaultValue={30}
                    className="w-full p-4 rounded-xl border-2 font-medium text-lg focus:outline-none focus:ring-2 transition-all"
                    style={{
                      backgroundColor: 'var(--fixed-background)',
                      color: 'var(--fixed-text)',
                      borderColor: 'var(--color-border)',
                      '--tw-ring-color': customButtonColor || '#10b981',
                    } as React.CSSProperties}
                  />
                </motion.div>
              )}
            </div>
          </motion.div>
          
          {/* Translation Option */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="p-6 rounded-2xl border-2"
            style={{
              backgroundColor: 'var(--fixed-background)',
              borderColor: 'var(--color-border)',
            }}
          >
            <label className="flex items-center gap-4 cursor-pointer">
              <input
                type="checkbox"
                {...register('showTranslation')}
                className="w-5 h-5 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
              />
              <span className="text-base font-medium" style={{ color: 'var(--fixed-text)' }}>
                {t('quiz.showTranslationInQuizConfig')}
              </span>
            </label>
          </motion.div>
          
          {/* Summary */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="p-8 rounded-3xl border-2 shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(20, 184, 166, 0.1) 100%)',
              borderColor: customButtonColor || '#10b981',
            }}
          >
            <h3 className="text-xl font-bold mb-6 flex items-center gap-3" style={{ color: 'var(--fixed-text)' }}>
              <Sparkles className="w-6 h-6" style={{ color: customButtonColor || '#10b981' }} />
              {t('quiz.quizSummary')}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm mb-1" style={{ color: 'var(--fixed-text-secondary)' }}>
                  {t('quiz.questions')}
                </p>
                <p className="text-2xl font-bold" style={{ color: 'var(--fixed-text)' }}>
                  {questionCount}
                </p>
              </div>
              <div>
                <p className="text-sm mb-1" style={{ color: 'var(--fixed-text-secondary)' }}>
                  {t('quiz.difficulty')}
                </p>
                <p className="text-2xl font-bold capitalize" style={{ color: 'var(--fixed-text)' }}>
                  {t(`quiz.${difficulty}Level`)}
                </p>
              </div>
              <div>
                <p className="text-sm mb-1" style={{ color: 'var(--fixed-text-secondary)' }}>
                  {t('quiz.typesConfig')}
                </p>
                <p className="text-2xl font-bold" style={{ color: 'var(--fixed-text)' }}>
                  {selectedTypes.length}
                </p>
              </div>
              <div>
                <p className="text-sm mb-1" style={{ color: 'var(--fixed-text-secondary)' }}>
                  {t('quiz.timerConfig')}
                </p>
                <p className="text-2xl font-bold" style={{ color: 'var(--fixed-text)' }}>
                  {useTimer ? '✓' : '✗'}
                </p>
              </div>
            </div>
          </motion.div>
          
          {/* Start Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full py-8 text-xl font-bold text-white rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105"
              style={{
                background: customButtonColor || 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)',
              }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="w-6 h-6 border-3 border-white border-t-transparent rounded-full"
                  />
                  {t('quiz.generatingQuizQuestions')}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-3">
                  <Play className="w-6 h-6" />
                  {t('quiz.startQuiz')}
                </span>
              )}
            </Button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}
