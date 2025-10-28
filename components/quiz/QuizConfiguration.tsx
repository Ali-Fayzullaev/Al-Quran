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
  FileText
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
  const { t } = useLocale();
  const { customButtonColor } = useQuranStore();
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['guess-surah']);
  const [useTimer, setUseTimer] = useState(false);

  const QUESTION_TYPES: Array<{ value: QuestionType; labelKey: string; icon: React.ComponentType<{ className?: string }> }> = [
    { value: 'guess-surah', labelKey: 'guessSurah', icon: BookMarked },
    { value: 'continue-ayah', labelKey: 'continueAyah', icon: ArrowRight },
    { value: 'missing-word', labelKey: 'fillMissingWord', icon: PenLine },
    { value: 'surah-description', labelKey: 'surahDescription', icon: FileText },
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto p-6"
    >
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="inline-block p-4 rounded-full bg-gradient-to-br theme-bg-primary mb-4"
          style={{ backgroundColor: customButtonColor || undefined }}
        >
          <Brain className="w-12 h-12 text-white" />
        </motion.div>
        <h1 className="text-3xl font-bold mb-2">{t('quizTitle')}</h1>
        <p className="text-muted-foreground">
          {t('quizDescription')}
        </p>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Question Count */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-medium">
            <BookOpen className="w-4 h-4" />
            {t('numberOfQuestions')}
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(['1', '3', '5', '10'] as const).map((count) => (
              <label key={count} className="relative cursor-pointer">
                <input
                  type="radio"
                  value={count}
                  {...register('questionCount')}
                  className="peer sr-only"
                />
                <div 
                  className="p-4 text-center rounded-lg border-2 border-border peer-checked:bg-emerald-50 dark:peer-checked:bg-emerald-950 transition-all hover:border-emerald-300"
                  style={{
                    borderColor: 'var(--color-border)',
                  }}
                >
                  <span className="text-lg font-bold">{count}</span>
                </div>
              </label>
            ))}
          </div>
        </div>
        
        {/* Difficulty */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            {t('difficultyLevel')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['easy', 'medium', 'hard'] as const).map((level) => (
              <label key={level} className="relative cursor-pointer">
                <input
                  type="radio"
                  value={level}
                  {...register('difficulty')}
                  className="peer sr-only"
                />
                <div className="p-4 text-center rounded-lg border-2 border-border peer-checked:bg-emerald-50 dark:peer-checked:bg-emerald-950 transition-all hover:border-emerald-300">
                  <div className="font-semibold capitalize">{t(level)}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {level === 'easy' && `10 ${t('points')}`}
                    {level === 'medium' && `20 ${t('points')}`}
                    {level === 'hard' && `30 ${t('points')}`}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>
        
        {/* Question Types */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-medium">
            <Settings2 className="w-4 h-4" />
            {t('questionTypes')}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {QUESTION_TYPES.map((type) => (
              <label
                key={type.value}
                className="relative cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedTypes.includes(type.value)}
                  onChange={() => toggleQuestionType(type.value)}
                  className="peer sr-only"
                />
                <div className="p-4 rounded-lg border-2 border-border peer-checked:bg-emerald-50 dark:peer-checked:bg-emerald-950 transition-all hover:border-emerald-300">
                  <div className="flex items-center gap-2">
                    <type.icon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-sm font-medium">{t(type.labelKey)}</span>
                  </div>
                </div>
              </label>
            ))}
          </div>
          {errors.questionTypes && (
            <p className="text-sm text-red-500">{errors.questionTypes.message}</p>
          )}
        </div>
        
        {/* Timer Option */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-medium">
            <Clock className="w-4 h-4" />
            {t('timeLimit')}
          </label>
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={useTimer}
                onChange={(e) => setUseTimer(e.target.checked)}
                className="w-4 h-4 rounded border-border text-emerald-500 focus:ring-emerald-500"
              />
              <span className="text-sm">{t('enableTimeLimit')}</span>
            </label>
            {useTimer && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <input
                  type="number"
                  {...register('timePerQuestion', { valueAsNumber: true })}
                  placeholder={t('secondsPerQuestion')}
                  min={10}
                  max={120}
                  className="w-full p-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </motion.div>
            )}
          </div>
        </div>
        
        {/* Translation Option */}
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              {...register('showTranslation')}
              className="w-4 h-4 rounded border-border text-emerald-500 focus:ring-emerald-500"
            />
            <span className="text-sm font-medium">{t('showTranslationInQuiz')}</span>
          </label>
        </div>
        
        {/* Summary */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800"
        >
          <h3 className="font-semibold mb-2 text-emerald-900 dark:text-emerald-100">
            {t('quizSummary')}
          </h3>
          <ul className="text-sm space-y-1 text-emerald-800 dark:text-emerald-200">
            <li>• {questionCount} {t('questions')}</li>
            <li>• {t('difficulty')}: {t(difficulty)}</li>
            <li>• {t('questionTypes')}: {selectedTypes.length}</li>
            {useTimer && <li>• {t('timedQuizEnabled')}</li>}
          </ul>
        </motion.div>
        
        {/* Start Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full py-6 text-lg font-semibold text-white"
          style={{
            background: customButtonColor || 'linear-gradient(to right, rgb(16 185 129), rgb(13 148 136))',
          }}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              />
              {t('generatingQuestions')}
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Play className="w-5 h-5" />
              {t('startQuiz')}
            </span>
          )}
        </Button>
      </form>
    </motion.div>
  );
}
