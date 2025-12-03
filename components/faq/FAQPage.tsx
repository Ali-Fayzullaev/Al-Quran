// components/faq/FAQPage.tsx
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useLocale } from '@/context/LocaleContext';
import { useFAQ } from '@/lib/useFAQ';
import { useFAQBookmarks } from '@/lib/useFAQBookmarks';
import type { FAQSearchFilters } from '@/types/faq';
import { generateFAQJsonLd } from '@/lib/faqJsonLd';
import FAQSearch from './FAQSearch';
import FAQFilters from './FAQFilters';
import FAQList from './FAQList';
import FAQStats from './FAQStats';
import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';
import { Search, Filter, BookOpen, MessageCircle, Bookmark } from 'lucide-react';

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

  const updateFilter = (key: keyof FAQSearchFilters, value: any) => {
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
    return <LoadingSpinner />;
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
        className="sticky top-0 z-10 shadow-sm"
        style={{ 
          backgroundColor: 'var(--color-background-secondary)', 
          borderBottomColor: 'var(--color-border)', 
          borderBottomWidth: '1px' 
        }}
      >
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-3">
              <BookOpen size={32} className="mr-3" style={{ color: 'var(--color-primary)' }} />
              <h1 className="text-3xl font-bold">{t('faqSection.title')}</h1>
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t('faqSection.description')}
            </p>
          </div>

          {/* Search and Filter Controls */}
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex-1 max-w-2xl w-full">
              <FAQSearch 
                searchTerm={filters.searchTerm}
                onSearchChange={(value) => updateFilter('searchTerm', value)}
                placeholder={`${t('faqSection.searchPlaceholder')} (Ctrl+K)`}
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => updateFilter('showOnlyBookmarked', !filters.showOnlyBookmarked)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-all hover:shadow-md"
                style={{ 
                  backgroundColor: filters.showOnlyBookmarked ? 'var(--color-primary)' : 'var(--color-background)', 
                  borderColor: 'var(--color-border)',
                  color: filters.showOnlyBookmarked ? 'white' : 'var(--color-text)'
                }}
                title="Показать только закладки"
              >
                <Bookmark size={18} />
                <span className="hidden sm:inline">
                  {bookmarkedIds.size}
                </span>
              </button>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-all hover:shadow-md"
                style={{ 
                  backgroundColor: showFilters ? 'var(--color-primary)' : 'var(--color-background)', 
                  borderColor: 'var(--color-border)',
                  color: showFilters ? 'white' : 'var(--color-text)'
                }}
              >
                <Filter size={18} />
                <span className="hidden sm:inline">
                  {showFilters ? t('hideFilters') : t('showFilters')}
                </span>
              </button>

              <FAQStats 
                total={faqData.length}
                filtered={filteredFAQ.length}
                hasFilters={filters.searchTerm.trim() !== '' || filters.selectedTags.length > 0 || filters.showOnlyBookmarked}
              />
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: 'var(--color-background)' }}>
              <FAQFilters
                allTags={allTags}
                selectedTags={filters.selectedTags}
                sortBy={filters.sortBy}
                sortOrder={filters.sortOrder}
                onTagsChange={(tags) => updateFilter('selectedTags', tags)}
                onSortChange={(sortBy, sortOrder) => {
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
      <div className="max-w-7xl mx-auto px-4 py-6">
        {filteredFAQ.length > 0 ? (
          <FAQList 
            faqItems={filteredFAQ} 
            onTagClick={(tag) => {
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