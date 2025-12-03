// components/faq/FAQList.tsx
"use client";

import React from 'react';
import type { FAQItem } from '@/types/faq';
import { useLocale } from '@/context/LocaleContext';
import FAQCard from './FAQCard';

interface FAQListProps {
  faqItems: FAQItem[];
  onTagClick?: (tag: string) => void;
  onToggleBookmark?: (id: number) => void;
  isBookmarked?: (id: number) => boolean;
}

export default function FAQList({ faqItems, onTagClick, onToggleBookmark, isBookmarked }: FAQListProps) {
  const { locale } = useLocale();
  
  return (
    <div className="grid gap-6 lg:gap-8">
      {faqItems.map((item, index) => (
        <FAQCard 
          key={`${locale}-${item.id}-${index}`} 
          faqItem={item} 
          onTagClick={onTagClick} 
          onToggleBookmark={onToggleBookmark}
          isBookmarked={isBookmarked?.(item.id)}
        />
      ))}
    </div>
  );
}