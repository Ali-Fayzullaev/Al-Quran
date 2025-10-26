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

// Получить список доступных изданий
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

// Получить издания по типу (translation, tafsir, transliteration)
export async function getEditionsByType(type: string): Promise<Edition[]> {
  try {
    const response = await fetch(`${BASE_URL}/edition/type/${type}`);
    if (!response.ok) throw new Error(`Failed to fetch editions of type ${type}`);
    
    const data: ApiResponse<Edition[]> = await response.json();
    return data.data;
  } catch (error) {
    console.error(`Error fetching editions of type ${type}:`, error);
    throw error;
  }
}

// Получить издания по языку
export async function getEditionsByLanguage(language: string): Promise<Edition[]> {
  try {
    const response = await fetch(`${BASE_URL}/edition/language/${language}`);
    if (!response.ok) throw new Error(`Failed to fetch editions for language ${language}`);
    
    const data: ApiResponse<Edition[]> = await response.json();
    return data.data;
  } catch (error) {
    console.error(`Error fetching editions for language ${language}:`, error);
    throw error;
  }
}

// Поиск в Коране
export async function searchQuran(query: string, surah?: number, edition: string = 'quran-uthmani'): Promise<{
  count: number;
  matches: Array<{
    number: number;
    text: string;
    edition: Edition;
    surah: ApiSurah;
    numberInSurah: number;
  }>;
}> {
  try {
    let url = `${BASE_URL}/search/${encodeURIComponent(query)}/${edition}`;
    if (surah) {
      url += `/${surah}`;
    }
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to search Quran');
    
    const data: ApiResponse<{
      count: number;
      matches: Array<{
        number: number;
        text: string;
        edition: Edition;
        surah: ApiSurah;
        numberInSurah: number;
      }>;
    }> = await response.json();
    
    return data.data;
  } catch (error) {
    console.error('Error searching Quran:', error);
    throw error;
  }
}

// Получить конкретный аят
export async function getAyah(reference: string, editions: string[] = ['quran-uthmani']): Promise<ApiVerse[]> {
  try {
    const editionString = editions.join(',');
    const response = await fetch(`${BASE_URL}/ayah/${reference}/editions/${editionString}`);
    if (!response.ok) throw new Error(`Failed to fetch ayah ${reference}`);
    
    const data: ApiResponse<ApiVerse[]> = await response.json();
    return data.data;
  } catch (error) {
    console.error(`Error fetching ayah ${reference}:`, error);
    throw error;
  }
}

// Получить случайный аят
export async function getRandomAyah(edition: string = 'quran-uthmani'): Promise<ApiVerse> {
  try {
    const response = await fetch(`${BASE_URL}/ayah/random/${edition}`);
    if (!response.ok) throw new Error('Failed to fetch random ayah');
    
    const data: ApiResponse<ApiVerse> = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching random ayah:', error);
    throw error;
  }
}

// Получить аяты в диапазоне
export async function getAyahsRange(from: string, to: string, edition: string = 'quran-uthmani'): Promise<ApiVerse[]> {
  try {
    const response = await fetch(`${BASE_URL}/ayah/${from}-${to}/${edition}`);
    if (!response.ok) throw new Error(`Failed to fetch ayahs range ${from}-${to}`);
    
    const data: ApiResponse<ApiVerse[]> = await response.json();
    return data.data;
  } catch (error) {
    console.error(`Error fetching ayahs range ${from}-${to}:`, error);
    throw error;
  }
}

// Получить информацию о месте саджда (земного поклона)
export async function getSajdas(edition: string = 'quran-uthmani'): Promise<ApiVerse[]> {
  try {
    const response = await fetch(`${BASE_URL}/sajda/${edition}`);
    if (!response.ok) throw new Error('Failed to fetch sajdas');
    
    const data: ApiResponse<ApiVerse[]> = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching sajdas:', error);
    throw error;
  }
}

