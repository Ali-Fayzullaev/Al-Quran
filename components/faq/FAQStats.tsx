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
    <div className="relative group">
      {/* Градиентный фон */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition-all duration-500"></div>
      
      <div 
        className="relative flex items-center gap-3 px-4 py-3 rounded-xl border-2 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105"
        style={{ 
          background: 'linear-gradient(135deg, var(--color-background-secondary) 0%, var(--color-background) 100%)', 
          borderColor: 'var(--color-primary)',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.1)'
        }}
      >
        {/* Анимированная иконка */}
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500 rounded-full blur opacity-30 animate-pulse"></div>
          <FileText 
            size={18} 
            className="relative z-10 group-hover:scale-110 transition-transform duration-300" 
            style={{ color: 'var(--color-primary)' }} 
          />
        </div>
        
        {/* Статистика с анимированными числами */}
        <span className="text-sm sm:text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {hasFilters ? (
            <>
              <span className="inline-block animate-pulse">{filtered}</span>
              <span className="text-gray-500 mx-1">/</span>
              <span>{total}</span> {t('faqSection.questionsFound')}
            </>
          ) : (
            <>
              <span className="inline-block group-hover:animate-bounce">{total}</span> {t('faqSection.questionsFound')}
            </>
          )}
        </span>
        
        {/* Процентный индикатор при фильтрации */}
        {hasFilters && total > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000 ease-out"
                style={{ 
                  width: `${Math.max((filtered / total) * 100, 5)}%`
                }}
              ></div>
            </div>
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {Math.round((filtered / total) * 100)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}