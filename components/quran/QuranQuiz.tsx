// components/quran/QuranQuiz.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  Trophy, 
  Star, 
  Target, 
  CheckCircle, 
  XCircle, 
  Shuffle,
  Play,
  Brain,
  Heart,
  Book
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Verse {
  number: number;
  text: string;
  numberInSurah: number;
  page: number;
}

interface QuizQuestion {
  verse: Verse;
  options: string[];
  correctAnswer: number;
  surahNumber: number;
}

interface QuranQuizProps {
  verses: Verse[];
  onClose: () => void;
  onPlayAudio: (verse: Verse) => void;
  findSurahForVerse: (verseNumber: number) => number | null;
}

export default function QuranQuiz({ 
  verses, 
  onClose, 
  onPlayAudio, 
  findSurahForVerse 
}: QuranQuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [streak, setStreak] = useState(0);
  const [quizType, setQuizType] = useState<'verse-recognition' | 'surah-identification' | 'page-number'>('verse-recognition');

  // Генерация вопроса
  const generateQuestion = () => {
    if (!verses || verses.length === 0) return;

    const randomVerse = verses[Math.floor(Math.random() * verses.length)];
    const surahNumber = findSurahForVerse(randomVerse.number);
    
    let question: QuizQuestion;

    switch (quizType) {
      case 'verse-recognition':
        // Викторина на узнавание аята по началу
        const otherVerses = verses.filter(v => v.number !== randomVerse.number).slice(0, 3);
        const options = [
          randomVerse.text.substring(0, 50) + "...",
          ...otherVerses.map(v => v.text.substring(0, 50) + "...")
        ];
        
        // Перемешиваем варианты
        const shuffledOptions = [...options].sort(() => Math.random() - 0.5);
        const correctIndex = shuffledOptions.indexOf(options[0]);
        
        question = {
          verse: randomVerse,
          options: shuffledOptions,
          correctAnswer: correctIndex,
          surahNumber: surahNumber || 1
        };
        break;

      case 'surah-identification':
        // Викторина на определение суры
        const possibleSurahs = Array.from(new Set(
          verses.map(v => findSurahForVerse(v.number)).filter(Boolean)
        )).slice(0, 4);
        
        question = {
          verse: randomVerse,
          options: possibleSurahs.map(s => `Сура ${s}`),
          correctAnswer: possibleSurahs.indexOf(surahNumber),
          surahNumber: surahNumber || 1
        };
        break;

      case 'page-number':
        // Викторина на определение страницы
        const pages = Array.from(new Set(verses.map(v => v.page))).slice(0, 4);
        const pageOptions = pages.sort(() => Math.random() - 0.5);
        
        question = {
          verse: randomVerse,
          options: pageOptions.map(p => `Страница ${p}`),
          correctAnswer: pageOptions.indexOf(randomVerse.page),
          surahNumber: surahNumber || 1
        };
        break;

      default:
        return;
    }

    setCurrentQuestion(question);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  // Проверка ответа
  const checkAnswer = () => {
    if (!currentQuestion || selectedAnswer === null) return;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }
    
    setQuestionsAnswered(prev => prev + 1);
    setShowResult(true);

    // Автоматически переходим к следующему вопросу через 2 секунды
    setTimeout(() => {
      generateQuestion();
    }, 2000);
  };

  // Инициализация первого вопроса
  useEffect(() => {
    generateQuestion();
  }, [quizType]);

  const getQuizTypeTitle = () => {
    switch (quizType) {
      case 'verse-recognition':
        return 'Узнайте аят';
      case 'surah-identification':
        return 'Определите суру';
      case 'page-number':
        return 'Найдите страницу';
      default:
        return 'Викторина';
    }
  };

  const getQuizTypeDescription = () => {
    switch (quizType) {
      case 'verse-recognition':
        return 'По началу текста определите правильный аят';
      case 'surah-identification':
        return 'Определите из какой суры данный аят';
      case 'page-number':
        return 'На какой странице находится этот аят?';
      default:
        return '';
    }
  };

  const getScoreColor = () => {
    const percentage = questionsAnswered > 0 ? (score / questionsAnswered) * 100 : 0;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStreakIcon = () => {
    if (streak >= 5) return '🔥';
    if (streak >= 3) return '⭐';
    if (streak >= 1) return '✨';
    return '💫';
  };

  if (!currentQuestion) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl max-w-md mx-4">
          <div className="text-center">
            <Brain className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-pulse" />
            <h3 className="text-xl font-bold mb-2">Подготовка викторины...</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Генерируем вопросы для вас
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="quiz-modal w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Trophy className="w-8 h-8 text-yellow-500" />
            <h2 className="text-3xl font-bold gradient-text-primary">
              {getQuizTypeTitle()}
            </h2>
            <Trophy className="w-8 h-8 text-yellow-500" />
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 text-lg mb-4">
            {getQuizTypeDescription()}
          </p>

          {/* Quiz Type Selector */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            <Button
              variant={quizType === 'verse-recognition' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setQuizType('verse-recognition')}
              className="gap-2"
            >
              <Book className="w-4 h-4" />
              Аяты
            </Button>
            <Button
              variant={quizType === 'surah-identification' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setQuizType('surah-identification')}
              className="gap-2"
            >
              <Target className="w-4 h-4" />
              Суры
            </Button>
            <Button
              variant={quizType === 'page-number' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setQuizType('page-number')}
              className="gap-2"
            >
              <Star className="w-4 h-4" />
              Страницы
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="game-stats-card p-4 text-center">
              <div className={cn("text-2xl font-bold", getScoreColor())}>
                {questionsAnswered > 0 ? Math.round((score / questionsAnswered) * 100) : 0}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Точность</div>
            </div>
            
            <div className="game-stats-card p-4 text-center">
              <div className="text-2xl font-bold theme-text-primary">
                {score}/{questionsAnswered}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Счет</div>
            </div>
            
            <div className="game-stats-card p-4 text-center">
              <div className="text-2xl font-bold text-orange-600 flex items-center justify-center gap-1">
                {streak} <span>{getStreakIcon()}</span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Серия</div>
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="mb-8">
          {quizType === 'verse-recognition' ? (
            <div className="text-center p-6 bg-gray-50 dark:bg-gray-700 rounded-2xl mb-6">
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">
                Какой из этих аятов правильный?
              </p>
              <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border-2 border-blue-200 dark:border-blue-700">
                <p className="font-amiri text-xl text-right mb-2" dir="rtl">
                  {currentQuestion.verse.text.substring(0, 30)}...
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Сура {currentQuestion.surahNumber}, аят {currentQuestion.verse.numberInSurah}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onPlayAudio(currentQuestion.verse)}
                    className="gap-1"
                  >
                    <Play className="w-4 h-4" />
                    Слушать
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center p-6 bg-gray-50 dark:bg-gray-700 rounded-2xl mb-6">
              <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border-2 border-blue-200 dark:border-blue-700 mb-4">
                <p className="font-amiri text-xl text-right mb-4" dir="rtl">
                  {currentQuestion.verse.text.substring(0, 80)}...
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onPlayAudio(currentQuestion.verse)}
                  className="gap-1"
                >
                  <Play className="w-4 h-4" />
                  Прослушать аят
                </Button>
              </div>
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                {quizType === 'surah-identification' 
                  ? 'Из какой суры этот аят?' 
                  : 'На какой странице находится этот аят?'
                }
              </p>
            </div>
          )}

          {/* Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestion.options.map((option, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => !showResult && setSelectedAnswer(index)}
                disabled={showResult}
                className={cn(
                  "p-4 rounded-2xl border-2 transition-all duration-300 text-left",
                  "hover:scale-105 transform",
                  selectedAnswer === index && !showResult && "ring-4 ring-blue-300 border-blue-500 bg-blue-50 dark:bg-blue-900/20",
                  showResult && index === currentQuestion.correctAnswer && "border-green-500 bg-green-50 dark:bg-green-900/20",
                  showResult && selectedAnswer === index && index !== currentQuestion.correctAnswer && "border-red-500 bg-red-50 dark:bg-red-900/20",
                  !showResult && selectedAnswer !== index && "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-blue-300",
                  showResult && selectedAnswer !== index && index !== currentQuestion.correctAnswer && "opacity-50"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className={cn(
                    quizType === 'verse-recognition' && "font-amiri text-right",
                    "flex-1"
                  )} dir={quizType === 'verse-recognition' ? 'rtl' : 'ltr'}>
                    {option}
                  </span>
                  
                  {showResult && (
                    <div className="ml-3">
                      {index === currentQuestion.correctAnswer ? (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      ) : selectedAnswer === index ? (
                        <XCircle className="w-6 h-6 text-red-500" />
                      ) : null}
                    </div>
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Result */}
        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={cn(
                "text-center p-6 rounded-2xl mb-6",
                selectedAnswer === currentQuestion.correctAnswer
                  ? "bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-700"
                  : "bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-700"
              )}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                {selectedAnswer === currentQuestion.correctAnswer ? (
                  <>
                    <CheckCircle className="w-8 h-8 text-green-500" />
                    <span className="text-2xl font-bold text-green-700 dark:text-green-300">
                      Правильно! {getStreakIcon()}
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-8 h-8 text-red-500" />
                    <span className="text-2xl font-bold text-red-700 dark:text-red-300">
                      Неправильно 😔
                    </span>
                  </>
                )}
              </div>
              
              {selectedAnswer !== currentQuestion.correctAnswer && (
                <p className="text-gray-600 dark:text-gray-300">
                  Правильный ответ: <strong>{currentQuestion.options[currentQuestion.correctAnswer]}</strong>
                </p>
              )}
              
              <p className="text-sm text-gray-500 mt-2">
                Следующий вопрос через несколько секунд...
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls */}
        <div className="flex items-center justify-between gap-4">
          <Button
            onClick={onClose}
            variant="outline"
            className="gap-2"
          >
            Закрыть
          </Button>

          <div className="flex items-center gap-2">
            <Button
              onClick={generateQuestion}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Shuffle className="w-4 h-4" />
              Новый вопрос
            </Button>

            {selectedAnswer !== null && !showResult && (
              <Button
                onClick={checkAnswer}
                className="gap-2 theme-btn-luxury"
              >
                <CheckCircle className="w-4 h-4" />
                Ответить
              </Button>
            )}
          </div>
        </div>

        {/* Motivational Messages */}
        {streak >= 5 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 text-center p-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl text-white"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-2xl">🔥</span>
              <span className="font-bold text-lg">Невероятная серия!</span>
              <span className="text-2xl">🔥</span>
            </div>
            <p className="text-sm opacity-90">
              {streak} правильных ответов подряд! Машаллах!
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}