// Список доступных чтецов (кари) - расширенный список
export const RECITERS = [
  { id: 'ar.alafasy', name: 'Mishary Rashid Alafasy', language: 'Arabic', country: 'Kuwait' },
  { id: 'ar.abdulbasitmurattal', name: 'Abdul Basit Abd us-Samad (Murattal)', language: 'Arabic', country: 'Egypt' },
  { id: 'ar.abdullahbasfar', name: 'Abdullah Basfar', language: 'Arabic', country: 'Saudi Arabia' },
  { id: 'ar.abdurrahmaansudais', name: 'Abdul Rahman Al-Sudais', language: 'Arabic', country: 'Saudi Arabia' },
  { id: 'ar.shaatree', name: 'Abu Bakr Ash-Shaatree', language: 'Arabic', country: 'Saudi Arabia' },
  { id: 'ar.mahermuaiqly', name: 'Maher Al Muaiqly', language: 'Arabic', country: 'Saudi Arabia' },
  { id: 'ar.husary', name: 'Mahmoud Khalil Al-Husary', language: 'Arabic', country: 'Egypt' },
  { id: 'ar.minshawi', name: 'Mohammad al Minshawi', language: 'Arabic', country: 'Egypt' },
  { id: 'ar.muhammadayyoub', name: 'Muhammad Ayyoub', language: 'Arabic', country: 'Pakistan' },
  { id: 'ar.saoodshuraym', name: 'Saood bin Ibraaheem Ash-Shuraym', language: 'Arabic', country: 'Saudi Arabia' },
  { id: 'ar.parhizgar', name: 'Mahmoud Ali Al-Banna', language: 'Arabic', country: 'Egypt' },
  { id: 'ar.tablawi', name: 'Mohammad At-Tablawi', language: 'Arabic', country: 'Egypt' },
  { id: 'ar.abdullahawadallah', name: 'Abdullah Awad Al Juhani', language: 'Arabic', country: 'Saudi Arabia' },
  { id: 'ar.hanirifai', name: 'Hani Ar-Rifai', language: 'Arabic', country: 'Saudi Arabia' },
  { id: 'ar.ibrahimakhbar', name: 'Ibrahim Al-Akhdar', language: 'Arabic', country: 'Egypt' },
];

