// types/faq.ts
export interface FAQItem {
  id: number;
  question: string;
  answer: string;
  short_answer: string;
  source: string;
  tags: string[];
  type: "qa";
}

export interface FAQSearchFilters {
  searchTerm: string;
  selectedTags: string[];
  sortBy: 'id' | 'question' | 'relevance';
  sortOrder: 'asc' | 'desc';
  showOnlyBookmarked: boolean;
}