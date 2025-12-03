// lib/useFAQBookmarks.ts
import { useState, useEffect } from 'react';
import type { FAQItem } from '@/types/faq';

const FAQ_BOOKMARKS_KEY = 'faq-bookmarks';

export const useFAQBookmarks = () => {
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    const saved = localStorage.getItem(FAQ_BOOKMARKS_KEY);
    if (saved) {
      try {
        const ids = JSON.parse(saved);
        setBookmarkedIds(new Set(ids));
      } catch (error) {
        console.error('Error loading FAQ bookmarks:', error);
      }
    }
  }, []);

  const saveBookmarks = (ids: Set<number>) => {
    try {
      localStorage.setItem(FAQ_BOOKMARKS_KEY, JSON.stringify([...ids]));
    } catch (error) {
      console.error('Error saving FAQ bookmarks:', error);
    }
  };

  const toggleBookmark = (faqId: number) => {
    setBookmarkedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(faqId)) {
        newSet.delete(faqId);
      } else {
        newSet.add(faqId);
      }
      saveBookmarks(newSet);
      return newSet;
    });
  };

  const isBookmarked = (faqId: number) => bookmarkedIds.has(faqId);

  const getBookmarkedFAQs = (allFAQs: FAQItem[]) => {
    return allFAQs.filter(faq => bookmarkedIds.has(faq.id));
  };

  return {
    toggleBookmark,
    isBookmarked,
    getBookmarkedFAQs,
    bookmarkedIds
  };
};