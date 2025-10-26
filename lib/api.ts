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

// Список доступных чтецов (кари)
export const RECITERS = [
  { id: 'ar.alafasy', name: 'Mishary Rashid Alafasy', language: 'Arabic' },
  { id: 'ar.abdulbasitmurattal', name: 'Abdul Basit Abd us-Samad (Murattal)', language: 'Arabic' },
  { id: 'ar.abdullahbasfar', name: 'Abdullah Basfar', language: 'Arabic' },
  { id: 'ar.abdurrahmaansudais', name: 'Abdul Rahman Al-Sudais', language: 'Arabic' },
  { id: 'ar.shaatree', name: 'Abu Bakr Ash-Shaatree', language: 'Arabic' },
  { id: 'ar.mahermuaiqly', name: 'Maher Al Muaiqly', language: 'Arabic' },
  { id: 'ar.husary', name: 'Mahmoud Khalil Al-Husary', language: 'Arabic' },
  { id: 'ar.minshawi', name: 'Mohammad al Minshawi', language: 'Arabic' },
  { id: 'ar.muhammadayyoub', name: 'Muhammad Ayyoub', language: 'Arabic' },
  { id: 'ar.saoodshuraym', name: 'Saood bin Ibraaheem Ash-Shuraym', language: 'Arabic' }
];

// Список популярных переводов
export const TRANSLATIONS = [
  // Английские переводы
  { id: 'en.sahih', name: 'Sahih International', language: 'English', type: 'translation' },
  { id: 'en.asad', name: 'Muhammad Asad', language: 'English', type: 'translation' },
  { id: 'en.pickthall', name: 'Mohammed Marmaduke William Pickthall', language: 'English', type: 'translation' },
  { id: 'en.yusufali', name: 'Abdullah Yusuf Ali', language: 'English', type: 'translation' },
  { id: 'en.hilali', name: 'Muhsin Khan', language: 'English', type: 'translation' },
  
  // Русские переводы
  { id: 'ru.kuliev', name: 'Эльмир Кулиев', language: 'Russian', type: 'translation' },
  { id: 'ru.osmanov', name: 'М.-Н. О. Османов', language: 'Russian', type: 'translation' },
  { id: 'ru.porokhova', name: 'В. Порохова', language: 'Russian', type: 'translation' },
  
  // Арабский текст
  { id: 'quran-uthmani', name: 'القرآن الكريم', language: 'Arabic', type: 'quran' },
  { id: 'ar.muyassar', name: 'تفسير المیسر', language: 'Arabic', type: 'tafsir' },
  
  // Другие языки
  { id: 'fr.hamidullah', name: 'Muhammad Hamidullah', language: 'French', type: 'translation' },
  { id: 'de.bubenheim', name: 'A. S. F. Bubenheim and N. Elyas', language: 'German', type: 'translation' },
  { id: 'tr.ates', name: 'Süleyman Ateş', language: 'Turkish', type: 'translation' },
  { id: 'ur.jalandhry', name: 'Fateh Muhammad Jalandhry', language: 'Urdu', type: 'translation' }
];

// Исправленная функция для получения аудио суры
export function getAudioUrl(surahNumber: number, reciter: string = 'ar.alafasy'): string {
  const paddedSurah = surahNumber.toString().padStart(3, '0');
  
  // Используем правильный URL для аудио сур
  switch (reciter) {
    case 'ar.alafasy':
      return `https://server8.mp3quran.net/afs/${paddedSurah}.mp3`;
    case 'ar.abdulbasitmurattal':
      return `https://server7.mp3quran.net/basit/${paddedSurah}.mp3`;
    case 'ar.abdurrahmaansudais':
      return `https://server11.mp3quran.net/sds/${paddedSurah}.mp3`;
    case 'ar.mahermuaiqly':
      return `https://server12.mp3quran.net/maher/${paddedSurah}.mp3`;
    case 'ar.husary':
      return `https://server6.mp3quran.net/husary/${paddedSurah}.mp3`;
    case 'ar.minshawi':
      return `https://server10.mp3quran.net/minsh/${paddedSurah}.mp3`;
    default:
      return `https://server8.mp3quran.net/afs/${paddedSurah}.mp3`;
  }
}

