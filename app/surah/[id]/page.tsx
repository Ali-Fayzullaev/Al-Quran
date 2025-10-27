// app/surah/[id]/page.tsx
"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import QuranReader from "@/components/quran/QuranReader";
import { useSurah } from "@/lib/hooks";
import { useLocale } from "@/context/LocaleContext";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Home, Book } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SurahPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ verse?: string }>;
}

export default function SurahPage({ params, searchParams }: SurahPageProps) {
  const resolvedParams = use(params);
  const resolvedSearchParams = use(searchParams);
  
  const { locale } = useLocale();
  const surahId = parseInt(resolvedParams.id);
  const initialVerse = resolvedSearchParams.verse ? parseInt(resolvedSearchParams.verse) : 1;
  
  // Валидация ID суры
  if (isNaN(surahId) || surahId < 1 || surahId > 114) {
    notFound();
  }

  // Получаем базовую информацию о суре
  const { data: surahInfo, isLoading } = useSurah(surahId);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">
            {locale === 'en' ? 'Loading Surah...' : 'Загрузка суры...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-green-900/20 relative overflow-hidden">
      
      {/* Декоративные элементы */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-96 h-96 theme-decoration rounded-full blur-3xl"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-96 h-96 theme-decoration rounded-full blur-3xl"></div>
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
                  {locale === 'en' ? 'Home' : 'Главная'}
                </Button>
              </Link>
              
              <Link href="/surahs">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Book className="w-4 h-4" />
                  {locale === 'en' ? 'All Surahs' : 'Все суры'}
                </Button>
              </Link>
            </div>

            {/* Center - Surah Info */}
            {surahInfo && (
              <div className="text-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <div className="w-2 h-2 theme-dot-animated rounded-full"></div>
                  <h1 className="font-bold text-xl gradient-text-primary">
                    {surahInfo.englishName}
                  </h1>
                  <div className="w-2 h-2 theme-dot-animated rounded-full"></div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                  {locale === 'en' ? 'Surah' : 'Сура'} {surahId} • {surahInfo.numberOfAyahs} {locale === 'en' ? 'verses' : 'аятов'}
                </p>
                <div className="mt-2 h-1 gradient-primary rounded-full w-20 mx-auto opacity-60"></div>
              </div>
            )}

            {/* Right Navigation */}
            <div className="flex items-center gap-2">
              <Link href={`/surah/${Math.max(1, surahId - 1)}`}>
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={surahId === 1}
                  className="gap-1 theme-hover-bg-soft hover:theme-border-primary"
                >
                  <ChevronLeft className="w-4 h-4" />
                  {locale === 'en' ? 'Prev' : 'Пред'}
                </Button>
              </Link>
              
              <Link href={`/surah/${Math.min(114, surahId + 1)}`}>
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={surahId === 114}
                  className="gap-1 theme-hover-bg-soft hover:theme-border-primary"
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
        
        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Previous Surah */}
          {surahId > 1 && (
            <Link href={`/surah/${surahId - 1}`} className="group">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl group-hover:shadow-2xl transition-all duration-500 border border-gray-200 dark:border-gray-700 hover:theme-border-primary">
                <div className="flex items-center gap-4">
                  <div className="theme-bg-primary w-12 h-12 rounded-full flex items-center justify-center group-hover:animate-pulse">
                    <ChevronLeft className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 font-medium mb-1">
                      {locale === 'en' ? 'Previous Surah' : 'Предыдущая сура'}
                    </p>
                    <p className="font-bold theme-text-primary text-lg">
                      {locale === 'en' ? `Surah ${surahId - 1}` : `Сура ${surahId - 1}`}
                    </p>
                  </div>
                </div>
                <div className="mt-3 h-1 gradient-primary rounded-full w-0 group-hover:w-full transition-all duration-500"></div>
              </div>
            </Link>
          )}
          
          {/* Back to List */}
          <Link href="/surahs" className="group md:col-start-2">
            <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:theme-border-primary hover:shadow-2xl transition-all duration-500 text-center group-hover:scale-105 group-hover:-translate-y-1">
              <div className="theme-bg-primary w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                <Book className="w-6 h-6 text-white" />
              </div>
              <p className="font-bold theme-text-primary text-lg">
                {locale === 'en' ? 'All Surahs' : 'Все суры'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {locale === 'en' ? 'Browse all chapters' : 'Просмотреть все главы'}
              </p>
            </div>
          </Link>

          {/* Next Surah */}
          {surahId < 114 && (
            <Link href={`/surah/${surahId + 1}`} className="group">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl group-hover:shadow-2xl transition-all duration-500 text-right border border-gray-200 dark:border-gray-700 hover:theme-border-primary">
                <div className="flex items-center gap-4 justify-end">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 font-medium mb-1">
                      {locale === 'en' ? 'Next Surah' : 'Следующая сура'}
                    </p>
                    <p className="font-bold theme-text-primary text-lg">
                      {locale === 'en' ? `Surah ${surahId + 1}` : `Сура ${surahId + 1}`}
                    </p>
                  </div>
                  <div className="theme-bg-primary w-12 h-12 rounded-full flex items-center justify-center group-hover:animate-pulse">
                    <ChevronRight className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="mt-3 h-1 gradient-primary rounded-full w-0 group-hover:w-full transition-all duration-500"></div>
              </div>
            </Link>
          )}
        </div>

        {/* Quran Reader Component */}
        <QuranReader surahNumber={surahId} initialVerse={initialVerse} />
      </div>
    </div>
  );
}
