import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { getSurah, getSurahMultipleEditions } from './api';
import { QUERY_KEYS } from './hooks';

/**
 * Хук для предзагрузки данных суры при наведении на ссылку
 */
export function usePrefetchSurah() {
  const queryClient = useQueryClient();

  const prefetchSurah = useCallback(async (surahNumber: number, editions: string[] = ['quran-uthmani']) => {
    // Проверяем, есть ли уже данные в кеше
    const hasBasicData = queryClient.getQueryData(QUERY_KEYS.surah(surahNumber, 'quran-uthmani'));
    const hasMultipleData = queryClient.getQueryData(QUERY_KEYS.surahMultiple(surahNumber, editions));

    // Если данных нет, предзагружаем их
    if (!hasBasicData) {
      queryClient.prefetchQuery({
        queryKey: QUERY_KEYS.surah(surahNumber, 'quran-uthmani'),
        queryFn: () => getSurah(surahNumber, 'quran-uthmani'),
        staleTime: 10 * 60 * 1000, // 10 минут
      });
    }

    if (!hasMultipleData && editions.length > 1) {
      queryClient.prefetchQuery({
        queryKey: QUERY_KEYS.surahMultiple(surahNumber, editions),
        queryFn: () => getSurahMultipleEditions(surahNumber, editions),
        staleTime: 10 * 60 * 1000, // 10 минут
      });
    }
  }, [queryClient]);

  return { prefetchSurah };
}

/**
 * Хук для предзагрузки соседних сур (предыдущая и следующая)
 */
export function usePrefetchNeighborSurahs() {
  const { prefetchSurah } = usePrefetchSurah();

  const prefetchNeighbors = useCallback((currentSurahNumber: number, editions: string[] = ['quran-uthmani']) => {
    // Предзагружаем предыдущую суру
    if (currentSurahNumber > 1) {
      prefetchSurah(currentSurahNumber - 1, editions);
    }
    
    // Предзагружаем следующую суру
    if (currentSurahNumber < 114) {
      prefetchSurah(currentSurahNumber + 1, editions);
    }
  }, [prefetchSurah]);

  return { prefetchNeighbors };
}