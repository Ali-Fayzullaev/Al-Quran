const BASE_URL = "https://api.alquran.cloud/v1";

// Кеш для API запросов
const apiCache = new Map<string, { data: any; timestamp: number; ttl: number }>();

// Функция для получения из кеша
function getCachedData(key: string) {
  const cached = apiCache.get(key);
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data;
  }
  return null;
}

// Функция для сохранения в кеш
function setCachedData(key: string, data: any, ttl: number = 10 * 60 * 1000) {
  apiCache.set(key, {
    data,
    timestamp: Date.now(),
    ttl
  });
}

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
  const cacheKey = 'surahs';
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch(`${BASE_URL}/surah`);
    if (!response.ok) throw new Error("Failed to fetch surahs");

    const data: ApiResponse<ApiSurah[]> = await response.json();
    setCachedData(cacheKey, data.data, 24 * 60 * 60 * 1000); // 24 часа
    return data.data;
  } catch (error) {
    console.error("Error fetching surahs:", error);
    throw error;
  }
}

// Получить конкретную суру с аятами
export async function getSurah(
  surahNumber: number,
  edition: string = "quran-uthmani"
): Promise<ApiSurah> {
  const cacheKey = `surah-${surahNumber}-${edition}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch(`${BASE_URL}/surah/${surahNumber}/${edition}`);
    if (!response.ok) throw new Error(`Failed to fetch surah ${surahNumber}`);

    const data: ApiResponse<ApiSurah> = await response.json();
    setCachedData(cacheKey, data.data, 10 * 60 * 1000); // 10 минут
    return data.data;
  } catch (error) {
    console.error(`Error fetching surah ${surahNumber}:`, error);
    throw error;
  }
}

// Получить множественные переводы для суры
export async function getSurahMultipleEditions(
  surahNumber: number,
  editions: string[]
): Promise<ApiSurah[]> {
  const editionString = editions.join(",");
  const cacheKey = `surah-multiple-${surahNumber}-${editionString}`;
  const cached = getCachedData(cacheKey);
  if (cached) {
    console.log(`getSurahMultipleEditions: Using cached data for surah ${surahNumber}`);
    return cached;
  }

  try {
    const url = `${BASE_URL}/surah/${surahNumber}/editions/${editionString}`;
    console.log(`getSurahMultipleEditions: Fetching from URL: ${url}`);
    
    const response = await fetch(url);
    
    console.log(`getSurahMultipleEditions: Response status: ${response.status}`);
    
    if (!response.ok) {
      throw new Error(
        `Failed to fetch surah ${surahNumber} with multiple editions. Status: ${response.status}`
      );
    }

    const data: ApiResponse<ApiSurah[]> = await response.json();
    console.log(`getSurahMultipleEditions: Success! Got ${data.data?.length} editions`);
    
    setCachedData(cacheKey, data.data, 10 * 60 * 1000); // 10 минут
    return data.data;
  } catch (error) {
    console.error(
      `Error fetching surah ${surahNumber} with multiple editions:`,
      error
    );
    throw error;
  }
}

// Получить джуз
export async function getJuz(
  juzNumber: number,
  edition: string = "quran-uthmani"
): Promise<{ ayahs: ApiVerse[]; surahs: Record<number, ApiSurah> }> {
  try {
    const response = await fetch(`${BASE_URL}/juz/${juzNumber}/${edition}`);
    if (!response.ok) throw new Error(`Failed to fetch juz ${juzNumber}`);

    const data: ApiResponse<{
      ayahs: ApiVerse[];
      surahs: Record<number, ApiSurah>;
    }> = await response.json();
    return data.data;
  } catch (error) {
    console.error(`Error fetching juz ${juzNumber}:`, error);
    throw error;
  }
}

// Получить страницу Корана
export async function getPage(
  pageNumber: number,
  edition: string = "quran-uthmani"
): Promise<{ ayahs: ApiVerse[]; surahs: Record<number, ApiSurah> }> {
  try {
    const response = await fetch(`${BASE_URL}/page/${pageNumber}/${edition}`);
    if (!response.ok) throw new Error(`Failed to fetch page ${pageNumber}`);

    const data: ApiResponse<{
      ayahs: ApiVerse[];
      surahs: Record<number, ApiSurah>;
    }> = await response.json();
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
    if (!response.ok) throw new Error("Failed to fetch editions");

    const data: ApiResponse<Edition[]> = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching editions:", error);
    throw error;
  }
}

// Получить издания по типу (translation, tafsir, transliteration)
export async function getEditionsByType(type: string): Promise<Edition[]> {
  try {
    const response = await fetch(`${BASE_URL}/edition/type/${type}`);
    if (!response.ok)
      throw new Error(`Failed to fetch editions of type ${type}`);

    const data: ApiResponse<Edition[]> = await response.json();
    return data.data;
  } catch (error) {
    console.error(`Error fetching editions of type ${type}:`, error);
    throw error;
  }
}

// Получить издания по языку
export async function getEditionsByLanguage(
  language: string
): Promise<Edition[]> {
  try {
    const response = await fetch(`${BASE_URL}/edition/language/${language}`);
    if (!response.ok)
      throw new Error(`Failed to fetch editions for language ${language}`);

    const data: ApiResponse<Edition[]> = await response.json();
    return data.data;
  } catch (error) {
    console.error(`Error fetching editions for language ${language}:`, error);
    throw error;
  }
}

// Поиск в Коране
export async function searchQuran(
  query: string,
  surah?: number,
  edition: string = "quran-uthmani"
): Promise<{
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
    if (!response.ok) throw new Error("Failed to search Quran");

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
    console.error("Error searching Quran:", error);
    throw error;
  }
}

// Получить конкретный аят
export async function getAyah(
  reference: string,
  editions: string[] = ["quran-uthmani"]
): Promise<ApiVerse[]> {
  try {
    const editionString = editions.join(",");
    const response = await fetch(
      `${BASE_URL}/ayah/${reference}/editions/${editionString}`
    );
    if (!response.ok) throw new Error(`Failed to fetch ayah ${reference}`);

    const data: ApiResponse<ApiVerse[]> = await response.json();
    return data.data;
  } catch (error) {
    console.error(`Error fetching ayah ${reference}:`, error);
    throw error;
  }
}

// Получить случайный аят
export async function getRandomAyah(
  edition: string = "quran-uthmani"
): Promise<ApiVerse> {
  try {
    const response = await fetch(`${BASE_URL}/ayah/random/${edition}`);
    if (!response.ok) throw new Error("Failed to fetch random ayah");

    const data: ApiResponse<ApiVerse> = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching random ayah:", error);
    throw error;
  }
}

// Получить аяты в диапазоне из суры
export async function getAyahsRange(
  surah: string,
  fromAyah: string,
  toAyah: string,
  edition: string = "quran-uthmani"
): Promise<ApiVerse[]> {
  try {
    // Строим запрос для получения аятов из суры
    const surahNum = parseInt(surah);
    const fromAyahNum = parseInt(fromAyah);
    const toAyahNum = parseInt(toAyah);
    
    // Получаем суру целиком и фильтруем нужные аяты
    const response = await fetch(`${BASE_URL}/surah/${surahNum}/${edition}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch surah ${surah}`);
    }

    const data: ApiResponse<{ ayahs: ApiVerse[] }> = await response.json();
    
    // Фильтруем аяты в нужном диапазоне
    const filteredAyahs = data.data.ayahs.filter(ayah => 
      ayah.numberInSurah >= fromAyahNum && ayah.numberInSurah <= toAyahNum
    );
    
    return filteredAyahs;
  } catch (error) {
    console.error(`Error fetching ayahs range ${surah}:${fromAyah}-${toAyah}:`, error);
    throw error;
  }
}

// Получить информацию о месте саджда (земного поклона)
export async function getSajdas(
  edition: string = "quran-uthmani"
): Promise<ApiVerse[]> {
  try {
    const response = await fetch(`${BASE_URL}/sajda/${edition}`);
    if (!response.ok) throw new Error("Failed to fetch sajdas");

    const data: ApiResponse<ApiVerse[]> = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching sajdas:", error);
    throw error;
  }
}

// Список доступных чтецов (кари) - расширенный список
export const RECITERS = [
  {
    id: "ar.husary",
    name: "Mahmoud Khalil Al-Husary",
    language: "Arabic",
    country: "Egypt",
  },
  {
    id: "ar.alafasy",
    name: "Mishary Rashid Alafasy",
    language: "Arabic",
    country: "Kuwait",
  },
  {
    id: "ar.abdulbasitmurattal",
    name: "Abdul Basit Abd us-Samad (Murattal)",
    language: "Arabic",
    country: "Egypt",
  },
  {
    id: "ar.abdullahbasfar",
    name: "Abdullah Basfar",
    language: "Arabic",
    country: "Saudi Arabia",
  },
  {
    id: "ar.abdurrahmaansudais",
    name: "Abdul Rahman Al-Sudais",
    language: "Arabic",
    country: "Saudi Arabia",
  },
  {
    id: "ar.shaatree",
    name: "Abu Bakr Ash-Shaatree",
    language: "Arabic",
    country: "Saudi Arabia",
  },
  {
    id: "ar.mahermuaiqly",
    name: "Maher Al Muaiqly",
    language: "Arabic",
    country: "Saudi Arabia",
  },
  {
    id: "ar.minshawi",
    name: "Mohammad al Minshawi",
    language: "Arabic",
    country: "Egypt",
  },
  {
    id: "ar.muhammadayyoub",
    name: "Muhammad Ayyoub",
    language: "Arabic",
    country: "Pakistan",
  },
  {
    id: "ar.saoodshuraym",
    name: "Saood bin Ibraaheem Ash-Shuraym",
    language: "Arabic",
    country: "Saudi Arabia",
  },
  {
    id: "ar.parhizgar",
    name: "Mahmoud Ali Al-Banna",
    language: "Arabic",
    country: "Egypt",
  },
  {
    id: "ar.tablawi",
    name: "Mohammad At-Tablawi",
    language: "Arabic",
    country: "Egypt",
  },
  {
    id: "ar.abdullahawadallah",
    name: "Abdullah Awad Al Juhani",
    language: "Arabic",
    country: "Saudi Arabia",
  },
  {
    id: "ar.hanirifai",
    name: "Hani Ar-Rifai",
    language: "Arabic",
    country: "Saudi Arabia",
  },
  {
    id: "ar.ibrahimakhbar",
    name: "Ibrahim Al-Akhdar",
    language: "Arabic",
    country: "Egypt",
  },
];

// Расширенный список переводов
export const TRANSLATIONS = [
  // Английские переводы
  {
    id: "en.sahih",
    name: "Sahih International",
    language: "English",
    type: "translation",
    quality: "high",
  },
  {
    id: "en.asad",
    name: "Muhammad Asad",
    language: "English",
    type: "translation",
    quality: "high",
  },
  {
    id: "en.pickthall",
    name: "Mohammed Marmaduke William Pickthall",
    language: "English",
    type: "translation",
    quality: "high",
  },
  {
    id: "en.yusufali",
    name: "Abdullah Yusuf Ali",
    language: "English",
    type: "translation",
    quality: "high",
  },
  {
    id: "en.hilali",
    name: "Muhsin Khan & Muhammad Taqi-ud-Din",
    language: "English",
    type: "translation",
    quality: "medium",
  },
  {
    id: "en.arberry",
    name: "Arthur John Arberry",
    language: "English",
    type: "translation",
    quality: "medium",
  },
  {
    id: "en.shakir",
    name: "M. H. Shakir",
    language: "English",
    type: "translation",
    quality: "medium",
  },
  {
    id: "en.sarwar",
    name: "Muhammad Sarwar",
    language: "English",
    type: "translation",
    quality: "medium",
  },

  // Русские переводы
  {
    id: "ru.kuliev",
    name: "Эльмир Кулиев",
    language: "Russian",
    type: "translation",
    quality: "high",
  },
  {
    id: "ru.osmanov",
    name: "М.-Н. О. Османов",
    language: "Russian",
    type: "translation",
    quality: "high",
  },
  {
    id: "ru.porokhova",
    name: "В. Порохова",
    language: "Russian",
    type: "translation",
    quality: "high",
  },
  {
    id: "ru.muntahab",
    name: "Министерство вакуфов Египта",
    language: "Russian",
    type: "translation",
    quality: "high",
  },
  {
    id: "ru.sablukov",
    name: "Г. С. Саблуков",
    language: "Russian",
    type: "translation",
    quality: "medium",
  },
  {
    id: "ru.krachkovsky",
    name: "И. Ю. Крачковский",
    language: "Russian",
    type: "translation",
    quality: "medium",
  },

  // Арабский текст и тафсир
  {
    id: "quran-uthmani",
    name: "القرآن الكريم (Uthmani)",
    language: "Arabic",
    type: "quran",
    quality: "original",
  },
  {
    id: "quran-simple",
    name: "القرآن الكريم (Simplified)",
    language: "Arabic",
    type: "quran",
    quality: "original",
  },
  {
    id: "ar.muyassar",
    name: "تفسير المیسر",
    language: "Arabic",
    type: "tafsir",
    quality: "high",
  },
  {
    id: "ar.jalalayn",
    name: "تفسير الجلالين",
    language: "Arabic",
    type: "tafsir",
    quality: "high",
  },

  // Французские переводы
  {
    id: "fr.hamidullah",
    name: "Muhammad Hamidullah",
    language: "French",
    type: "translation",
    quality: "high",
  },
  {
    id: "fr.leclerc",
    name: "André Du Ryer",
    language: "French",
    type: "translation",
    quality: "medium",
  },

  // Немецкие переводы
  {
    id: "de.bubenheim",
    name: "A. S. F. Bubenheim and N. Elyas",
    language: "German",
    type: "translation",
    quality: "high",
  },
  {
    id: "de.khoury",
    name: "Adel Theodor Khoury",
    language: "German",
    type: "translation",
    quality: "high",
  },

  // Турецкие переводы
  {
    id: "tr.ates",
    name: "Süleyman Ateş",
    language: "Turkish",
    type: "translation",
    quality: "high",
  },
  {
    id: "tr.yuksel",
    name: "Edip Yüksel",
    language: "Turkish",
    type: "translation",
    quality: "medium",
  },
  {
    id: "tr.ozturk",
    name: "Yaşar Nuri Öztürk",
    language: "Turkish",
    type: "translation",
    quality: "medium",
  },

  // Урду переводы
  {
    id: "ur.jalandhry",
    name: "Fateh Muhammad Jalandhry",
    language: "Urdu",
    type: "translation",
    quality: "high",
  },
  {
    id: "ur.kanzuliman",
    name: "Kanzul Iman",
    language: "Urdu",
    type: "translation",
    quality: "medium",
  },

  // Персидские переводы
  {
    id: "fa.makarem",
    name: "Makarem Shirazi",
    language: "Persian",
    type: "translation",
    quality: "high",
  },
  {
    id: "fa.ansarian",
    name: "Hussain Ansarian",
    language: "Persian",
    type: "translation",
    quality: "medium",
  },

  // Индонезийские переводы
  {
    id: "id.indonesian",
    name: "Indonesian Ministry of Religious Affairs",
    language: "Indonesian",
    type: "translation",
    quality: "high",
  },

  // Малайские переводы
  {
    id: "ms.basmeih",
    name: "Abdullah Muhammad Basmeih",
    language: "Malay",
    type: "translation",
    quality: "high",
  },

  // Испанские переводы
  {
    id: "es.cortes",
    name: "Julio Cortés",
    language: "Spanish",
    type: "translation",
    quality: "high",
  },

  // Итальянские переводы
  {
    id: "it.piccardo",
    name: "Hamza Roberto Piccardo",
    language: "Italian",
    type: "translation",
    quality: "high",
  },

  // Китайские переводы
  {
    id: "zh.jian",
    name: "马坚 (Ma Jian)",
    language: "Chinese",
    type: "translation",
    quality: "high",
  },

  // Японские переводы
  {
    id: "ja.japanese",
    name: "日本ムスリム协会",
    language: "Japanese",
    type: "translation",
    quality: "medium",
  },

  // Узбекские переводы
  {
    id: "uz.sodik",
    name: "Мухаммад Содик Мухаммад Юсуф",
    language: "Uzbek",
    type: "translation",
    quality: "high",
  },
  {
    id: "uz.mansur",
    name: "Алаўддин Мансур",
    language: "Uzbek", 
    type: "translation",
    quality: "high",
  },
  {
    id: "uz.abdurauf",
    name: "Абдурауф Фитрат",
    language: "Uzbek",
    type: "translation", 
    quality: "medium",
  },
];

// Исправленная функция для получения аудио суры
export function getAudioUrl(
  surahNumber: number,
  reciter: string = "ar.husary"
): string {
  const paddedSurah = surahNumber.toString().padStart(3, "0");

  // Используем правильный URL для аудио сур
  switch (reciter) {
    case "ar.alafasy":
      return `https://server8.mp3quran.net/afs/${paddedSurah}.mp3`;
    case "ar.abdulbasitmurattal":
      return `https://server7.mp3quran.net/basit/${paddedSurah}.mp3`;
    case "ar.abdurrahmaansudais":
      return `https://server11.mp3quran.net/sds/${paddedSurah}.mp3`;
    case "ar.mahermuaiqly":
      return `https://server12.mp3quran.net/maher/${paddedSurah}.mp3`;
    case "ar.husary":
      return `https://server6.mp3quran.net/husary/${paddedSurah}.mp3`;
    case "ar.minshawi":
      return `https://server10.mp3quran.net/minsh/${paddedSurah}.mp3`;
    case "ar.shaatree":
      return `https://server13.mp3quran.net/shatri/${paddedSurah}.mp3`;
    case "ar.abdullahbasfar":
      return `https://server12.mp3quran.net/basfar/${paddedSurah}.mp3`;
    case "ar.saoodshuraym":
      return `https://server15.mp3quran.net/shuraym/${paddedSurah}.mp3`;
    case "ar.muhammadayyoub":
      return `https://server14.mp3quran.net/ayyub/${paddedSurah}.mp3`;
    case "ar.parhizgar":
      return `https://server16.mp3quran.net/parhizgar/${paddedSurah}.mp3`;
    case "ar.tablawi":
      return `https://server17.mp3quran.net/tablawi/${paddedSurah}.mp3`;
    case "ar.abdullahawadallah":
      return `https://server18.mp3quran.net/juhani/${paddedSurah}.mp3`;
    case "ar.hanirifai":
      return `https://server19.mp3quran.net/rifai/${paddedSurah}.mp3`;
    case "ar.ibrahimakhbar":
      return `https://server20.mp3quran.net/akhdar/${paddedSurah}.mp3`;
    default:
      return `https://server6.mp3quran.net/husary/${paddedSurah}.mp3`;
  }
}

