// lib/faqJsonLd.ts
import type { FAQItem } from '@/types/faq';

export const generateFAQJsonLd = (faqItems: FAQItem[]) => {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqItems.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer,
        "author": {
          "@type": "Organization",
          "name": "Al-Quran Islamic Learning Platform"
        }
      }
    }))
  };

  return JSON.stringify(faqSchema, null, 2);
};