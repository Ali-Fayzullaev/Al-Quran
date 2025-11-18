/**
 * База популярных мечетей для fallback
 */

import { Mosque } from '@/types/mosque';

/**
 * Транслитерация текста между латиницей и кириллицей
 */
function transliterate(text: string): string[] {
  const cyrillicToLatin: { [key: string]: string } = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'h', 'ц': 'c', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
    'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
    'ө': 'o', 'ү': 'u', 'қ': 'q', 'ғ': 'g', 'ң': 'ng', 'һ': 'h'
  };
  
  const latinToCyrillic: { [key: string]: string } = {
    'a': 'а', 'b': 'б', 'v': 'в', 'g': 'г', 'd': 'д', 'e': 'е',
    'zh': 'ж', 'z': 'з', 'i': 'и', 'y': 'й', 'k': 'к', 'l': 'л',
    'm': 'м', 'n': 'н', 'o': 'о', 'p': 'п', 'r': 'р', 's': 'с',
    't': 'т', 'u': 'у', 'f': 'ф', 'h': 'х', 'c': 'ц', 'ch': 'ч',
    'sh': 'ш', 'sch': 'щ', 'yu': 'ю', 'ya': 'я', 'q': 'қ', 'ng': 'ң'
  };
  
  const variations = [text.toLowerCase()];
  
  // Кириллица -> Латиница
  let latinVersion = text.toLowerCase();
  for (const [cyr, lat] of Object.entries(cyrillicToLatin)) {
    latinVersion = latinVersion.replace(new RegExp(cyr, 'g'), lat);
  }
  if (latinVersion !== text.toLowerCase()) {
    variations.push(latinVersion);
  }
  
  // Латиница -> Кириллица
  let cyrillicVersion = text.toLowerCase();
  // Сначала заменяем длинные комбинации
  const longCombinations = ['sch', 'zh', 'ch', 'sh', 'yu', 'ya', 'yo', 'ng'];
  for (const combo of longCombinations) {
    if (latinToCyrillic[combo]) {
      cyrillicVersion = cyrillicVersion.replace(new RegExp(combo, 'g'), latinToCyrillic[combo]);
    }
  }
  // Затем одиночные символы
  for (const [lat, cyr] of Object.entries(latinToCyrillic)) {
    if (lat.length === 1) {
      cyrillicVersion = cyrillicVersion.replace(new RegExp(lat, 'g'), cyr);
    }
  }
  if (cyrillicVersion !== text.toLowerCase()) {
    variations.push(cyrillicVersion);
  }
  
  return [...new Set(variations)];
}

/**
 * Проверка, является ли место мечетью
 */
export function isMosqueRelated(text: string): boolean {
  const lowerText = text.toLowerCase();
  
  // Ключевые слова мечетей
  const mosqueKeywords = [
    // Русские
    'мечеть', 'мечети', 'масжид', 'масджид', 'молитвенный дом',
    // Английские
    'mosque', 'masjid', 'masjed', 'prayer hall', 'islamic center', 'islamic centre',
    // Узбекские
    'masjid', 'ibodatxona', 'namoz', 
    // Казахские
    'мешіт', 'масжид', 'намазхана',
    // Турецкие
    'cami', 'camii', 'mescit'
  ];
  
  // Исключаемые слова (отели, рестораны и т.д.)
  const excludeKeywords = [
    // Отели
    'hotel', 'apart-hotel', 'apartment', 'resort', 'inn', 'lodge', 'hostel',
    'отель', 'гостиница', 'апарт-отель', 'хостел',
    // Рестораны
    'restaurant', 'cafe', 'bar', 'pub', 'club', 'lounge',
    'ресторан', 'кафе', 'бар', 'клуб',
    // Магазины
    'shop', 'store', 'mall', 'market', 'center', 'centre', 'plaza',
    'магазин', 'торговый центр', 'рынок',
    // Офисы
    'office', 'business', 'company', 'corporation',
    'офис', 'компания', 'организация',
    // Медицина
    'hospital', 'clinic', 'medical', 'pharmacy',
    'больница', 'клиника', 'медцентр', 'аптека',
    // Транспорт
    'station', 'airport', 'terminal', 'parking',
    'станция', 'аэропорт', 'вокзал', 'парковка'
  ];
  
  // Проверяем наличие исключающих слов
  const hasExcludeWords = excludeKeywords.some(keyword => lowerText.includes(keyword));
  if (hasExcludeWords) {
    return false;
  }
  
  // Проверяем наличие мечетских слов
  const hasMosqueWords = mosqueKeywords.some(keyword => lowerText.includes(keyword));
  
  return hasMosqueWords;
}

