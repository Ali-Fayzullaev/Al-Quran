"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
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
  Loader2,
  BookOpen
} from "lucide-react";
import { useQuranStore } from "@/lib/store";
import { useSurahMultipleEditions } from "@/lib/hooks";
import { getWorkingAudioUrl, RECITERS, TRANSLATIONS, clearAudioCache } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocale } from "@/context/LocaleContext";
import { cn } from "@/lib/utils";
import { usePrefetchNeighborSurahs } from "@/lib/usePrefetch";

interface QuranReaderProps {
  surahNumber: number;
  initialVerse?: number;
  customQuranTextColor?: string | null;
  customQuranTranslationColor?: string | null;
}

export default function QuranReader({ 
  surahNumber, 
  initialVerse = 1,
  customQuranTextColor,
  customQuranTranslationColor
}: QuranReaderProps) {
  const { locale, t } = useLocale();
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
    customButtonColor,
  } = useQuranStore();

  // Используем пропсы для кастомных цветов, если они переданы, иначе берем из store
  const { 
    customQuranTextColor: storeTextColor, 
    customQuranTranslationColor: storeTranslationColor 
  } = useQuranStore();
  
  const effectiveTextColor = customQuranTextColor ?? storeTextColor;
  const effectiveTranslationColor = customQuranTranslationColor ?? storeTranslationColor;

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
  
  // Хук для предзагрузки соседних сур
  const { prefetchNeighbors } = usePrefetchNeighborSurahs();

  // ИСПРАВЛЕНИЕ: Мемоизируем список изданий - по умолчанию только арабский текст
  const requestedEditions = useMemo(() => {
    const baseEdition = 'quran-uthmani';
    // По умолчанию загружаем только арабский текст
    if (!showTranslation) {
      return [baseEdition];
    }
    // Переводы добавляются только когда пользователь включает отображение переводов
    const translationsToLoad = selectedTranslations.filter(t => t !== baseEdition && t !== '');
    return [baseEdition, ...translationsToLoad];
  }, [selectedTranslations, showTranslation]);

  // Получаем суру с множественными переводами - теперь стабильно
  const { data: surahData, isLoading, error } = useSurahMultipleEditions(
    surahNumber, 
    requestedEditions
  );

  // ИСПРАВЛЕНИЕ: Перемещаем все мемоизированные значения до условных возвратов
  // НАХОДИМ арабский текст - по умолчанию первая сура должна быть арабской
  const arabicSurah = useMemo(() => {
    if (!surahData || surahData.length === 0) return null;
    
    // Поскольку мы получаем данные в том порядке, в котором запрашиваем в requestedEditions,
    // первая сура всегда должна быть quran-uthmani (арабская)
    const firstSurah = surahData[0];
    
    // Проверяем, что у нас есть аяты и они на арабском (содержат арабские символы)
    if (firstSurah?.ayahs?.[0]?.text) {
      const firstVerseText = firstSurah.ayahs[0].text;
      const hasArabicChars = /[\u0600-\u06FF\u0750-\u077F]/.test(firstVerseText);
      
      if (!hasArabicChars) {
        console.warn('⚠️ First surah does not appear to be Arabic text:', firstVerseText.substring(0, 50));
      } else {
        console.log('✓ Arabic text confirmed');
      }
    }
    
    return firstSurah;
  }, [surahData]);
  
  // Получаем только переводы (все кроме первой суры - арабской)
  const translationSurahs = useMemo(() => {
    if (!showTranslation || !surahData || surahData.length <= 1) return [];
    
    // Поскольку первая сура - арабская, все остальные - переводы
    const translations = surahData.slice(1);
    
    console.log('✓ Translations loaded:', translations.length, 'editions');
    return translations;
  }, [surahData, showTranslation]);

  // Автоскролл к текущему аяту - оптимизировано
  const scrollToVerse = useCallback((verseNumber: number) => {
    if (verseRefs.current[verseNumber]) {
      verseRefs.current[verseNumber]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, []);

  // ИСПРАВЛЕНИЕ: Перемещаем ВСЕ useEffect до условных возвратов
  useEffect(() => {
    scrollToVerse(currentVerse);
  }, [currentVerse, scrollToVerse]);

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

  // Обработка изменения чтеца - останавливаем и перезагружаем аудио
  useEffect(() => {
    const audio = audioRef.current;
    
    // Очищаем кэш аудио при смене чтеца
    clearAudioCache();
    
    if (audio && isPlaying) {
      // Останавливаем текущее воспроизведение
      audio.pause();
      setIsPlaying(false);
      setAudioProgress(0);
      setAudioCurrentTime(0);
      
      // Если было активное воспроизведение, автоматически начинаем с новым чтецом
      setTimeout(() => {
        playVerseAudio(currentVerse);
      }, 300);
    }
  }, [audioReciter]);

  // Предзагружаем соседние суры для быстрой навигации
  useEffect(() => {
    // Предзагружаем с небольшой задержкой, чтобы не мешать основной загрузке
    const timer = setTimeout(() => {
      prefetchNeighbors(surahNumber, requestedEditions);
    }, 1000);

    return () => clearTimeout(timer);
  }, [surahNumber, requestedEditions, prefetchNeighbors]);

  // ИСПРАВЛЕННАЯ функция для воспроизведения аудио конкретного аята
  const playVerseAudio = useCallback(async (verseNumber: number) => {
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
  }, [surahNumber, audioReciter, audioSpeed, audioVolume, arabicSurah, locale]);

  // Остальные функции
  const pauseAudio = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      setIsPlaying(false);
    }
  }, []);

  const toggleAudio = useCallback(() => {
    if (isPlaying) {
      pauseAudio();
    } else {
      playVerseAudio(currentVerse);
    }
  }, [isPlaying, pauseAudio, playVerseAudio, currentVerse]);

  const handleResetAudio = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      audio.src = '';
    }
    setIsPlaying(false);
    setAudioCurrentTime(0);
    setAudioProgress(0);
    setIsBuffering(false);
    setIsLoadingAudio(false);
    setAudioError(null);
  }, []);

  const navigateVerse = useCallback((direction: 'prev' | 'next') => {
    if (!arabicSurah) return;

    if (direction === 'prev' && currentVerse > 1) {
      setCurrentVerse(prev => prev - 1);
    } else if (direction === 'next' && currentVerse < arabicSurah.numberOfAyahs) {
      setCurrentVerse(prev => prev + 1);
    }

    pauseAudio();
  }, [arabicSurah, currentVerse, pauseAudio]);

  const isBookmarked = useCallback((verseNumber: number) => {
    return bookmarks.some(b => b.surahNumber === surahNumber && b.verseNumber === verseNumber);
  }, [bookmarks, surahNumber]);

  const toggleBookmark = useCallback((verseNumber: number) => {
    if (isBookmarked(verseNumber)) {
      removeBookmark(surahNumber, verseNumber);
    } else {
      addBookmark(surahNumber, verseNumber);
    }
  }, [isBookmarked, removeBookmark, addBookmark, surahNumber]);

  const copyVerse = useCallback(async (verseNumber: number) => {
    if (!arabicSurah) return;

    const arabicVerse = arabicSurah.ayahs?.[verseNumber - 1];
    const translationVerses = translationSurahs.map(surah => 
      surah.ayahs?.[verseNumber - 1]?.text
    ).filter(Boolean);

    // Арабский текст сначала, затем переводы
    let text = `${arabicVerse?.text}\n\n`;
    
    if (translationVerses.length > 0) {
      translationVerses.forEach((translation) => {
        text += `${translation}\n\n`;
      });
    }
    
    text += `${arabicSurah.englishName} ${arabicSurah.number}:${verseNumber}`;

    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  }, [arabicSurah, translationSurahs]);

  const handleTranslationChange = useCallback((translationId: string, checked: boolean) => {
    const currentTranslations = selectedTranslations.filter(t => t !== 'quran-uthmani');
    
    if (checked) {
      setSelectedTranslations([...currentTranslations, translationId]);
    } else {
      setSelectedTranslations(currentTranslations.filter(t => t !== translationId));
    }
  }, [selectedTranslations, setSelectedTranslations]);

  // НОВЫЕ функции управления аудио
  const seekAudio = useCallback((percentage: number) => {
    const audio = audioRef.current;
    if (audio && audioDuration) {
      const newTime = (percentage / 100) * audioDuration;
      audio.currentTime = newTime;
      setAudioCurrentTime(newTime);
      setAudioProgress(percentage);
    }
  }, [audioDuration]);

  const skipAudio = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (audio) {
      const newTime = Math.max(0, Math.min(audioDuration, audioCurrentTime + seconds));
      audio.currentTime = newTime;
    }
  }, [audioDuration, audioCurrentTime]);

  const restartAudio = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = 0;
      setAudioProgress(0);
      setAudioCurrentTime(0);
    }
  }, []);

  // Форматирование времени
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // УЛУЧШЕННАЯ функция для получения иконки состояния аудио
  const getAudioIcon = useCallback((verseNumber?: number) => {
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
  }, [currentVerse, isPlaying, isLoadingAudio, isBuffering]);

  // Отладочная информация для QuranReader
  console.log('QuranReader Debug:', {
    surahNumber,
    requestedEditions,
    isLoading,
    error,
    surahData: surahData ? `${surahData.length} editions` : 'No data',
    arabicFound: arabicSurah ? 'Yes' : 'No',
    translationsCount: translationSurahs.length
  });

  // Обработка ошибок загрузки
  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500 mb-4">
          {t('errorLoadingSurahData')}
        </p>
        <p className="text-sm" style={{ color: 'var(--fixed-text-secondary)' }}>
          {error.message}
        </p>
      </div>
    );
  }

  // Показываем красивый индикатор загрузки данных Корана
  if (isLoading || !surahData || !arabicSurah) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-green-500 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-green-500" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
              {t('loadingQuran')}
            </h3>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              {t('preparingVerses')}
            </p>
            <div className="flex items-center justify-center space-x-1 mt-3">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse [animation-delay:0.2s]"></div>
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse [animation-delay:0.4s]"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
      <audio ref={audioRef} preload="metadata" />
      
      {/* Header - Адаптивный */}
      <div className="text-center mb-6 sm:mb-8 p-4 sm:p-6 rounded-xl sm:rounded-2xl" style={{ backgroundColor: 'var(--verse-background)' }}>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 font-amiri" style={{ color: 'var(--color-primary)' }} dir="rtl">
          {arabicSurah.name}
        </h1>
        <p className="text-sm sm:text-base lg:text-lg" style={{ color: 'var(--fixed-text-secondary)' }}>
          {arabicSurah.englishName} - {arabicSurah.englishNameTranslation}
        </p>
        <p className="text-xs sm:text-sm mt-1" style={{ color: 'var(--fixed-text-secondary)', opacity: 0.8 }}>
          {arabicSurah.numberOfAyahs} {t('versesInSurah')} • {arabicSurah.revelationType}
        </p>
      </div>

      {/* УПРОЩЕННЫЕ Controls без общей аудио-панели */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6 p-3 sm:p- rounded-xl shadow-sm" style={{
                    background: `linear-gradient(135deg, var(--color-secondary) 0%, var(--color-background-secondary) 100%)`,
                    borderColor: 'var(--color-primary)'
                  }}>
        <div className="flex items-center justify-center sm:justify-start gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateVerse('prev')}
            disabled={currentVerse === 1}
            className="flex-1 sm:flex-initial"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sm:hidden">{t('previous')}</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={toggleAudio}
            className="flex items-center gap-2 flex-1 sm:flex-initial"
            disabled={isLoadingAudio}
          >
            {getAudioIcon()}
            <span className="hidden sm:inline">{t('audioLabel')}</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateVerse('next')}
            disabled={currentVerse === arabicSurah.numberOfAyahs}
            className="flex-1 sm:flex-initial"
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sm:hidden">{t('next')}</span>
          </Button>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2" >
          <span className=" text-xs sm:text-sm px-2 py-1 rounded"
          style={showTranslation ? { 
              backgroundColor: 'var(--color-primary)', 
              color: 'white',
              borderColor: 'var(--color-primary)'
            } : undefined} 
            >
            {currentVerse} / {arabicSurah.numberOfAyahs}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={toggleTranslation}
            style={showTranslation ? { 
              backgroundColor: 'var(--color-primary)', 
              color: 'white',
              borderColor: 'var(--color-primary)'
            } : undefined}
          >
            <Languages className="h-4 w-4" />
            <span className="hidden sm:inline ml-1">{t('translationLabel')}</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline ml-1">{t('settingsLabel')}</span>
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

      {/* УЛУЧШЕННАЯ Settings Panel - Исправлено для мобильных устройств */}
      <AnimatePresence>
        {showSettings && (
          <>
            {/* Backdrop для мобильных устройств */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 mobile-settings-backdrop sm:hidden"
              style={{ zIndex: 40 }}
              onClick={() => setShowSettings(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, height: 0, scale: 0.95 }}
              animate={{ opacity: 1, height: 'auto', scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.95 }}
              className={cn(
                "mb-4 sm:mb-6 rounded-xl overflow-hidden shadow-xl border-2 mobile-settings-panel",
                "fixed inset-x-4 top-20 mobile-settings-content sm:relative sm:inset-auto sm:top-auto sm:z-auto",
                "max-h-[80vh] overflow-y-auto mobile-scroll"
              )}
              style={{ backgroundColor: 'var(--color-background-secondary)', borderColor: 'var(--color-border)', borderWidth: '1px' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Header with close button - улучшено для мобильных */}
              <div className="flex items-center justify-between pb-3 border-b-2 sticky top-0 z-10" 
                   style={{ backgroundColor: 'var(--color-background-secondary)', borderColor: 'var(--color-border)', borderWidth: '1px' }}>
                <h3 className="text-lg sm:text-xl font-bold">
                  {locale === 'en' ? 'Settings' : 'Настройки'}
                </h3>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => setShowSettings(false)}
                  className="p-2 rounded-full hover:bg-red-50 touch-manipulation"
                  style={{ backgroundColor: 'var(--color-background-secondary)', borderColor: 'var(--color-border)', borderWidth: '1px' }}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Reciter Selection - Улучшено для мобильных */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-semibold">
                  <User className="w-4 h-4"/>
                  {locale === 'en' ? 'Select Reciter (Qari)' : 'Выбрать чтеца (Кари)'}
                </label>
                <Select value={audioReciter} onValueChange={setAudioReciter}>
                  <SelectTrigger 
                    className="w-full h-12 touch-manipulation border-2" 
                    style={{ backgroundColor: 'var(--color-background-secondary)', borderColor: 'var(--color-border)', borderWidth: '1px' }}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent 
                    className="max-h-60 z-60 border-2"
                   style={{ backgroundColor: 'var(--color-background-secondary)', borderColor: 'var(--color-border)', borderWidth: '1px' }}
                  >
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
                <label className="flex items-center gap-2 text-sm font-semibold">
                  <Globe className="w-4 h-4"/>
                  {locale === 'en' ? 'Select Translations' : 'Выбрать переводы'}
                </label>
                <div className="grid grid-cols-1 gap-3 max-h-48 overflow-y-auto border-2 rounded-lg p-3" 
                    style={{ backgroundColor: 'var(--color-background-secondary)', borderColor: 'var(--color-border)', borderWidth: '1px' }}>
                  {availableTranslations
                    .filter(t => t.type === 'translation')
                    .map((translation) => (
                      <label
                        key={translation.id}
                        className="flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-green-50 touch-manipulation border"
                        style={{ backgroundColor: 'var(--color-background-secondary)', borderColor: 'var(--color-border)', borderWidth: '1px' }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedTranslations.includes(translation.id)}
                          onChange={(e) => handleTranslationChange(translation.id, e.target.checked)}
                          className="rounded w-5 h-5 touch-manipulation border-2" 
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold truncate" style={{ color: '#1f2937' }}>
                            {translation.name}
                          </div>
                          <div className="text-xs" style={{ color: '#6b7280' }}>
                            {translation.language}
                          </div>
                        </div>
                      </label>
                    ))}
                </div>
              </div>

              {/* Audio Settings - Улучшено для мобильных */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium" style={{ color: 'var(--fixed-text)' }}>
                    {locale === 'en' ? 'Font Size' : 'Размер шрифта'}
                  </label>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setFontSize(fontSize - 2)}
                      className="w-12 h-12 p-0 touch-manipulation"
                      style={{ 
                        backgroundColor: 'var(--verse-background)',
                        borderColor: 'var(--color-border)'
                      }}
                    >
                      -
                    </Button>
                    <span className="text-sm font-medium w-20 text-center rounded-lg px-3 py-2" 
                          style={{ 
                            backgroundColor: 'var(--verse-background)',
                            color: 'var(--fixed-text)',
                            border: '1px solid var(--color-border)'
                          }}>
                      {fontSize}px
                    </span>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setFontSize(fontSize + 2)}
                      className="w-12 h-12 p-0 touch-manipulation"
                      style={{ 
                        backgroundColor: 'var(--verse-background)',
                        borderColor: 'var(--color-border)'
                      }}
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
                      onTouchStart={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
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
                    <SelectTrigger
                      onTouchStart={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent
                      onTouchStart={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                    >
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
                  onTouchStart={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
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
          </>
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
                  : "hover:opacity-90"
              )}
              style={{
                backgroundColor: isCurrentVerse ? undefined : 'var(--verse-background)',
                borderColor: isCurrentVerse ? undefined : 'var(--color-border)'
              }}
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
                          className="w-3 h-3 border-2 border-t-transparent rounded-full"
                          style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }}
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
                    className="p-2 transition-all duration-200"
                    style={isCurrentVerse && isPlaying ? {
                      color: 'var(--color-primary)',
                      backgroundColor: 'var(--verse-background)',
                      opacity: 0.9
                    } : undefined}
                  >
                    {getAudioIcon(verseNumber)}
                  </Button>
                </div>
              </div>

              {/* Arabic Text - Адаптивный размер */}
              <div 
                className="text-right mb-4 leading-loose font-amiri px-2 quran-arabic-text"
                style={{ 
                  fontSize: `${fontSize + 2}px`,
                  color: effectiveTextColor || 'var(--color-primary)'
                }}
                dir="rtl"
              >
                {verse.text}
              </div>

              {/* НОВАЯ Индивидуальная аудио-панель для каждого аята */}
              <AnimatePresence>
                {hasAudioProgress && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -20 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -20 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="mb-4 p-4 rounded-xl border overflow-hidden"
                    style={{
                      backgroundColor: 'var(--verse-background)',
                      borderColor: 'var(--color-primary)',
                      opacity: 0.95
                    }}
                  >
                    {/* Прогресс-бар */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs mb-2" style={{ color: 'var(--fixed-text-secondary)' }}>
                        <span className="flex items-center gap-2">
                          <motion.div
                            animate={{ scale: isCurrentlyPlaying ? [1, 1.1, 1] : 1 }}
                            transition={{ repeat: isCurrentlyPlaying ? Infinity : 0, duration: 1.5 }}
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: 'var(--color-primary)' }}
                          />
                          {formatTime(audioCurrentTime)}
                        </span>
                        <span className="font-medium px-2 py-1 rounded-full text-xs" style={{ 
                          color: 'var(--color-primary)',
                          backgroundColor: 'var(--fixed-background)'
                        }}>
                          {locale === 'en' ? 'Verse' : 'Аят'} {currentVerse}
                        </span>
                        <span>{formatTime(audioDuration)}</span>
                      </div>
                      <div className="relative h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-border)' }}>
                        <motion.div 
                          className="absolute left-0 top-0 h-full rounded-full"
                          style={{ 
                            width: `${audioProgress}%`,
                            backgroundColor: 'var(--color-primary)'
                          }}
                          transition={{ duration: 0.1 }}
                        />
                        {isBuffering && (
                          <motion.div 
                            className="absolute inset-0 rounded-full opacity-50"
                            style={{ backgroundColor: 'var(--color-border)' }}
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
                        className="px-4 text-white shadow-lg"
                        style={{
                          backgroundColor: 'var(--color-primary)'
                        }}
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
                        className="mt-2 text-center text-xs flex items-center justify-center gap-2"
                        style={{ color: 'var(--fixed-text-secondary)' }}
                      >
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1 }}
                          className="w-3 h-3 border-2 border-t-transparent rounded-full"
                          style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }}
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

                      // Используем индекс для определения идентификатора перевода
                      const translationId = selectedTranslations.filter(t => t !== 'quran-uthmani')[tIndex];
                      const translationInfo = availableTranslations.find(t => t.id === translationId);

                      return (
                        <motion.div 
                          key={`${translationId}-${verseNumber}`}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ delay: tIndex * 0.1 }}
                          className="mb-3 last:mb-0 px-2 py-3 rounded-lg border-l-4"
                          style={{
                            backgroundColor: 'var(--verse-background)',
                            borderLeftColor: 'var(--color-primary)',
                            opacity: 0.95
                          }}
                        >
                          <p 
                            className="quran-translation-text leading-relaxed"
                            style={{ 
                              fontSize: `${fontSize - 2}px`,
                              color: effectiveTranslationColor || 'var(--quran-translation-color)'
                            }}
                          >
                            {translationVerse.text}
                          </p>
                          {translationInfo && (
                            <p className="text-xs mt-2 flex items-center gap-2" style={{ color: 'var(--fixed-text-secondary)' }}>
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }}></span>
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
          
          <span className="px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium ">
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

      {/* Mobile Floating Settings Button - Улучшено */}
      <div className="fixed bottom-6 right-6 z-40 md:hidden">
        <Button
          onClick={() => setShowSettings(!showSettings)}
          className="w-16 h-16 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 touch-manipulation border-2"
          style={{
            backgroundColor: showSettings ? 'var(--color-primary)' : 'var(--fixed-background)',
            borderColor: 'var(--color-primary)',
            color: showSettings ? 'white' : 'var(--color-primary)',
            minHeight: '64px',
            minWidth: '64px',
            boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
          }}
        >
          <motion.div
            animate={{ rotate: showSettings ? 180 : 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <Settings className="w-7 h-7" />
          </motion.div>
        </Button>
      </div>

      {/* Mobile Settings Panel - Fixed Structure */}
      {showSettings && (
        <div className="md:hidden">
          {/* Background Overlay */}
          <div 
            className="fixed inset-0 bg-black/50 z-40 mobile-overlay-backdrop"
            onTouchStart={(e) => {
              e.stopPropagation();
              setShowSettings(false);
            }}
            onClick={(e) => {
              e.stopPropagation();
              setShowSettings(false);
            }}
            onTouchEnd={(e) => e.stopPropagation()}
          />
          
          {/* Settings Panel */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl shadow-2xl mobile-panel-interactive mobile-panel-foreground"
            style={{ 
              backgroundColor: 'var(--fixed-background)',
              pointerEvents: 'auto',
              touchAction: 'pan-y'
            }}
            onTouchStart={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mt-3 mb-4"></div>
            
            <div 
              className="px-6 pb-6 max-h-[80vh] overflow-y-auto mobile-panel-interactive"
              onTouchStart={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchEnd={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
              style={{ touchAction: 'pan-y' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold">
                  {locale === 'en' ? 'Settings' : 'Настройки'}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(false)}
                  onTouchStart={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="p-2"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Quick Audio Controls */}
              <div className="mb-6 p-4 rounded-xl" style={{ backgroundColor: 'var(--verse-background)' }}>
                <h4 className="text-sm font-medium mb-3" style={{ color: 'var(--fixed-text)' }}>
                  {locale === 'en' ? 'Audio Controls' : 'Управление аудио'}
                </h4>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleAudio}
                    onTouchStart={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="flex-1"
                  >
                    {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                    {isPlaying ? (locale === 'en' ? 'Pause' : 'Пауза') : (locale === 'en' ? 'Play' : 'Воспроизвести')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetAudio}
                    onTouchStart={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    disabled={!audioRef.current?.src}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Volume Control */}
                <div className="mt-4">
                  <label className="text-xs font-medium flex items-center gap-2 mb-2" style={{ color: 'var(--fixed-text-secondary)' }}>
                    <Volume2 className="w-3 h-3" />
                    {locale === 'en' ? 'Volume' : 'Громкость'}: {Math.round(audioVolume * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={audioVolume}
                    onChange={(e) => setAudioVolume(parseFloat(e.target.value))}
                    onTouchStart={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Reciter Selection */}
              <div className="mb-6">
                <label className="text-sm font-medium mb-3 flex items-center gap-2" style={{ color: 'var(--fixed-text)' }}>
                  <User className="w-4 h-4" />
                  {locale === 'en' ? 'Reciter' : 'Чтец'}
                </label>
                <Select value={audioReciter} onValueChange={setAudioReciter}>
                  <SelectTrigger 
                    className="w-full"
                    onTouchStart={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent 
                    className="max-h-60"
                    onTouchStart={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    {availableReciters.map((reciter) => (
                      <SelectItem key={reciter.id} value={reciter.id}>
                        <div>
                          <div className="font-medium text-sm">{reciter.name}</div>
                          <div className="text-xs opacity-70">{reciter.country}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Font Size */}
              <div className="mb-6">
                <label className="text-sm font-medium mb-3 flex items-center gap-2" style={{ color: 'var(--fixed-text)' }}>
                  <Type className="w-4 h-4" />
                  {locale === 'en' ? 'Font Size' : 'Размер шрифта'}: {fontSize}px
                </label>
                <input
                  type="range"
                  min="14"
                  max="32"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                  onTouchStart={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="w-full"
                />
              </div>

              {/* Translation Toggle */}
              <div className="mb-6">
                <label className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center gap-2" style={{ color: 'var(--fixed-text)' }}>
                    <Languages className="w-4 h-4" />
                    {locale === 'en' ? 'Show Translation' : 'Показать перевод'}
                  </span>
                  <input
                    type="checkbox"
                    checked={showTranslation}
                    onChange={(e) => toggleTranslation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="w-5 h-5 rounded"
                    style={{ accentColor: 'var(--color-primary)' }}
                  />
                </label>
              </div>

              {/* Auto Play Toggle */}
              <div>
                <label className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center gap-2" style={{ color: 'var(--fixed-text)' }}>
                    <SkipForward className="w-4 h-4" />
                    {locale === 'en' ? 'Auto Play Next' : 'Автовоспроизведение'}
                  </span>
                  <input
                    type="checkbox"
                    checked={autoPlay}
                    onChange={(e) => setAutoPlay(e.target.checked)}
                    onTouchStart={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="w-5 h-5 rounded"
                    style={{ accentColor: 'var(--color-primary)' }}
                  />
                </label>
              </div>
            </div>
            </motion.div>
        </div>
      )}
    </div>
  );
}