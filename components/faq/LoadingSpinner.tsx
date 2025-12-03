// components/faq/LoadingSpinner.tsx
"use client";

import React from 'react';
import { Loader2, BookOpen } from 'lucide-react';
import { useLocale } from '@/context/LocaleContext';

export default function LoadingSpinner() {
  const { t } = useLocale();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <div className="relative mb-6">
          <BookOpen size={48} className="mx-auto text-gray-300" />
          <Loader2 
            size={24} 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-spin" 
            style={{ color: 'var(--color-primary)' }}
          />
        </div>
        
        <h2 className="text-xl font-semibold mb-2">{t('loading')}</h2>
        <p className="text-gray-600">
          {t('faqSection.title')}...
        </p>
      </div>
    </div>
  );
}