// Функция для получения источников MP3Quran по конкретным чтецам
function getMP3QuranSources(
  surahNumber: number,
  ayahNumber: number,
  reciter: string
): string[] {
  const paddedSurah = surahNumber.toString().padStart(3, "0");
  const paddedAyah = ayahNumber.toString().padStart(3, "0");

  // Проверенные рабочие источники для аятов
  const mp3Sources: Record<string, string> = {
    "ar.husary": `https://server6.mp3quran.net/husary/${paddedSurah}${paddedAyah}.mp3`,
    "ar.alafasy": `https://server8.mp3quran.net/afs/${paddedSurah}${paddedAyah}.mp3`,
    "ar.abdulbasitmurattal": `https://server7.mp3quran.net/basit/${paddedSurah}${paddedAyah}.mp3`,
    "ar.abdurrahmaansudais": `https://server11.mp3quran.net/sds/${paddedSurah}${paddedAyah}.mp3`,
    "ar.mahermuaiqly": `https://server12.mp3quran.net/maher/${paddedSurah}${paddedAyah}.mp3`,
    "ar.minshawi": `https://server10.mp3quran.net/minsh/${paddedSurah}${paddedAyah}.mp3`,
    "ar.shaatree": `https://server13.mp3quran.net/shatri/${paddedSurah}${paddedAyah}.mp3`,
    // Новые чтецы - пробуем разные серверы
    "ar.muhammadayyoub": `https://server14.mp3quran.net/ayyub/${paddedSurah}${paddedAyah}.mp3`,
    "ar.saoodshuraym": `https://server15.mp3quran.net/shuraym/${paddedSurah}${paddedAyah}.mp3`,
    "ar.parhizgar": `https://server16.mp3quran.net/parhizgar/${paddedSurah}${paddedAyah}.mp3`,
    "ar.tablawi": `https://server17.mp3quran.net/tablawi/${paddedSurah}${paddedAyah}.mp3`,
    "ar.abdullahawadallah": `https://server18.mp3quran.net/juhani/${paddedSurah}${paddedAyah}.mp3`,
    "ar.hanirifai": `https://server19.mp3quran.net/rifai/${paddedSurah}${paddedAyah}.mp3`,
    "ar.ibrahimakhbar": `https://server20.mp3quran.net/akhdar/${paddedSurah}${paddedAyah}.mp3`,
  };

  const sources = [];
  if (mp3Sources[reciter]) {
    sources.push(mp3Sources[reciter]);
  }

  // Добавляем fallback - полную суру если аят не найден
  if (mp3Sources[reciter]) {
    const surahUrl = mp3Sources[reciter].replace(
      `${paddedSurah}${paddedAyah}.mp3`,
      `${paddedSurah}.mp3`
    );
    sources.push(surahUrl);
  }

  return sources;
}

