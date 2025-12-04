// lib/useFAQ.ts
import { useState, useEffect, useMemo } from 'react';
import { useLocale } from '@/context/LocaleContext';
import type { FAQItem, FAQSearchFilters } from '@/types/faq';

export const useFAQ = () => {
  const { locale } = useLocale();
  const [faqData, setFaqData] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFAQData = async () => {
      setLoading(true);
      setError(null);
      // Clear existing data to prevent duplicate keys during transition
      setFaqData([]);
      
      try {
        const fileName = `200_faq_for_islam-${locale}.json`;
        const response = await fetch(`/messages/${fileName}`);
        
        if (!response.ok) {
          throw new Error(`Failed to load FAQ data for ${locale}`);
        }
        
        const data: FAQItem[] = await response.json();
        setFaqData(data);
      } catch (err) {
        console.error('Error loading FAQ data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load FAQ data');
      } finally {
        setLoading(false);
      }
    };

    loadFAQData();
  }, [locale]);

  // Get all unique tags from FAQ data
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    faqData.forEach(item => {
      item.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [faqData]);

  // Filter and sort FAQ data
  const filterFAQ = useMemo(() => {
    return (filters: FAQSearchFilters, bookmarkedIds?: Set<number>) => {
      let filtered = faqData;

      // Apply bookmark filter first
      if (filters.showOnlyBookmarked && bookmarkedIds) {
        filtered = filtered.filter(item => bookmarkedIds.has(item.id));
      }

      // Apply search filter
      if (filters.searchTerm.trim()) {
        const searchTerm = filters.searchTerm.toLowerCase();
        filtered = filtered.filter(item =>
          item.question.toLowerCase().includes(searchTerm) ||
          item.answer.toLowerCase().includes(searchTerm) ||
          item.short_answer.toLowerCase().includes(searchTerm) ||
          item.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
      }

      // Apply tag filters
      if (filters.selectedTags.length > 0) {
        filtered = filtered.filter(item =>
          filters.selectedTags.some(tag => item.tags.includes(tag))
        );
      }

      // Apply sorting
      filtered.sort((a, b) => {
        let comparison = 0;
        
        switch (filters.sortBy) {
          case 'id':
            comparison = a.id - b.id;
            break;
          case 'question':
            comparison = a.question.localeCompare(b.question);
            break;
          case 'relevance':
            // For relevance, prioritize items that match search term in question
            if (filters.searchTerm.trim()) {
              const searchTerm = filters.searchTerm.toLowerCase();
              const aInQuestion = a.question.toLowerCase().includes(searchTerm);
              const bInQuestion = b.question.toLowerCase().includes(searchTerm);
              if (aInQuestion && !bInQuestion) comparison = -1;
              else if (!aInQuestion && bInQuestion) comparison = 1;
              else comparison = a.id - b.id;
            } else {
              comparison = a.id - b.id;
            }
            break;
          default:
            comparison = 0;
        }

        return filters.sortOrder === 'desc' ? -comparison : comparison;
      });

      return filtered;
    };
  }, [faqData]);

  return {
    faqData,
    allTags,
    filterFAQ,
    loading,
    error
  };
};