// Исправленная функция для получения аудио аята с более надежными URL
export function getAyahAudioUrl(surahNumber: number, ayahNumber: number, reciter: string = 'ar.alafasy'): string {
  const paddedSurah = surahNumber.toString().padStart(3, '0');
  const paddedAyah = ayahNumber.toString().padStart(3, '0');
  
  // Используем более надежные аудио источники
  switch (reciter) {
    case 'ar.alafasy':
      return `https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${paddedSurah}${paddedAyah}.mp3`;
    case 'ar.abdulbasitmurattal':
      return `https://cdn.islamic.network/quran/audio-surah/128/ar.abdulbasitmurattal/${paddedSurah}${paddedAyah}.mp3`;
    case 'ar.abdurrahmaansudais':
      return `https://cdn.islamic.network/quran/audio-surah/128/ar.abdurrahmaansudais/${paddedSurah}${paddedAyah}.mp3`;
    case 'ar.mahermuaiqly':
      return `https://cdn.islamic.network/quran/audio-surah/128/ar.mahermuaiqly/${paddedSurah}${paddedAyah}.mp3`;
    case 'ar.husary':
      return `https://cdn.islamic.network/quran/audio-surah/128/ar.husary/${paddedSurah}${paddedAyah}.mp3`;
    case 'ar.minshawi':
      return `https://cdn.islamic.network/quran/audio-surah/128/ar.minshawi/${paddedSurah}${paddedAyah}.mp3`;
    case 'ar.muhammadayyoub':
      return `https://cdn.islamic.network/quran/audio-surah/128/ar.muhammadayyoub/${paddedSurah}${paddedAyah}.mp3`;
    case 'ar.saoodshuraym':
      return `https://cdn.islamic.network/quran/audio-surah/128/ar.saoodshuraym/${paddedSurah}${paddedAyah}.mp3`;
    default:
      return `https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${paddedSurah}${paddedAyah}.mp3`;
  }
}

// Функция для проверки доступности аудио
export async function checkAudioAvailability(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

// Получить альтернативные аудио URL если основной не работает
export async function getWorkingAudioUrl(surahNumber: number, ayahNumber?: number, reciter: string = 'ar.alafasy'): Promise<string> {
  const urls = [];
  
  if (ayahNumber) {
    // Для конкретного аята - используем разные источники
    urls.push(getAyahAudioUrl(surahNumber, ayahNumber, reciter));
    
    // Резервные URL с разными форматами
    const paddedSurah = surahNumber.toString().padStart(3, '0');
    const paddedAyah = ayahNumber.toString().padStart(3, '0');
    
    // Everyayah.com - очень надежный источник
    const everyAyahReciter = reciter.replace('ar.', '');
    urls.push(`https://everyayah.com/data/${everyAyahReciter}/${paddedSurah}${paddedAyah}.mp3`);
    
    // QuranCDN
    urls.push(`https://audio.qurancdn.com/${reciter.replace('ar.', '')}/${paddedSurah}${paddedAyah}.mp3`);
    
    // Fallback to default reciter if current doesn't work
    if (reciter !== 'ar.alafasy') {
      urls.push(`https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${paddedSurah}${paddedAyah}.mp3`);
      urls.push(`https://everyayah.com/data/Alafasy_128kbps/${paddedSurah}${paddedAyah}.mp3`);
    }
  } else {
    // Для всей суры
    urls.push(getAudioUrl(surahNumber, reciter));
    const paddedSurah = surahNumber.toString().padStart(3, '0');
    urls.push(`https://download.quranicaudio.com/quran/${reciter.replace('ar.', '')}/${paddedSurah}.mp3`);
  }
  
  // Возвращаем первый URL (можно добавить проверку доступности)
  return urls[0];
}