// Новая улучшенная функция для получения аудио аятов с множественными источниками
export function getAyahAudioSources(
  surahNumber: number,
  ayahNumber: number,
  reciter: string = "ar.husary"
): string[] {
  const paddedSurah = surahNumber.toString().padStart(3, "0");
  const paddedAyah = ayahNumber.toString().padStart(3, "0");
  const reciterCode = reciter.replace("ar.", "");

  // Конвертация в формат EveryAyah (проверенные источники)
  const getEveryAyahReciterCode = (reciterId: string): string => {
    const reciterMap: Record<string, string> = {
      "ar.alafasy": "Alafasy_128kbps",
      "ar.abdulbasitmurattal": "Abdul_Basit_Murattal_192kbps",
      "ar.abdurrahmaansudais": "Sudais_128kbps",
      "ar.mahermuaiqly": "MaherAlMuaiqly128kbps",
      "ar.husary": "Husary_128kbps",
      "ar.minshawi": "Minshawi_Murattal_128kbps",
      "ar.muhammadayyoub": "Muhammad_Ayyoub_128kbps",
      "ar.saoodshuraym": "Saood_ash-Shuraym_128kbps",
      "ar.shaatree": "Shatree_128kbps", // Исправлено: Shatree вместо Shaatree
      "ar.abdullahbasfar": "Abdullah_Basfar_192kbps",
      // Новые чтецы
      "ar.ibrahimakhbar": "Ibrahim_Al_Akhdar_128kbps",
      "ar.hanirifai": "Hani_Rifai_128kbps",
      "ar.abdullahawadallah": "Abdullah_Awad_Al_Juhani_128kbps",
      "ar.tablawi": "Tablawi_128kbps",
      "ar.parhizgar": "Parhizgar_128kbps",
    };
    return reciterMap[reciterId] || "Husary_128kbps";
  };

  const everyAyahCode = getEveryAyahReciterCode(reciter);

  return [
    // MP3Quran - самые надежные прямые источники (приоритет #1)
    ...getMP3QuranSources(surahNumber, ayahNumber, reciter),

    // EveryAyah - хорошая альтернатива
    `https://everyayah.com/data/${everyAyahCode}/${paddedSurah}${paddedAyah}.mp3`,

    // QuranCDN - еще один источник
    `https://audio.qurancdn.com/kh/${reciterCode}/${paddedSurah}${paddedAyah}.mp3`,

    // Fallback - полная сура для всех чтецов
    getAudioUrl(surahNumber, reciter),
  ];
}

