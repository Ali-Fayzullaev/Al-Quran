const BASE_URL = 'https://api.alquran.cloud/v1';

export interface ApiVerse {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda?: {
    id: number;
    recommended: boolean;
    obligatory: boolean;
  };
}

export interface ApiSurah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
  ayahs?: ApiVerse[];
}

export interface ApiResponse<T> {
  code: number;
  status: string;
  data: T;
}

export interface Edition {
  identifier: string;
  language: string;
  name: string;
  englishName: string;
  format: string;
  type: string;
  direction?: string;
}

// Получить список всех сур
export async function getSurahs(): Promise<ApiSurah[]> {
  try {
    const response = await fetch(`${BASE_URL}/surah`);
    if (!response.ok) throw new Error('Failed to fetch surahs');
    
    const data: ApiResponse<ApiSurah[]> = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching surahs:', error);
    throw error;
  }
}

// Получить конкретную суру с аятами
export async function getSurah(surahNumber: number, edition: string = 'quran-uthmani'): Promise<ApiSurah> {
  try {
    const response = await fetch(`${BASE_URL}/surah/${surahNumber}/${edition}`);
    if (!response.ok) throw new Error(`Failed to fetch surah ${surahNumber}`);
    
    const data: ApiResponse<ApiSurah> = await response.json();
    return data.data;
  } catch (error) {
    console.error(`Error fetching surah ${surahNumber}:`, error);
    throw error;
  }
}

// Получить множественные переводы для суры
export async function getSurahMultipleEditions(surahNumber: number, editions: string[]): Promise<ApiSurah[]> {
  try {
    const editionString = editions.join(',');
    const response = await fetch(`${BASE_URL}/surah/${surahNumber}/editions/${editionString}`);
    if (!response.ok) throw new Error(`Failed to fetch surah ${surahNumber} with multiple editions`);
    
    const data: ApiResponse<ApiSurah[]> = await response.json();
    return data.data;
  } catch (error) {
    console.error(`Error fetching surah ${surahNumber} with multiple editions:`, error);
    throw error;
  }
}

// Получить джуз
export async function getJuz(juzNumber: number, edition: string = 'quran-uthmani'): Promise<{ ayahs: ApiVerse[]; surahs: Record<number, ApiSurah> }> {
  try {
    const response = await fetch(`${BASE_URL}/juz/${juzNumber}/${edition}`);
    if (!response.ok) throw new Error(`Failed to fetch juz ${juzNumber}`);
    
    const data: ApiResponse<{ ayahs: ApiVerse[]; surahs: Record<number, ApiSurah> }> = await response.json();
    return data.data;
  } catch (error) {
    console.error(`Error fetching juz ${juzNumber}:`, error);
    throw error;
  }
}

// Получить страницу Корана
export async function getPage(pageNumber: number, edition: string = 'quran-uthmani'): Promise<{ ayahs: ApiVerse[]; surahs: Record<number, ApiSurah> }> {
  try {
    const response = await fetch(`${BASE_URL}/page/${pageNumber}/${edition}`);
    if (!response.ok) throw new Error(`Failed to fetch page ${pageNumber}`);
    
    const data: ApiResponse<{ ayahs: ApiVerse[]; surahs: Record<number, ApiSurah> }> = await response.json();
    return data.data;
  } catch (error) {
    console.error(`Error fetching page ${pageNumber}:`, error);
    throw error;
  }
}

// Поиск в Коране
export async function searchQuran(query: string, surah?: number): Promise<{ ayahs: ApiVerse[]; matches: number }> {
  try {
    let url = `${BASE_URL}/search/${encodeURIComponent(query)}/all/en`;
    if (surah) {
      url = `${BASE_URL}/search/${encodeURIComponent(query)}/${surah}/en`;
    }
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to search Quran');
    
    const data: ApiResponse<{ ayahs: ApiVerse[]; matches: number }> = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error searching Quran:', error);
    throw error;
  }
}

// Получить конкретный аят
export async function getAyah(ayahNumber: number, edition: string = 'quran-uthmani'): Promise<ApiVerse> {
  try {
    const response = await fetch(`${BASE_URL}/ayah/${ayahNumber}/${edition}`);
    if (!response.ok) throw new Error(`Failed to fetch ayah ${ayahNumber}`);
    
    const data: ApiResponse<ApiVerse> = await response.json();
    return data.data;
  } catch (error) {
    console.error(`Error fetching ayah ${ayahNumber}:`, error);
    throw error;
  }
}

// Получить доступные издания (переводы)
export async function getEditions(): Promise<Edition[]> {
  try {
    const response = await fetch(`${BASE_URL}/edition`);
    if (!response.ok) throw new Error('Failed to fetch editions');
    
    const data: ApiResponse<Edition[]> = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching editions:', error);
    throw error;
  }
}

// Получить случайный аят дня
export async function getRandomAyah(edition: string = 'en.asad'): Promise<ApiVerse> {
  try {
    const response = await fetch(`${BASE_URL}/ayah/${Math.floor(Math.random() * 6236) + 1}/${edition}`);
    if (!response.ok) throw new Error('Failed to fetch random ayah');
    
    const data: ApiResponse<ApiVerse> = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching random ayah:', error);
    throw error;
  }
}

// Получить аудио для суры
export function getAudioUrl(surahNumber: number, reciter: string = 'ar.alafasy'): string {
  const paddedSurah = surahNumber.toString().padStart(3, '0');
  return `https://cdn.islamic.network/quran/audio-surah/${reciter}/${paddedSurah}.mp3`;
}

// Получить аудио для конкретного аята
export function getAyahAudioUrl(ayahNumber: number, reciter: string = 'ar.alafasy'): string {
  const paddedAyah = ayahNumber.toString().padStart(6, '0');
  return `https://cdn.islamic.network/quran/audio/${reciter}/${paddedAyah}.mp3`;
}