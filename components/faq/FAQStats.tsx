// components/faq/FAQStats.tsx
"use client";

import React from 'react';
import { useLocale } from '@/context/LocaleContext';
import { FileText } from 'lucide-react';

interface FAQStatsProps {
  total: number;
  filtered: number;
  hasFilters: boolean;
}

export default function FAQStats({ total, filtered, hasFilters }: FAQStatsProps) {
  const { t } = useLocale();

  return (
    <div 
      className="flex items-center gap-2 px-4 py-2 rounded-lg border"
      style={{ 
        backgroundColor: 'var(--color-background-secondary)', 
        borderColor: 'var(--color-border)'
      }}
    >
      <FileText size={16} style={{ color: 'var(--color-primary)' }} />
      <span className="text-sm font-medium">
        {hasFilters ? (
          <>
            {filtered} / {total} {t('faqSection.questionsFound')}
          </>
        ) : (
          <>
            {total} {t('faqSection.questionsFound')}
          </>
        )}
      </span>
    </div>
  );
}