// Функция для проверки доступности аудио с таймаутом
export async function checkAudioAvailability(
  url: string,
  timeout: number = 5000
): Promise<boolean> {
  return new Promise((resolve) => {
    const audio = new Audio();
    let isResolved = false;

    const cleanup = () => {
      if (!isResolved) {
        isResolved = true;
        audio.src = "";
        audio.removeEventListener("canplaythrough", onSuccess);
        audio.removeEventListener("loadeddata", onSuccess);
        audio.removeEventListener("canplay", onSuccess);
        audio.removeEventListener("error", onError);
        audio.removeEventListener("abort", onError);
      }
    };

    const onSuccess = () => {
      cleanup();
      resolve(true);
    };

    const onError = (event?: any) => {
      console.warn("Audio check failed for:", url, event?.type);
      cleanup();
      resolve(false);
    };

    // Устанавливаем таймаут
    const timeoutId = setTimeout(() => {
      if (!isResolved) {
        console.warn("Audio check timeout for:", url);
        cleanup();
        resolve(false);
      }
    }, timeout);

    // Слушаем несколько событий для лучшей совместимости
    audio.addEventListener("canplaythrough", onSuccess);
    audio.addEventListener("loadeddata", onSuccess);
    audio.addEventListener("canplay", onSuccess);
    audio.addEventListener("error", onError);
    audio.addEventListener("abort", onError);

    try {
      audio.crossOrigin = "anonymous"; // Попробуем избежать CORS проблем
      audio.preload = "metadata";
      audio.src = url;
      audio.load(); // Принудительно загружаем
    } catch (error) {
      console.warn("Audio setup error for:", url, error);
      clearTimeout(timeoutId);
      cleanup();
      resolve(false);
    }
  });
}

