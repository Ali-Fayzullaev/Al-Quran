// components/faq/FAQFilters.tsx
"use client";

import React from 'react';
import { useLocale } from '@/context/LocaleContext';
import { X, Tag, ArrowUp, ArrowDown, RotateCcw } from 'lucide-react';

interface FAQFiltersProps {
  allTags: string[];
  selectedTags: string[];
  sortBy: 'id' | 'question' | 'relevance';
  sortOrder: 'asc' | 'desc';
  onTagsChange: (tags: string[]) => void;
  onSortChange: (sortBy: 'id' | 'question' | 'relevance', sortOrder: 'asc' | 'desc') => void;
  onClearFilters: () => void;
}

export default function FAQFilters({
  allTags,
  selectedTags,
  sortBy,
  sortOrder,
  onTagsChange,
  onSortChange,
  onClearFilters
}: FAQFiltersProps) {
  const { t } = useLocale();

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const hasActiveFilters = selectedTags.length > 0;

  return (
    <div className="space-y-6">
      {/* Tags Filter */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Tag size={18} style={{ color: 'var(--color-primary)' }} />
          <h3 className="font-semibold text-sm">{t('faqSection.tags')}</h3>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onTagsChange([])}
            className={`px-3 py-1 rounded-full text-sm border transition-all hover:shadow-sm ${
              selectedTags.length === 0 
                ? 'text-white'
                : 'hover:border-gray-400'
            }`}
            style={{
              backgroundColor: selectedTags.length === 0 ? 'var(--color-primary)' : 'var(--color-background)',
              borderColor: selectedTags.length === 0 ? 'var(--color-primary)' : 'var(--color-border)',
              color: selectedTags.length === 0 ? 'white' : 'var(--color-text)'
            }}
          >
            {t('faqSection.allTags')}
          </button>
          
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1 rounded-full text-sm border transition-all hover:shadow-sm ${
                selectedTags.includes(tag) 
                  ? 'text-white'
                  : 'hover:border-gray-400'
              }`}
              style={{
                backgroundColor: selectedTags.includes(tag) ? 'var(--color-primary)' : 'var(--color-background)',
                borderColor: selectedTags.includes(tag) ? 'var(--color-primary)' : 'var(--color-border)',
                color: selectedTags.includes(tag) ? 'white' : 'var(--color-text)'
              }}
            >
              {tag}
              {selectedTags.includes(tag) && (
                <X size={14} className="ml-1 inline-block" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Sort Options */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">{t('faqSection.sortBy')}:</span>
          
          <div className="flex gap-2">
            {[
              { key: 'id', label: t('faqSection.sortById') },
              { key: 'question', label: t('faqSection.sortByQuestion') },
              { key: 'relevance', label: t('faqSection.sortByRelevance') }
            ].map((option) => (
              <button
                key={option.key}
                onClick={() => onSortChange(option.key as any, sortOrder)}
                className={`px-3 py-1 text-sm rounded border transition-all hover:shadow-sm ${
                  sortBy === option.key 
                    ? 'text-white'
                    : 'hover:border-gray-400'
                }`}
                style={{
                  backgroundColor: sortBy === option.key ? 'var(--color-primary)' : 'var(--color-background)',
                  borderColor: sortBy === option.key ? 'var(--color-primary)' : 'var(--color-border)',
                  color: sortBy === option.key ? 'white' : 'var(--color-text)'
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => onSortChange(sortBy, sortOrder === 'asc' ? 'desc' : 'asc')}
            className="flex items-center gap-1 px-3 py-1 text-sm rounded border transition-all hover:shadow-sm"
            style={{ 
              backgroundColor: 'var(--color-background)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)'
            }}
          >
            {sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
            <span className="hidden sm:inline">
              {sortOrder === 'asc' ? t('faqSection.ascending') : t('faqSection.descending')}
            </span>
          </button>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-2 px-3 py-1 text-sm rounded border transition-all hover:shadow-sm text-gray-600 hover:text-gray-800"
            style={{ 
              backgroundColor: 'var(--color-background)',
              borderColor: 'var(--color-border)'
            }}
          >
            <RotateCcw size={14} />
            {t('faqSection.clearFilters')}
          </button>
        )}
      </div>
    </div>
  );
}