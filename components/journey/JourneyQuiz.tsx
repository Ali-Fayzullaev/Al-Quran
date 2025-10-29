"use client";

import { useState, useEffect } from 'react';
import { useLocale } from '@/context/LocaleContext';
import { useQuranStore } from '@/lib/store';
import { useJourneyStore } from '@/lib/journeyStore';
import { useQuizStore } from '@/lib/quizStore';
import { Quiz } from '@/components/quiz/Quiz';
import { QuizResults } from '@/components/quiz/QuizResults';
import { Button } from '@/components/ui/button';
import { BookOpen, Trophy, Shuffle, Brain, PlayCircle, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface JourneyQuizProps {
  onBack?: () => void;
}

export default function JourneyQuiz({ onBack }: JourneyQuizProps) {
  const { locale } = useLocale();
  const { surahProgress, getCompletedSurahsInPriorityOrder, stats, completeSurahQuiz, initializeJourney } = useJourneyStore();
  const { 
    startJourneyQuiz, 
    isQuizActive: isActive,
    currentResult: results,
    questions
  } = useQuizStore();
  
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [questionsCount, setQuestionsCount] = useState(10);
  const [showResults, setShowResults] = useState(false);

  const primaryColor = "var(--color-primary)";

  // Инициализируем journey при загрузке компонента
  useEffect(() => {
    console.log('JourneyQuiz - initializing journey');
    initializeJourney();
  }, [initializeJourney]);

  // Получаем завершенные суры в порядке приоритета
  const completedSurahs = getCompletedSurahsInPriorityOrder();
  
  console.log('JourneyQuiz - surahProgress count:', Object.keys(surahProgress).length);
  console.log('JourneyQuiz - surahProgress sample:', Object.entries(surahProgress).slice(0, 3));
  console.log('JourneyQuiz - completedSurahs:', completedSurahs);
  console.log('JourneyQuiz - stats:', stats);

  useEffect(() => {
    if (!isActive && results) {
      setShowResults(true);
    }
  }, [isActive, results]);

  const handleStartQuiz = async () => {
    console.log('handleStartQuiz called', { completedSurahs, questionsCount, selectedDifficulty });
    
    // Если нет завершенных сур, используем доступные суры для тестирования
    let surahsToUse = completedSurahs;
    if (surahsToUse.length === 0) {
      console.log('No completed surahs, using available surahs [1, 114] for testing');
      surahsToUse = [1, 114]; // Используем доступные суры для тестирования
    }
    
    try {
      await startJourneyQuiz({
        surahNumbers: surahsToUse,
        questionsPerSurah: Math.ceil(questionsCount / surahsToUse.length),
        totalQuestions: questionsCount,
        difficulty: selectedDifficulty,
        timeLimit: 30,
      });
      console.log('Quiz started successfully');
    } catch (error) {
      console.error('Failed to start quiz:', error);
      alert(`Ошибка запуска викторины: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  };

  const handleBackToConfig = () => {
    setShowResults(false);
  };

  // Тестовая функция для завершения нескольких сур
  const handleTestComplete = () => {
    // Завершаем суры 114, 113, 112, 1, 2 для тестирования
    const testSurahs = [114, 113, 112, 1, 2];
    testSurahs.forEach(surahNumber => {
      completeSurahQuiz({
        surahNumber,
        score: 85,
        correctAnswers: 17,
        totalQuestions: 20,
        timeSpent: 120,
        completedAt: new Date(),
        answers: [],
      });
    });
  };

  // Если викторина активна, показываем компонент Quiz
  if (isActive && !showResults) {
    // Дополнительная проверка типов вопросов
    const hasWrongTypes = questions.some(q => q.type !== 'continue-ayah' && q.type !== 'missing-word');
    if (hasWrongTypes) {
      console.error('Найдены неправильные типы вопросов:', questions.map(q => q.type));
      // Перезапустить викторину с правильными типами
      handleStartQuiz();
      return <div>Перезапуск викторины...</div>;
    }
    return <Quiz />;
  }

  // Если показываем результаты
  if (showResults && results) {
    return (
      <QuizResults 
        result={results}
        onRetry={handleStartQuiz}
        onHome={handleBackToConfig}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Заголовок */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="inline-block p-4 rounded-full"
          style={{ backgroundColor: `${primaryColor}20` }}
        >
          <Brain className="w-12 h-12" style={{ color: primaryColor }} />
        </motion.div>
        
        <div>
          <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--fixed-text)' }}>
            {locale === 'en' ? 'Journey Quiz' : 'Викторина путешествия'}
          </h1>
          <p className="text-lg" style={{ color: 'var(--fixed-text-secondary)' }}>
            {locale === 'en' 
              ? 'Test your knowledge of completed surahs'
              : 'Проверьте свои знания по завершенным сурам'
            }
          </p>
        </div>
      </div>

      {/* Статистика */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div
          className="p-6 rounded-2xl border-2 text-center"
          style={{
            backgroundColor: 'var(--fixed-background)',
            borderColor: 'var(--color-border)',
          }}
        >
          <BookOpen className="w-8 h-8 mx-auto mb-3" style={{ color: primaryColor }} />
          <div className="text-2xl font-bold mb-1" style={{ color: 'var(--fixed-text)' }}>
            {completedSurahs.length}
          </div>
          <div className="text-sm" style={{ color: 'var(--fixed-text-secondary)' }}>
            {locale === 'en' ? 'Completed Surahs' : 'Завершенных сур'}
          </div>
        </div>

        <div
          className="p-6 rounded-2xl border-2 text-center"
          style={{
            backgroundColor: 'var(--fixed-background)',
            borderColor: 'var(--color-border)',
          }}
        >
          <Trophy className="w-8 h-8 mx-auto mb-3" style={{ color: primaryColor }} />
          <div className="text-2xl font-bold mb-1" style={{ color: 'var(--fixed-text)' }}>
            {stats.averageScore}%
          </div>
          <div className="text-sm" style={{ color: 'var(--fixed-text-secondary)' }}>
            {locale === 'en' ? 'Average Score' : 'Средний балл'}
          </div>
        </div>

        <div
          className="p-6 rounded-2xl border-2 text-center"
          style={{
            backgroundColor: 'var(--fixed-background)',
            borderColor: 'var(--color-border)',
          }}
        >
          <Shuffle className="w-8 h-8 mx-auto mb-3" style={{ color: primaryColor }} />
          <div className="text-2xl font-bold mb-1" style={{ color: 'var(--fixed-text)' }}>
            {stats.perfectSurahs}
          </div>
          <div className="text-sm" style={{ color: 'var(--fixed-text-secondary)' }}>
            {locale === 'en' ? 'Perfect Scores' : 'Идеальных результатов'}
          </div>
        </div>
      </motion.div>

      {/* Настройки викторины */}
      {true || completedSurahs.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-8 rounded-3xl border-2"
          style={{
            backgroundColor: 'var(--fixed-background)',
            borderColor: 'var(--color-border)',
          }}
        >
          <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: 'var(--fixed-text)' }}>
            {locale === 'en' ? 'Quiz Configuration' : 'Настройки викторины'}
          </h2>

          <div className="space-y-6">
            {/* Количество вопросов */}
            <div>
              <label className="block text-lg font-medium mb-3" style={{ color: 'var(--fixed-text)' }}>
                {locale === 'en' ? 'Number of Questions' : 'Количество вопросов'}
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[5, 10, 15, 20].map((count) => (
                  <button
                    key={count}
                    onClick={() => setQuestionsCount(count)}
                    className="py-3 px-4 rounded-xl border-2 font-medium transition-all"
                    style={{
                      backgroundColor: questionsCount === count ? primaryColor : 'transparent',
                      borderColor: questionsCount === count ? primaryColor : 'var(--color-border)',
                      color: questionsCount === count ? 'white' : 'var(--fixed-text)',
                    }}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>

            {/* Сложность */}
            <div>
              <label className="block text-lg font-medium mb-3" style={{ color: 'var(--fixed-text)' }}>
                {locale === 'en' ? 'Difficulty' : 'Сложность'}
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['easy', 'medium', 'hard'] as const).map((difficulty) => (
                  <button
                    key={difficulty}
                    onClick={() => setSelectedDifficulty(difficulty)}
                    className="py-3 px-4 rounded-xl border-2 font-medium transition-all"
                    style={{
                      backgroundColor: selectedDifficulty === difficulty ? primaryColor : 'transparent',
                      borderColor: selectedDifficulty === difficulty ? primaryColor : 'var(--color-border)',
                      color: selectedDifficulty === difficulty ? 'white' : 'var(--fixed-text)',
                    }}
                  >
                    {difficulty === 'easy' 
                      ? (locale === 'en' ? 'Easy' : 'Легко')
                      : difficulty === 'medium'
                      ? (locale === 'en' ? 'Medium' : 'Средне')
                      : (locale === 'en' ? 'Hard' : 'Сложно')
                    }
                  </button>
                ))}
              </div>
            </div>

            {/* Типы вопросов */}
            <div>
              <label className="block text-lg font-medium mb-3" style={{ color: 'var(--fixed-text)' }}>
                {locale === 'en' ? 'Question Types' : 'Типы вопросов'}
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div
                  className="p-4 rounded-xl border-2 text-center"
                  style={{
                    backgroundColor: `${primaryColor}10`,
                    borderColor: primaryColor,
                  }}
                >
                  <div className="text-2xl mb-2">📖</div>
                  <div className="font-medium" style={{ color: 'var(--fixed-text)' }}>
                    {locale === 'en' ? 'Continue Ayah' : 'Продолжи аят'}
                  </div>
                  <div className="text-sm mt-1" style={{ color: 'var(--fixed-text-secondary)' }}>
                    {locale === 'en' 
                      ? 'Complete the verse from memory'
                      : 'Завершите аят по памяти'
                    }
                  </div>
                </div>
                
                <div
                  className="p-4 rounded-xl border-2 text-center"
                  style={{
                    backgroundColor: `${primaryColor}10`,
                    borderColor: primaryColor,
                  }}
                >
                  <div className="text-2xl mb-2">🔤</div>
                  <div className="font-medium" style={{ color: 'var(--fixed-text)' }}>
                    {locale === 'en' ? 'Missing Word' : 'Пропущенное слово'}
                  </div>
                  <div className="text-sm mt-1" style={{ color: 'var(--fixed-text-secondary)' }}>
                    {locale === 'en' 
                      ? 'Find the missing word in the verse'
                      : 'Найдите пропущенное слово в аяте'
                    }
                  </div>
                </div>
              </div>
            </div>

            {/* Приоритетные суры */}
            <div>
              <label className="block text-lg font-medium mb-3" style={{ color: 'var(--fixed-text)' }}>
                {locale === 'en' ? 'Surahs Priority Order' : 'Порядок приоритета сур'}
              </label>
              <div className="text-sm mb-2" style={{ color: 'var(--fixed-text-secondary)' }}>
                {locale === 'en' 
                  ? 'Small surahs (114→77) have priority, then large surahs (1→76)'
                  : 'Приоритет у малых сур (114→77), затем большие суры (1→76)'
                }
              </div>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {completedSurahs.slice(0, 10).map((surahNumber, index) => {
                  const isSmall = surahNumber >= 77;
                  return (
                    <span
                      key={surahNumber}
                      className="px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-1"
                      style={{
                        backgroundColor: isSmall ? `${primaryColor}20` : `${primaryColor}10`,
                        color: isSmall ? primaryColor : 'var(--fixed-text)',
                        border: isSmall ? `1px solid ${primaryColor}40` : '1px solid var(--color-border)',
                      }}
                    >
                      {isSmall ? '🌟' : '📖'} {index + 1}. {locale === 'en' ? `Surah ${surahNumber}` : `Сура ${surahNumber}`}
                    </span>
                  );
                })}
                {completedSurahs.length > 10 && (
                  <span
                    className="px-3 py-1 rounded-lg text-sm"
                    style={{ color: 'var(--fixed-text-secondary)' }}
                  >
                    +{completedSurahs.length - 10} {locale === 'en' ? 'more' : 'ещё'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Кнопка запуска */}
          <div className="flex justify-center mt-8">
            <Button
              onClick={handleStartQuiz}
              className="px-8 py-4 text-lg font-medium rounded-2xl gap-3"
              style={{
                backgroundColor: primaryColor,
                color: 'white',
              }}
            >
              <PlayCircle className="w-6 h-6" />
              {locale === 'en' ? 'Start Quiz' : 'Начать викторину'}
            </Button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center py-16"
        >
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--fixed-text)' }}>
            {locale === 'en' ? 'No Completed Surahs' : 'Нет завершенных сур'}
          </h2>
          <p className="text-lg mb-6" style={{ color: 'var(--fixed-text-secondary)' }}>
            {locale === 'en' 
              ? 'Complete some surahs first to unlock the journey quiz'
              : 'Сначала завершите некоторые суры, чтобы разблокировать викторину путешествия'
            }
          </p>
          
          {/* Тестовые кнопки для разработки */}
          <div className="flex gap-4 flex-wrap justify-center mb-6">
            <Button
              onClick={handleTestComplete}
              className="gap-2"
              style={{ backgroundColor: primaryColor, color: 'white' }}
            >
              🧪 {locale === 'en' ? 'Test: Complete Some Surahs' : 'Тест: Завершить несколько сур'}
            </Button>
          </div>
          
          {onBack && (
            <Button
              onClick={onBack}
              variant="outline"
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {locale === 'en' ? 'Back to Journey' : 'Назад к путешествию'}
            </Button>
          )}
        </motion.div>
      )}
    </div>
  );
}