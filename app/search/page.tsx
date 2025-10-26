"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, BookOpen, Clock, Bookmark, Copy, ExternalLink } from "lucide-react";
import { useSearchQuran } from "@/lib/hooks";
import { useQuranStore } from "@/lib/store";
import { useLocale } from "@/context/LocaleContext";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { cn } from "@/lib/utils";

function SearchContent() {
  const { locale } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToSearchHistory, searchHistory } = useQuranStore();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [surahFilter, setSurahFilter] = useState<number | undefined>();
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  // Update URL when query changes
  useEffect(() => {
    if (debouncedQuery && debouncedQuery !== searchParams.get('q')) {
      router.push(`/search?q=${encodeURIComponent(debouncedQuery)}`);
      addToSearchHistory(debouncedQuery);
    }
  }, [debouncedQuery, router, searchParams, addToSearchHistory]);

  // Search API call
  const { data: searchResults, isLoading, error } = useSearchQuran(
    debouncedQuery, 
    surahFilter
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setDebouncedQuery(query.trim());
    }
  };

  const highlightText = (text: string, searchTerm: string) => {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  const copyVerse = async (verse: any) => {
    try {
      await navigator.clipboard.writeText(verse.text);
      // Show toast notification
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-green-900/20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
            {locale === 'en' ? 'Search the Holy Quran' : 'Поиск по Священному Корану'}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {locale === 'en' 
              ? 'Find verses, themes, and concepts throughout the Quran'
              : 'Найдите аяты, темы и концепции по всему Корану'}
          </p>
        </motion.div>

        {/* Search Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-lg"
        >
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={locale === 'en' ? 'Enter your search query...' : 'Введите поисковый запрос...'}
                className="w-full pl-12 pr-6 py-4 text-lg border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 focus:border-green-500 focus:ring-0 focus:outline-none transition-colors"
              />
            </div>
            
            <div className="flex flex-wrap gap-4 items-center">
              <Select 
                value={surahFilter?.toString() || 'all'} 
                onValueChange={(value) => setSurahFilter(value === 'all' ? undefined : parseInt(value))}
              >
                <SelectTrigger className="w-[200px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {locale === 'en' ? 'All Surahs' : 'Все суры'}
                  </SelectItem>
                  {/* Add surah options dynamically */}
                </SelectContent>
              </Select>
              
              <Button type="submit" disabled={!query.trim()} className="px-6 py-2">
                {locale === 'en' ? 'Search' : 'Поиск'}
              </Button>
            </div>
          </form>
        </motion.div>

        {/* Search History */}
        {searchHistory.length > 0 && !query && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              {locale === 'en' ? 'Recent Searches' : 'Недавние поиски'}
            </h3>
            <div className="flex flex-wrap gap-2">
              {searchHistory.slice(0, 5).map((historyQuery, index) => (
                <button
                  key={index}
                  onClick={() => setQuery(historyQuery)}
                  className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {historyQuery}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Search Results */}
        <AnimatePresence mode="wait">
          {isLoading && debouncedQuery && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">
                {locale === 'en' ? 'Searching...' : 'Поиск...'}
              </p>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <p className="text-red-600 dark:text-red-400">
                {locale === 'en' ? 'Error occurred while searching' : 'Ошибка при выполнении поиска'}
              </p>
            </motion.div>
          )}

          {searchResults && debouncedQuery && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Results Header */}
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
                  {locale === 'en' ? 'Search Results' : 'Результаты поиска'}
                </h3>
                <p className="text-green-600 dark:text-green-300">
                  {locale === 'en' 
                    ? `Found ${searchResults.matches} matches for "${debouncedQuery}"`
                    : `Найдено ${searchResults.matches} совпадений для "${debouncedQuery}"`}
                </p>
              </div>

              {/* Results List */}
              <div className="space-y-6">
                {searchResults.ayahs?.map((ayah, index) => (
                  <motion.div
                    key={ayah.number}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-green-700 dark:text-green-300">
                            {ayah.numberInSurah}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {locale === 'en' ? `Surah ${ayah.number}` : `Сура ${ayah.number}`} • 
                            {locale === 'en' ? ` Verse ${ayah.numberInSurah}` : ` Аят ${ayah.numberInSurah}`}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {locale === 'en' ? `Juz ${ayah.juz} • Page ${ayah.page}` : `Джуз ${ayah.juz} • Страница ${ayah.page}`}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyVerse(ayah)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        
                        <Link href={`/surah/${Math.floor((ayah.number - 1) / 10) + 1}?verse=${ayah.numberInSurah}`}>
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                    
                    <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {highlightText(ayah.text, debouncedQuery)}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* No Results */}
              {searchResults.matches === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16"
                >
                  <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
                    {locale === 'en' ? 'No results found' : 'Результаты не найдены'}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    {locale === 'en' 
                      ? 'Try different keywords or check your spelling'
                      : 'Попробуйте другие ключевые слова или проверьте правописание'}
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search Tips */}
        {!debouncedQuery && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-12"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {locale === 'en' ? 'Search Tips' : 'Советы по поиску'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                  {locale === 'en' ? 'Keywords' : 'Ключевые слова'}
                </h4>
                <p className="text-sm text-blue-600 dark:text-blue-300">
                  {locale === 'en' 
                    ? 'Search for specific words like "mercy", "prayer", "guidance"'
                    : 'Ищите конкретные слова как "милость", "молитва", "руководство"'}
                </p>
              </div>
              
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-2">
                  {locale === 'en' ? 'Themes' : 'Темы'}
                </h4>
                <p className="text-sm text-purple-600 dark:text-purple-300">
                  {locale === 'en' 
                    ? 'Find verses by theme like "paradise", "patience", "forgiveness"'
                    : 'Найдите аяты по теме как "рай", "терпение", "прощение"'}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600"></div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}