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

export default function SurahsList() {
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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--fixed-background)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--color-primary)' }}></div>
          <p style={{ color: 'var(--fixed-text-secondary)' }}>
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
    <div className="min-h-screen" style={{ backgroundColor: 'var(--fixed-background)' }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--color-primary)' }}>
            {locale === 'en' ? 'Surahs of the Holy Quran' : 'Суры Священного Корана'}
          </h1>
          <p className="text-xl max-w-2xl mx-auto" style={{ color: 'var(--fixed-text-secondary)' }}>
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
          className="backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-lg"
          style={{ backgroundColor: 'var(--verse-background)', opacity: 0.95 }}
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: 'var(--fixed-text-secondary)' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={locale === 'en' ? 'Search surahs...' : 'Поиск сур...'}
                className="w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:ring-0 focus:outline-none transition-colors"
                style={{
                  backgroundColor: 'var(--fixed-background)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--fixed-text)'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
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
              <div className="flex rounded-lg p-1" style={{ backgroundColor: 'var(--color-border)' }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="px-3 py-2"
                  style={viewMode === 'grid' ? {
                    backgroundColor: 'var(--fixed-background)',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                  } : undefined}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="px-3 py-2"
                  style={viewMode === 'list' ? {
                    backgroundColor: 'var(--fixed-background)',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                  } : undefined}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <p className="text-sm" style={{ color: 'var(--fixed-text-secondary)' }}>
              {locale === 'en' 
                ? `Showing ${filteredAndSortedSurahs.length} of ${surahs.length} surahs`
                : `Показано ${filteredAndSortedSurahs.length} из ${surahs.length} сур`}
            </p>
            <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--fixed-text-secondary)' }}>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }}></div>
                {locale === 'en' ? 'Meccan' : 'Мекканские'}
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#3b82f6' }}></div>
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
                <div 
                  className={cn(
                    "group relative overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
                    viewMode === 'list' && "flex items-center"
                  )}
                  style={{
                    backgroundColor: 'var(--verse-background)',
                    borderColor: 'var(--color-border)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
                >
                  
                  {/* Revelation Type Indicator */}
                  <div 
                    className="absolute top-0 right-0 w-4 h-4 rounded-bl-lg"
                    style={{
                      backgroundColor: surah.revelationType === 'Meccan' 
                        ? 'var(--color-primary)' 
                        : '#3b82f6'
                    }}
                  ></div>

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
                      <div 
                        className="relative w-16 h-16 mx-auto rounded-2xl flex items-center justify-center transition-all duration-300"
                        style={{
                          backgroundColor: 'var(--verse-background)',
                          border: '2px solid var(--color-primary)',
                          opacity: 0.9
                        }}
                      >
                        <span className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
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
                      <h3 className="text-2xl font-bold font-amiri mb-2" dir="rtl" style={{ color: 'var(--fixed-text)' }}>
                        {surah.name}
                      </h3>
                      
                      {/* English Name */}
                      <h4 className="text-xl font-semibold mb-1" style={{ color: 'var(--fixed-text)' }}>
                        {surah.englishName}
                      </h4>
                      
                      {/* Translation */}
                      <p className="mb-4" style={{ color: 'var(--fixed-text-secondary)' }}>
                        {surah.englishNameTranslation}
                      </p>

                      {/* Stats */}
                      <div className={cn(
                        "flex gap-4 text-sm",
                        viewMode === 'grid' && "justify-center",
                        viewMode === 'list' && "justify-start"
                      )}
                      style={{ color: 'var(--fixed-text-secondary)' }}
                      >
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
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                          style={{
                            backgroundColor: 'var(--verse-background)',
                            color: 'var(--color-primary)',
                            border: '2px solid var(--color-primary)'
                          }}
                        >
                          <Play className="w-5 h-5" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Hover Effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ backgroundColor: 'var(--color-primary)', opacity: 0.05 }}></div>
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
            <Book className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--fixed-text-secondary)' }} />
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--fixed-text-secondary)' }}>
              {locale === 'en' ? 'No surahs found' : 'Суры не найдены'}
            </h3>
            <p style={{ color: 'var(--fixed-text-secondary)', opacity: 0.7 }}>
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
