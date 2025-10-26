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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-green-900/20">
      
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
              
              <Link href="/surahs">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Book className="w-4 h-4" />
                  {locale === 'en' ? 'All Surahs' : 'Все суры'}
                </Button>
              </Link>
            </div>

            {/* Center - Surah Info */}
            {surahInfo && (
              <div className="text-center">
                <h1 className="font-bold text-gray-900 dark:text-white">
                  {surahInfo.englishName}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {locale === 'en' ? 'Surah' : 'Сура'} {surahId}
                </p>
              </div>
            )}

            {/* Right Navigation */}
            <div className="flex items-center gap-2">
              <Link href={`/surah/${Math.max(1, surahId - 1)}`}>
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={surahId === 1}
                  className="gap-1"
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
      <QuranReader 
        surahNumber={surahId} 
        initialVerse={initialVerse}
      />
      
      {/* Footer Navigation */}
      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Previous Surah */}
            {surahId > 1 && (
              <Link href={`/surah/${surahId - 1}`} className="group">
                <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 transition-all duration-300 group-hover:shadow-lg">
                  <div className="flex items-center gap-3">
                    <ChevronLeft className="w-6 h-6 text-gray-400 group-hover:text-green-600" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {locale === 'en' ? 'Previous Surah' : 'Предыдущая сура'}
                      </p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {locale === 'en' ? `Surah ${surahId - 1}` : `Сура ${surahId - 1}`}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            )}
            
            {/* Back to List */}
            <Link href="/surahs" className="group md:col-start-2">
              <div className="p-4 rounded-xl bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 border border-green-200 dark:border-green-800 hover:shadow-lg transition-all duration-300 text-center">
                <Book className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
                <p className="font-semibold text-green-800 dark:text-green-200">
                  {locale === 'en' ? 'View All Surahs' : 'Посмотреть все суры'}
                </p>
              </div>
            </Link>
            
            {/* Next Surah */}
            {surahId < 114 && (
              <Link href={`/surah/${surahId + 1}`} className="group">
                <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 transition-all duration-300 group-hover:shadow-lg">
                  <div className="flex items-center gap-3 justify-end text-right">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {locale === 'en' ? 'Next Surah' : 'Следующая сура'}
                      </p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {locale === 'en' ? `Surah ${surahId + 1}` : `Сура ${surahId + 1}`}
                      </p>
                    </div>
                    <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-green-600" />
                  </div>
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