// Расширенный список переводов
export const TRANSLATIONS = [
  // Английские переводы
  { id: 'en.sahih', name: 'Sahih International', language: 'English', type: 'translation', quality: 'high' },
  { id: 'en.asad', name: 'Muhammad Asad', language: 'English', type: 'translation', quality: 'high' },
  { id: 'en.pickthall', name: 'Mohammed Marmaduke William Pickthall', language: 'English', type: 'translation', quality: 'high' },
  { id: 'en.yusufali', name: 'Abdullah Yusuf Ali', language: 'English', type: 'translation', quality: 'high' },
  { id: 'en.hilali', name: 'Muhsin Khan & Muhammad Taqi-ud-Din', language: 'English', type: 'translation', quality: 'medium' },
  { id: 'en.arberry', name: 'Arthur John Arberry', language: 'English', type: 'translation', quality: 'medium' },
  { id: 'en.shakir', name: 'M. H. Shakir', language: 'English', type: 'translation', quality: 'medium' },
  { id: 'en.sarwar', name: 'Muhammad Sarwar', language: 'English', type: 'translation', quality: 'medium' },
  
  // Русские переводы
  { id: 'ru.kuliev', name: 'Эльмир Кулиев', language: 'Russian', type: 'translation', quality: 'high' },
  { id: 'ru.osmanov', name: 'М.-Н. О. Османов', language: 'Russian', type: 'translation', quality: 'high' },
  { id: 'ru.porokhova', name: 'В. Порохова', language: 'Russian', type: 'translation', quality: 'high' },
  { id: 'ru.muntahab', name: 'Министерство вакуфов Египта', language: 'Russian', type: 'translation', quality: 'high' },
  { id: 'ru.sablukov', name: 'Г. С. Саблуков', language: 'Russian', type: 'translation', quality: 'medium' },
  { id: 'ru.krachkovsky', name: 'И. Ю. Крачковский', language: 'Russian', type: 'translation', quality: 'medium' },
  
  // Арабский текст и тафсир
  { id: 'quran-uthmani', name: 'القرآن الكريم (Uthmani)', language: 'Arabic', type: 'quran', quality: 'original' },
  { id: 'quran-simple', name: 'القرآن الكريم (Simplified)', language: 'Arabic', type: 'quran', quality: 'original' },
  { id: 'ar.muyassar', name: 'تفسير المیسر', language: 'Arabic', type: 'tafsir', quality: 'high' },
  { id: 'ar.jalalayn', name: 'تفسير الجلالين', language: 'Arabic', type: 'tafsir', quality: 'high' },
  
  // Французские переводы
  { id: 'fr.hamidullah', name: 'Muhammad Hamidullah', language: 'French', type: 'translation', quality: 'high' },
  { id: 'fr.leclerc', name: 'André Du Ryer', language: 'French', type: 'translation', quality: 'medium' },
  
  // Немецкие переводы
  { id: 'de.bubenheim', name: 'A. S. F. Bubenheim and N. Elyas', language: 'German', type: 'translation', quality: 'high' },
  { id: 'de.khoury', name: 'Adel Theodor Khoury', language: 'German', type: 'translation', quality: 'high' },
  
  // Турецкие переводы
  { id: 'tr.ates', name: 'Süleyman Ateş', language: 'Turkish', type: 'translation', quality: 'high' },
  { id: 'tr.yuksel', name: 'Edip Yüksel', language: 'Turkish', type: 'translation', quality: 'medium' },
  { id: 'tr.ozturk', name: 'Yaşar Nuri Öztürk', language: 'Turkish', type: 'translation', quality: 'medium' },
  
  // Урду переводы
  { id: 'ur.jalandhry', name: 'Fateh Muhammad Jalandhry', language: 'Urdu', type: 'translation', quality: 'high' },
  { id: 'ur.kanzuliman', name: 'Kanzul Iman', language: 'Urdu', type: 'translation', quality: 'medium' },
  
  // Персидские переводы
  { id: 'fa.makarem', name: 'Makarem Shirazi', language: 'Persian', type: 'translation', quality: 'high' },
  { id: 'fa.ansarian', name: 'Hussain Ansarian', language: 'Persian', type: 'translation', quality: 'medium' },
  
  // Индонезийские переводы
  { id: 'id.indonesian', name: 'Indonesian Ministry of Religious Affairs', language: 'Indonesian', type: 'translation', quality: 'high' },
  
  // Малайские переводы
  { id: 'ms.basmeih', name: 'Abdullah Muhammad Basmeih', language: 'Malay', type: 'translation', quality: 'high' },
  
  // Испанские переводы
  { id: 'es.cortes', name: 'Julio Cortés', language: 'Spanish', type: 'translation', quality: 'high' },
  
  // Итальянские переводы
  { id: 'it.piccardo', name: 'Hamza Roberto Piccardo', language: 'Italian', type: 'translation', quality: 'high' },
  
  // Китайские переводы
  { id: 'zh.jian', name: '马坚 (Ma Jian)', language: 'Chinese', type: 'translation', quality: 'high' },
  
  // Японские переводы
  { id: 'ja.japanese', name: '日本ムスリム協会', language: 'Japanese', type: 'translation', quality: 'medium' },
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

// Новая улучшенная функция для получения аудио аятов с множественными источниками
export function getAyahAudioSources(surahNumber: number, ayahNumber: number, reciter: string = 'ar.alafasy'): string[] {
  const paddedSurah = surahNumber.toString().padStart(3, '0');
  const paddedAyah = ayahNumber.toString().padStart(3, '0');
  const reciterCode = reciter.replace('ar.', '');
  
  // Конвертация в формат EveryAyah
  const getEveryAyahReciterCode = (reciterId: string): string => {
    const reciterMap: Record<string, string> = {
      'ar.alafasy': 'Alafasy_128kbps',
      'ar.abdulbasitmurattal': 'Abdul_Basit_Murattal_192kbps',
      'ar.abdurrahmaansudais': 'Sudais_128kbps', 
      'ar.mahermuaiqly': 'MaherAlMuaiqly128kbps',
      'ar.husary': 'Husary_128kbps',
      'ar.minshawi': 'Minshawi_Murattal_128kbps',
      'ar.muhammadayyoub': 'Muhammad_Ayyoub_128kbps',
      'ar.saoodshuraym': 'Saood_ash-Shuraym_128kbps',
      'ar.shaatree': 'Shaatree_128kbps',
      'ar.abdullahbasfar': 'Abdullah_Basfar_192kbps'
    };
    return reciterMap[reciterId] || 'Alafasy_128kbps';
  };

  const everyAyahCode = getEveryAyahReciterCode(reciter);
  
  return [
    // EveryAyah - самый надежный источник
    `https://everyayah.com/data/${everyAyahCode}/${paddedSurah}${paddedAyah}.mp3`,
    
    // QuranCDN
    `https://audio.qurancdn.com/kh/${reciterCode}/${paddedSurah}${paddedAyah}.mp3`,
    
    // Tanzil.net
    `https://tanzil.net/res/audio/${reciterCode}/${paddedSurah}${paddedAyah}.mp3`,
    
    // Islamic Network CDN (резервный)
    `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${paddedSurah}${paddedAyah}.mp3`,
    
    // MP3Quran backup для полной суры (если аят не найден)
    `https://server8.mp3quran.net/afs/${paddedSurah}.mp3`,
    
    // GlobalQuraan
    `https://www.globalquraan.com/audio/${reciterCode}/${paddedSurah}${paddedAyah}.mp3`,
  ];
}

// Функция для проверки доступности аудио с таймаутом
export async function checkAudioAvailability(url: string, timeout: number = 5000): Promise<boolean> {
  return new Promise((resolve) => {
    const audio = new Audio();
    let isResolved = false;
    
    const cleanup = () => {
      if (!isResolved) {
        isResolved = true;
        audio.src = '';
        audio.removeEventListener('canplaythrough', onSuccess);
        audio.removeEventListener('error', onError);
      }
    };
    
    const onSuccess = () => {
      cleanup();
      resolve(true);
    };
    
    const onError = () => {
      cleanup();
      resolve(false);
    };
    
    // Устанавливаем таймаут
    setTimeout(() => {
      if (!isResolved) {
        cleanup();
        resolve(false);
      }
    }, timeout);
    
    audio.addEventListener('canplaythrough', onSuccess);
    audio.addEventListener('error', onError);
    
    try {
      audio.src = url;
    } catch (error) {
      cleanup();
      resolve(false);
    }
  });
}

// Улучшенная функция для получения работающего аудио URL
export async function getWorkingAudioUrl(surahNumber: number, ayahNumber?: number, reciter: string = 'ar.alafasy'): Promise<string> {
  if (ayahNumber) {
    // Для конкретного аята
    const sources = getAyahAudioSources(surahNumber, ayahNumber, reciter);
    
    // Пытаемся найти работающий источник
    for (const url of sources) {
      const isAvailable = await checkAudioAvailability(url, 3000);
      if (isAvailable) {
        console.log('Found working audio source:', url);
        return url;
      }
    }
    
    // Если ничего не найдено, возвращаем первый источник как fallback
    console.warn('No working audio sources found, using fallback');
    return sources[0];
    
  } else {
    // Для всей суры - пробуем разные серверы
    const surahSources = [
      getAudioUrl(surahNumber, reciter),
      `https://download.quranicaudio.com/quran/${reciter.replace('ar.', '')}/${surahNumber.toString().padStart(3, '0')}.mp3`,
      `https://server8.mp3quran.net/afs/${surahNumber.toString().padStart(3, '0')}.mp3`, // fallback to Alafasy
    ];
    
    for (const url of surahSources) {
      const isAvailable = await checkAudioAvailability(url, 3000);
      if (isAvailable) {
        return url;
      }
    }
    
    return surahSources[0]; // fallback
  }
}

// Функция для предзагрузки аудио
export async function preloadAudio(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.preload = 'metadata';
    
    audio.onloadedmetadata = () => {
      resolve(true);
    };
    
    audio.onerror = () => {
      resolve(false);
    };
    
    setTimeout(() => resolve(false), 10000); // 10 секунд таймаут
    
    audio.src = url;
  });
}

