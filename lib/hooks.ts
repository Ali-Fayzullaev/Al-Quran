import { useQuery, useQueries } from '@tanstack/react-query';
import {
  getSurahs,
  getSurah,
  getSurahMultipleEditions,
  getJuz,
  getPage,
  searchQuran,
  getAyah,
  getEditions,
  getRandomAyah,
  ApiSurah,
  ApiVerse,
  Edition
} from './api';

// Query keys
export const QUERY_KEYS = {
  surahs: ['surahs'] as const,
  surah: (id: number, edition: string) => ['surah', id, edition] as const,
  surahMultiple: (id: number, editions: string[]) => ['surah-multiple', id, editions] as const,
  juz: (id: number, edition: string) => ['juz', id, edition] as const,
  page: (id: number, edition: string) => ['page', id, edition] as const,
  search: (query: string, surah?: number) => ['search', query, surah] as const,
  ayah: (id: number, edition: string) => ['ayah', id, edition] as const,
  editions: ['editions'] as const,
  randomAyah: (edition: string) => ['random-ayah', edition] as const,
};

// Получить все суры
export function useSurahs() {
  return useQuery({
    queryKey: QUERY_KEYS.surahs,
    queryFn: getSurahs,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours (surah list doesn't change)
  });
}

// Получить конкретную суру
export function useSurah(surahNumber: number, edition: string = 'quran-uthmani') {
  return useQuery({
    queryKey: QUERY_KEYS.surah(surahNumber, edition),
    queryFn: () => getSurah(surahNumber, edition),
    enabled: surahNumber > 0 && surahNumber <= 114,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

// Хук для получения суры с множественными переводами
export function useSurahMultipleEditions(surahNumber: number, editions: string[]) {
  return useQuery({
    queryKey: ['surah', surahNumber, 'multiple', editions.sort().join(',')],
    queryFn: () => getSurahMultipleEditions(surahNumber, editions),
    enabled: !!surahNumber && editions.length > 0,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Получить джуз
export function useJuz(juzNumber: number, edition: string = 'quran-uthmani') {
  return useQuery({
    queryKey: QUERY_KEYS.juz(juzNumber, edition),
    queryFn: () => getJuz(juzNumber, edition),
    enabled: juzNumber > 0 && juzNumber <= 30,
    staleTime: 30 * 60 * 1000,
  });
}

// Получить страницу
export function usePage(pageNumber: number, edition: string = 'quran-uthmani') {
  return useQuery({
    queryKey: QUERY_KEYS.page(pageNumber, edition),
    queryFn: () => getPage(pageNumber, edition),
    enabled: pageNumber > 0 && pageNumber <= 604,
    staleTime: 30 * 60 * 1000,
  });
}

// Поиск
export function useSearchQuran(query: string, surah?: number) {
  return useQuery({
    queryKey: QUERY_KEYS.search(query, surah),
    queryFn: () => searchQuran(query, surah),
    enabled: query.length >= 2,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Получить аят
export function useAyah(ayahNumber: number, edition: string = 'quran-uthmani') {
  return useQuery({
    queryKey: QUERY_KEYS.ayah(ayahNumber, edition),
    queryFn: () => getAyah(ayahNumber.toString(), [edition]),
    enabled: ayahNumber > 0 && ayahNumber <= 6236,
    staleTime: 30 * 60 * 1000,
  });
}

// Получить доступные издания
export function useEditions() {
  return useQuery({
    queryKey: QUERY_KEYS.editions,
    queryFn: getEditions,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}

// Получить случайный аят дня
export function useRandomAyah(edition: string = 'en.asad') {
  return useQuery({
    queryKey: QUERY_KEYS.randomAyah(edition),
    queryFn: () => getRandomAyah(edition),
    staleTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false,
  });
}

// Получить множественные суры одновременно
export function useMultipleSurahs(surahNumbers: number[], edition: string = 'quran-uthmani') {
  return useQueries({
    queries: surahNumbers.map(number => ({
      queryKey: QUERY_KEYS.surah(number, edition),
      queryFn: () => getSurah(number, edition),
      enabled: number > 0 && number <= 114,
      staleTime: 30 * 60 * 1000,
    })),
  });
}

// Получить популярные суры (предопределенный список)
export function usePopularSurahs(edition: string = 'quran-uthmani') {
  const popularSurahNumbers = [1, 2, 18, 36, 55, 67, 112, 113, 114]; // Al-Fatiha, Al-Baqarah, Al-Kahf, Ya-Sin, Ar-Rahman, Al-Mulk, Al-Ikhlas, Al-Falaq, An-Nas
  
  return useMultipleSurahs(popularSurahNumbers, edition);
}