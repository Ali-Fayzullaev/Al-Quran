// app/juz/[id]/page.tsx
"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { motion } from "framer-motion";
import { useJuz } from "@/lib/hooks";
import { useLocale } from "@/context/LocaleContext";
import { useQuranStore } from "@/lib/store";
import Link from "next/link";
import { 
  ChevronLeft, 
  ChevronRight, 
  Home, 
  Book, 
  Play, 
  Pause, 
  Settings, 
  Copy, 
  Bookmark, 
  BookmarkCheck,
  SkipForward,
  Shuffle,
  Target,
  Trophy,
  Clock,
  Eye,
  Heart,
  Star,
  Minus,
  Plus,
  Minimize2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { getWorkingAudioUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

interface JuzPageProps {
  params: Promise<{ id: string }>;
}

export default function JuzPage({ params }: JuzPageProps) {
  const resolvedParams = use(params);
  const { locale, t } = useLocale();
  const juzId = parseInt(resolvedParams.id);
  
  const {
    fontSize,
    showTranslation,
    selectedTranslations,
    audioReciter,
    bookmarks,
    setFontSize,
    toggleTranslation,
    addBookmark,
    removeBookmark,
    customButtonColor,
    customQuranTextColor,
    customQuranTranslationColor,
  } = useQuranStore();

  const [currentVerse, setCurrentVerse] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [autoPlayNext, setAutoPlayNext] = useState(false);
  const [showAutoPlayDialog, setShowAutoPlayDialog] = useState(false);
  
  // Игровые элементы
  const [readingStreak, setReadingStreak] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [focusMode, setFocusMode] = useState(false);
  const [versesRead, setVersesRead] = useState(new Set<number>());
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuizVerse, setCurrentQuizVerse] = useState<any>(null);
  
  // Состояния для перемещаемой панели статистики
  const [statsPosition, setStatsPosition] = useState({ x: 20, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [statsMinimized, setStatsMinimized] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const readingStartTime = useRef<number>(Date.now());

  // Валидация ID джуза
  if (isNaN(juzId) || juzId < 1 || juzId > 30) {
    notFound();
  }

  // Загрузка данных из localStorage при монтировании
  useEffect(() => {
    const savedProgress = localStorage.getItem(`juz-${juzId}-progress`);
    if (savedProgress) {
      const { versesRead: savedVersesRead, readingStreak: savedStreak, readingTime: savedTime } = JSON.parse(savedProgress);
      setVersesRead(new Set(savedVersesRead));
      setReadingStreak(savedStreak || 0);
      setReadingTime(savedTime || 0);
    }

    const savedStatsPosition = localStorage.getItem('stats-position');
    if (savedStatsPosition) {
      setStatsPosition(JSON.parse(savedStatsPosition));
    }

    const savedStatsMinimized = localStorage.getItem('stats-minimized');
    if (savedStatsMinimized) {
      setStatsMinimized(JSON.parse(savedStatsMinimized));
    }
  }, [juzId]);

  // Сохранение прогресса в localStorage
  useEffect(() => {
    if (versesRead.size > 0 || readingStreak > 0 || readingTime > 0) {
      const progressData = {
        versesRead: Array.from(versesRead),
        readingStreak,
        readingTime
      };
      localStorage.setItem(`juz-${juzId}-progress`, JSON.stringify(progressData));
    }
  }, [versesRead, readingStreak, readingTime, juzId]);

  // Получаем данные джуза
  const { data: juzData, isLoading, error } = useJuz(juzId);

  // Функция для поиска номера суры по аяту
  const findSurahForVerse = (verseNumber: number) => {
    if (!juzData?.surahs || !juzData?.ayahs) {
      return null;
    }

    const verse = juzData.ayahs.find(ayah => ayah.number === verseNumber);
    if (!verse) {
      return null;
    }

    for (const [surahId, surahData] of Object.entries(juzData.surahs)) {
      const surahNumber = parseInt(surahId);
      const ayahInSurah = surahData.ayahs?.find(ayah => 
        ayah.number === verseNumber || 
        ayah.numberInSurah === verse.numberInSurah
      );
      
      if (ayahInSurah) {
        return surahNumber;
      }
    }

    if (juzId === 1) {
      if (verse.numberInSurah <= 7 && Object.keys(juzData.surahs).includes('1')) {
        return 1;
      } else if (Object.keys(juzData.surahs).includes('2')) {
        return 2;
      }
    }
    
    const firstSurahId = Object.keys(juzData.surahs)[0];
    if (firstSurahId) {
      return parseInt(firstSurahId);
    }
    
    return null;
  };

  // Трекинг времени чтения
  useEffect(() => {
    const interval = setInterval(() => {
      if (!focusMode) {
        setReadingTime(prev => prev + 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [focusMode]);

  // Функция для отметки аята как прочитанного
  const markVerseAsRead = (verseNumber: number) => {
    setVersesRead(prev => {
      const newSet = new Set(prev);
      if (!newSet.has(verseNumber)) {
        newSet.add(verseNumber);
        // Увеличиваем streak при прочтении нового аята
        setReadingStreak(prevStreak => prevStreak + 1);
        console.log(`Аят ${verseNumber} отмечен как прочитанный. Всего прочитано: ${newSet.size}`);
      }
      return newSet;
    });
  };

  // Обработчики перетаскивания
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = Math.max(0, Math.min(window.innerWidth - 200, e.clientX - dragOffset.x));
      const newY = Math.max(0, Math.min(window.innerHeight - 150, e.clientY - dragOffset.y));
      const newPosition = { x: newX, y: newY };
      setStatsPosition(newPosition);
      localStorage.setItem('stats-position', JSON.stringify(newPosition));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  // Функция переключения минимизации
  const toggleStatsMinimized = () => {
    const newMinimized = !statsMinimized;
    setStatsMinimized(newMinimized);
    localStorage.setItem('stats-minimized', JSON.stringify(newMinimized));
  };

  // Функция запуска теста
  const startQuiz = () => {
    if (versesRead.size === 0) return;
    const readVersesArray = Array.from(versesRead);
    const randomIndex = Math.floor(Math.random() * readVersesArray.length);
    const randomVerseNumber = readVersesArray[randomIndex];
    const randomVerse = juzData?.ayahs?.find(v => v.number === randomVerseNumber);
    
    if (randomVerse) {
      setCurrentQuizVerse(randomVerse);
      setShowQuiz(true);
    }
  };

  const playAudio = async (verse: any) => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
        audio.currentTime = 0;
      }

      const surahNumber = findSurahForVerse(verse.number);
      
      if (!surahNumber) {
        console.error('Could not find surah number for verse:', verse);
        return;
      }

      const audioUrl = await getWorkingAudioUrl(surahNumber, verse.numberInSurah, audioReciter);
      
      audio.src = audioUrl;
      
      await new Promise((resolve, reject) => {
        const handleLoadedMetadata = () => {
          audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
          audio.removeEventListener('error', handleError);
          resolve(void 0);
        };
        
        const handleError = () => {
          audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
          audio.removeEventListener('error', handleError);
          reject(new Error('Failed to load audio'));
        };
        
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('error', handleError);
        
        audio.load();
      });

      await audio.play();
      setIsPlaying(true);
      setCurrentVerse(verse.number);
      markVerseAsRead(verse.number);
      
      if (!localStorage.getItem('autoPlayPreference')) {
        setShowAutoPlayDialog(true);
      }
      
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
      setCurrentVerse(null);
    }
  };

  const pauseAudio = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const toggleAudio = (verse: any) => {
    if (isPlaying && currentVerse === verse.number) {
      pauseAudio();
    } else {
      playAudio(verse);
    }
  };

  const playNextVerse = () => {
    if (!juzData?.ayahs || !currentVerse) return;
    
    const currentIndex = juzData.ayahs.findIndex(v => v.number === currentVerse);
    if (currentIndex !== -1 && currentIndex < juzData.ayahs.length - 1) {
      const nextVerse = juzData.ayahs[currentIndex + 1];
      setTimeout(() => playAudio(nextVerse), 1000);
    } else {
      setIsPlaying(false);
      setCurrentVerse(null);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      setIsPlaying(false);
      if (autoPlayNext) {
        playNextVerse();
      } else {
        setCurrentVerse(null);
      }
    };

    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, [autoPlayNext, currentVerse, juzData]);

  const handleAutoPlayChoice = (choice: boolean) => {
    setAutoPlayNext(choice);
    setShowAutoPlayDialog(false);
    localStorage.setItem('autoPlayPreference', choice.toString());
  };

  const isBookmarked = (surahNumber: number, verseNumber: number) => {
    return bookmarks.some(b => b.surahNumber === surahNumber && b.verseNumber === verseNumber);
  };

  const toggleBookmark = (surahNumber: number, verseNumber: number) => {
    if (isBookmarked(surahNumber, verseNumber)) {
      removeBookmark(surahNumber, verseNumber);
    } else {
      addBookmark(surahNumber, verseNumber);
    }
  };

  const copyVerse = async (verse: any) => {
    try {
      await navigator.clipboard.writeText(verse.text);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    if (!juzData?.ayahs) {
      console.log('getProgressPercentage: juzData.ayahs не найден');
      return 0;
    }
    
    const totalVerses = juzData.ayahs.length;
    const readVerses = versesRead.size;
    const percentage = (readVerses / totalVerses) * 100;
    
    console.log(`Прогресс: ${readVerses}/${totalVerses} = ${percentage.toFixed(1)}%`);
    console.log('versesRead:', Array.from(versesRead));
    
    return percentage;
  };

  // Добавляем useEffect для отладки загрузки данных
  useEffect(() => {
    console.log('juzData загружен:', !!juzData);
    console.log('juzData.ayahs length:', juzData?.ayahs?.length);
    console.log('versesRead size:', versesRead.size);
    console.log('Текущий прогресс:', getProgressPercentage());
  }, [juzData, versesRead]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">
            {t('loadingJuz')}
          </p>
        </div>
      </div>
    );
  }

  if (error || !juzData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="text-xl mb-2">
            {t('errorLoadingJuz')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: 'var(--fixed-background)' }}>
      <audio ref={audioRef} preload="metadata" />
      
      {/* Викторина */}
      {showQuiz && currentQuizVerse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl max-w-2xl mx-4">
            <div className="text-center mb-6">
              <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold gradient-text-primary mb-2">
                Тест на запоминание
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Сможете ли вы узнать этот аят?
              </p>
            </div>
            
            <div className="text-center p-6 bg-gray-50 dark:bg-gray-700 rounded-2xl mb-6">
              <p className="font-amiri text-2xl text-right mb-4" dir="rtl">
                {currentQuizVerse.text.substring(0, 50)}...
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                Это аят номер {currentQuizVerse.numberInSurah} из суры {findSurahForVerse(currentQuizVerse.number)}
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={() => {
                  playAudio(currentQuizVerse);
                  setShowQuiz(false);
                }}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                <Play className="w-4 h-4 mr-2" />
                Прослушать
              </Button>
              <Button 
                onClick={() => setShowQuiz(false)}
                variant="outline"
                className="flex-1"
              >
                Закрыть
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Диалог автовоспроизведения */}
      {showAutoPlayDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              {t('autoPlayTitle') || 'Автовоспроизведение'}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {t('autoPlayMessage') || 'Хотите автоматически воспроизводить следующий аят после завершения текущего?'}
            </p>
            <div className="flex gap-3">
              <Button 
                onClick={() => handleAutoPlayChoice(true)}
                className="flex-1 theme-bg-primary hover:theme-bg-primary-dark text-white"
              >
                {t('yes') || 'Да'}
              </Button>
              <Button 
                onClick={() => handleAutoPlayChoice(false)}
                variant="outline"
                className="flex-1"
              >
                {t('no') || 'Нет'}
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Декоративные элементы */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-96 h-96 theme-decoration rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-96 h-96 theme-decoration rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>
      
      {/* Navigation Header */}
      <div className="sticky top-0 z-10 backdrop-blur-xl border-b shadow-lg" style={{ 
        backgroundColor: 'var(--fixed-background)',
        borderColor: 'var(--color-border)',
        opacity: 0.95
      }}>
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            
            {/* Left Navigation */}
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Home className="w-4 h-4" />
                  {t('home')}
                </Button>
              </Link>
              
              <Link href="/juz">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Book className="w-4 h-4" />
                  {t('allJuz')}
                </Button>
              </Link>
            </div>

            {/* Center - Juz Info */}
            <div className="text-center p-4 rounded-xl shadow-xl border" style={{
              backgroundColor: 'var(--fixed-background)',
              borderColor: 'var(--color-border)'
            }}>
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="w-2 h-2 theme-dot-animated rounded-full"></div>
                <h1 className="font-bold text-xl gradient-text-primary">
                  {t('juz')} {juzId}
                </h1>
                <div className="w-2 h-2 theme-dot-animated rounded-full"></div>
              </div>
              <p className="text-sm font-medium" style={{ color: 'var(--fixed-text-secondary)' }}>
                {juzData.ayahs?.length} {t('verses')}
              </p>
              <div className="mt-2 h-1 gradient-primary rounded-full w-20 mx-auto opacity-60"></div>
            </div>

            {/* Right Navigation */}
            <div className="flex items-center gap-3">
              <Link href={`/juz/${Math.max(1, juzId - 1)}`}>
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={juzId === 1}
                  className="disabled:opacity-50 disabled:cursor-not-allowed gap-1 theme-hover-bg-soft hover:theme-border-primary"
                >
                  <ChevronLeft className="w-4 h-4" />
                  {t('prev')}
                </Button>
              </Link>
              
              <Link href={`/juz/${Math.min(30, juzId + 1)}`}>
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={juzId === 30}
                  className="disabled:opacity-50 disabled:cursor-not-allowed gap-1 theme-hover-bg-soft hover:theme-border-primary"
                >
                  {t('next')}
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Stats */}
      <div
        className="fixed z-50 bg-white/90 dark:bg-gray-800/90 p-4 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700"
        style={{
          top: statsPosition.y,
          left: statsPosition.x,
          width: statsMinimized ? "auto" : "200px",
          height: statsMinimized ? "auto" : "150px",
          cursor: isDragging ? "grabbing" : "grab",
        }}
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">
            {t('stats') || 'Статистика'}
          </h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleStatsMinimized}
            className="p-1"
          >
            <Minimize2 className="w-4 h-4" />
          </Button>
        </div>
        {!statsMinimized && (
          <div className="grid grid-cols-2 gap-2">
            <div className="text-center">
              <Eye className="w-5 h-5 theme-text-primary mx-auto mb-1" />
              <p className="text-sm font-bold theme-text-primary">
                {versesRead.size}
              </p>
            </div>
            <div className="text-center">
              <Clock className="w-5 h-5 theme-text-primary mx-auto mb-1" />
              <p className="text-sm font-bold theme-text-primary">
                {formatTime(readingTime)}
              </p>
            </div>
            <div className="text-center">
              <Target className="w-5 h-5 theme-text-primary mx-auto mb-1" />
              <p className="text-sm font-bold theme-text-primary">
                {Math.round(getProgressPercentage())}%
              </p>
            </div>
            <div className="text-center">
              <Star className="w-5 h-5 theme-text-primary mx-auto mb-1" />
              <p className="text-sm font-bold theme-text-primary">
                {readingStreak}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="text-center mb-8 p-8 rounded-3xl shadow-2xl border hover:shadow-xl transition-all duration-300" style={{
          backgroundColor: 'var(--fixed-background)',
          borderColor: 'var(--color-border)'
        }}>
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-3 h-3 theme-dot-animated rounded-full"></div>
            <h1 className="text-4xl font-bold gradient-text-primary">
              {t('juz')} {juzId}
            </h1>
            <div className="w-3 h-3 theme-dot-animated rounded-full"></div>
          </div>
          <p className="text-lg font-medium" style={{ color: 'var(--fixed-text-secondary)' }}>
            {juzData.ayahs?.length} {t('versesFromMultipleSurahs')}
          </p>
          <div className="mt-4 h-2 gradient-primary rounded-full w-32 mx-auto opacity-70"></div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 backdrop-blur-sm p-6 rounded-2xl shadow-xl border" style={{
          backgroundColor: 'var(--fixed-background)',
          borderColor: 'var(--color-border)',
          opacity: 0.9
        }}>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTranslation}
              className={cn(
                "transition-all duration-300 theme-hover-bg-soft",
                showTranslation && "theme-active-bg theme-border-primary"
              )}
            >
              {t('translation')}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className="theme-hover-bg-soft"
            >
              <Settings className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoPlayNext(!autoPlayNext)}
              className={cn(
                "transition-all duration-300 theme-hover-bg-soft gap-2",
                autoPlayNext && "bg-green-100 border-green-300 text-green-700 dark:bg-green-900/30 dark:border-green-600 dark:text-green-400"
              )}
            >
              <SkipForward className="w-4 h-4" />
              Авто
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={startQuiz}
              className="theme-hover-bg-soft gap-2"
            >
              <Shuffle className="w-4 h-4" />
              Тест
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setFocusMode(!focusMode)}
              className={cn(
                "transition-all duration-300 theme-hover-bg-soft gap-2",
                focusMode && "bg-purple-100 border-purple-300 text-purple-700 dark:bg-purple-900/30 dark:border-purple-600 dark:text-purple-400"
              )}
            >
              <Target className="w-4 h-4" />
              Фокус
            </Button>
          </div>

          <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700 p-3 rounded-xl">
            <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">
              {t('fontSizeLabel')}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFontSize(fontSize - 2)}
              className="w-8 h-8 p-0 theme-hover-bg-soft"
            >
              <Minus className="w-4 h-4" />
            </Button>
            <span className="text-sm font-bold gradient-text-primary w-16 text-center">{fontSize}px</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFontSize(fontSize + 2)}
              className="w-8 h-8 p-0 theme-hover-bg-soft"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Verses */}
        <div className="space-y-8">
          {juzData.ayahs?.map((verse, index) => {
            const isCurrentVerse = currentVerse === verse.number;
            const surahNumber = findSurahForVerse(verse.number);
            const isRead = versesRead.has(verse.number);
            
            return (
              <motion.div
                key={verse.number}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "group relative p-8 rounded-3xl shadow-xl transition-all duration-500 border hover:shadow-2xl transform hover:-translate-y-1 cursor-pointer",
                  isCurrentVerse && isPlaying
                    ? "theme-gradient-active border-green-300 dark:border-green-600 ring-4 ring-green-200/50 dark:ring-green-800/50 scale-[1.02]"
                    : isRead
                    ? "bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700"
                    : "bg-white/90 dark:bg-gray-800/90 border-gray-200 dark:border-gray-700 hover:border-green-200 dark:hover:border-green-700"
                )}
                onClick={() => markVerseAsRead(verse.number)}
              >
                {/* Reading Progress Indicator */}
                {isRead && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                    <Eye className="w-3 h-3 text-white" />
                  </div>
                )}

                {/* Verse Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-6">
                    <div className={cn(
                      "relative w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3",
                      isCurrentVerse && isPlaying 
                        ? "bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600 animate-pulse shadow-green-500/50" 
                        : isRead
                        ? "bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 shadow-blue-500/30"
                        : "bg-gradient-to-br from-gray-500 via-slate-600 to-gray-700 shadow-gray-500/30"
                    )}>
                      {verse.numberInSurah}
                      {isCurrentVerse && isPlaying && (
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-400 to-emerald-500 animate-ping opacity-20"></div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <p className="text-lg font-bold mb-1 text-gray-900 dark:text-gray-100">
                        {t('surah')} {surahNumber || '?'} • {t('verse')} {verse.numberInSurah}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <Book className="w-4 h-4" />
                        {t('page')} {verse.page}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {surahNumber && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleBookmark(surahNumber, verse.numberInSurah)}
                        className={cn(
                          "p-3 rounded-2xl hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-all duration-300 hover:scale-110",
                          isBookmarked(surahNumber, verse.numberInSurah) && "text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 shadow-lg"
                        )}
                      >
                        {isBookmarked(surahNumber, verse.numberInSurah) ? 
                          <BookmarkCheck className="w-5 h-5" /> : 
                          <Bookmark className="w-5 h-5" />
                        }
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyVerse(verse)}
                      className="p-3 rounded-2xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 hover:scale-110"
                    >
                      <Copy className="w-5 h-5" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleAudio(verse)}
                      className={cn(
                        "p-3 rounded-2xl transition-all duration-300 hover:scale-110",
                        isPlaying && currentVerse === verse.number
                          ? "bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50 shadow-lg"
                          : "hover:bg-green-50 dark:hover:bg-green-900/20"
                      )}
                    >
                      {isPlaying && currentVerse === verse.number ? 
                        <Pause className="w-6 h-6" /> : 
                        <Play className="w-6 h-6" />
                      }
                    </Button>
                  </div>
                </div>

                {/* Arabic Text */}
                <div 
                  className="text-right mb-8 leading-loose font-amiri"
                  style={{ 
                    fontSize: `${fontSize + 6}px`,
                  }}
                  dir="rtl"
                >
                  <div 
                    className={cn(
                      "relative p-6 rounded-2xl transition-all duration-500 hover:scale-[1.01] hover:opacity-90"
                    )}
                    style={{
                      backgroundColor: 'var(--verse-background)'
                    }}
                  >
                    <p 
                      className="leading-relaxed tracking-wide"
                      style={{ color: customQuranTextColor || 'var(--quran-arabic-color)' }}
                    >
                      {verse.text}
                    </p>
                  </div>
                </div>

                {/* Interactive Elements */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200/60 dark:border-gray-600/60">
                  <div className="flex items-center gap-4">
                    {!isRead && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markVerseAsRead(verse.number)}
                        className="gap-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-blue-200 dark:border-blue-700"
                      >
                        <Eye className="w-4 h-4" />
                        Отметить как прочитанное
                      </Button>
                    )}
                    
                    {isRead && (
                      <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                        <Eye className="w-4 h-4" />
                        <span className="text-sm font-medium">Прочитано</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                    <Heart className="w-4 h-4" />
                    <span className="text-sm">Барака за чтение</span>
                  </div>
                </div>

                {/* Translation */}
                {showTranslation && (verse as any).translations && (
                  <div className="mt-6 pt-6 border-t" style={{ borderColor: 'var(--color-border)' }}>
                    {(verse as any).translations.map((translation: any, idx: number) => (
                      <div 
                        key={idx} 
                        className="p-4 rounded-xl mb-3 last:mb-0"
                        style={{ backgroundColor: 'var(--verse-background)', opacity: 0.95 }}
                      >
                        <p 
                          className="leading-relaxed"
                          style={{ 
                            fontSize: `${fontSize}px`,
                            color: customQuranTranslationColor || 'var(--quran-translation-color)'
                          }}
                        >
                          {translation.text}
                        </p>
                        {translation.resource_name && (
                          <p className="text-sm mt-2" style={{ color: 'var(--fixed-text-secondary)' }}>
                            — {translation.resource_name}
                          </p>
                        )}
                      </div>
                    ))}
                    {(!(verse as any).translations || (verse as any).translations.length === 0) && (
                      <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--verse-background)' }}>
                        <p className="italic text-lg leading-relaxed" style={{ color: 'var(--fixed-text-secondary)' }}>
                          {t('translationAvailableSoon')}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Completion Celebration */}
        {versesRead.size === juzData?.ayahs?.length && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-12 text-center p-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl shadow-2xl text-white"
          >
            <Trophy className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-3xl font-bold mb-2">
              Маша Аллах! 🎉
            </h3>
            <p className="text-xl mb-4">
              Вы завершили чтение {juzId}-го джуза!
            </p>
            <p className="text-lg opacity-90">
              Время чтения: {formatTime(readingTime)} • Серия: {readingStreak} аятов
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}