export const popularMosques: Record<string, Mosque[]> = {
  moscow: [
    {
      id: 'moscow-cathedral-mosque',
      name: 'Соборная мечеть Москвы',
      alternativeNames: ['Cathedral Mosque Moscow', 'Sobornaya mechet', 'Moscow Cathedral Mosque', 'мечеть москва'],
      address: 'Выползов пер., 7, Москва, 129090',
      location: { lat: 55.7759, lng: 37.6327 },
      rating: 4.8,
      user_ratings_total: 1547,
      jumuah_times: ['13:00', '14:00', '15:00'],
      services: ['Пятничный намаз', 'Обучение', 'Никах', 'Мадраса'],
      phone: '+7 (495) 681-49-65',
      opening_hours: {
        open_now: true,
        weekday_text: [
          'Понедельник: 5:00–22:00',
          'Вторник: 5:00–22:00',
          'Среда: 5:00–22:00',
          'Четверг: 5:00–22:00',
          'Пятница: 5:00–22:00',
          'Суббота: 5:00–22:00',
          'Воскресенье: 5:00–22:00'
        ]
      }
    },
    {
      id: 'moscow-memorial-mosque',
      name: 'Мемориальная мечеть',
      address: 'Поклонная ул., 3А, Москва, 121170',
      location: { lat: 55.7317, lng: 37.5138 },
      rating: 4.6,
      user_ratings_total: 823,
      photos: [
        'https://images.unsplash.com/photo-1593564937782-c4c38cee1ee0?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=400&h=300&fit=crop'
      ],
      jumuah_times: ['13:30', '14:30'],
      services: ['Пятничный намаз', 'Обучение'],
      phone: '+7 (495) 148-56-45'
    }
  ],
  
  london: [
    {
      id: 'london-central-mosque',
      name: 'London Central Mosque',
      address: '146 Park Rd, London NW8 7RG, UK',
      location: { lat: 51.5285, lng: -0.1706 },
      rating: 4.5,
      user_ratings_total: 2341,
      photos: [
        'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1578325042423-97300a17cd5b?w=400&h=300&fit=crop'
      ],
      jumuah_times: ['13:00', '14:00'],
      services: ['Friday Prayer', 'Education', 'Community Center'],
      phone: '+44 20 7724 3363'
    },
    {
      id: 'london-east-mosque',
      name: 'East London Mosque',
      address: '82-92 Whitechapel Rd, London E1 1JQ, UK',
      location: { lat: 51.5195, lng: -0.0648 },
      rating: 4.7,
      user_ratings_total: 1876,
      photos: [
        'https://images.unsplash.com/photo-1567516658951-b1ed0efef46a?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1589308078059-be1415eab4c2?w=400&h=300&fit=crop'
      ],
      jumuah_times: ['12:30', '13:30', '14:30'],
      services: ['Friday Prayer', 'Madrasa', 'Community Services'],
      phone: '+44 20 7650 3000'
    }
  ],
  
  istanbul: [
    {
      id: 'istanbul-sultan-ahmed',
      name: 'Sultan Ahmed Mosque (Blue Mosque)',
      address: 'Sultan Ahmet, At Meydanı No:7, 34122 Fatih/İstanbul, Turkey',
      location: { lat: 41.0054, lng: 28.9768 },
      rating: 4.9,
      user_ratings_total: 45672,
      jumuah_times: ['12:30'],
      services: ['Friday Prayer', 'Tourism', 'Historical Site'],
      opening_hours: {
        open_now: true,
        weekday_text: [
          'Monday: 8:30–18:30',
          'Tuesday: 8:30–18:30',
          'Wednesday: 8:30–18:30',
          'Thursday: 8:30–18:30',
          'Friday: 8:30–18:30',
          'Saturday: 8:30–18:30',
          'Sunday: 8:30–18:30'
        ]
      }
    },
    {
      id: 'istanbul-suleymaniye',
      name: 'Suleymaniye Mosque',
      address: 'Prof. Sıddık Sami Onar Cd. No:2, 34116 Fatih/İstanbul, Turkey',
      location: { lat: 41.0165, lng: 28.9640 },
      rating: 4.8,
      user_ratings_total: 23451,
      jumuah_times: ['12:15'],
      services: ['Friday Prayer', 'Islamic Library', 'Museum'],
    }
  ],
  
  dubai: [
    {
      id: 'dubai-grand-mosque',
      name: 'Grand Mosque Dubai',
      address: 'Ali Bin Abi Talib St - Bur Dubai - Dubai - UAE',
      location: { lat: 25.2677, lng: 55.3019 },
      rating: 4.6,
      user_ratings_total: 1234,
      jumuah_times: ['12:00', '13:00'],
      services: ['Friday Prayer', 'Islamic Center', 'Education'],
      phone: '+971 4 353 6666'
    }
  ],
  
  tashkent: [
    {
      id: 'tashkent-minor-mosque',
      name: 'Minor Mosque',
      alternativeNames: ['Минор мечети', 'Minor masjidi', 'Tashkent Minor', 'ташкент мечеть', 'toshkent masjid'],
      address: 'Uzbekistan, Tashkent, Sebzor District',
      location: { lat: 41.3193, lng: 69.2684 },
      rating: 4.7,
      user_ratings_total: 856,
      jumuah_times: ['12:30'],
      services: ['Пятничный намаз', 'Образование'],
    }
  ],
  
  almaty: [
    {
      id: 'almaty-central-mosque',
      name: 'Центральная мечеть Алматы',
      alternativeNames: ['Almaty Central Mosque', 'Алматы мешити', 'алматы мечеть', 'Central Mosque Almaty'],
      address: 'ул. Пушкина, 17, Алматы 050000, Казахстан',
      location: { lat: 43.2566, lng: 76.9286 },
      rating: 4.5,
      user_ratings_total: 432,
      jumuah_times: ['13:00'],
      services: ['Пятничный намаз', 'Обучение'],
    }
  ]
};

