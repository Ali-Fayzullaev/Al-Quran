"use client";

import { useState, useRef, useEffect } from "react";
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
  X
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

  const audioRef = useRef<HTMLAudioElement>(null);
  const verseRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  // Получаем суру с множественными переводами
  const { data: surahData, isLoading, error } = useSurahMultipleEditions(
    surahNumber, 
    ['quran-uthmani', ...selectedTranslations]
  );

  const arabicSurah = surahData?.[0];
  const translationSurahs = surahData?.slice(1) || [];

  // Автоскролл к текущему аяту
  useEffect(() => {
    if (verseRefs.current[currentVerse]) {
      verseRefs.current[currentVerse]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [currentVerse]);

  // Обработка аудио
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      setIsPlaying(false);
      if (autoPlay && arabicSurah && currentVerse < arabicSurah.numberOfAyahs) {
        setCurrentVerse(prev => prev + 1);
        setTimeout(() => playVerseAudio(currentVerse + 1), 1000);
      }
    };

    const handleError = () => {
      console.error('Audio playback error');
      setIsPlaying(false);
      setIsLoadingAudio(false);
      setAudioError(locale === 'en' ? 'Audio not available for this reciter' : 'Аудио недоступно для этого чтеца');
    };

    const handleLoadStart = () => {
      setIsLoadingAudio(true);
      setAudioError(null);
    };

    const handleCanPlay = () => {
      setIsLoadingAudio(false);
      setAudioError(null);
    };

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
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

      {/* Controls - Адаптивный */}
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
            {isLoadingAudio ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
            ) : isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
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
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400 text-sm">{audioError}</p>
        </div>
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
                    autoPlay ? "bg-green-600" : "bg-gray-300 dark:bg-gray-600"
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

      {/* Verses - Полностью адаптивные */}
      <div className="space-y-4 sm:space-y-6">
        {arabicSurah.ayahs?.map((verse, index) => {
          const verseNumber = verse.numberInSurah;
          const isCurrentVerse = verseNumber === currentVerse;
          
          return (
            <motion.div
              key={verse.number}
              ref={(el) => {
                verseRefs.current[verseNumber] = el;
              }}
              className={cn(
                "p-4 sm:p-6 rounded-xl border transition-all duration-300",
                isCurrentVerse 
                  ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 shadow-lg" 
                  : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
              )}
            >
              {/* Verse Header - Адаптивный */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-600 text-white rounded-full flex items-center justify-center text-sm sm:text-base font-bold">
                    {verseNumber}
                  </div>
                  {isCurrentVerse && isPlaying && (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="w-2 h-2 bg-green-500 rounded-full"
                    />
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
                  
                  {/* ИСПРАВЛЕННАЯ кнопка Play */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => playVerseAudio(verseNumber)}
                    disabled={isLoadingAudio}
                    className="p-2"
                  >
                    {isLoadingAudio && currentVerse === verseNumber ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Arabic Text - Адаптивный размер */}
              <div 
                className="text-right mb-4 leading-loose font-amiri px-2"
                style={{ fontSize: `${fontSize + 2}px` }}
                dir="rtl"
              >
                <p className="text-gray-900 dark:text-gray-100">
                  {verse.text}
                </p>
              </div>

              {/* Translations - Адаптивный */}
              {showTranslation && translationSurahs.map((translationSurah, tIndex) => {
                const translationVerse = translationSurah.ayahs?.[index];
                if (!translationVerse) return null;

                return (
                  <div key={tIndex} className="mb-3 last:mb-0 px-2">
                    <p 
                      className="text-gray-700 dark:text-gray-300 leading-relaxed"
                      style={{ fontSize: `${fontSize - 2}px` }}
                    >
                      {translationVerse.text}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {selectedTranslations[tIndex] && availableTranslations.find(t => t.id === selectedTranslations[tIndex])?.name}
                    </p>
                  </div>
                );
              })}
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