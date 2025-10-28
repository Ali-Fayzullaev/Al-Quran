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
  const [searchMode, setSearchMode] = useState<'arabic' | 'translation' | 'both'>('both');
  const [translationLanguage, setTranslationLanguage] = useState<string>('en.sahih');
  const [juzFilter, setJuzFilter] = useState<number | undefined>();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState(0);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  // Search function with better error handling
  useEffect(() => {
    if (debouncedQuery && debouncedQuery.trim().length >= 2) {
      performSearch(debouncedQuery.trim());
      addToSearchHistory(debouncedQuery.trim());
    } else {
      setSearchResults([]);
    }
  }, [debouncedQuery, surahFilter, searchMode, translationLanguage, juzFilter]);

  const performSearch = async (searchQuery: string) => {
    setIsLoading(true);
    setError(null);

    try {
      let results: any[] = [];
      
      // Search in Arabic text
      if (searchMode === 'arabic' || searchMode === 'both') {
        const arabicResponse = await fetch(`https://api.alquran.cloud/v1/search/${encodeURIComponent(searchQuery)}/quran-uthmani`);
        if (arabicResponse.ok) {
          const arabicData = await arabicResponse.json();
          if (arabicData.data?.matches) {
            results.push(...arabicData.data.matches.map((match: any) => ({ 
              ...match, 
              source: 'arabic',
              surahName: match.surah?.englishName || `Surah ${match.surah?.number || 0}`,
              surahNameArabic: match.surah?.name || '',
            })));
          }
        }
      }

      // Search in translation
      if (searchMode === 'translation' || searchMode === 'both') {
        const translationResponse = await fetch(`https://api.alquran.cloud/v1/search/${encodeURIComponent(searchQuery)}/${translationLanguage}`);
        if (translationResponse.ok) {
          const translationData = await translationResponse.json();
          if (translationData.data?.matches) {
            results.push(...translationData.data.matches.map((match: any) => ({ 
              ...match, 
              source: 'translation',
              surahName: match.surah?.englishName || `Surah ${match.surah?.number || 0}`,
              surahNameArabic: match.surah?.name || '',
            })));
          }
        }
      }

      // Remove duplicates and clean up results
      const uniqueResults = results.reduce((acc: any[], current: any) => {
        const exists = acc.find(item => 
          item.number === current.number && 
          item.surah?.number === current.surah?.number
        );
        if (!exists) {
          acc.push({
            ...current,
            // Ensure text fields are strings, not objects
            text: typeof current.text === 'string' ? current.text : current.text?.arabic || '',
            translation: typeof current.translation === 'string' ? current.translation : '',
            surahName: current.surah?.englishName || `Surah ${current.surah?.number || 0}`,
            surahNameArabic: current.surah?.name || '',
          });
        } else if (current.source === 'translation' && current.text) {
          // Add translation to existing Arabic result
          exists.translation = typeof current.text === 'string' ? current.text : current.text?.arabic || '';
        }
        return acc;
      }, []);

      // Apply filters
      const filteredResults = uniqueResults.filter((match: any) => {
        if (surahFilter && match.surah?.number !== surahFilter) return false;
        if (juzFilter && match.juz !== juzFilter) return false;
        return true;
      });

      setSearchResults(filteredResults);
      setTotalResults(filteredResults.length);
    } catch (searchError) {
      console.error('Search error:', searchError);
      setError(locale === 'en' ? 'Search failed. Please try again.' : 'Поиск не удался. Попробуйте снова.');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length >= 2) {
      setDebouncedQuery(query.trim());
    }
  };

  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm || !text) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800/60 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  const copyVerse = async (verse: any) => {
    try {
      const text = `${verse.text}\n\n${verse.surahName} ${verse.numberInSurah}:${verse.surah?.number}`;
      await navigator.clipboard.writeText(text);
      // Show success feedback
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const handleResultClick = (result: any) => {
    router.push(`/surah/${result.surah?.number}?verse=${result.numberInSurah}`);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Search Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold gradient-text-primary">
          {locale === 'en' ? 'Search the Quran' : 'Поиск по Корану'}
        </h1>
        <p style={{ color: 'var(--fixed-text-secondary)' }}>
          {locale === 'en' 
            ? 'Search through verses in Arabic text and translations'
            : 'Поиск по аятам в арабском тексте и переводах'
          }
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={locale === 'en' ? 'Enter your search query...' : 'Введите поисковый запрос...'}
          className="w-full p-4 text-lg border-2 rounded-xl focus:outline-none"
          style={{
            backgroundColor: 'var(--verse-background)',
            borderColor: 'var(--color-border)',
            color: 'var(--fixed-text)'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--color-primary)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'var(--color-border)';
          }}
        />
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors"
          style={{ color: 'var(--fixed-text-secondary)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--color-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--fixed-text-secondary)';
          }}
        >
          ⚙️
        </button>
      </div>

      {/* Advanced Search Options */}
      {showAdvanced && (
        <div className="p-4 rounded-xl space-y-4" style={{
          backgroundColor: 'var(--verse-background)',
          borderColor: 'var(--color-border)',
          border: '1px solid'
        }}>
          <h3 className="font-semibold text-lg" style={{ color: 'var(--fixed-text)' }}>
            {locale === 'en' ? 'Advanced Search' : 'Расширенный поиск'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search Mode */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--fixed-text-secondary)' }}>
                {locale === 'en' ? 'Search Mode' : 'Режим поиска'}
              </label>
              <select
                value={searchMode}
                onChange={(e) => setSearchMode(e.target.value as any)}
                className="w-full p-2 border rounded-lg"
                style={{
                  backgroundColor: 'var(--fixed-background)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--fixed-text)'
                }}
              >
                <option value="both">
                  {locale === 'en' ? 'Arabic & Translation' : 'Арабский и перевод'}
                </option>
                <option value="arabic">
                  {locale === 'en' ? 'Arabic Only' : 'Только арабский'}
                </option>
                <option value="translation">
                  {locale === 'en' ? 'Translation Only' : 'Только перевод'}
                </option>
              </select>
            </div>

            {/* Translation Language */}
            {(searchMode === 'translation' || searchMode === 'both') && (
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--fixed-text-secondary)' }}>
                  {locale === 'en' ? 'Translation' : 'Перевод'}
                </label>
                <select
                  value={translationLanguage}
                  onChange={(e) => setTranslationLanguage(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                  style={{
                    backgroundColor: 'var(--fixed-background)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--fixed-text)'
                  }}
                >
                  <option value="en.sahih">Sahih International</option>
                  <option value="en.pickthall">Pickthall</option>
                  <option value="en.yusufali">Yusuf Ali</option>
                  <option value="ru.kuliev">Кулиев (Russian)</option>
                  <option value="ru.osmanov">Османов (Russian)</option>
                </select>
              </div>
            )}

            {/* Surah Filter */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--fixed-text-secondary)' }}>
                {locale === 'en' ? 'Filter by Surah' : 'Фильтр по суре'}
              </label>
              <select
                value={surahFilter || ''}
                onChange={(e) => setSurahFilter(e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full p-2 border rounded-lg"
                style={{
                  backgroundColor: 'var(--fixed-background)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--fixed-text)'
                }}
              >
                <option value="">
                  {locale === 'en' ? 'All Surahs' : 'Все суры'}
                </option>
                {Array.from({ length: 114 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {locale === 'en' ? `Surah ${i + 1}` : `Сура ${i + 1}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Juz Filter */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--fixed-text-secondary)' }}>
                {locale === 'en' ? 'Filter by Juz' : 'Фильтр по джузу'}
              </label>
              <select
                value={juzFilter || ''}
                onChange={(e) => setJuzFilter(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full p-2 border rounded-lg"
                style={{
                  backgroundColor: 'var(--fixed-background)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--fixed-text)'
                }}
              >
                <option value="">
                  {locale === 'en' ? 'All Juz' : 'Все джузы'}
                </option>
                {Array.from({ length: 30 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {locale === 'en' ? `Juz ${i + 1}` : `Джуз ${i + 1}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Search Results Summary */}
      {searchResults.length > 0 && (
        <div className="p-3 rounded-lg" style={{
          backgroundColor: 'var(--verse-background)',
          borderLeft: '4px solid var(--color-primary)'
        }}>
          <p style={{ color: 'var(--color-primary)' }}>
            {locale === 'en' 
              ? `Found ${totalResults} result${totalResults !== 1 ? 's' : ''} for "${debouncedQuery}"`
              : `Найдено ${totalResults} результат${totalResults === 1 ? '' : totalResults < 5 ? 'а' : 'ов'} по запросу "${debouncedQuery}"`
            }
          </p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" style={{ borderColor: 'var(--color-primary)' }}></div>
          <p className="mt-2" style={{ color: 'var(--fixed-text-secondary)' }}>
            {locale === 'en' ? 'Searching...' : 'Поиск...'}
          </p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="space-y-4">
          {searchResults.map((result, index) => (
            <div
              key={`${result.number}-${index}`}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleResultClick(result)}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">{result.surahName}</span>
                  {result.surahNameArabic && (
                    <span className="mr-2 text-right" dir="rtl"> • {result.surahNameArabic}</span>
                  )}
                  <span> • {locale === 'en' ? 'Verse' : 'Аят'} {result.numberInSurah}</span>
                  <span> • Juz {result.juz}</span>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyVerse(result);
                    }}
                    className="p-1 text-gray-500 hover:text-blue-500 transition-colors"
                    title={locale === 'en' ? 'Copy verse' : 'Копировать аят'}
                  >
                    <Copy size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Add to bookmarks functionality
                    }}
                    className="p-1 text-gray-500 hover:text-yellow-500 transition-colors"
                    title={locale === 'en' ? 'Bookmark verse' : 'Добавить в закладки'}
                  >
                    <Bookmark size={16} />
                  </button>
                </div>
              </div>

              {/* Arabic Text */}
              <div className="text-right mb-4" dir="rtl">
                <p className="text-xl leading-relaxed font-arabic text-gray-800 dark:text-gray-200">
                  {highlightSearchTerm(result.text, searchMode === 'arabic' || searchMode === 'both' ? debouncedQuery : '')}
                </p>
              </div>

              {/* Translation (if available) */}
              {result.translation && (
                <div className="border-t pt-3">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {highlightSearchTerm(result.translation, searchMode === 'translation' || searchMode === 'both' ? debouncedQuery : '')}
                  </p>
                </div>
              )}

              {/* Source indicator */}
              <div className="mt-3 flex justify-between items-center text-xs text-gray-500">
                <span>
                  {result.source === 'arabic' && (locale === 'en' ? 'Found in Arabic text' : 'Найдено в арабском тексте')}
                  {result.source === 'translation' && (locale === 'en' ? 'Found in translation' : 'Найдено в переводе')}
                </span>
                <span className="flex items-center gap-1 text-blue-500 hover:text-blue-600">
                  {locale === 'en' ? 'Read full surah' : 'Читать полную суру'}
                  <ExternalLink size={12} />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Results */}
      {debouncedQuery && !isLoading && searchResults.length === 0 && !error && (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
            {locale === 'en' ? 'No verses found' : 'Аяты не найдены'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {locale === 'en' 
              ? 'Try different keywords or check your spelling'
              : 'Попробуйте другие ключевые слова или проверьте правописание'
            }
          </p>
        </div>
      )}

      {/* Search History */}
      {searchHistory.length > 0 && !debouncedQuery && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock size={20} />
            {locale === 'en' ? 'Recent Searches' : 'Недавние поиски'}
          </h3>
          <div className="flex flex-wrap gap-2">
            {searchHistory.slice(0, 10).map((searchTerm, index) => (
              <button
                key={index}
                onClick={() => setQuery(searchTerm)}
                className="px-3 py-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                {searchTerm}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Tips */}
      {!debouncedQuery && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">
            {locale === 'en' ? 'Search Tips' : 'Советы по поиску'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
            <div>
              <h4 className="font-medium mb-2">
                {locale === 'en' ? 'Arabic Search:' : 'Поиск на арабском:'}
              </h4>
              <ul className="space-y-1">
                <li>• {locale === 'en' ? 'Use Arabic text for exact matches' : 'Используйте арабский текст для точных совпадений'}</li>
                <li>• {locale === 'en' ? 'Try different word forms' : 'Попробуйте разные формы слов'}</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">
                {locale === 'en' ? 'Translation Search:' : 'Поиск в переводе:'}
              </h4>
              <ul className="space-y-1">
                <li>• {locale === 'en' ? 'Search in your preferred language' : 'Ищите на предпочитаемом языке'}</li>
                <li>• {locale === 'en' ? 'Use keywords and phrases' : 'Используйте ключевые слова и фразы'}</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mx-auto"></div>
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}