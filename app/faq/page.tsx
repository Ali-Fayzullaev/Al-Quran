// app/faq/page.tsx
"use client";

import React from 'react';
import Head from 'next/head';
import { useLocale } from '@/context/LocaleContext';
import FAQPage from '@/components/faq/FAQPage';

export default function FAQ() {
  const { locale, t } = useLocale();

  const metaTitle = `${t('faqSection.title')} | ${t('title')}`;
  const metaDescription = t('faqSection.description');

  return (
    <>
      <Head>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <meta name="keywords" content="Ислам, вопросы, ответы, FAQ, религия, Коран, мусульмане" />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:description" content={metaDescription} />
        <link rel="canonical" href={`https://your-domain.com/${locale}/faq`} />
      </Head>
      <FAQPage />
    </>
  );
}