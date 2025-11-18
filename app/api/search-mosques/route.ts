import { NextRequest, NextResponse } from 'next/server';

/**
 * API роут для поиска мечетей через Google Places API
 * Используется для обхода CORS ограничений
 */

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const radius = searchParams.get('radius') || '5000';

  if (!lat || !lng) {
    return NextResponse.json({ 
      error: 'Координаты обязательны',
      mosques: []
    }, { status: 400 });
  }

  // Проверяем наличие API ключа
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    console.warn('⚠️ Google Places API ключ не настроен. Используем Mock данные.');
    return NextResponse.json({ 
      mosques: getMockMosques(parseFloat(lat), parseFloat(lng), parseInt(radius))
    });
  }

  try {
    // Поиск мечетей через Google Places API с повышенной специфичностью
    const placesResponse = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?` +
      `location=${lat},${lng}&radius=${radius}&type=place_of_worship&keyword=mosque+masjid+islamic&key=${apiKey}`,
      {
        headers: {
          'Accept': 'application/json',
        }
      }
    );

    if (!placesResponse.ok) {
      throw new Error(`Google Places API error: ${placesResponse.status}`);
    }

    const placesData = await placesResponse.json();
    
    if (placesData.status !== 'OK') {
      console.warn(`Google Places API status: ${placesData.status}`);
      // Возвращаем mock данные при ошибке
      return NextResponse.json({ 
        mosques: getMockMosques(parseFloat(lat), parseFloat(lng), parseInt(radius))
      });
    }

    // Фильтруем результаты: только мечети
    const filteredResults = placesData.results.filter((place: any) => {
      const placeName = place.name.toLowerCase();
      const placeTypes = place.types || [];
      
      // Проверяем типы места
      const hasReligiousType = placeTypes.includes('place_of_worship') || 
                             placeTypes.includes('mosque') ||
                             placeTypes.includes('establishment');
      
      // Исключаем отели и другие немечетские объекты
      const excludeKeywords = [
        'hotel', 'apart-hotel', 'apartment', 'resort', 'inn', 'lodge', 'hostel',
        'restaurant', 'cafe', 'bar', 'pub', 'club', 'lounge',
        'shop', 'store', 'mall', 'market', 'center', 'centre', 'plaza',
        'office', 'business', 'company', 'hospital', 'clinic', 'pharmacy'
      ];
      
      const hasExcludeWords = excludeKeywords.some(keyword => 
        placeName.includes(keyword) || placeTypes.includes(keyword)
      );
      
      // Проверяем мечетские ключевые слова
      const mosqueKeywords = ['mosque', 'masjid', 'islamic', 'muslim', 'prayer', 'jami'];
      const hasMosqueWords = mosqueKeywords.some(keyword => placeName.includes(keyword));
      
      return hasReligiousType && !hasExcludeWords && (hasMosqueWords || hasReligiousType);
    });
    
    // Преобразуем отфильтрованные данные Google Places в наш формат
    const mosques = await Promise.all(
      filteredResults.slice(0, 15).map(async (place: any) => {
        // Получаем детальную информацию о мечети
        const details = await getPlaceDetails(place.place_id, apiKey);
        
        return transformGooglePlaceToMosque(place, details, apiKey);
      })
    );

    return NextResponse.json({ mosques: mosques.filter(Boolean) });
    
  } catch (error) {
    console.error('Ошибка поиска мечетей:', error);
    
    // Возвращаем mock данные при ошибке
    return NextResponse.json({ 
      mosques: getMockMosques(parseFloat(lat), parseFloat(lng), parseInt(radius))
    });
  }
}

/**
 * Генерация URL для фотографий через Google Places Photos API
 */
function generatePhotoUrls(photos: any[], apiKey: string): string[] {
  if (!photos || photos.length === 0) return [];
  
  return photos.slice(0, 5).map(photo => 
    `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${apiKey}`
  );
}

/**
 * Получение детальной информации о месте
 */
async function getPlaceDetails(placeId: string, apiKey: string) {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?` +
      `place_id=${placeId}&fields=name,formatted_address,geometry,rating,opening_hours,photos,website,formatted_phone_number,user_ratings_total&key=${apiKey}`
    );
    
    if (!response.ok) {
      throw new Error(`Place Details API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.result;
  } catch (error) {
    console.warn('Ошибка получения деталей:', error);
    return null;
  }
}

/**
 * Преобразование данных Google Places в наш формат
 */
function transformGooglePlaceToMosque(place: any, details: any, apiKey: string) {
  const mosque = {
    id: place.place_id,
    name: place.name || details?.name || 'Неизвестная мечеть',
    address: place.vicinity || details?.formatted_address || '',
    location: {
      lat: place.geometry.location.lat,
      lng: place.geometry.location.lng,
    },
    rating: place.rating || details?.rating,
    user_ratings_total: place.user_ratings_total || details?.user_ratings_total,
    opening_hours: details?.opening_hours,
    phone: details?.formatted_phone_number,
    website: details?.website,
    place_id: place.place_id,
    photos: generatePhotoUrls(details?.photos || place.photos || [], apiKey),
    // Оцениваем время пятничного намаза (по умолчанию)
    jumuah_times: estimateJumuahTimes(place),
    services: estimateServices(place),
  };

  return mosque;
}

/**
 * Оценка времени пятничного намаза
 */
function estimateJumuahTimes(place: any): string[] {
  // По умолчанию возвращаем стандартное время
  return ['12:30', '13:30'];
}

/**
 * Оценка услуг мечети
 */
function estimateServices(place: any): string[] {
  const services = ['Пятничный намаз'];
  
  // Добавляем услуги на основе рейтинга
  if (place.rating && place.rating > 4.0) {
    services.push('Образование');
  }
  
  if (place.user_ratings_total && place.user_ratings_total > 100) {
    services.push('Общественные мероприятия');
  }
  
  return services;
}

/**
 * Mock данные для тестирования без API ключа
 */
function getMockMosques(lat: number, lng: number, radius: number) {
  // Возвращаем mock данные с фотографиями
  return [
    {
      id: 'mock-mosque-1',
      name: 'Мечеть Аль-Нур',
      address: `Исламский центр, близко к ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      location: { 
        lat: lat + (Math.random() - 0.5) * 0.01, 
        lng: lng + (Math.random() - 0.5) * 0.01 
      },
      rating: 4.5,
      user_ratings_total: 234,
      photos: [
        'https://images.unsplash.com/photo-1564769625392-651b2ee1ddd4?w=400&h=300&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1593564937782-c4c38cee1ee0?w=400&h=300&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1555826542-c3024f841e70?w=400&h=300&fit=crop&auto=format'
      ],
      jumuah_times: ['12:30', '13:30'],
      services: ['Пятничный намаз', 'Образование', 'Коранские уроки'],
      opening_hours: {
        open_now: true,
        weekday_text: ['Открыто для молитв: 5:00–22:00']
      }
    },
    {
      id: 'mock-mosque-2',
      name: 'Масжид Аль-Хикма',
      address: `Центральная мечеть района`,
      location: { 
        lat: lat + (Math.random() - 0.5) * 0.02, 
        lng: lng + (Math.random() - 0.5) * 0.02 
      },
      rating: 4.8,
      user_ratings_total: 567,
      photos: [
        'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&h=300&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=400&h=300&fit=crop&auto=format'
      ],
      jumuah_times: ['13:00', '14:00'],
      services: ['Пятничный намаз', 'Мадраса', 'Никах', 'Исламская библиотека'],
      phone: '+7 (000) 000-00-00',
      opening_hours: {
        open_now: true,
        weekday_text: ['Ежедневно: 5:00–22:00 (молитвенный зал)']
      }
    },
    {
      id: 'mock-mosque-3',
      name: 'Мечеть Ар-Рахман',
      address: `Мусульманская община`,
      location: { 
        lat: lat + (Math.random() - 0.5) * 0.015, 
        lng: lng + (Math.random() - 0.5) * 0.015 
      },
      rating: 4.6,
      user_ratings_total: 345,
      photos: [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop&auto=format'
      ],
      jumuah_times: ['12:00', '13:15'],
      services: ['Пятничный намаз', 'Образование для детей'],
      opening_hours: {
        open_now: true,
        weekday_text: ['Открыто для посещения: 6:00–21:00']
      }
    }
  ];
}