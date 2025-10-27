"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, 
  Pause, 
  Bookmark, 
  BookmarkCheck, 
  Settings, 
  Copy, 
  Share2,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  Type,
  Languages,
  User,
  Globe,
  X,
  SkipBack,
  SkipForward,
  RotateCcw,
  Loader2
} from "lucide-react";
import { useQuranStore } from "@/lib/store";
import { useSurahMultipleEditions } from "@/lib/hooks";
import { getWorkingAudioUrl, RECITERS, TRANSLATIONS } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocale } from "@/context/LocaleContext";
import { cn } from "@/lib/utils";

interface QuranReaderProps {
  surahNumber: number;
  initialVerse?: number;
}

export default function QuranReader({ surahNumber, initialVerse = 1 }: QuranReaderProps) {
  const { locale } = useLocale();
  const {
    fontSize,
    showTranslation,
    selectedTranslations,
    audioReciter,
    audioSpeed,
    audioVolume,
    autoPlay,
    bookmarks,
    availableReciters,
    availableTranslations,
    setFontSize,
    toggleTranslation,
    setSelectedTranslations,
    setAudioReciter,
    setAudioSpeed,
    setAudioVolume,
    setAutoPlay,
    addBookmark,
    removeBookmark,
  } = useQuranStore();

  const [currentVerse, setCurrentVerse] = useState(initialVerse);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  // НОВЫЕ состояния для улучшенного аудио
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const verseRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  // ИСПРАВЛЕНИЕ: Мемоизируем список изданий для предотвращения ненужных перезагрузок
  const requestedEditions = useMemo(() => {
    const baseEdition = 'quran-uthmani';
    // Включаем переводы только если они действительно нужны
    const translationsToLoad = showTranslation ? selectedTranslations.filter(t => t !== baseEdition) : [];
    return [baseEdition, ...translationsToLoad];
  }, [selectedTranslations, showTranslation]);

  // Получаем суру с множественными переводами - теперь стабильно
  const { data: surahData, isLoading, error } = useSurahMultipleEditions(
    surahNumber, 
    requestedEditions
  );

  const arabicSurah = surahData?.[0];
  
  // ИСПРАВЛЕНИЕ: Фильтруем переводы только при отображении
  const translationSurahs = useMemo(() => {
    if (!showTranslation || !surahData) return [];
    return surahData.slice(1) || [];
  }, [surahData, showTranslation]);

  // Автоскролл к текущему аяту
  useEffect(() => {
    if (verseRefs.current[currentVerse]) {
      verseRefs.current[currentVerse]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [currentVerse]);

  // УЛУЧШЕННАЯ обработка аудио с прогрессом
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      setIsPlaying(false);
      setAudioProgress(0);
      setAudioCurrentTime(0);
      if (autoPlay && arabicSurah && currentVerse < arabicSurah.numberOfAyahs) {
        setCurrentVerse(prev => prev + 1);
        setTimeout(() => playVerseAudio(currentVerse + 1), 1000);
      }
    };

    const handleError = () => {
      console.error('Audio playback error');
      setIsPlaying(false);
      setIsLoadingAudio(false);
      setIsBuffering(false);
      setAudioError(locale === 'en' ? 'Audio not available for this reciter' : 'Аудио недоступно для этого чтеца');
    };

    const handleLoadStart = () => {
      setIsLoadingAudio(true);
      setIsBuffering(true);
      setAudioError(null);
    };

    const handleCanPlay = () => {
      setIsLoadingAudio(false);
      setIsBuffering(false);
      setAudioError(null);
    };

    const handleTimeUpdate = () => {
      const currentTime = audio.currentTime;
      const duration = audio.duration;
      setAudioCurrentTime(currentTime);
      if (duration) {
        setAudioProgress((currentTime / duration) * 100);
      }
    };

    const handleDurationChange = () => {
      setAudioDuration(audio.duration);
    };

    const handleWaiting = () => {
      setIsBuffering(true);
    };

    const handleCanPlayThrough = () => {
      setIsBuffering(false);
    };

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('canplaythrough', handleCanPlayThrough);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('canplaythrough', handleCanPlayThrough);
    };
  }, [currentVerse, arabicSurah, autoPlay, locale]);

  // ИСПРАВЛЕННАЯ функция для воспроизведения аудио конкретного аята
  const playVerseAudio = async (verseNumber: number) => {
    const audio = audioRef.current;
    if (!audio || !arabicSurah) return;

    try {
      setIsLoadingAudio(true);
      setAudioError(null);
      
      // Устанавливаем текущий аят
      setCurrentVerse(verseNumber);
      
      // Получаем рабочий URL для аудио
      const audioUrl = await getWorkingAudioUrl(surahNumber, verseNumber, audioReciter);
      
      console.log('Playing audio:', audioUrl); // Для отладки
      
      audio.src = audioUrl;
      audio.playbackRate = audioSpeed;
      audio.volume = audioVolume;
      
      await audio.play();
      setIsPlaying(true);
      setIsLoadingAudio(false);
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
      setIsLoadingAudio(false);
      setAudioError(locale === 'en' ? 'Audio not available' : 'Аудио недоступно');
    }
  };

  const pauseAudio = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const toggleAudio = () => {
    if (isPlaying) {
      pauseAudio();
    } else {
      playVerseAudio(currentVerse);
    }
  };

  const navigateVerse = (direction: 'prev' | 'next') => {
    if (!arabicSurah) return;

    if (direction === 'prev' && currentVerse > 1) {
      setCurrentVerse(prev => prev - 1);
    } else if (direction === 'next' && currentVerse < arabicSurah.numberOfAyahs) {
      setCurrentVerse(prev => prev + 1);
    }

    pauseAudio();
  };

  const isBookmarked = (verseNumber: number) => {
    return bookmarks.some(b => b.surahNumber === surahNumber && b.verseNumber === verseNumber);
  };

  const toggleBookmark = (verseNumber: number) => {
    if (isBookmarked(verseNumber)) {
      removeBookmark(surahNumber, verseNumber);
    } else {
      addBookmark(surahNumber, verseNumber);
    }
  };

  const copyVerse = async (verseNumber: number) => {
    if (!arabicSurah) return;

    const arabicVerse = arabicSurah.ayahs?.[verseNumber - 1];
    const translationVerses = translationSurahs.map(surah => 
      surah.ayahs?.[verseNumber - 1]?.text
    ).filter(Boolean);

    let text = `${arabicVerse?.text}\n\n`;
    translationVerses.forEach((translation) => {
      text += `${translation}\n`;
    });
    text += `\n${arabicSurah.englishName} ${verseNumber}:${arabicSurah.number}`;

    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const handleTranslationChange = (translationId: string, checked: boolean) => {
    const currentTranslations = selectedTranslations.filter(t => t !== 'quran-uthmani');
    
    if (checked) {
      setSelectedTranslations([...currentTranslations, translationId]);
    } else {
      setSelectedTranslations(currentTranslations.filter(t => t !== translationId));
    }
  };

  // НОВЫЕ функции управления аудио
  const seekAudio = (percentage: number) => {
    const audio = audioRef.current;
    if (audio && audioDuration) {
      const newTime = (percentage / 100) * audioDuration;
      audio.currentTime = newTime;
      setAudioCurrentTime(newTime);
      setAudioProgress(percentage);
    }
  };

  const skipAudio = (seconds: number) => {
    const audio = audioRef.current;
    if (audio) {
      const newTime = Math.max(0, Math.min(audioDuration, audioCurrentTime + seconds));
      audio.currentTime = newTime;
    }
  };

  const restartAudio = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = 0;
      setAudioProgress(0);
      setAudioCurrentTime(0);
    }
  };

  // Форматирование времени
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // УЛУЧШЕННАЯ функция для получения иконки состояния аудио
  const getAudioIcon = (verseNumber?: number) => {
    const isCurrentlyPlaying = verseNumber ? (currentVerse === verseNumber && isPlaying) : isPlaying;
    const isCurrentlyLoading = verseNumber ? (currentVerse === verseNumber && isLoadingAudio) : isLoadingAudio;
    const isCurrentlyBuffering = verseNumber ? (currentVerse === verseNumber && isBuffering) : isBuffering;

    if (isCurrentlyLoading) {
      return <Loader2 className="h-4 w-4 animate-spin" />;
    }
    
    if (isCurrentlyBuffering) {
      return <RotateCcw className="h-4 w-4 animate-spin" />;
    }
    
    if (isCurrentlyPlaying) {
      return <Pause className="h-4 w-4" />;
    }
    
    return <Play className="h-4 w-4" />;
  };

  // ИСПРАВЛЕНИЕ: Показываем лоадер только при первоначальной загрузке
  if (isLoading && !arabicSurah) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">
            {locale === 'en' ? 'Loading Surah...' : 'Загрузка суры...'}
          </p>
        </div>
      </div>
    );
  }

  if (error || !arabicSurah) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600">
          <p>{locale === 'en' ? 'Error loading Surah' : 'Ошибка загрузки суры'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
      <audio ref={audioRef} preload="metadata" />
      
      {/* Header - Адаптивный */}
      <div className="text-center mb-6 sm:mb-8 p-4 sm:p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl sm:rounded-2xl">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-800 dark:text-green-200 mb-2 font-amiri" dir="rtl">
          {arabicSurah.name}
        </h1>
        <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300">
          {arabicSurah.englishName} - {arabicSurah.englishNameTranslation}
        </p>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
          {arabicSurah.numberOfAyahs} {locale === 'en' ? 'verses' : 'аятов'} • {arabicSurah.revelationType}
        </p>
      </div>

      {/* УПРОЩЕННЫЕ Controls без общей аудио-панели */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6 p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        <div className="flex items-center justify-center sm:justify-start gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateVerse('prev')}
            disabled={currentVerse === 1}
            className="flex-1 sm:flex-initial"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sm:hidden">{locale === 'en' ? 'Prev' : 'Пред'}</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={toggleAudio}
            className="flex items-center gap-2 flex-1 sm:flex-initial"
            disabled={isLoadingAudio}
          >
            {getAudioIcon()}
            <span className="hidden sm:inline">{locale === 'en' ? 'Audio' : 'Аудио'}</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateVerse('next')}
            disabled={currentVerse === arabicSurah.numberOfAyahs}
            className="flex-1 sm:flex-initial"
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sm:hidden">{locale === 'en' ? 'Next' : 'След'}</span>
          </Button>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2">
          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
            {currentVerse} / {arabicSurah.numberOfAyahs}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={toggleTranslation}
            className={cn(showTranslation && "bg-green-100 dark:bg-green-900")}
          >
            <Languages className="h-4 w-4" />
            <span className="hidden sm:inline ml-1">{locale === 'en' ? 'Translation' : 'Перевод'}</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline ml-1">{locale === 'en' ? 'Settings' : 'Настройки'}</span>
          </Button>
        </div>
      </div>

      {/* Audio Error */}
      {audioError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
        >
          <p className="text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
            <X className="w-4 h-4" />
            {audioError}
          </p>
        </motion.div>
      )}

      {/* УЛУЧШЕННАЯ Settings Panel - Полностью адаптивная */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 sm:mb-6 bg-gray-50 dark:bg-gray-800 rounded-xl overflow-hidden"
          >
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Header with close button */}
              <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  {locale === 'en' ? 'Settings' : 'Настройки'}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(false)}
                  className="sm:hidden"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Reciter Selection - Адаптивный */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
                  <User className="w-4 h-4" />
                  {locale === 'en' ? 'Select Reciter (Qari)' : 'Выбрать чтеца (Кари)'}
                </label>
                <Select value={audioReciter} onValueChange={setAudioReciter}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {availableReciters.map((reciter) => (
                      <SelectItem key={reciter.id} value={reciter.id}>
                        <div className="text-left">
                          <div className="font-medium">{reciter.name}</div>
                          <div className="text-xs text-gray-500">{reciter.language}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Translation Selection - Улучшенный и адаптивный */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
                  <Globe className="w-4 h-4" />
                  {locale === 'en' ? 'Select Translations' : 'Выбрать переводы'}
                </label>
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg p-2">
                  {availableTranslations
                    .filter(t => t.type === 'translation')
                    .map((translation) => (
                      <label
                        key={translation.id}
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedTranslations.includes(translation.id)}
                          onChange={(e) => handleTranslationChange(translation.id, e.target.checked)}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500 w-4 h-4"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {translation.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {translation.language}
                          </div>
                        </div>
                      </label>
                    ))}
                </div>
              </div>

              {/* Audio Settings - Адаптивная сетка */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900 dark:text-white">
                    {locale === 'en' ? 'Font Size' : 'Размер шрифта'}
                  </label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFontSize(fontSize - 2)}
                      className="w-8 h-8 p-0"
                    >
                      -
                    </Button>
                    <span className="text-sm font-medium w-16 text-center bg-gray-100 dark:bg-gray-700 rounded px-2 py-1">
                      {fontSize}px
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFontSize(fontSize + 2)}
                      className="w-8 h-8 p-0"
                    >
                      +
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900 dark:text-white">
                    {locale === 'en' ? 'Volume' : 'Громкость'}
                  </label>
                  <div className="flex items-center gap-2">
                    <VolumeX className="h-4 w-4 text-gray-500" />
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={audioVolume}
                      onChange={(e) => setAudioVolume(parseFloat(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />
                    <Volume2 className="h-4 w-4 text-gray-500" />
                  </div>
                  <div className="text-xs text-center text-gray-500">
                    {Math.round(audioVolume * 100)}%
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900 dark:text-white">
                    {locale === 'en' ? 'Speed' : 'Скорость'}
                  </label>
                  <Select value={audioSpeed.toString()} onValueChange={(value) => setAudioSpeed(parseFloat(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.5">0.5x</SelectItem>
                      <SelectItem value="0.75">0.75x</SelectItem>
                      <SelectItem value="1">1x</SelectItem>
                      <SelectItem value="1.25">1.25x</SelectItem>
                      <SelectItem value="1.5">1.5x</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Auto Play Toggle */}
              <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <label className="text-sm font-medium text-gray-900 dark:text-white">
                  {locale === 'en' ? 'Auto-play next verse' : 'Автовоспроизведение следующего аята'}
                </label>
                <button
                  onClick={() => setAutoPlay(!autoPlay)}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                    autoPlay ? "theme-bg-primary" : "bg-gray-300 dark:bg-gray-600"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                      autoPlay ? "translate-x-6" : "translate-x-1"
                    )}
                  />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* УЛУЧШЕННЫЕ Verses с индивидуальными аудио-панелями */}
      <div className="space-y-4 sm:space-y-6">
        {arabicSurah.ayahs?.map((verse, index) => {
          const verseNumber = verse.numberInSurah;
          const isCurrentVerse = verseNumber === currentVerse;
          const isCurrentlyPlaying = isCurrentVerse && isPlaying;
          const hasAudioProgress = isCurrentVerse && (isPlaying || audioProgress > 0);
          
          return (
            <motion.div
              key={verse.number}
              ref={(el) => {
                verseRefs.current[verseNumber] = el;
              }}
              className={cn(
                "p-4 sm:p-6 rounded-xl border transition-all duration-300",
                isCurrentVerse 
                  ? "quran-highlight theme-border-primary shadow-lg" 
                  : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
              )}
              layout
            >
              {/* Verse Header с улучшенными иконками */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-base font-bold quran-verse-number">
                    {verseNumber}
                  </div>
                  {isCurrentVerse && (
                    <div className="flex items-center gap-2">
                      {isPlaying && (
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 1 }}
                          className="w-2 h-2 theme-dot-animated rounded-full"
                        />
                      )}
                      {isBuffering && (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1 }}
                          className="w-3 h-3 border-2 border-green-500 border-t-transparent rounded-full"
                        />
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-1 sm:gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleBookmark(verseNumber)}
                    className={cn(
                      "p-2",
                      isBookmarked(verseNumber) && "text-yellow-500"
                    )}
                  >
                    {isBookmarked(verseNumber) ? 
                      <BookmarkCheck className="h-4 w-4" /> : 
                      <Bookmark className="h-4 w-4" />
                    }
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyVerse(verseNumber)}
                    className="p-2"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  
                  {/* УЛУЧШЕННАЯ кнопка Play с динамической иконкой */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => playVerseAudio(verseNumber)}
                    disabled={isLoadingAudio && currentVerse === verseNumber}
                    className={cn(
                      "p-2 transition-all duration-200",
                      isCurrentVerse && isPlaying && "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20"
                    )}
                  >
                    {getAudioIcon(verseNumber)}
                  </Button>
                </div>
              </div>

              {/* Arabic Text - Адаптивный размер */}
              <div 
                className="text-right mb-4 leading-loose font-amiri px-2 quran-arabic-text"
                style={{ fontSize: `${fontSize + 2}px` }}
                dir="rtl"
              >
                <p>
                  {verse.text}
                </p>
              </div>

              {/* НОВАЯ Индивидуальная аудио-панель для каждого аята */}
              <AnimatePresence>
                {hasAudioProgress && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -20 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -20 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="mb-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-xl border border-green-200 dark:border-green-700 overflow-hidden"
                  >
                    {/* Прогресс-бар */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300 mb-2">
                        <span className="flex items-center gap-2">
                          <motion.div
                            animate={{ scale: isCurrentlyPlaying ? [1, 1.1, 1] : 1 }}
                            transition={{ repeat: isCurrentlyPlaying ? Infinity : 0, duration: 1.5 }}
                            className="w-2 h-2 bg-green-500 rounded-full"
                          />
                          {formatTime(audioCurrentTime)}
                        </span>
                        <span className="text-green-600 dark:text-green-400 font-medium px-2 py-1 bg-white dark:bg-gray-800 rounded-full text-xs">
                          {locale === 'en' ? 'Verse' : 'Аят'} {currentVerse}
                        </span>
                        <span>{formatTime(audioDuration)}</span>
                      </div>
                      <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div 
                          className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                          style={{ width: `${audioProgress}%` }}
                          transition={{ duration: 0.1 }}
                        />
                        {isBuffering && (
                          <motion.div 
                            className="absolute inset-0 bg-gray-300 dark:bg-gray-600 rounded-full"
                            animate={{ opacity: [0.3, 0.7, 0.3] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                          />
                        )}
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={audioProgress}
                          onChange={(e) => seekAudio(parseFloat(e.target.value))}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Расширенные элементы управления для конкретного аята */}
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={restartAudio}
                        disabled={!isPlaying && audioProgress === 0}
                        className="p-2 hover:bg-white dark:hover:bg-gray-800 transition-colors"
                        title={locale === 'en' ? 'Restart verse' : 'Перезапустить аят'}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => skipAudio(-10)}
                        disabled={audioCurrentTime < 10}
                        className="p-2 hover:bg-white dark:hover:bg-gray-800 transition-colors"
                        title={locale === 'en' ? 'Back 10 seconds' : 'Назад 10 секунд'}
                      >
                        <SkipBack className="h-4 w-4" />
                        <span className="text-xs ml-1">10s</span>
                      </Button>

                      <Button
                        variant="default"
                        size="sm"
                        onClick={toggleAudio}
                        className="px-4 bg-green-600 hover:bg-green-700 text-white shadow-lg"
                        disabled={isLoadingAudio}
                      >
                        {getAudioIcon()}
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => skipAudio(10)}
                        disabled={audioCurrentTime > audioDuration - 10}
                        className="p-2 hover:bg-white dark:hover:bg-gray-800 transition-colors"
                        title={locale === 'en' ? 'Forward 10 seconds' : 'Вперед 10 секунд'}
                      >
                        <SkipForward className="h-4 w-4" />
                        <span className="text-xs ml-1">10s</span>
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigateVerse('next')}
                        disabled={currentVerse === arabicSurah.numberOfAyahs}
                        className="p-2 hover:bg-white dark:hover:bg-gray-800 transition-colors"
                        title={locale === 'en' ? 'Next verse' : 'Следующий аят'}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Статус буферизации */}
                    {isBuffering && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2"
                      >
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1 }}
                          className="w-3 h-3 border-2 border-green-500 border-t-transparent rounded-full"
                        />
                        {locale === 'en' ? 'Buffering...' : 'Буферизация...'}
                      </motion.div>
                    )}

                    {/* Информация о чтеце */}
                    <div className="mt-3 text-center text-xs text-gray-500 dark:text-gray-400">
                      {availableReciters.find(r => r.id === audioReciter)?.name || 'Unknown Reciter'}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ИСПРАВЛЕНИЕ: Улучшенное отображение переводов с анимацией */}
              <AnimatePresence mode="wait">
                {showTranslation && (
                  <motion.div
                    key="translations"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    {translationSurahs.map((translationSurah, tIndex) => {
                      const translationVerse = translationSurah.ayahs?.[index];
                      if (!translationVerse) return null;

                      const translationId = selectedTranslations[tIndex];
                      const translationInfo = availableTranslations.find(t => t.id === translationId);

                      return (
                        <motion.div 
                          key={`${translationId}-${verseNumber}`}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ delay: tIndex * 0.1 }}
                          className="mb-3 last:mb-0 px-2 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-l-4 border-green-200 dark:border-green-700"
                        >
                          <p 
                            className="quran-translation-text leading-relaxed text-gray-700 dark:text-gray-200"
                            style={{ fontSize: `${fontSize - 2}px` }}
                          >
                            {translationVerse.text}
                          </p>
                          {translationInfo && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-2">
                              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                              {translationInfo.name}
                            </p>
                          )}
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Navigation Footer - Адаптивный */}
      <div className="mt-8 sm:mt-12 flex justify-center">
        <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={() => navigateVerse('prev')}
            disabled={currentVerse === 1}
            className="flex-1 sm:flex-initial"
          >
            <ChevronLeft className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="text-sm sm:text-base">
              {locale === 'en' ? 'Previous' : 'Предыдущий'}
            </span>
          </Button>
          
          <span className="px-3 sm:px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs sm:text-sm font-medium">
            {currentVerse} / {arabicSurah.numberOfAyahs}
          </span>
          
          <Button
            variant="outline"
            onClick={() => navigateVerse('next')}
            disabled={currentVerse === arabicSurah.numberOfAyahs}
            className="flex-1 sm:flex-initial"
          >
            <span className="text-sm sm:text-base">
              {locale === 'en' ? 'Next' : 'Следующий'}
            </span>
            <ChevronRight className="h-4 w-4 ml-1 sm:ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}