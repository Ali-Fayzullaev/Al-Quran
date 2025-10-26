"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, Book, Play, Filter, Grid, List, BookOpen } from "lucide-react";
import Link from "next/link";
import { useSurahs } from "@/lib/hooks";
import { useLocale } from "@/context/LocaleContext";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type ViewMode = 'grid' | 'list';
type FilterType = 'all' | 'meccan' | 'medinan';
type SortType = 'number' | 'name' | 'verses' | 'revelation';

export default function SurahsPage() {
  const { locale } = useLocale();
  const { data: surahs, isLoading, error } = useSurahs();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('number');

  // Фильтрация и сортировка сур
  const filteredAndSortedSurahs = useMemo(() => {
    if (!surahs) return [];

    let filtered = surahs.filter(surah => {
      const matchesSearch = searchQuery === '' || 
        surah.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        surah.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        surah.englishNameTranslation.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = filter === 'all' || 
        surah.revelationType.toLowerCase() === filter;

      return matchesSearch && matchesFilter;
    });

    // Сортировка
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.englishName.localeCompare(b.englishName);
        case 'verses':
          return b.numberOfAyahs - a.numberOfAyahs;
        case 'revelation':
          return a.revelationType.localeCompare(b.revelationType);
        default:
          return a.number - b.number;
      }
    });

    return filtered;
  }, [surahs, searchQuery, filter, sortBy]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">
            {locale === 'en' ? 'Loading Surahs...' : 'Загрузка сур...'}
          </p>
        </div>
      </div>
    );
  }

  if (error || !surahs) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <Book className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-xl mb-2">
            {locale === 'en' ? 'Error loading Surahs' : 'Ошибка загрузки сур'}
          </p>
          <p className="text-gray-500">
            {locale === 'en' ? 'Please try refreshing the page' : 'Пожалуйста, обновите страницу'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-green-900/20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
            {locale === 'en' ? 'Surahs of the Holy Quran' : 'Суры Священного Корана'}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {locale === 'en' 
              ? 'Explore all 114 chapters of the Quran with translations, audio, and study tools'
              : 'Изучайте все 114 глав Корана с переводами, аудио и инструментами для изучения'}
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-lg"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={locale === 'en' ? 'Search surahs...' : 'Поиск сур...'}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 focus:border-green-500 focus:ring-0 focus:outline-none transition-colors"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <Select value={filter} onValueChange={(value: FilterType) => setFilter(value)}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{locale === 'en' ? 'All' : 'Все'}</SelectItem>
                  <SelectItem value="meccan">{locale === 'en' ? 'Meccan' : 'Мекканские'}</SelectItem>
                  <SelectItem value="medinan">{locale === 'en' ? 'Medinan' : 'Мединские'}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(value: SortType) => setSortBy(value)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="number">{locale === 'en' ? 'Number' : 'Номер'}</SelectItem>
                  <SelectItem value="name">{locale === 'en' ? 'Name' : 'Название'}</SelectItem>
                  <SelectItem value="verses">{locale === 'en' ? 'Verses' : 'Аяты'}</SelectItem>
                  <SelectItem value="revelation">{locale === 'en' ? 'Revelation' : 'Откровение'}</SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    "px-3 py-2",
                    viewMode === 'grid' && "bg-white dark:bg-gray-600 shadow-sm"
                  )}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={cn(
                    "px-3 py-2",
                    viewMode === 'list' && "bg-white dark:bg-gray-600 shadow-sm"
                  )}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {locale === 'en' 
                ? `Showing ${filteredAndSortedSurahs.length} of ${surahs.length} surahs`
                : `Показано ${filteredAndSortedSurahs.length} из ${surahs.length} сур`}
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                {locale === 'en' ? 'Meccan' : 'Мекканские'}
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                {locale === 'en' ? 'Medinan' : 'Мединские'}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Surahs Grid/List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className={cn(
            "gap-6",
            viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "space-y-4"
          )}
        >
          {filteredAndSortedSurahs.map((surah, index) => (
            <motion.div
              key={surah.number}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.05 }}
            >
              <Link href={`/surah/${surah.number}`}>
                <div className={cn(
                  "group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
                  viewMode === 'list' && "flex items-center"
                )}>
                  
                  {/* Revelation Type Indicator */}
                  <div className={cn(
                    "absolute top-0 right-0 w-4 h-4 rounded-bl-lg",
                    surah.revelationType === 'Meccan' 
                      ? "bg-green-500" 
                      : "bg-blue-500"
                  )}></div>

                  <div className={cn(
                    "p-6",
                    viewMode === 'list' && "flex items-center w-full gap-6"
                  )}>
                    {/* Surah Number */}
                    <div className={cn(
                      "relative",
                      viewMode === 'grid' && "text-center mb-6",
                      viewMode === 'list' && "flex-shrink-0"
                    )}>
                      <div className="relative w-16 h-16 mx-auto bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-2xl flex items-center justify-center group-hover:from-green-200 group-hover:to-emerald-200 dark:group-hover:from-green-800/50 dark:group-hover:to-emerald-800/50 transition-all duration-300">
                        <span className="text-2xl font-bold text-green-700 dark:text-green-300">
                          {surah.number}
                        </span>
                      </div>
                    </div>

                    {/* Surah Info */}
                    <div className={cn(
                      viewMode === 'grid' && "text-center",
                      viewMode === 'list' && "flex-1"
                    )}>
                      {/* Arabic Name */}
                      <h3 className="text-2xl font-bold font-amiri text-gray-900 dark:text-white mb-2" dir="rtl">
                        {surah.name}
                      </h3>
                      
                      {/* English Name */}
                      <h4 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-1">
                        {surah.englishName}
                      </h4>
                      
                      {/* Translation */}
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        {surah.englishNameTranslation}
                      </p>

                      {/* Stats */}
                      <div className={cn(
                        "flex gap-4 text-sm text-gray-500 dark:text-gray-400",
                        viewMode === 'grid' && "justify-center",
                        viewMode === 'list' && "justify-start"
                      )}>
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          {surah.numberOfAyahs} {locale === 'en' ? 'verses' : 'аятов'}
                        </span>
                        <span className="capitalize">
                          {locale === 'en' 
                            ? surah.revelationType
                            : surah.revelationType === 'Meccan' ? 'Мекканская' : 'Мединская'
                          }
                        </span>
                      </div>
                    </div>

                    {/* Action Button (List View) */}
                    {viewMode === 'list' && (
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors">
                          <Play className="w-5 h-5" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Hover Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* No Results */}
        {filteredAndSortedSurahs.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Book className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
              {locale === 'en' ? 'No surahs found' : 'Суры не найдены'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {locale === 'en' 
                ? 'Try adjusting your search or filter criteria'
                : 'Попробуйте изменить поиск или критерии фильтрации'}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
