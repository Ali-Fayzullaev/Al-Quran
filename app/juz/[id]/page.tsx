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
import { getAyahAudioUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

interface JuzPageProps {
  params: Promise<{ id: string }>;
}

export default function JuzPage({ params }: JuzPageProps) {
  const resolvedParams = use(params);
  const { locale } = useLocale();
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

  const [currentVerse, setCurrentVerse] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  // Валидация ID джуза
  if (isNaN(juzId) || juzId < 1 || juzId > 30) {
    notFound();
  }

  // Получаем данные джуза
  const { data: juzData, isLoading, error } = useJuz(juzId);

  const playAudio = async (ayahNumber: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      audio.src = getAyahAudioUrl(ayahNumber, audioReciter);
      await audio.play();
      setIsPlaying(true);
      setCurrentVerse(ayahNumber);
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

  const toggleAudio = (ayahNumber: number) => {
    if (isPlaying && currentVerse === ayahNumber) {
      pauseAudio();
    } else {
      playAudio(ayahNumber);
    }
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">
            {locale === 'en' ? 'Loading Juz...' : 'Загрузка джуза...'}
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
            {locale === 'en' ? 'Error loading Juz' : 'Ошибка загрузки джуза'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-green-900/20">
      <audio ref={audioRef} preload="metadata" onEnded={() => setIsPlaying(false)} />
      
      {/* Navigation Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            
            {/* Left Navigation */}
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Home className="w-4 h-4" />
                  {locale === 'en' ? 'Home' : 'Главная'}
                </Button>
              </Link>
              
              <Link href="/juz">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Book className="w-4 h-4" />
                  {locale === 'en' ? 'All Juz' : 'Все джузы'}
                </Button>
              </Link>
            </div>

            {/* Center - Juz Info */}
            <div className="text-center">
              <h1 className="font-bold text-gray-900 dark:text-white">
                {locale === 'en' ? `Juz ${juzId}` : `Джуз ${juzId}`}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {juzData.ayahs?.length} {locale === 'en' ? 'verses' : 'аятов'}
              </p>
            </div>

            {/* Right Navigation */}
            <div className="flex items-center gap-2">
              <Link href={`/juz/${Math.max(1, juzId - 1)}`}>
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={juzId === 1}
                  className="gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  {locale === 'en' ? 'Prev' : 'Пред'}
                </Button>
              </Link>
              
              <Link href={`/juz/${Math.min(30, juzId + 1)}`}>
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={juzId === 30}
                  className="gap-1"
                >
                  {locale === 'en' ? 'Next' : 'След'}
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
        <div className="text-center mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl">
          <h1 className="text-3xl font-bold text-green-800 dark:text-green-200 mb-2">
            {locale === 'en' ? `Juz ${juzId}` : `Джуз ${juzId}`}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            {juzData.ayahs?.length} {locale === 'en' ? 'verses from multiple surahs' : 'аятов из нескольких сур'}
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTranslation}
              className={cn(showTranslation && "bg-green-100 dark:bg-green-900")}
            >
              {locale === 'en' ? 'Translation' : 'Перевод'}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {locale === 'en' ? 'Font Size:' : 'Размер шрифта:'}
            </span>
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

        {/* Verses */}
        <div className="space-y-6">
          {juzData.ayahs?.map((verse, index) => {
            const isCurrentVerse = currentVerse === verse.number;
            const surahNumber = Object.keys(juzData.surahs || {}).find(key => 
              juzData.surahs?.[parseInt(key)]?.ayahs?.some(ayah => ayah.number === verse.number)
            );
            
            return (
              <motion.div
                key={verse.number}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "p-6 rounded-xl border transition-all duration-300",
                  isCurrentVerse && isPlaying
                    ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 shadow-lg" 
                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                )}
              >
                {/* Verse Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {verse.numberInSurah}
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {locale === 'en' ? `Surah ${surahNumber} • Verse ${verse.numberInSurah}` : `Сура ${surahNumber} • Аят ${verse.numberInSurah}`}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {locale === 'en' ? `Page ${verse.page}` : `Страница ${verse.page}`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {surahNumber && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleBookmark(parseInt(surahNumber), verse.numberInSurah)}
                        className={cn(
                          isBookmarked(parseInt(surahNumber), verse.numberInSurah) && "text-yellow-500"
                        )}
                      >
                        {isBookmarked(parseInt(surahNumber), verse.numberInSurah) ? 
                          <BookmarkCheck className="w-4 h-4" /> : 
                          <Bookmark className="w-4 h-4" />
                        }
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyVerse(verse)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleAudio(verse.number)}
                    >
                      {isPlaying && currentVerse === verse.number ? 
                        <Pause className="w-4 h-4" /> : 
                        <Play className="w-4 h-4" />
                      }
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

                {/* Translation would go here if available */}
                {showTranslation && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <p className="text-gray-600 dark:text-gray-300 italic">
                      {locale === 'en' ? 'Translation will be available soon' : 'Перевод скоро будет доступен'}
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