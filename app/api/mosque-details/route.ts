import { NextRequest, NextResponse } from 'next/server';

/**
 * API роут для получения детальной информации о мечети
 */

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const placeId = searchParams.get('id');

  if (!placeId) {
    return NextResponse.json({ 
      error: 'ID мечети обязателен'
    }, { status: 400 });
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    // Возвращаем mock данные
    return NextResponse.json({ 
      mosque: getMockMosqueDetails(placeId)
    });
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?` +
      `place_id=${placeId}&fields=name,formatted_address,geometry,rating,opening_hours,photos,website,formatted_phone_number,user_ratings_total,reviews&key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status !== 'OK') {
      throw new Error(`Google Places API status: ${data.status}`);
    }

    const place = data.result;
    const mosque = {
      id: placeId,
      name: place.name,
      address: place.formatted_address,
      location: {
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
      },
      rating: place.rating,
      user_ratings_total: place.user_ratings_total,
      opening_hours: place.opening_hours,
      phone: place.formatted_phone_number,
      website: place.website,
      photos: place.photos?.slice(0, 5).map((photo: any) => 
        `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photo.photo_reference}&key=${apiKey}`
      ),
      reviews: place.reviews?.slice(0, 5).map((review: any) => ({
        author: review.author_name,
        rating: review.rating,
        text: review.text,
        time: review.time
      })),
      jumuah_times: estimateJumuahTimes(),
      services: estimateServices(place),
    };

    return NextResponse.json({ mosque });
    
  } catch (error) {
    console.error('Ошибка получения деталей мечети:', error);
    
    return NextResponse.json({ 
      mosque: getMockMosqueDetails(placeId)
    });
  }
}

function estimateJumuahTimes(): string[] {
  return ['12:30', '13:30'];
}

function estimateServices(place: any): string[] {
  const services = ['Пятничный намаз'];
  
  if (place.rating && place.rating > 4.0) {
    services.push('Образование');
  }
  
  if (place.user_ratings_total && place.user_ratings_total > 100) {
    services.push('Общественные мероприятия');
  }
  
  return services;
}

function getMockMosqueDetails(placeId: string) {
  return {
    id: placeId,
    name: 'Пример мечети',
    address: 'Пример адреса',
    location: { lat: 55.7558, lng: 37.6176 },
    rating: 4.5,
    user_ratings_total: 234,
    jumuah_times: ['12:30', '13:30'],
    services: ['Пятничный намаз', 'Образование'],
    opening_hours: {
      open_now: true,
      weekday_text: ['Открыто круглосуточно']
    },
    phone: '+7 (000) 000-00-00'
  };
}