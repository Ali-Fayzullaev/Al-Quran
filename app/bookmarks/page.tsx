"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuranStore } from "@/lib/store";
import { useLocale } from "@/context/LocaleContext";
import { useSurah } from "@/lib/hooks";
import { 
  BookmarkCheck, 
  Trash2, 
  Play, 
  Copy, 
  Calendar,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Heart,
  Book
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function BookmarksPage() {
  const { locale } = useLocale();
  const { bookmarks, removeBookmark } = useQuranStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<'date' | 'surah'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Фильтрация и сортировка закладок
  const filteredBookmarks = bookmarks
    .filter(bookmark => {
      if (!searchQuery) return true;
      
      // Поиск по номеру суры или аята
      return (
        bookmark.surahNumber.toString().includes(searchQuery) ||
        bookmark.verseNumber.toString().includes(searchQuery) ||
        (bookmark.note?.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    })
    .sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'date') {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === 'surah') {
        comparison = a.surahNumber - b.surahNumber || a.verseNumber - b.verseNumber;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const copyBookmark = async (bookmark: any) => {
    const text = `Surah ${bookmark.surahNumber}:${bookmark.verseNumber}${
      bookmark.note ? `\nNote: ${bookmark.note}` : ''
    }`;
    
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Failed to copy bookmark:', error);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : locale === 'ru' ? 'ru-RU' : 'uz-UZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  if (bookmarks.length === 0) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--fixed-background)' }}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}
            >
              <BookmarkCheck className="w-10 h-10 text-white" />
            </motion.div>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-4 gradient-text-primary">
              {locale === 'en' ? 'Your Bookmarks' : 'Ваши закладки'}
            </h1>
            
            <p className="mb-8 max-w-md mx-auto" style={{ color: 'var(--fixed-text-secondary)' }}>
              {locale === 'en' 
                ? 'You haven\'t saved any verses yet. Start reading and bookmark your favorite ayahs!'
                : 'Вы еще не сохранили ни одного аята. Начните читать и сохраняйте любимые аяты!'}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/surahs">
                <Button className="theme-btn-primary gap-2">
                  <Book className="w-4 h-4" />
                  {locale === 'en' ? 'Browse Surahs' : 'Просмотр сур'}
                </Button>
              </Link>
              
              <Link href="/search">
                <Button variant="outline" className="gap-2">
                  <Search className="w-4 h-4" />
                  {locale === 'en' ? 'Search Quran' : 'Поиск в Коране'}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--fixed-background)' }}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}
          >
            <BookmarkCheck className="w-8 h-8 text-white" />
          </motion.div>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-2 gradient-text-primary">
            {locale === 'en' ? 'Your Bookmarks' : 'Ваши закладки'}
          </h1>
          
          <p className="mb-6" style={{ color: 'var(--fixed-text-secondary)' }}>
            {bookmarks.length} {locale === 'en' 
              ? `saved verse${bookmarks.length !== 1 ? 's' : ''}`
              : `сохраненных аят${bookmarks.length === 1 ? '' : bookmarks.length < 5 ? 'а' : 'ов'}`}
          </p>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--fixed-text-secondary)' }} />
              <input
                type="text"
                placeholder={locale === 'en' ? 'Search bookmarks...' : 'Поиск закладок...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:outline-none"
                style={{
                  backgroundColor: 'var(--verse-background)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--fixed-text)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--color-primary)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(var(--color-primary-rgb), 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--color-border)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortBy(sortBy === 'date' ? 'surah' : 'date')}
                className="gap-2"
              >
                <Filter className="w-4 h-4" />
                {locale === 'en' 
                  ? (sortBy === 'date' ? 'By Date' : 'By Surah') 
                  : (sortBy === 'date' ? 'По дате' : 'По суре')}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="gap-2"
              >
                {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Bookmarks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredBookmarks.map((bookmark, index) => (
              <BookmarkCard
                key={`${bookmark.surahNumber}-${bookmark.verseNumber}`}
                bookmark={bookmark}
                index={index}
                onRemove={() => removeBookmark(bookmark.surahNumber, bookmark.verseNumber)}
                onCopy={() => copyBookmark(bookmark)}
                locale={locale}
                formatDate={formatDate}
              />
            ))}
          </AnimatePresence>
        </div>

        {filteredBookmarks.length === 0 && searchQuery && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--fixed-text-secondary)' }} />
            <p style={{ color: 'var(--fixed-text-secondary)' }}>
              {locale === 'en' 
                ? `No bookmarks found for "${searchQuery}"`
                : `Не найдено закладок для "${searchQuery}"`}
            </p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-12 text-center">
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/surahs">
              <Button variant="outline" className="gap-2">
                <Book className="w-4 h-4" />
                {locale === 'en' ? 'Browse Surahs' : 'Просмотр сур'}
              </Button>
            </Link>
            
            <Link href="/search">
              <Button variant="outline" className="gap-2">
                <Search className="w-4 h-4" />
                {locale === 'en' ? 'Search Quran' : 'Поиск в Коране'}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Компонент карточки закладки
function BookmarkCard({ 
  bookmark, 
  index, 
  onRemove, 
  onCopy, 
  locale, 
  formatDate 
}: {
  bookmark: any;
  index: number;
  onRemove: () => void;
  onCopy: () => void;
  locale: string;
  formatDate: (date: Date) => string;
}) {
  const { data: surahData } = useSurah(bookmark.surahNumber);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.1 }}
      className="rounded-2xl p-6 shadow-sm border hover:shadow-md transition-all duration-300"
      style={{
        backgroundColor: 'var(--verse-background)',
        borderColor: 'var(--color-border)'
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-bold" style={{
              backgroundColor: 'var(--color-primary)'
            }}>
              {bookmark.verseNumber}
            </div>
            <div>
              <h3 className="font-semibold" style={{ color: 'var(--fixed-text)' }}>
                {locale === 'en' ? 'Surah' : 'Сура'} {bookmark.surahNumber}
              </h3>
              {surahData && (
                <p className="text-xs" style={{ color: 'var(--fixed-text-secondary)' }}>
                  {surahData.englishName}
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCopy}
            className="p-2"
            style={{
              '--hover-bg': 'var(--color-border)'
            } as React.CSSProperties}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-border)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <Copy className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="p-2 text-red-600 dark:text-red-400"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Note */}
      {bookmark.note && (
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-700 dark:text-gray-300 italic">
            "{bookmark.note}"
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
          <Calendar className="w-3 h-3" />
          {formatDate(bookmark.createdAt)}
        </div>
        
        <Link href={`/surah/${bookmark.surahNumber}?verse=${bookmark.verseNumber}`}>
          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-xs">
            <Play className="w-3 h-3 mr-1" />
            {locale === 'en' ? 'Read' : 'Читать'}
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}