// Улучшенная функция для получения работающего аудио URL
export async function getWorkingAudioUrl(
  surahNumber: number,
  ayahNumber?: number,
  reciter: string = "ar.husary"
): Promise<string> {
  console.log(
    `Getting audio for surah ${surahNumber}, ayah ${ayahNumber}, reciter ${reciter}`
  );

  if (ayahNumber) {
    // Для конкретного аята - проверяем источники по приоритету
    const sources = getAyahAudioSources(surahNumber, ayahNumber, reciter);

    // Быстрая проверка первых двух источников с коротким таймаутом
    for (let i = 0; i < Math.min(2, sources.length); i++) {
      const url = sources[i];
      console.log(`Checking audio source ${i + 1}:`, url);
      const isAvailable = await checkAudioAvailability(url, 2000);
      if (isAvailable) {
        console.log("✓ Found working audio source:", url);
        return url;
      }
    }

    // Если быстрая проверка не сработала, пробуем остальные с более длинным таймаутом
    for (let i = 2; i < sources.length; i++) {
      const url = sources[i];
      console.log(`Checking fallback source ${i + 1}:`, url);
      const isAvailable = await checkAudioAvailability(url, 4000);
      if (isAvailable) {
        console.log("✓ Found working fallback source:", url);
        return url;
      }
    }

    // Последняя попытка - используем AlQuran Cloud API напрямую
    try {
      const apiUrl = `https://cdn.islamic.network/quran/audio-surah/128/${reciter}/${surahNumber
        .toString()
        .padStart(3, "0")}${ayahNumber.toString().padStart(3, "0")}.mp3`;
      console.log("Trying AlQuran Cloud API:", apiUrl);
      const isApiAvailable = await checkAudioAvailability(apiUrl, 3000);
      if (isApiAvailable) {
        console.log("✓ AlQuran Cloud API works:", apiUrl);
        return apiUrl;
      }
    } catch (error) {
      console.warn("AlQuran Cloud API failed:", error);
    }

    // Если ничего не найдено, возвращаем первый источник как fallback
    console.warn(
      "⚠ No working audio sources found, using fallback:",
      sources[0]
    );
    return sources[0];
  } else {
    // Для всей суры - используем проверенные серверы
    const surahSources = [
      getAudioUrl(surahNumber, reciter),
      `https://cdn.islamic.network/quran/audio-surah/128/${reciter}/${surahNumber
        .toString()
        .padStart(3, "0")}.mp3`,
      `https://download.quranicaudio.com/quran/${reciter.replace(
        "ar.",
        ""
      )}/${surahNumber.toString().padStart(3, "0")}.mp3`,
      `https://server6.mp3quran.net/husary/${surahNumber
        .toString()
        .padStart(3, "0")}.mp3`, // fallback to Husary
    ];

    for (const url of surahSources) {
      console.log("Checking surah source:", url);
      const isAvailable = await checkAudioAvailability(url, 3000);
      if (isAvailable) {
        console.log("✓ Found working surah source:", url);
        return url;
      }
    }

    console.warn(
      "⚠ No working surah sources found, using fallback:",
      surahSources[0]
    );
    return surahSources[0]; // fallback
  }
}

