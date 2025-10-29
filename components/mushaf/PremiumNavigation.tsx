"use client";

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Bookmark, 
  SkipBack, 
  SkipForward,
  MapPin,
  Hash,
  Star,
  Clock,
  Grid3X3,
  Navigation
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  NavigationState,
  QuickJumpLandmark,
  JUZ_PAGE_MAPPING,
  MUSHAF_CONFIG 
} from '@/lib/mushafTypes';
import { useLocale } from '@/context/LocaleContext';

interface PremiumNavigationProps {
  navigationState: NavigationState;
  onNavigationChange: (navigation: Partial<NavigationState>) => void;
  bookmarks: number[];
  onBookmarkToggle: (page: number) => void;
  className?: string;
}

// Данные о сурах с их страницами (упрощенная версия)
const SURAH_LANDMARKS: QuickJumpLandmark[] = [
  { page: 1, type: 'surah', label: 'الفاتحة', labelArabic: 'الفاتحة', surahNumber: 1 },
  { page: 2, type: 'surah', label: 'البقرة', labelArabic: 'البقرة', surahNumber: 2 },
  { page: 50, type: 'surah', label: 'آل عمران', labelArabic: 'آل عمران', surahNumber: 3 },
  { page: 77, type: 'surah', label: 'النساء', labelArabic: 'النساء', surahNumber: 4 },
  { page: 106, type: 'surah', label: 'المائدة', labelArabic: 'المائدة', surahNumber: 5 },
  { page: 128, type: 'surah', label: 'الأنعام', labelArabic: 'الأنعام', surahNumber: 6 },
  { page: 151, type: 'surah', label: 'الأعراف', labelArabic: 'الأعراف', surahNumber: 7 },
  { page: 177, type: 'surah', label: 'الأنفال', labelArabic: 'الأنفال', surahNumber: 8 },
  { page: 187, type: 'surah', label: 'التوبة', labelArabic: 'التوبة', surahNumber: 9 },
  { page: 208, type: 'surah', label: 'يونس', labelArabic: 'يونس', surahNumber: 10 },
  // Добавьте остальные суры по необходимости
  { page: 582, type: 'surah', label: 'العلق', labelArabic: 'العلق', surahNumber: 96 },
  { page: 598, type: 'surah', label: 'الإخلاص', labelArabic: 'الإخلاص', surahNumber: 112 },
  { page: 604, type: 'surah', label: 'الناس', labelArabic: 'الناس', surahNumber: 114 }
];

