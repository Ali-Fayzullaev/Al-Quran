// app/juz/[id]/page.tsx
"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { motion } from "framer-motion";
import { useJuz } from "@/lib/hooks";
import { useLocale } from "@/context/LocaleContext";
import { useQuranStore } from "@/lib/store";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Home, Book, Play, Pause, Settings, Copy, Bookmark, BookmarkCheck } from "lucide-react";
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
  } = useQuranStore();

  const [currentVerse, setCurrentVerse] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [autoPlayNext, setAutoPlayNext] = useState(false);
  const [showAutoPlayDialog, setShowAutoPlayDialog] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  // Валидация ID джуза
  if (isNaN(juzId) || juzId < 1 || juzId > 30) {
    notFound();
  }

  // Получаем данные джуза
  const { data: juzData, isLoading, error } = useJuz(juzId);

  // Функция для поиска номера суры по аяту
  const findSurahForVerse = (verseNumber: number) => {
    if (!juzData?.surahs || !juzData?.ayahs) {
      console.log('No juz data available');
      return null;
    }

    console.log('Looking for verse number:', verseNumber);
    console.log('Available surahs:', Object.keys(juzData.surahs));
    
    // Способ 1: Поиск по ayahs в каждой суре
    for (const [surahId, surahData] of Object.entries(juzData.surahs)) {
      if (surahData.ayahs?.some(ayah => ayah.number === verseNumber)) {
        console.log(`Found verse ${verseNumber} in surah ${surahId}`);
        return parseInt(surahId);
      }
    }
    
    // Способ 2: Найти аят в основном массиве и использовать его индекс для определения суры
    const verseIndex = juzData.ayahs.findIndex(ayah => ayah.number === verseNumber);
    if (verseIndex !== -1) {
      const verse = juzData.ayahs[verseIndex];
      console.log('Found verse in main array:', verse);
      
      // Если у аята есть информация о джузе, мы можем использовать её для определения суры
      // Попробуем найти суру по номеру аята в суре (numberInSurah)
      for (const [surahId, surahData] of Object.entries(juzData.surahs)) {
        if (surahData.ayahs?.some(ayah => ayah.numberInSurah === verse.numberInSurah)) {
          console.log(`Found verse by numberInSurah ${verse.numberInSurah} in surah ${surahId}`);
          return parseInt(surahId);
        }
      }
      
      // Способ 3: Используем первую суру из джуза как fallback
      const firstSurahId = Object.keys(juzData.surahs)[0];
      if (firstSurahId) {
        console.log(`Using fallback surah ${firstSurahId} for verse ${verseNumber}`);
        return parseInt(firstSurahId);
      }
    }
    
    console.error('Could not find surah for verse:', verseNumber);
    return null;
  };

  // Улучшенная функция для получения информации о суре по аяту
  const getSurahInfoForVerse = (verse: any) => {
    if (!verse) return { surahNumber: null, surahName: null };
    
    const surahNumber = findSurahForVerse(verse.number);
    let surahName = null;
    
    if (surahNumber && juzData?.surahs?.[surahNumber]) {
      surahName = juzData.surahs[surahNumber].englishName || juzData.surahs[surahNumber].name;
    }
    
    return { surahNumber, surahName };
  };

  const playAudio = async (verse: any) => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      // Останавливаем текущее аудио если играет
      if (isPlaying) {
        audio.pause();
        audio.currentTime = 0;
      }

      const surahNumber = findSurahForVerse(verse.number);
      
      if (!surahNumber) {
        console.error('Could not find surah number for verse:', verse);
        return;
      }

      console.log(`Playing audio for Surah ${surahNumber}, Ayah ${verse.numberInSurah}`);

      const audioUrl = await getWorkingAudioUrl(surahNumber, verse.numberInSurah, audioReciter);
      
      // Устанавливаем новый источник
      audio.src = audioUrl;
      
      // Ждем загрузки метаданных
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
      
      // Показать диалог автовоспроизведения при первом использовании
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

  // Автовоспроизведение следующего аята
  const playNextVerse = () => {
    if (!juzData?.ayahs || !currentVerse) return;
    
    const currentIndex = juzData.ayahs.findIndex(v => v.number === currentVerse);
    if (currentIndex !== -1 && currentIndex < juzData.ayahs.length - 1) {
      const nextVerse = juzData.ayahs[currentIndex + 1];
      setTimeout(() => playAudio(nextVerse), 1000); // Пауза 1 секунда между аятами
    } else {
      setIsPlaying(false);
      setCurrentVerse(null);
    }
  };

  // Обработчик завершения аудио
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
      // Можно добавить уведомление об успешном копировании
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-green-900/20 relative overflow-hidden">
      <audio ref={audioRef} preload="metadata" />
      
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
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
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
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 shadow-lg">
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
            <div className="text-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="w-2 h-2 theme-dot-animated rounded-full"></div>
                <h1 className="font-bold text-xl gradient-text-primary">
                  {t('juz')} {juzId}
                </h1>
                <div className="w-2 h-2 theme-dot-animated rounded-full"></div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
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

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="text-center mb-8 theme-gradient-subtle p-8 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-3 h-3 theme-dot-animated rounded-full"></div>
            <h1 className="text-4xl font-bold gradient-text-primary">
              {t('juz')} {juzId}
            </h1>
            <div className="w-3 h-3 theme-dot-animated rounded-full"></div>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 font-medium">
            {juzData.ayahs?.length} {t('versesFromMultipleSurahs')}
          </p>
          <div className="mt-4 h-2 gradient-primary rounded-full w-32 mx-auto opacity-70"></div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
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
                "transition-all duration-300 theme-hover-bg-soft",
                autoPlayNext && "bg-green-100 border-green-300 text-green-700 dark:bg-green-900/30 dark:border-green-600 dark:text-green-400"
              )}
            >
              {autoPlayNext ? '🔄 Авто' : '⏭️ Авто'}
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
              -
            </Button>
            <span className="text-sm font-bold gradient-text-primary w-16 text-center">{fontSize}px</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFontSize(fontSize + 2)}
              className="w-8 h-8 p-0 theme-hover-bg-soft"
            >
              +
            </Button>
          </div>
        </div>

        {/* Verses */}
        <div className="space-y-6">
          {juzData.ayahs?.map((verse, index) => {
            const isCurrentVerse = currentVerse === verse.number;
            const surahNumber = findSurahForVerse(verse.number);
            
            return (
              <motion.div
                key={verse.number}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "p-8 rounded-2xl shadow-xl transition-all duration-500 border hover:shadow-2xl",
                  isCurrentVerse && isPlaying
                    ? "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-300 dark:border-green-600 ring-2 ring-green-200 dark:ring-green-800"
                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-green-200 dark:hover:border-green-700"
                )}
              >
                {/* Verse Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg transition-all duration-300",
                      isCurrentVerse && isPlaying 
                        ? "bg-gradient-to-r from-green-500 to-emerald-600 scale-110" 
                        : "bg-gradient-to-r from-gray-500 to-gray-600"
                    )}>
                      {verse.numberInSurah}
                    </div>
                    <div>
                      <p className="text-sm font-semibold mb-1 text-gray-900 dark:text-gray-100">
                        {t('surah')} {surahNumber || '?'} • {t('verse')} {verse.numberInSurah}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t('page')} {verse.page}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {surahNumber && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleBookmark(surahNumber, verse.numberInSurah)}
                        className={cn(
                          "p-2 rounded-xl hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-all duration-200",
                          isBookmarked(surahNumber, verse.numberInSurah) && "text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20"
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
                      className="p-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
                    >
                      <Copy className="w-5 h-5" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleAudio(verse)}
                      className={cn(
                        "p-2 rounded-xl transition-all duration-200",
                        isPlaying && currentVerse === verse.number
                          ? "bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
                          : "hover:bg-green-50 dark:hover:bg-green-900/20"
                      )}
                    >
                      {isPlaying && currentVerse === verse.number ? 
                        <Pause className="w-5 h-5" /> : 
                        <Play className="w-5 h-5" />
                      }
                    </Button>
                  </div>
                </div>

                {/* Arabic Text */}
                <div 
                  className="text-right mb-6 leading-loose font-amiri"
                  style={{ fontSize: `${fontSize + 4}px` }}
                  dir="rtl"
                >
                  <p className={cn(
                    "p-4 rounded-xl transition-all duration-300",
                    isCurrentVerse && isPlaying
                      ? "text-green-900 dark:text-green-100 bg-green-50/50 dark:bg-green-900/10"
                      : "text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700/30"
                  )}>
                    {verse.text}
                  </p>
                </div>

                {/* Translation */}
                {showTranslation && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <p className="text-gray-600 dark:text-gray-300 italic">
                      {t('translationAvailableSoon')}
                    </p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}