// Функция для предзагрузки аудио
export async function preloadAudio(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.preload = "metadata";

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
export async function getAudioInfo(
  url: string
): Promise<{ duration: number; canPlay: boolean }> {
  return new Promise((resolve) => {
    const audio = new Audio();

    audio.onloadedmetadata = () => {
      resolve({
        duration: audio.duration || 0,
        canPlay: true,
      });
    };

    audio.onerror = () => {
      resolve({
        duration: 0,
        canPlay: false,
      });
    };

    setTimeout(() => {
      resolve({
        duration: 0,
        canPlay: false,
      });
    }, 5000);

    audio.src = url;
  });
}

// Кэш для аудио источников
const audioSourceCache = new Map<string, string>();

// Функция для очистки кэша аудио (полезно при смене чтеца)
export function clearAudioCache(): void {
  audioSourceCache.clear();
}

// Функция для получения доступных аудио изданий через API AlQuran Cloud
export async function getAvailableAudioEditions(): Promise<Edition[]> {
  try {
    const response = await fetch(
      `${BASE_URL}/edition?format=audio&type=versebyverse`
    );
    if (!response.ok) throw new Error("Failed to fetch audio editions");

    const data: ApiResponse<Edition[]> = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching audio editions:", error);
    // Возвращаем наши известные чтецы как fallback
    return RECITERS.map((r) => ({
      identifier: r.id,
      language: r.language,
      name: r.name,
      englishName: r.name,
      format: "audio",
      type: "versebyverse",
    }));
  }
}

// Функция для быстрой проверки доступности чтеца
export async function testReciterAvailability(
  reciterId: string
): Promise<boolean> {
  try {
    // Тестируем первый аят первой суры
    const sources = getAyahAudioSources(1, 1, reciterId);

    // Проверяем первый источник с коротким таймаутом
    for (const url of sources.slice(0, 2)) {
      const isAvailable = await checkAudioAvailability(url, 3000);
      if (isAvailable) {
        console.log(`✓ Reciter ${reciterId} is available via:`, url);
        return true;
      }
    }

    console.warn(`⚠ Reciter ${reciterId} is not available`);
    return false;
  } catch (error) {
    console.error(`Error testing reciter ${reciterId}:`, error);
    return false;
  }
}

// Функция с кэшированием для быстрого доступа к работающим источникам
export async function getCachedWorkingAudioUrl(
  surahNumber: number,
  ayahNumber?: number,
  reciter: string = "ar.husary"
): Promise<string> {
  const cacheKey = `${reciter}-${surahNumber}-${ayahNumber || "full"}`;
  console.log(`🔍 Getting cached audio URL for: ${cacheKey}`);

  // Проверяем кэш
  if (audioSourceCache.has(cacheKey)) {
    const cachedUrl = audioSourceCache.get(cacheKey)!;
    console.log(`💾 Found cached URL: ${cachedUrl}`);
    // Проверяем, что кэшированный URL все еще работает
    const isStillWorking = await checkAudioAvailability(cachedUrl, 2000);
    if (isStillWorking) {
      console.log(`✅ Cached URL still working`);
      return cachedUrl;
    } else {
      console.log(`❌ Cached URL not working, removing from cache`);
      audioSourceCache.delete(cacheKey);
    }
  }

  // Получаем новый рабочий URL
  console.log(`🔄 Getting new working URL for reciter: ${reciter}`);
  const workingUrl = await getWorkingAudioUrl(surahNumber, ayahNumber, reciter);
  console.log(`🎯 Got working URL: ${workingUrl}`);

  // Сохраняем в кэш
  audioSourceCache.set(cacheKey, workingUrl);

  return workingUrl;
}

// Функция для получения качественного перевода по языку
export function getTranslationsByLanguage(
  language: string
): typeof TRANSLATIONS {
  return TRANSLATIONS.filter(
    (t) => t.language.toLowerCase() === language.toLowerCase()
  ).sort((a, b) => {
    const qualityOrder = { original: 0, high: 1, medium: 2, low: 3 };
    return (
      (qualityOrder[a.quality as keyof typeof qualityOrder] || 3) -
      (qualityOrder[b.quality as keyof typeof qualityOrder] || 3)
    );
  });
}

// Функция для получения рекомендуемых переводов
export function getRecommendedTranslations(
  userLanguage: string = "en"
): typeof TRANSLATIONS {
  const recommended = [];

  // Всегда добавляем арабский оригинал
  recommended.push(TRANSLATIONS.find((t) => t.id === "quran-uthmani")!);

  // Добавляем лучший перевод на языке пользователя
  const userLangTranslations = getTranslationsByLanguage(userLanguage);
  if (userLangTranslations.length > 0) {
    recommended.push(userLangTranslations[0]);
  }

  // Добавляем популярные английские переводы если язык не английский
  if (userLanguage !== "English" && userLanguage !== "en") {
    recommended.push(TRANSLATIONS.find((t) => t.id === "en.sahih")!);
  }

  return recommended.filter(Boolean);
}

// === ДОПОЛНИТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ ПЛАНИРОВЩИКА ИЗУЧЕНИЯ ===

// Получить подробную информацию о суре для планирования
export async function getSurahInfoForPlanner(surahNumber: number): Promise<{
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
} | null> {
  try {
    const surahs = await getSurahs();
    return surahs.find(surah => surah.number === surahNumber) || null;
  } catch (error) {
    console.error(`Error fetching surah info for ${surahNumber}:`, error);
    return null;
  }
}

// Получить все суры с их информацией для планировщика
export async function getAllSurahsForPlanner(): Promise<ApiSurah[]> {
  try {
    return await getSurahs();
  } catch (error) {
    console.error('Error fetching all surahs info:', error);
    return [];
  }
}

// Получить информацию о джузе для планировщика
export async function getJuzInfoForPlanner(juzNumber: number): Promise<{
  number: number;
  ayahs: ApiVerse[];
  surahs: Record<number, ApiSurah>;
} | null> {
  try {
    const juzData = await getJuz(juzNumber);
    return {
      number: juzNumber,
      ...juzData
    };
  } catch (error) {
    console.error(`Error fetching juz info for ${juzNumber}:`, error);
    return null;
  }
}

// Получить манзиль (для недельного чтения)
export async function getManzil(
  manzilNumber: number,
  edition: string = "quran-uthmani"
): Promise<{ ayahs: ApiVerse[]; surahs: Record<number, ApiSurah> } | null> {
  try {
    const response = await fetch(`${BASE_URL}/manzil/${manzilNumber}/${edition}`);
    if (!response.ok) throw new Error(`Failed to fetch manzil ${manzilNumber}`);

    const data: ApiResponse<{
      ayahs: ApiVerse[];
      surahs: Record<number, ApiSurah>;
    }> = await response.json();
    return data.data;
  } catch (error) {
    console.error(`Error fetching manzil ${manzilNumber}:`, error);
    return null;
  }
}

// Получить метаданные Корана для планировщика
export async function getQuranMetaForPlanner(): Promise<{
  surahs: { count: number; references: ApiSurah[] };
  ayahs: { count: number };
  rukus: number;
  pages: number;
  manzils: number;
  sajdas: { count: number; references: any[] };
} | null> {
  try {
    const response = await fetch(`${BASE_URL}/meta`);
    if (!response.ok) throw new Error('Failed to fetch Quran meta');

    const data: ApiResponse<any> = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching Quran meta:', error);
    return null;
  }
}

// Утилиты для планирования

// Подсчет общего количества аятов в диапазоне сур
export async function countAyahsInSurahs(surahNumbers: number[]): Promise<number> {
  try {
    const surahs = await getAllSurahsForPlanner();
    return surahNumbers.reduce((total, surahNumber) => {
      const surah = surahs.find((s: ApiSurah) => s.number === surahNumber);
      return total + (surah?.numberOfAyahs || 0);
    }, 0);
  } catch (error) {
    console.error('Error counting ayahs in surahs:', error);
    return 0;
  }
}

// Получить рекомендуемые суры для начинающих
export function getRecommendedSurahsForBeginners(): number[] {
  return [
    1,   // Аль-Фатиха
    112, // Аль-Ихлас
    113, // Аль-Фаляк
    114, // Ан-Нас
    111, // Аль-Масад
    110, // Ан-Наср
    109, // Аль-Кафирун
    108, // Аль-Каусар
    107, // Аль-Маун
    106, // Курайш
    105, // Аль-Филь
    104, // Аль-Хумаза
    103, // Аль-Аср
    102, // Ат-Такасур
  ];
}

// Получить среднее время чтения для количества аятов (в минутах)
export function getEstimatedReadingTime(ayahCount: number): number {
  // Приблизительно 30 секунд на аят для обдуманного чтения
  return Math.round((ayahCount * 0.5) * 10) / 10;
}

// Получить оценку сложности для суры
export function getSurahDifficulty(ayahCount: number): 'easy' | 'medium' | 'hard' {
  if (ayahCount <= 10) return 'easy';
  if (ayahCount <= 50) return 'medium';
  return 'hard';
}
