// components/faq/EmptyState.tsx
"use client";

import React from 'react';
import { useLocale } from '@/context/LocaleContext';
import { Search, Filter, RotateCcw } from 'lucide-react';

interface EmptyStateProps {
  hasFilters: boolean;
  onClearFilters: () => void;
}

export default function EmptyState({ hasFilters, onClearFilters }: EmptyStateProps) {
  const { t } = useLocale();

  return (
    <div className="text-center py-16">
      <div 
        className="max-w-md mx-auto p-8 rounded-lg border"
        style={{ 
          backgroundColor: 'var(--color-background-secondary)', 
          borderColor: 'var(--color-border)', 
          borderWidth: '1px' 
        }}
      >
        {hasFilters ? (
          <>
            <Filter size={48} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">
              {t('faqSection.noQuestionsFound')}
            </h3>
            <p className="text-gray-600 mb-6">
              {t('faqSection.tryDifferentSearch')}
            </p>
            <button
              onClick={onClearFilters}
              className="flex items-center gap-2 mx-auto px-4 py-2 rounded-lg border transition-all hover:shadow-md"
              style={{ 
                backgroundColor: 'var(--color-primary)',
                borderColor: 'var(--color-primary)',
                color: 'white'
              }}
            >
              <RotateCcw size={16} />
              {t('faqSection.clearFilters')}
            </button>
          </>
        ) : (
          <>
            <Search size={48} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">
              {t('faqSection.noQuestionsFound')}
            </h3>
            <p className="text-gray-600">
              {t('tryAgain')}
            </p>
          </>
        )}
      </div>
    </div>
  );
}