import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query
      )}&limit=10&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'Al-Quran-PrayerTimes/1.0',
          'Accept': 'application/json',
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    
    const results = data
      .filter((item: any) => {
        const allowedTypes = ['city', 'town', 'village', 'municipality', 'borough', 'district'];
        const allowedClasses = ['place', 'boundary'];
        
        return allowedTypes.includes(item.type) || 
               allowedClasses.includes(item.class) ||
               (item.address && (item.address.city || item.address.town || item.address.village));
      })
      .map((item: any) => {
        let cityName = item.display_name.split(',')[0];
        
        if (item.address) {
          cityName = item.address.city || 
                    item.address.town || 
                    item.address.village || 
                    item.address.municipality ||
                    cityName;
        }
        
        const addressParts = item.display_name.split(',');
        let country = addressParts[addressParts.length - 1]?.trim() || '';
        
        if (item.address && item.address.country) {
          country = item.address.country;
        }
        
        return {
          city: cityName.trim(),
          country: country,
          coordinates: {
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon)
          }
        };
      })
      .filter((item: any) => item.city && item.city.length > 0)
      .slice(0, 5);

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Ошибка поиска городов:', error);
    
    // Возвращаем популярные города как резерв
    const popularCities = [
      { city: 'Moscow', country: 'Russia', coordinates: { lat: 55.7558, lng: 37.6176 } },
      { city: 'London', country: 'United Kingdom', coordinates: { lat: 51.5074, lng: -0.1278 } },
      { city: 'Istanbul', country: 'Turkey', coordinates: { lat: 41.0082, lng: 28.9784 } },
      { city: 'Dubai', country: 'UAE', coordinates: { lat: 25.2048, lng: 55.2708 } },
      { city: 'Almaty', country: 'Kazakhstan', coordinates: { lat: 43.2220, lng: 76.8512 } },
      { city: 'Tashkent', country: 'Uzbekistan', coordinates: { lat: 41.2995, lng: 69.2401 } }
    ];

    const lowerQuery = query.toLowerCase();
    const filtered = popularCities.filter(city => 
      city.city.toLowerCase().includes(lowerQuery) ||
      city.country.toLowerCase().includes(lowerQuery)
    );

    return NextResponse.json({ results: filtered });
  }
}