export default function PremiumNavigation({
  navigationState,
  onNavigationChange,
  bookmarks,
  onBookmarkToggle,
  className
}: PremiumNavigationProps) {
  const { locale } = useLocale();
  const [showQuickJump, setShowQuickJump] = useState(false);
  const [searchPage, setSearchPage] = useState('');

  // Переход к конкретной странице
  const goToPage = useCallback((page: number) => {
    if (page < 1 || page > navigationState.totalPages) return;
    
    const newHistory = [...navigationState.history, navigationState.currentPage];
    
    onNavigationChange({
      currentPage: page,
      history: newHistory.slice(-10),
      canGoBack: page > 1,
      canGoForward: page < navigationState.totalPages
    });
  }, [navigationState, onNavigationChange]);

  // Переход к джузу
  const goToJuz = useCallback((juzNumber: number) => {
    const juzInfo = JUZ_PAGE_MAPPING[juzNumber];
    if (juzInfo) {
      goToPage(juzInfo.startPage);
      setShowQuickJump(false);
    }
  }, [goToPage]);

  // Переход к суре
  const goToSurah = useCallback((surahNumber: number) => {
    const surahInfo = SURAH_LANDMARKS.find(s => s.surahNumber === surahNumber);
    if (surahInfo) {
      goToPage(surahInfo.page);
      setShowQuickJump(false);
    }
  }, [goToPage]);

  // Переход к закладке
  const goToBookmark = useCallback((page: number) => {
    goToPage(page);
    setShowQuickJump(false);
  }, [goToPage]);

  // Поиск по номеру страницы
  const handlePageSearch = useCallback(() => {
    const page = parseInt(searchPage);
    if (page && page >= 1 && page <= navigationState.totalPages) {
      goToPage(page);
      setSearchPage('');
      setShowQuickJump(false);
    }
  }, [searchPage, navigationState.totalPages, goToPage]);

  // Переход к первой/последней странице
  const goToFirst = useCallback(() => goToPage(1), [goToPage]);
  const goToLast = useCallback(() => goToPage(navigationState.totalPages), [goToPage]);

  // Переключение закладки для текущей страницы
  const toggleCurrentBookmark = useCallback(() => {
    onBookmarkToggle(navigationState.currentPage);
  }, [navigationState.currentPage, onBookmarkToggle]);

  const isBookmarked = bookmarks.includes(navigationState.currentPage);
  const currentJuz = Object.entries(JUZ_PAGE_MAPPING).find(([juz, range]) => 
    navigationState.currentPage >= range.startPage && navigationState.currentPage <= range.endPage
  )?.[0];

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Основная навигационная панель */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between p-4 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-amber-200"
      >
        {/* Левая группа кнопок */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={goToFirst}
            disabled={navigationState.currentPage === 1}
            className="text-amber-700 hover:bg-amber-100"
          >
            <SkipBack className="w-4 h-4" />
            <span className="hidden sm:inline ml-1">
              {locale === 'en' ? 'First' : 'الأولى'}
            </span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleCurrentBookmark}
            className={cn(
              "transition-colors",
              isBookmarked 
                ? "text-yellow-600 hover:bg-yellow-100" 
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            <Bookmark className={cn("w-4 h-4", isBookmarked && "fill-current")} />
          </Button>
        </div>

        {/* Центральная информация */}
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-800">
              {navigationState.currentPage}
            </div>
            <div className="text-xs text-amber-600">
              من {navigationState.totalPages}
            </div>
          </div>
          
          {currentJuz && (
            <div className="text-center px-3 py-1 bg-amber-100 rounded-full">
              <div className="text-sm font-medium text-amber-800">
                {locale === 'en' ? `Juz ${currentJuz}` : `الجزء ${currentJuz}`}
              </div>
            </div>
          )}
        </div>

        {/* Правая группа кнопок */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowQuickJump(!showQuickJump)}
            className="text-blue-700 hover:bg-blue-100"
          >
            <Navigation className="w-4 h-4" />
            <span className="hidden sm:inline ml-1">
              {locale === 'en' ? 'Jump' : 'انتقال'}
            </span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={goToLast}
            disabled={navigationState.currentPage === navigationState.totalPages}
            className="text-amber-700 hover:bg-amber-100"
          >
            <span className="hidden sm:inline mr-1">
              {locale === 'en' ? 'Last' : 'الأخيرة'}
            </span>
            <SkipForward className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>

      {/* Прогресс-бар */}
      <div className="w-full bg-amber-100 rounded-full h-2 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${(navigationState.currentPage / navigationState.totalPages) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      {/* Быстрая навигация */}
      <AnimatePresence>
        {showQuickJump && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-amber-200 overflow-hidden"
          >
            <div className="p-6">
              <h3 className="text-lg font-bold text-amber-800 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                {locale === 'en' ? 'Quick Navigation' : 'التنقل السريع'}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Поиск по номеру страницы */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-amber-700 flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    {locale === 'en' ? 'Page Number' : 'رقم الصفحة'}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="1"
                      max={navigationState.totalPages}
                      value={searchPage}
                      onChange={(e) => setSearchPage(e.target.value)}
                      className="flex-1 px-3 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder={locale === 'en' ? '1-604' : '١-٦٠٤'}
                    />
                    <Button
                      size="sm"
                      onClick={handlePageSearch}
                      disabled={!searchPage}
                      className="bg-amber-600 hover:bg-amber-700"
                    >
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Навигация по джузам */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-green-700 flex items-center gap-2">
                    <Grid3X3 className="w-4 h-4" />
                    {locale === 'en' ? 'Juz (Para)' : 'الجزء'}
                  </label>
                  <Select onValueChange={(value) => goToJuz(parseInt(value))}>
                    <SelectTrigger className="border-green-300 focus:ring-green-500">
                      <SelectValue placeholder={locale === 'en' ? 'Select Juz' : 'اختر الجزء'} />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 30 }, (_, i) => i + 1).map(juz => (
                        <SelectItem key={juz} value={juz.toString()}>
                          {locale === 'en' ? `Juz ${juz}` : `الجزء ${juz}`}
                          <span className="text-sm text-gray-500 ml-2">
                            ({JUZ_PAGE_MAPPING[juz]?.startPage}-{JUZ_PAGE_MAPPING[juz]?.endPage})
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Навигация по сурам */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-blue-700 flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    {locale === 'en' ? 'Surah' : 'السورة'}
                  </label>
                  <Select onValueChange={(value) => goToSurah(parseInt(value))}>
                    <SelectTrigger className="border-blue-300 focus:ring-blue-500">
                      <SelectValue placeholder={locale === 'en' ? 'Select Surah' : 'اختر السورة'} />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {SURAH_LANDMARKS.map(surah => (
                        <SelectItem key={surah.surahNumber} value={surah.surahNumber?.toString() || ''}>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{surah.labelArabic}</span>
                            <span className="text-sm text-gray-500">
                              (صفحة {surah.page})
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Закладки */}
              {bookmarks.length > 0 && (
                <div className="mt-6 pt-4 border-t border-amber-200">
                  <h4 className="text-sm font-medium text-purple-700 mb-3 flex items-center gap-2">
                    <Bookmark className="w-4 h-4" />
                    {locale === 'en' ? 'Bookmarks' : 'العلامات المرجعية'}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {bookmarks.slice(0, 10).map(page => (
                      <motion.button
                        key={page}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => goToBookmark(page)}
                        className={cn(
                          "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                          page === navigationState.currentPage
                            ? "bg-purple-600 text-white"
                            : "bg-purple-100 text-purple-700 hover:bg-purple-200"
                        )}
                      >
                        {page}
                      </motion.button>
                    ))}
                    {bookmarks.length > 10 && (
                      <div className="px-3 py-2 text-sm text-gray-500">
                        +{bookmarks.length - 10} أكثر
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* История навигации */}
              {navigationState.history.length > 0 && (
                <div className="mt-6 pt-4 border-t border-amber-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {locale === 'en' ? 'Recent Pages' : 'الصفحات الأخيرة'}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {navigationState.history.slice(-5).reverse().map((page, index) => (
                      <motion.button
                        key={`${page}-${index}`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => goToPage(page)}
                        className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                      >
                        {page}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}