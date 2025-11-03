import { NextRequest, NextResponse } from 'next/server';

// Функция для получения данных из внешнего API
async function fetchFromQuranAPI(keyword: string, surah: string = 'all', edition: string = 'en') {
  try {
    const url = `https://api.alquran.cloud/v1/search/${encodeURIComponent(keyword)}/${surah}/${edition}`;
    console.log('Запрос к внешнему API:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Al-Quran-App/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Ответ от API:', data);
    return data;
    
  } catch (error) {
    console.error('Ошибка при обращении к внешнему API:', error);
    return null;
  }
}

// Локальная резервная база данных (на случай если внешний API недоступен)
const FALLBACK_QURAN_DATA = [
  // Сура 1 - Аль-Фатиха
  {
    surah: 1,
    verse: 1,
    arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
    translation_en: "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
    translation_ru: "Именем Аллаха, Милостивого, Милосердного!",
    surah_name_en: "Al-Fatiha",
    surah_name_ar: "الفاتحة",
    surah_name_ru: "Открывающая",
    juz: 1
  },
  {
    surah: 1,
    verse: 2,
    arabic: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
    translation_en: "[All] praise is [due] to Allah, Lord of the worlds -",
    translation_ru: "Хвала Аллаху, Господу миров,",
    surah_name_en: "Al-Fatiha",
    surah_name_ar: "الفاتحة",
    surah_name_ru: "Открывающая",
    juz: 1
  },
  // ... можно добавить больше данных для резерва
];

// Резервный локальный поиск
function fallbackSearch(query: string, mode: string = 'both', language: string = 'both') {
  console.log('Используем резервный локальный поиск');
  const searchTerm = query.toLowerCase().trim();
  const originalQuery = query.trim();
  
  const results = FALLBACK_QURAN_DATA.filter(verse => {
    let matches = false;
    
    if (mode === 'arabic' || mode === 'both') {
      if (verse.arabic.includes(originalQuery) || verse.surah_name_ar.includes(originalQuery)) {
        matches = true;
      }
    }
    
    if (mode === 'translation' || mode === 'both') {
      if (language === 'en' || language === 'both') {
        if (verse.translation_en.toLowerCase().includes(searchTerm) ||
            verse.surah_name_en.toLowerCase().includes(searchTerm)) {
          matches = true;
        }
      }
      
      if (language === 'ru' || language === 'both') {
        if (verse.translation_ru.toLowerCase().includes(searchTerm) ||
            verse.surah_name_ru.toLowerCase().includes(searchTerm)) {
          matches = true;
        }
      }
    }
    
    return matches;
  });

  return results.map(verse => ({
    number: verse.verse,
    numberInSurah: verse.verse,
    text: verse.arabic,
    translation: language === 'ru' ? verse.translation_ru : verse.translation_en,
    surah: {
      number: verse.surah,
      name: verse.surah_name_ar,
      englishName: verse.surah_name_en,
      russianName: verse.surah_name_ru
    },
    surahName: verse.surah_name_en,
    surahNameArabic: verse.surah_name_ar,
    juz: verse.juz,
    source: 'fallback'
  }));
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const mode = searchParams.get('mode') || 'both';
    const language = searchParams.get('lang') || 'en';
    const surahFilter = searchParams.get('surah');

    if (!query) {
      return NextResponse.json({
        success: false,
        error: 'Query parameter is required'
      }, { status: 400 });
    }

    console.log('API Search request:', { query, mode, language, surahFilter });

    let allResults: any[] = [];

    // Определяем суру для поиска
    const searchSurah = surahFilter || 'all';

    try {
      // Поиск в арабском тексте
      if (mode === 'arabic' || mode === 'both') {
        console.log('Поиск в арабском тексте...');
        const arabicData = await fetchFromQuranAPI(query, searchSurah, 'quran-uthmani');
        if (arabicData && arabicData.data && arabicData.data.matches) {
          const arabicResults = arabicData.data.matches.map((match: any) => ({
            number: match.number,
            numberInSurah: match.numberInSurah,
            text: match.text,
            translation: match.text, // Арабский текст как основной
            surah: {
              number: match.surah.number,
              name: match.surah.name,
              englishName: match.surah.englishName,
              englishNameTranslation: match.surah.englishNameTranslation
            },
            surahName: match.surah.englishName,
            surahNameArabic: match.surah.name,
            juz: match.juz,
            source: 'arabic-api'
          }));
          allResults.push(...arabicResults);
          console.log(`Найдено ${arabicResults.length} арабских результатов`);
        }
      }

      // Поиск в переводах
      if (mode === 'translation' || mode === 'both') {
        console.log('Поиск в переводах...');
        
        // Выбираем edition в зависимости от языка
        let editions = [];
        if (language === 'en' || language === 'both') {
          editions.push('en.sahih', 'en.pickthall', 'en.yusufali');
        }
        if (language === 'ru' || language === 'both') {
          editions.push('ru.kuliev', 'ru.osmanov');
        }

        // Поиск по каждому переводу
        for (const edition of editions) {
          try {
            const translationData = await fetchFromQuranAPI(query, searchSurah, edition);
            if (translationData && translationData.data && translationData.data.matches) {
              const translationResults = translationData.data.matches.map((match: any) => ({
                number: match.number,
                numberInSurah: match.numberInSurah,
                text: match.text, // Текст перевода
                translation: match.text,
                surah: {
                  number: match.surah.number,
                  name: match.surah.name,
                  englishName: match.surah.englishName,
                  englishNameTranslation: match.surah.englishNameTranslation
                },
                surahName: match.surah.englishName,
                surahNameArabic: match.surah.name,
                juz: match.juz,
                source: `translation-${edition}`,
                edition: edition
              }));
              allResults.push(...translationResults);
              console.log(`Найдено ${translationResults.length} результатов в ${edition}`);
            }
          } catch (error) {
            console.error(`Ошибка поиска в ${edition}:`, error);
          }
        }
      }

    } catch (apiError) {
      console.error('Ошибка внешнего API, используем резервный поиск:', apiError);
      // Если внешний API не работает, используем локальный резервный поиск
      allResults = fallbackSearch(query, mode, language);
    }

    // Если нет результатов, пробуем резервный поиск
    if (allResults.length === 0) {
      console.log('Нет результатов от внешнего API, пробуем локальный поиск...');
      allResults = fallbackSearch(query, mode, language);
    }

    // Удаляем дубликаты (по номеру суры и аяту)
    const uniqueResults = allResults.reduce((acc: any[], current: any) => {
      const exists = acc.find(
        (item) =>
          item.numberInSurah === current.numberInSurah &&
          item.surah?.number === current.surah?.number
      );
      
      if (!exists) {
        acc.push(current);
      } else {
        // Если найден дубликат, объединяем информацию
        if (current.source?.includes('arabic') && current.text) {
          exists.arabicText = current.text;
        }
        if (current.source?.includes('translation') && current.translation) {
          exists.translation = current.translation;
        }
      }
      return acc;
    }, []);

    // Сортируем по номеру суры и аяту
    uniqueResults.sort((a, b) => {
      if (a.surah.number !== b.surah.number) {
        return a.surah.number - b.surah.number;
      }
      return a.numberInSurah - b.numberInSurah;
    });

    console.log(`Итого уникальных результатов: ${uniqueResults.length}`);

    return NextResponse.json({
      success: true,
      data: {
        matches: uniqueResults,
        count: uniqueResults.length,
        query: query,
        searchMode: mode,
        language: language
      }
    });

  } catch (error) {
    console.error('Search API Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}