// Функция для получения мечетей по городу/стране с поддержкой транслитерации
export function getMosquesByLocation(city?: string, country?: string): Mosque[] {
  if (!city && !country) return [];
  
  const allResults: Mosque[] = [];
  
  if (city) {
    const cityVariations = transliterate(city);
    
    // Поиск по всем вариациям названия города
    for (const variation of cityVariations) {
      const searchKey = variation.toLowerCase();
      
      // Поиск по точному совпадению
      if (popularMosques[searchKey]) {
        allResults.push(...popularMosques[searchKey]);
      }
      
      // Поиск по частичному совпадению в ключах
      const partialMatches = Object.keys(popularMosques).filter(key => 
        key.includes(searchKey) || searchKey.includes(key)
      );
      
      partialMatches.forEach(key => {
        allResults.push(...popularMosques[key]);
      });
    }
  }
  
  // Фильтруем результаты: только мечети
  const filteredResults = allResults.filter(mosque => 
    isMosqueRelated(mosque.name)
  );
  
  // Удаляем дубликаты по ID
  const uniqueResults = filteredResults.filter((mosque, index, self) => 
    index === self.findIndex(m => m.id === mosque.id)
  );
  
  return uniqueResults;
}

// Поиск мечетей по ключевым словам с поддержкой транслитерации
export function searchMosquesByKeyword(keyword: string): Mosque[] {
  const searchVariations = transliterate(keyword);
  const allMosques = Object.values(popularMosques).flat();
  
  return allMosques.filter(mosque => {
    // Проверяем, что это действительно мечеть
    if (!isMosqueRelated(mosque.name)) {
      return false;
    }
    
    // Включаем альтернативные названия в поиск
    const allTexts = [
      mosque.name,
      mosque.address,
      ...(mosque.alternativeNames || []),
      ...(mosque.services || [])
    ].join(' ').toLowerCase();
    
    return searchVariations.some(variation => 
      allTexts.includes(variation) ||
      // Дополнительный поиск по частичному совпадению
      variation.split(' ').some(word => 
        word.length > 2 && allTexts.includes(word)
      )
    );
  });
}