// Функция для получения информации об аудио файле
export async function getAudioInfo(url: string): Promise<{duration: number, canPlay: boolean}> {
  return new Promise((resolve) => {
    const audio = new Audio();
    
    audio.onloadedmetadata = () => {
      resolve({
        duration: audio.duration || 0,
        canPlay: true
      });
    };
    
    audio.onerror = () => {
      resolve({
        duration: 0,
        canPlay: false
      });
    };
    
    setTimeout(() => {
      resolve({
        duration: 0,
        canPlay: false
      });
    }, 5000);
    
    audio.src = url;
  });
}

// Кэш для аудио источников
const audioSourceCache = new Map<string, string>();

// Функция с кэшированием для быстрого доступа к работающим источникам
export async function getCachedWorkingAudioUrl(surahNumber: number, ayahNumber?: number, reciter: string = 'ar.alafasy'): Promise<string> {
  const cacheKey = `${reciter}-${surahNumber}-${ayahNumber || 'full'}`;
  
  // Проверяем кэш
  if (audioSourceCache.has(cacheKey)) {
    const cachedUrl = audioSourceCache.get(cacheKey)!;
    // Проверяем, что кэшированный URL все еще работает
    const isStillWorking = await checkAudioAvailability(cachedUrl, 2000);
    if (isStillWorking) {
      return cachedUrl;
    } else {
      audioSourceCache.delete(cacheKey);
    }
  }
  
  // Получаем новый рабочий URL
  const workingUrl = await getWorkingAudioUrl(surahNumber, ayahNumber, reciter);
  
  // Сохраняем в кэш
  audioSourceCache.set(cacheKey, workingUrl);
  
  return workingUrl;
}

