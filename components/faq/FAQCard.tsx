// components/faq/FAQCard.tsx
"use client";

import React, { useState } from 'react';
import { useLocale } from '@/context/LocaleContext';
import type { FAQItem } from '@/types/faq';
import { 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Share2, 
  Bookmark,
  Tag,
  BookOpen
} from 'lucide-react';

interface FAQCardProps {
  faqItem: FAQItem;
  onTagClick?: (tag: string) => void;
  onToggleBookmark?: (id: number) => void;
  isBookmarked?: boolean;
}

export default function FAQCard({ faqItem, onTagClick, onToggleBookmark, isBookmarked = false }: FAQCardProps) {
  const { t } = useLocale();
  const [isExpanded, setIsExpanded] = useState(false);
  const [copySuccess, setCopySuccess] = useState<'question' | 'answer' | null>(null);

  const handleCopy = async (text: string, type: 'question' | 'answer') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(type);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: faqItem.question,
          text: `${faqItem.question}\n\n${faqItem.short_answer}`,
          url: window.location.href + `#faq-${locale}-${faqItem.id}`
        });
      } else {
        // Fallback to copying URL
        await navigator.clipboard.writeText(window.location.href + `#faq-${locale}-${faqItem.id}`);
        setCopySuccess('question');
        setTimeout(() => setCopySuccess(null), 2000);
      }
    } catch (err) {
      console.error('Failed to share:', err);
    }
  };

  const { locale } = useLocale();
  
  return (
    <div 
      id={`faq-${locale}-${faqItem.id}`}
      className="rounded-lg border shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.01]"
      style={{ 
        backgroundColor: 'var(--color-background-secondary)', 
        borderColor: 'var(--color-border)', 
        borderWidth: '1px' 
      }}
    >
      {/* Question Header */}
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-start gap-3 mb-3">
              <div 
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                {faqItem.id}
              </div>
              <h3 className="text-base sm:text-lg font-semibold leading-relaxed">
                {faqItem.question}
              </h3>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2 flex-shrink-0 justify-end sm:justify-start">
            <button
              onClick={() => handleCopy(faqItem.question, 'question')}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={t('faqSection.copyQuestion')}
            >
              <Copy size={16} style={{ color: copySuccess === 'question' ? 'green' : 'var(--color-primary)' }} />
            </button>
            
            <button
              onClick={handleShare}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={t('faqSection.shareQuestion')}
            >
              <Share2 size={16} style={{ color: 'var(--color-primary)' }} />
            </button>
            
            <button
              onClick={() => onToggleBookmark?.(faqItem.id)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={isBookmarked ? t('bookmarksSection.removeBookmark') : t('faqSection.bookmarkQuestion')}
            >
              <Bookmark 
                size={16} 
                style={{ 
                  color: 'var(--color-primary)',
                  fill: isBookmarked ? 'var(--color-primary)' : 'none'
                }} 
              />
            </button>
          </div>
        </div>

        {/* Tags */}
        {faqItem.tags && faqItem.tags.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <Tag size={14} className="text-gray-500" />
            <div className="flex flex-wrap gap-1">
              {faqItem.tags.map((tag, index) => (
                <button
                  key={index}
                  onClick={() => onTagClick?.(tag)}
                  className="px-2 py-1 text-xs rounded-full border transition-all hover:shadow-sm hover:scale-105"
                  style={{ 
                    backgroundColor: 'var(--color-background)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-secondary)'
                  }}
                  title={`Поиск по тегу: ${tag}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Short Answer */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen size={16} style={{ color: 'var(--color-primary)' }} />
            <span className="text-sm font-medium text-gray-600">
              {t('faqSection.shortAnswer')}:
            </span>
          </div>
          <p className="text-gray-700 leading-relaxed">
            {faqItem.short_answer}
          </p>
        </div>

        {/* Toggle Full Answer Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-all hover:shadow-sm"
          style={{ 
            backgroundColor: 'var(--color-background)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-primary)'
          }}
        >
          {isExpanded ? (
            <>
              <ChevronUp size={16} />
              {t('faqSection.hideFullAnswer')}
            </>
          ) : (
            <>
              <ChevronDown size={16} />
              {t('faqSection.showFullAnswer')}
            </>
          )}
        </button>
      </div>

      {/* Expanded Full Answer */}
      {isExpanded && (
        <div 
          className="px-4 sm:px-6 pb-4 sm:pb-6 border-t animate-in slide-in-from-top-2 duration-300"
          style={{ borderTopColor: 'var(--color-border)' }}
        >
          <div className="pt-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-3">
              <div className="flex items-center gap-2">
                <BookOpen size={16} style={{ color: 'var(--color-primary)' }} />
                <span className="text-sm font-medium text-gray-600">
                  {t('faqSection.fullAnswer')}:
                </span>
              </div>
              
              <button
                onClick={() => handleCopy(faqItem.answer, 'answer')}
                className="flex items-center gap-2 px-3 py-1 text-sm rounded border transition-all hover:shadow-sm self-start sm:self-auto"
                style={{ 
                  backgroundColor: 'var(--color-background)',
                  borderColor: 'var(--color-border)',
                  color: copySuccess === 'answer' ? 'green' : 'var(--color-primary)'
                }}
              >
                <Copy size={14} />
                <span className="hidden sm:inline">{t('faqSection.copyAnswer')}</span>
                <span className="sm:hidden">Копировать</span>
              </button>
            </div>
            
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
                {faqItem.answer}
              </p>
            </div>

            {/* Source */}
            {faqItem.source && (
              <div className="mt-4 pt-3 border-t" style={{ borderTopColor: 'var(--color-border)' }}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-600">
                  <span className="font-medium">{t('faqSection.source')}:</span>
                  <span className="italic">{faqItem.source}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}