// app/surah/[id]/page.tsx
"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import QuranReader from "@/components/quran/QuranReader";
import { useSurah } from "@/lib/hooks";
import { useLocale } from "@/context/LocaleContext";
import { useQuranStore } from "@/lib/store";
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
  const { customQuranTextColor, customQuranTranslationColor } = useQuranStore();
  const surahId = parseInt(resolvedParams.id);
  const initialVerse = resolvedSearchParams.verse ? parseInt(resolvedSearchParams.verse) : 1;
  
  // Валидация ID суры
  if (isNaN(surahId) || surahId < 1 || surahId > 114) {
    notFound();
  }

  // Получаем базовую информацию о суре
  const { data: surahInfo, isLoading, error } = useSurah(surahId);

  // Отладочная информация
  console.log('SurahPage Debug:', {
    surahId,
    isLoading,
    error,
    surahInfo,
    initialVerse
  });

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">
            {locale === 'en' ? 'Error loading surah' : 'Ошибка загрузки суры'}
          </p>
          <p className="text-sm" style={{ color: 'var(--fixed-text-secondary)' }}>
            {error.message}
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--color-primary)' }}></div>
          <p style={{ color: 'var(--fixed-text-secondary)' }}>
            {locale === 'en' ? `Loading Surah ${surahId}...` : `Загрузка суры ${surahId}...`}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: 'var(--fixed-background)' }}>
      
      {/* Декоративные элементы */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-96 h-96 theme-decoration rounded-full blur-3xl"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-96 h-96 theme-decoration rounded-full blur-3xl"></div>
      </div>

      {/* Navigation Header - Mobile Optimized */}
      <div className="sticky top-0 z-10 backdrop-blur-xl border-b shadow-lg" style={{ 
        backgroundColor: 'var(--fixed-background)',
        borderColor: 'var(--color-border)',
        opacity: 0.95
      }}>
        <div className="max-w-6xl mx-auto px-3 py-3">
          
          {/* Mobile Header - Top Row */}
          <div className="flex items-center justify-between mb-3 md:hidden">
            {/* Left - Home/Back */}
            <div className="flex items-center gap-1">
              <Link href="/quran">
                <Button variant="ghost" size="sm" className="px-2">
                  <Home className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/surahs">
                <Button variant="ghost" size="sm" className="px-2">
                  <Book className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            {/* Center - Compact Surah Info */}
            {surahInfo && (
              <div className="text-center flex-1 mx-4">
                <h1 className="font-bold text-lg gradient-text-primary truncate">
                  {surahInfo.englishName}
                </h1>
                <p className="text-xs" style={{ color: 'var(--fixed-text-secondary)' }}>
                  {locale === 'en' ? 'Surah' : 'Сура'} {surahId} • {surahInfo.numberOfAyahs} {locale === 'en' ? 'verses' : 'аятов'}
                </p>
              </div>
            )}

            {/* Right - Navigation */}
            <div className="flex items-center gap-1">
              <Link href={`/surah/${Math.max(1, surahId - 1)}`}>
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={surahId === 1}
                  className="px-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </Link>
              
              <Link href={`/surah/${Math.min(114, surahId + 1)}`}>
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={surahId === 114}
                  className="px-2"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Desktop Header - Original Layout */}
          <div className="hidden md:flex items-center justify-between">
            
            {/* Left Navigation */}
            <div className="flex items-center gap-4">
              <Link href="/quran">
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
              <div className="text-center p-4 rounded-xl shadow-xl border" style={{
                backgroundColor: 'var(--fixed-background)',
                borderColor: 'var(--color-border)'
              }}>
                <div className="flex items-center justify-center gap-3 mb-2">
                  <div className="w-2 h-2 theme-dot-animated rounded-full"></div>
                  <h1 className="font-bold text-xl gradient-text-primary">
                    {surahInfo.englishName}
                  </h1>
                  <div className="w-2 h-2 theme-dot-animated rounded-full"></div>
                </div>
                <p className="text-sm font-medium" style={{ color: 'var(--fixed-text-secondary)' }}>
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
      <div className="max-w-4xl mx-auto px-3 py-4 md:px-4 md:py-8">
        
        {/* Mobile Quick Navigation - Horizontal Scroll */}
        <div className="md:hidden mb-6">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {/* Previous Surah - Mobile */}
            {surahId > 1 && (
              <Link href={`/surah/${surahId - 1}`} className="group min-w-[160px]">
                <div className="p-4 rounded-xl border hover:theme-border-primary transition-all duration-300" style={{
                  backgroundColor: 'var(--fixed-background)',
                  borderColor: 'var(--color-border)'
                }}>
                  <div className="flex items-center gap-2">
                    <div className="theme-bg-primary w-8 h-8 rounded-full flex items-center justify-center">
                      <ChevronLeft className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-medium" style={{ color: 'var(--fixed-text-secondary)' }}>
                        {locale === 'en' ? 'Previous' : 'Пред'}
                      </p>
                      <p className="font-bold theme-text-primary text-sm">
                        {locale === 'en' ? `Surah ${surahId - 1}` : `Сура ${surahId - 1}`}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            )}
            
            {/* Back to List - Mobile */}
            <Link href="/surahs" className="group min-w-[140px]">
              <div className="p-4 rounded-xl border hover:theme-border-primary transition-all duration-300 text-center" style={{
                backgroundColor: 'var(--fixed-background)',
                borderColor: 'var(--color-border)'
              }}>
                <div className="theme-bg-primary w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <Book className="w-4 h-4 text-white" />
                </div>
                <p className="font-bold theme-text-primary text-sm">
                  {locale === 'en' ? 'All Surahs' : 'Все суры'}
                </p>
              </div>
            </Link>

            {/* Next Surah - Mobile */}
            {surahId < 114 && (
              <Link href={`/surah/${surahId + 1}`} className="group min-w-[160px]">
                <div className="p-4 rounded-xl border hover:theme-border-primary transition-all duration-300 text-right" style={{
                  backgroundColor: 'var(--fixed-background)',
                  borderColor: 'var(--color-border)'
                }}>
                  <div className="flex items-center gap-2 justify-end">
                    <div>
                      <p className="text-xs font-medium" style={{ color: 'var(--fixed-text-secondary)' }}>
                        {locale === 'en' ? 'Next' : 'След'}
                      </p>
                      <p className="font-bold theme-text-primary text-sm">
                        {locale === 'en' ? `Surah ${surahId + 1}` : `Сура ${surahId + 1}`}
                      </p>
                    </div>
                    <div className="theme-bg-primary w-8 h-8 rounded-full flex items-center justify-center">
                      <ChevronRight className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
              </Link>
            )}
          </div>
        </div>

        {/* Desktop Quick Navigation Cards */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Previous Surah */}
          {surahId > 1 && (
            <Link href={`/surah/${surahId - 1}`} className="group">
              <div className="p-6 rounded-2xl shadow-xl group-hover:shadow-2xl transition-all duration-500 border hover:theme-border-primary" style={{
                backgroundColor: 'var(--fixed-background)',
                borderColor: 'var(--color-border)'
              }}>
                <div className="flex items-center gap-4">
                  <div className="theme-bg-primary w-12 h-12 rounded-full flex items-center justify-center group-hover:animate-pulse">
                    <ChevronLeft className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1" style={{ color: 'var(--fixed-text-secondary)' }}>
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
            <div className="p-6 rounded-2xl border hover:theme-border-primary hover:shadow-2xl transition-all duration-500 text-center group-hover:scale-105 group-hover:-translate-y-1" style={{
              backgroundColor: 'var(--fixed-background)',
              borderColor: 'var(--color-border)'
            }}>
              <div className="theme-bg-primary w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                <Book className="w-6 h-6 text-white" />
              </div>
              <p className="font-bold theme-text-primary text-lg">
                {locale === 'en' ? 'All Surahs' : 'Все суры'}
              </p>
              <p className="text-sm mt-1" style={{ color: 'var(--fixed-text-secondary)' }}>
                {locale === 'en' ? 'Browse all chapters' : 'Просмотреть все главы'}
              </p>
            </div>
          </Link>

          {/* Next Surah */}
          {surahId < 114 && (
            <Link href={`/surah/${surahId + 1}`} className="group">
              <div className="p-6 rounded-2xl shadow-xl group-hover:shadow-2xl transition-all duration-500 text-right border hover:theme-border-primary" style={{
                backgroundColor: 'var(--fixed-background)',
                borderColor: 'var(--color-border)'
              }}>
                <div className="flex items-center gap-4 justify-end">
                  <div>
                    <p className="text-sm font-medium mb-1" style={{ color: 'var(--fixed-text-secondary)' }}>
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
        <QuranReader 
          surahNumber={surahId} 
          initialVerse={initialVerse}
          customQuranTextColor={customQuranTextColor}
          customQuranTranslationColor={customQuranTranslationColor}
        />
      </div>
    </div>
  );
}