// Функция для получения качественного перевода по языку
export function getTranslationsByLanguage(language: string): typeof TRANSLATIONS {
  return TRANSLATIONS.filter(t => t.language.toLowerCase() === language.toLowerCase())
                   .sort((a, b) => {
                     const qualityOrder = { 'original': 0, 'high': 1, 'medium': 2, 'low': 3 };
                     return (qualityOrder[a.quality as keyof typeof qualityOrder] || 3) - 
                            (qualityOrder[b.quality as keyof typeof qualityOrder] || 3);
                   });
}

// Функция для получения рекомендуемых переводов
export function getRecommendedTranslations(userLanguage: string = 'en'): typeof TRANSLATIONS {
  const recommended = [];
  
  // Всегда добавляем арабский оригинал
  recommended.push(TRANSLATIONS.find(t => t.id === 'quran-uthmani')!);
  
  // Добавляем лучший перевод на языке пользователя
  const userLangTranslations = getTranslationsByLanguage(userLanguage);
  if (userLangTranslations.length > 0) {
    recommended.push(userLangTranslations[0]);
  }
  
  // Добавляем популярные английские переводы если язык не английский
  if (userLanguage !== 'English' && userLanguage !== 'en') {
    recommended.push(TRANSLATIONS.find(t => t.id === 'en.sahih')!);
  }
  
  return recommended.filter(Boolean);
}