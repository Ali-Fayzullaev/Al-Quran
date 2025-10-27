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
    return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  if (bookmarks.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-green-900/20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <BookmarkCheck className="w-10 h-10 text-white" />
            </motion.div>
            
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
              {locale === 'en' ? 'Your Bookmarks' : 'Ваши закладки'}
            </h1>
            
            <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-green-900/20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <BookmarkCheck className="w-8 h-8 text-white" />
          </motion.div>
          
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
            {locale === 'en' ? 'Your Bookmarks' : 'Ваши закладки'}
          </h1>
          
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {bookmarks.length} {locale === 'en' 
              ? `saved verse${bookmarks.length !== 1 ? 's' : ''}`
              : `сохраненных аят${bookmarks.length === 1 ? '' : bookmarks.length < 5 ? 'а' : 'ов'}`}
          </p>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder={locale === 'en' ? 'Search bookmarks...' : 'Поиск закладок...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
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
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
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
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
              {bookmark.verseNumber}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {locale === 'en' ? 'Surah' : 'Сура'} {bookmark.surahNumber}
              </h3>
              {surahData && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
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
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Copy className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
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