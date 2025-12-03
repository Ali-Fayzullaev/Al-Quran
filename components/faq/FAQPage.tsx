// components/faq/FAQPage.tsx
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useLocale } from '@/context/LocaleContext';
import { useFAQ } from '@/lib/useFAQ';
import { useFAQBookmarks } from '@/lib/useFAQBookmarks';
import type { FAQSearchFilters } from '@/types/faq';
import { generateFAQJsonLd } from '@/lib/faqJsonLd';
import FAQSearch from '@/components/faq/FAQSearch';
import FAQFilters from '@/components/faq/FAQFilters';
import FAQList from '@/components/faq/FAQList';
import FAQStats from '@/components/faq/FAQStats';
import LoadingSpinner from '@/components/faq/LoadingSpinner';
import EmptyState from '@/components/faq/EmptyState';
import { Search, Filter, BookOpen, MessageCircle, Bookmark, X } from 'lucide-react';

export default function FAQPage() {
  const { t, locale } = useLocale();
  const { faqData, allTags, filterFAQ, loading, error } = useFAQ();
  const { toggleBookmark, isBookmarked, bookmarkedIds } = useFAQBookmarks();
  
  const [filters, setFilters] = useState<FAQSearchFilters>({
    searchTerm: '',
    selectedTags: [],
    sortBy: 'id',
    sortOrder: 'asc',
    showOnlyBookmarked: false
  });

  const [showFilters, setShowFilters] = useState(false);

  // Filter and get FAQ results
  const filteredFAQ = useMemo(() => {
    return filterFAQ(filters, bookmarkedIds);
  }, [filterFAQ, filters, bookmarkedIds]);

  const updateFilter = <K extends keyof FAQSearchFilters>(key: K, value: FAQSearchFilters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      selectedTags: [],
      sortBy: 'id',
      sortOrder: 'asc',
      showOnlyBookmarked: false
    });
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + K to focus search
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }
      
      // Escape to clear search and collapse filters
      if (event.key === 'Escape') {
        setShowFilters(false);
        if (filters.searchTerm) {
          updateFilter('searchTerm', '');
        }
      }
      
      // Ctrl/Cmd + / to toggle filters
      if ((event.metaKey || event.ctrlKey) && event.key === '/') {
        event.preventDefault();
        setShowFilters(!showFilters);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filters.searchTerm, showFilters]);

  // Clear filters when language changes to avoid confusion
  useEffect(() => {
    clearFilters();
  }, [locale]);

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="animate-pulse">
          <div className="h-32 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20"></div>
          <div className="max-w-7xl mx-auto px-3 sm:px-4 py-8">
            <div className="space-y-8">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-40 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-4">
        <div 
          className="max-w-4xl mx-auto text-center py-16 rounded-lg"
          style={{ 
            backgroundColor: 'var(--color-background-secondary)', 
            borderColor: 'var(--color-border)', 
            borderWidth: '1px' 
          }}
        >
          <MessageCircle size={48} className="mx-auto mb-4" style={{ color: 'var(--color-primary)' }} />
          <h2 className="text-xl font-semibold mb-2">{t('error')}</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* JSON-LD for SEO */}
      {!loading && faqData.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: generateFAQJsonLd(faqData) }}
        />
      )}
      
      {/* Header */}
      <div 
        className="z-10 shadow-sm border-b"
        style={{ 
          backgroundColor: 'var(--color-background)', 
          borderBottomColor: 'var(--color-border)'
        }}
      >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen size={28} style={{ color: 'var(--color-primary)' }} />
            <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--color-text)' }}>
              {t('faqSection.title')}
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base px-4 sm:px-0">
            {t('faqSection.description')}
          </p>
        </div>        {/* Search and Filter Controls */}
        <div className="flex flex-col gap-4 sm:gap-6">
          <div className="w-full relative">
            <FAQSearch 
              searchTerm={filters.searchTerm}
              onSearchChange={(value: string) => updateFilter('searchTerm', value)}
              placeholder={`${t('faqSection.searchPlaceholder')} (Ctrl+K)`}
            />            {/* Active Filters Indicator */}
            {(filters.searchTerm.trim() !== '' || filters.selectedTags.length > 0 || filters.showOnlyBookmarked) && (
              <div className="mt-4 p-3 rounded border" style={{ backgroundColor: 'var(--color-background-secondary)', borderColor: 'var(--color-border)' }}>
                <div className="flex flex-wrap gap-2 text-sm">
                  <span className="text-gray-600 font-medium">
                    Активные фильтры:
                  </span>
                  {filters.searchTerm.trim() !== '' && (
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded text-sm">
                      <Search size={14} className="text-blue-600" />
                      <span className="text-blue-800">
                        "{filters.searchTerm.length > 20 ? filters.searchTerm.substring(0, 20) + '...' : filters.searchTerm}"
                      </span>
                      <button 
                        onClick={() => updateFilter('searchTerm', '')}
                        className="text-blue-600 hover:text-red-500"
                      >
                        ✕
                      </button>
                    </span>
                  )}
                  {filters.showOnlyBookmarked && (
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 border border-purple-200 rounded text-sm">
                      <Bookmark size={14} className="text-purple-600" />
                      <span className="text-purple-800">Закладки</span>
                      <button 
                        onClick={() => updateFilter('showOnlyBookmarked', false)}
                        className="text-purple-600 hover:text-red-500"
                      >
                        ✕
                      </button>
                    </span>
                  )}
                  {filters.selectedTags.map((tag) => (
                    <span 
                      key={tag}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded text-sm"
                    >
                      <span className="text-green-600">{tag}</span>
                      <button 
                        onClick={() => updateFilter('selectedTags', filters.selectedTags.filter(t => t !== tag))}
                        className="text-green-600 hover:text-red-500"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
            </div>
            
          
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
            {/* Bookmarks Filter */}
            <button
              onClick={() => updateFilter('showOnlyBookmarked', !filters.showOnlyBookmarked)}
              className="flex items-center gap-2 px-4 py-2 rounded border text-sm font-medium"
              style={{ 
                backgroundColor: filters.showOnlyBookmarked ? 'var(--color-primary)' : 'var(--color-background)', 
                borderColor: filters.showOnlyBookmarked ? 'var(--color-primary)' : 'var(--color-border)',
                color: filters.showOnlyBookmarked ? 'white' : 'var(--color-text)'
              }}
              title={filters.showOnlyBookmarked ? "Показать все вопросы" : "Показать только закладки"}
            >
              <Bookmark size={16} />
              <span className="hidden sm:inline">
                {bookmarkedIds.size > 0 ? `${bookmarkedIds.size} закладок` : 'Закладки'}
              </span>
            </button>            
            {/* Advanced Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 rounded border text-sm font-medium"
              style={{ 
                backgroundColor: showFilters ? 'var(--color-primary)' : 'var(--color-background)', 
                borderColor: showFilters ? 'var(--color-primary)' : 'var(--color-border)',
                color: showFilters ? 'white' : 'var(--color-text)'
              }}
            >
              <Filter size={16} />
              <span className="hidden sm:inline">
                {showFilters ? 'Скрыть фильтры' : 'Фильтры'}
              </span>
              <span className="sm:hidden">
                {showFilters ? 'Скрыть' : 'Фильтры'}
              </span>
              {(filters.selectedTags.length > 0 || filters.sortBy !== 'id') && (
                <span className="ml-1 px-2 py-0.5 text-xs rounded bg-white bg-opacity-30 min-w-[18px] text-center">
                  {filters.selectedTags.length > 0 ? filters.selectedTags.length : '1'}
                </span>
              )}
            </button>            {/* Quick Clear Filters */}
            {(filters.searchTerm.trim() !== '' || filters.selectedTags.length > 0 || filters.showOnlyBookmarked) && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-lg border transition-all hover:shadow-md text-red-600 hover:text-red-800 border-red-300 hover:border-red-400 text-sm"
                style={{ 
                  backgroundColor: 'var(--color-background)'
                }}
                title="Очистить все фильтры"
              >
                <span className="text-base">✕</span>
                <span className="hidden sm:inline">Очистить</span>
              </button>
            )}              <FAQStats 
                total={faqData.length}
                filtered={filteredFAQ.length}
                hasFilters={filters.searchTerm.trim() !== '' || filters.selectedTags.length > 0 || filters.showOnlyBookmarked}
              />
            </div>
          </div>

        {/* Filters Panel */}
        {showFilters && (
          <div 
            className="mt-4 p-6 rounded border shadow-sm"
            style={{ 
              backgroundColor: 'var(--color-background-secondary)', 
              borderColor: 'var(--color-border)'
            }}
          >
            {/* Header with close button */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Filter size={18} style={{ color: 'var(--color-primary)' }} />
                <h3 className="font-semibold text-base sm:text-lg">Расширенные фильтры</h3>
              </div>
              <button
                onClick={() => setShowFilters(false)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Закрыть фильтры"
              >
                <span className="text-lg sm:text-xl text-gray-500">✕</span>
              </button>
            </div>              <FAQFilters
                allTags={allTags}
                selectedTags={filters.selectedTags}
                sortBy={filters.sortBy}
                sortOrder={filters.sortOrder}
                onTagsChange={(tags: string[]) => updateFilter('selectedTags', tags)}
                onSortChange={(sortBy: 'id' | 'question' | 'relevance', sortOrder: 'asc' | 'desc') => {
                  updateFilter('sortBy', sortBy);
                  updateFilter('sortOrder', sortOrder);
                }}
                onClearFilters={clearFilters}
              />
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {filteredFAQ.length > 0 ? (
          <FAQList 
            faqItems={filteredFAQ} 
            onTagClick={(tag: string) => {
              if (!filters.selectedTags.includes(tag)) {
                updateFilter('selectedTags', [...filters.selectedTags, tag]);
              }
            }}
            onToggleBookmark={toggleBookmark}
            isBookmarked={isBookmarked}
          />
        ) : (
          <EmptyState 
            hasFilters={filters.searchTerm.trim() !== '' || filters.selectedTags.length > 0 || filters.showOnlyBookmarked}
            onClearFilters={clearFilters}
          />
        )}
      </div>
    </div>
  );
}