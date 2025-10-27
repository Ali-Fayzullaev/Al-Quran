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

  const playAudio = async (verse: any) => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      // Находим номер суры для данного аята
      const surahNumber = Object.keys(juzData?.surahs || {}).find(key => 
        juzData?.surahs?.[parseInt(key)]?.ayahs?.some(ayah => ayah.number === verse.number)
      );
      
      if (!surahNumber) {
        console.error('Could not find surah number for verse:', verse);
        return;
      }

      const audioUrl = await getWorkingAudioUrl(parseInt(surahNumber), verse.numberInSurah, audioReciter);
      audio.src = audioUrl;
      await audio.play();
      setIsPlaying(true);
      setCurrentVerse(verse.number);
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

  const toggleAudio = (verse: any) => {
    if (isPlaying && currentVerse === verse.number) {
      pauseAudio();
    } else {
      playAudio(verse);
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
    <div className="min-h-screen theme-gradient-bg relative overflow-hidden">
      <audio ref={audioRef} preload="metadata" onEnded={() => setIsPlaying(false)} />
      
      {/* Декоративные элементы */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-96 h-96 theme-bg-secondary opacity-10 rounded-full blur-3xl theme-float"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-96 h-96 theme-bg-secondary opacity-10 rounded-full blur-3xl theme-float" style={{animationDelay: '2s'}}></div>
      </div>
      
      {/* Navigation Header */}
      <div className="sticky top-0 z-10 theme-glass-surface backdrop-blur-xl theme-border-primary/20 border-b shadow-lg">
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
            <div className="text-center theme-card-elegant p-4 rounded-xl shadow-xl">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="w-2 h-2 theme-primary rounded-full animate-pulse"></div>
                <h1 className="font-bold text-xl theme-gradient-text">
                  {t('juz')} {juzId}
                </h1>
                <div className="w-2 h-2 theme-primary rounded-full animate-pulse"></div>
              </div>
              <p className="text-sm theme-text-accent font-medium">
                {juzData.ayahs?.length} {t('verses')}
              </p>
              <div className="mt-2 h-1 theme-gradient-primary rounded-full w-20 mx-auto opacity-60"></div>
            </div>

            {/* Right Navigation */}
            <div className="flex items-center gap-3">
              <Link href={`/juz/${Math.max(1, juzId - 1)}`}>
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={juzId === 1}
                  className="theme-btn-luxury theme-hover-lift disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none gap-1"
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
                  className="theme-btn-luxury theme-hover-lift disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none gap-1"
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
        <div className="text-center mb-8 theme-card-premium p-8 rounded-3xl shadow-2xl theme-hover-lift">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-3 h-3 theme-primary rounded-full theme-pulse-glow"></div>
            <h1 className="text-4xl font-bold theme-gradient-text theme-ornament">
              {t('juz')} {juzId}
            </h1>
            <div className="w-3 h-3 theme-primary rounded-full theme-pulse-glow"></div>
          </div>
          <p className="text-lg theme-text-accent font-medium">
            {juzData.ayahs?.length} {t('versesFromMultipleSurahs')}
          </p>
          <div className="mt-4 h-2 theme-gradient-primary rounded-full w-32 mx-auto opacity-70"></div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 theme-glass-intense p-6 rounded-2xl shadow-xl theme-scrollbar">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTranslation}
              className={cn(
                "theme-btn-luxury theme-hover-lift transition-all duration-300",
                showTranslation && "theme-glow-soft"
              )}
            >
              {t('translation')}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className="theme-btn-luxury theme-hover-lift"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center gap-3 theme-card-elegant p-3 rounded-xl">
            <span className="text-sm theme-text-accent font-medium">
              {t('fontSizeLabel')}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFontSize(fontSize - 2)}
              className="theme-btn-luxury w-8 h-8 p-0"
            >
              -
            </Button>
            <span className="text-sm font-bold theme-gradient-text w-16 text-center">{fontSize}px</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFontSize(fontSize + 2)}
              className="theme-btn-luxury w-8 h-8 p-0"
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
                  "theme-card-elegant theme-hover-lift theme-gradient-border p-8 rounded-2xl shadow-xl transition-all duration-500",
                  isCurrentVerse && isPlaying
                    ? "theme-glow theme-shimmer" 
                    : "hover:shadow-2xl"
                )}
              >
                {/* Verse Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 theme-primary rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg theme-glow-soft">
                      {verse.numberInSurah}
                    </div>
                    <div>
                      <p className="text-sm theme-text-accent font-semibold mb-1">
                        {t('surah')} {surahNumber} • {t('verse')} {verse.numberInSurah}
                      </p>
                      <p className="text-xs theme-text-muted">
                        {t('page')} {verse.page}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {surahNumber && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleBookmark(parseInt(surahNumber), verse.numberInSurah)}
                        className={cn(
                          "theme-btn-luxury theme-hover-lift p-2 rounded-xl",
                          isBookmarked(parseInt(surahNumber), verse.numberInSurah) && "theme-glow text-yellow-400"
                        )}
                      >
                        {isBookmarked(parseInt(surahNumber), verse.numberInSurah) ? 
                          <BookmarkCheck className="w-5 h-5" /> : 
                          <Bookmark className="w-5 h-5" />
                        }
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyVerse(verse)}
                      className="theme-btn-luxury theme-hover-lift p-2 rounded-xl"
                    >
                      <Copy className="w-5 h-5" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleAudio(verse)}
                      className={cn(
                        "theme-btn-luxury theme-hover-lift p-2 rounded-xl",
                        isPlaying && currentVerse === verse.number && "theme-pulse-glow"
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
                  className="text-right mb-6 leading-loose font-amiri theme-scrollbar"
                  style={{ fontSize: `${fontSize + 4}px` }}
                  dir="rtl"
                >
                  <p className="quran-arabic-text theme-hover-glow transition-all duration-300 p-4 rounded-xl">
                    {verse.text}
                  </p>
                </div>

                {/* Translation would go here if available */}
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