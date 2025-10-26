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
  Languages
} from "lucide-react";
import { useQuranStore } from "@/lib/store";
import { useSurahMultipleEditions } from "@/lib/hooks";
import { getAudioUrl, getAyahAudioUrl } from "@/lib/api";
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
    showTransliteration,
    selectedTranslations,
    audioReciter,
    bookmarks,
    setCurrentPosition,
    setFontSize,
    toggleTranslation,
    toggleTransliteration,
    addBookmark,
    removeBookmark,
    addReadingSession,
  } = useQuranStore();

  const [currentVerse, setCurrentVerse] = useState(initialVerse);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [volume, setVolume] = useState(1);

  const audioRef = useRef<HTMLAudioElement>(null);
  const verseRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const sessionStartTime = useRef<Date>(new Date());

  // Получаем суру с множественными переводами
  const { data: surahData, isLoading, error } = useSurahMultipleEditions(
    surahNumber, 
    ['quran-uthmani', ...selectedTranslations]
  );

  const arabicSurah = surahData?.[0];
  const translationSurahs = surahData?.slice(1) || [];

  // Обновляем позицию в store
  useEffect(() => {
    setCurrentPosition(surahNumber, currentVerse);
  }, [surahNumber, currentVerse, setCurrentPosition]);

  // Автоскролл к текущему аяту
  useEffect(() => {
    if (autoScroll && verseRefs.current[currentVerse]) {
      verseRefs.current[currentVerse]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [currentVerse, autoScroll]);

  // Обработка аудио
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      const progress = (audio.currentTime / audio.duration) * 100;
      setAudioProgress(progress);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      // Переходим к следующему аяту
      if (arabicSurah && currentVerse < arabicSurah.numberOfAyahs) {
        setCurrentVerse(prev => prev + 1);
        setTimeout(() => playAudio(), 1000); // Пауза между аятами
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentVerse, arabicSurah]);

  // Воспроизведение аудио
  const playAudio = async () => {
    const audio = audioRef.current;
    if (!audio || !arabicSurah) return;

    try {
      const ayahNumber = arabicSurah.ayahs?.[currentVerse - 1]?.number;
      if (ayahNumber) {
        audio.src = getAyahAudioUrl(ayahNumber, audioReciter);
        audio.playbackRate = playbackSpeed;
        audio.volume = volume;
        await audio.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
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
      playAudio();
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
    translationVerses.forEach((translation, index) => {
      text += `${translation}\n`;
    });
    text += `\n${arabicSurah.englishName} ${verseNumber}:${arabicSurah.number}`;

    try {
      await navigator.clipboard.writeText(text);
      // Показать уведомление об успешном копировании
    } catch (error) {
      console.error('Failed to copy text:', error);
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <audio ref={audioRef} preload="metadata" />
      
      {/* Header */}
      <div className="text-center mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl">
        <h1 className="text-3xl font-bold text-green-800 dark:text-green-200 mb-2">
          {arabicSurah.name}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          {arabicSurah.englishName} - {arabicSurah.englishNameTranslation}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {arabicSurah.numberOfAyahs} {locale === 'en' ? 'verses' : 'аятов'} • {arabicSurah.revelationType}
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateVerse('prev')}
            disabled={currentVerse === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={toggleAudio}
            className="flex items-center gap-2"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {locale === 'en' ? 'Audio' : 'Аудио'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateVerse('next')}
            disabled={currentVerse === arabicSurah.numberOfAyahs}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {currentVerse} / {arabicSurah.numberOfAyahs}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={toggleTranslation}
            className={cn(showTranslation && "bg-green-100 dark:bg-green-900")}
          >
            <Languages className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {locale === 'en' ? 'Font Size' : 'Размер шрифта'}
                </label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFontSize(fontSize - 2)}
                  >
                    -
                  </Button>
                  <span className="text-sm font-medium w-12 text-center">{fontSize}px</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFontSize(fontSize + 2)}
                  >
                    +
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {locale === 'en' ? 'Volume' : 'Громкость'}
                </label>
                <div className="flex items-center gap-2">
                  <VolumeX className="h-4 w-4" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="flex-1"
                  />
                  <Volume2 className="h-4 w-4" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {locale === 'en' ? 'Speed' : 'Скорость'}
                </label>
                <Select value={playbackSpeed.toString()} onValueChange={(value) => setPlaybackSpeed(parseFloat(value))}>
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Verses */}
      <div className="space-y-6">
        {arabicSurah.ayahs?.map((verse, index) => {
          const verseNumber = verse.numberInSurah;
          const isCurrentVerse = verseNumber === currentVerse;
          
          return (
            <motion.div
              key={verse.number}
              ref={(el) => (verseRefs.current[verseNumber] = el)}
              className={cn(
                "p-6 rounded-xl border transition-all duration-300",
                isCurrentVerse 
                  ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 shadow-lg" 
                  : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
              )}
              layout
            >
              {/* Verse Number */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
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
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleBookmark(verseNumber)}
                    className={cn(
                      isBookmarked(verseNumber) && "text-yellow-500"
                    )}
                  >
                    {isBookmarked(verseNumber) ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyVerse(verseNumber)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentVerse(verseNumber)}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Arabic Text */}
              <div 
                className="text-right mb-4 leading-loose font-amiri"
                style={{ fontSize: `${fontSize + 4}px` }}
                dir="rtl"
              >
                <p className="text-gray-900 dark:text-gray-100">
                  {verse.text}
                </p>
              </div>

              {/* Translations */}
              {showTranslation && translationSurahs.map((translationSurah, tIndex) => {
                const translationVerse = translationSurah.ayahs?.[index];
                if (!translationVerse) return null;

                return (
                  <div key={tIndex} className="mb-3 last:mb-0">
                    <p 
                      className="text-gray-700 dark:text-gray-300 leading-relaxed"
                      style={{ fontSize: `${fontSize}px` }}
                    >
                      {translationVerse.text}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {translationSurah.name || selectedTranslations[tIndex]}
                    </p>
                  </div>
                );
              })}
            </motion.div>
          );
        })}
      </div>

      {/* Navigation Footer */}
      <div className="mt-12 flex justify-center">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigateVerse('prev')}
            disabled={currentVerse === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            {locale === 'en' ? 'Previous' : 'Предыдущий'}
          </Button>
          
          <span className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm">
            {currentVerse} / {arabicSurah.numberOfAyahs}
          </span>
          
          <Button
            variant="outline"
            onClick={() => navigateVerse('next')}
            disabled={currentVerse === arabicSurah.numberOfAyahs}
          >
            {locale === 'en' ? 'Next' : 'Следующий'}
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}