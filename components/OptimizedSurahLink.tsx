"use client";

import Link from 'next/link';
import { ReactNode, MouseEvent } from 'react';
import { usePrefetchSurah } from '@/lib/usePrefetch';
import { useQuranStore } from '@/lib/store';

interface OptimizedSurahLinkProps {
  surahNumber: number;
  href?: string;
  children: ReactNode;
  className?: string;
  verse?: number;
  prefetchNeighbors?: boolean;
}

/**
 * Оптимизированная ссылка на суру с предзагрузкой данных при наведении
 */
export function OptimizedSurahLink({ 
  surahNumber, 
  href, 
  children, 
  className, 
  verse,
  prefetchNeighbors = false 
}: OptimizedSurahLinkProps) {
  const { prefetchSurah } = usePrefetchSurah();
  const { selectedTranslations, showTranslation } = useQuranStore();

  // Формируем URL
  const linkHref = href || `/surah/${surahNumber}${verse ? `?verse=${verse}` : ''}`;

  // Определяем, какие переводы предзагружать
  const getEditionsToPreload = () => {
    const baseEdition = 'quran-uthmani';
    if (!showTranslation) return [baseEdition];
    
    const translationsToLoad = selectedTranslations.filter(t => t !== baseEdition);
    return [baseEdition, ...translationsToLoad];
  };

  const handleMouseEnter = () => {
    // Предзагружаем данные суры при наведении
    const editions = getEditionsToPreload();
    prefetchSurah(surahNumber, editions);

    // Опционально предзагружаем соседние суры
    if (prefetchNeighbors) {
      if (surahNumber > 1) {
        prefetchSurah(surahNumber - 1, editions);
      }
      if (surahNumber < 114) {
        prefetchSurah(surahNumber + 1, editions);
      }
    }
  };

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    // Показываем индикатор загрузки при клике
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-green-500 z-[9999] animate-pulse';
    document.body.appendChild(loadingIndicator);

    // Убираем индикатор через некоторое время
    setTimeout(() => {
      loadingIndicator.remove();
    }, 2000);
  };

  return (
    <Link
      href={linkHref}
      className={className}
      onMouseEnter={handleMouseEnter}
      onClick={handleClick}
      prefetch={true} // Включаем встроенную предзагрузку Next.js
    >
      {children}
    </Link>
  );
}

export default OptimizedSurahLink;