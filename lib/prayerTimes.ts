/**
 * Система определения времени намазов с использованием Aladhan API
 * Профессиональная реализация для Al-Quran приложения
 */

// ========== ТИПЫ И ИНТЕРФЕЙСЫ ==========

export interface PrayerTimesData {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

export interface NextPrayer {
  name: string;
  time: string;
  timeUntil: string;
  arabic: string;
}

export interface LocationInfo {
  autoDetected: boolean;
  city: string;
  country: string;
  coordinates: { lat: number; lng: number };
  timezone: string;
}

export interface CalculationMethodInfo {
  id: number;
  name: string;
  nameAr: string;
}

export interface PrayerTimesSystem {
  location: LocationInfo;
  calculationMethod: CalculationMethodInfo;
  prayerTimes: {
    fajr: string;
    sunrise: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
    nextPrayer: NextPrayer;
    date: {
      hijri: string;
      gregorian: string;
    };
  };
  lastUpdated: Date;
}

export interface SearchResult {
  city: string;
  country: string;
  coordinates: { lat: number; lng: number };
}

export interface CalculationSettings {
  method: string;
  school: 'Hanafi' | 'Shafi';
  adjustments: {
    fajr: number;
    sunrise: number;
    dhuhr: number;
    asr: number;
    maghrib: number;
    isha: number;
  };
}

// ========== МЕТОДЫ РАСЧЕТА ==========

export const CALCULATION_METHODS: CalculationMethodInfo[] = [
  { id: 1, name: 'University of Islamic Sciences, Karachi', nameAr: 'جامعة العلوم الإسلامية، كراتشي' },
  { id: 2, name: 'Islamic Society of North America (ISNA)', nameAr: 'الجمعية الإسلامية لأمريكا الشمالية' },
  { id: 3, name: 'Muslim World League (MWL)', nameAr: 'رابطة العالم الإسلامي' },
  { id: 4, name: 'Umm al-Qura, Makkah', nameAr: 'أم القرى، مكة' },
  { id: 5, name: 'Egyptian General Authority of Survey', nameAr: 'الهيئة المصرية العامة للمساحة' },
  { id: 7, name: 'Institute of Geophysics, University of Tehran', nameAr: 'معهد الجيوفيزياء، جامعة طهران' },
  { id: 0, name: 'Jafari (Shia Ithna-Ashari)', nameAr: 'جعفري (شيعة اثنا عشرية)' }
];

// ========== ОСНОВНЫЕ ФУНКЦИИ ==========

/**
 * Получает текущее местоположение пользователя
 */
export async function getUserLocation(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Геолокация не поддерживается'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        let message = 'Не удалось определить местоположение';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Доступ к геолокации запрещен';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Информация о местоположении недоступна';
            break;
          case error.TIMEOUT:
            message = 'Время ожидания определения местоположения истекло';
            break;
        }
        reject(new Error(message));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 минут
      }
    );
  });
}

/**
 * Получает время намазов по координатам
 */
export async function getPrayerTimesByCoordinates(
  coordinates: { lat: number; lng: number },
  method: number = 3
): Promise<PrayerTimesSystem> {
  try {
    const response = await fetch(
      `https://api.aladhan.com/v1/timings?latitude=${coordinates.lat}&longitude=${coordinates.lng}&method=${method}&school=1`
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.code !== 200) {
      throw new Error(data.data || 'Ошибка получения данных');
    }

    return processPrayerTimesResponse(data.data, coordinates, true);
  } catch (error) {
    console.error('Ошибка получения времени намазов по координатам:', error);
    throw error;
  }
}

/**
 * Получает время намазов по названию города
 */
export async function getPrayerTimesByCity(
  city: string,
  country: string = '',
  method: number = 3
): Promise<PrayerTimesSystem> {
  try {
    let url = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&method=${method}&school=1`;
    
    if (country) {
      url += `&country=${encodeURIComponent(country)}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.code !== 200) {
      throw new Error(data.data || 'Ошибка получения данных');
    }

    return processPrayerTimesResponse(data.data, null, false);
  } catch (error) {
    console.error('Ошибка получения времени намазов по городу:', error);
    throw error;
  }
}

/**
 * Возвращает текущее время как Date, у которого час/минута соответствуют
 * стенным часам в указанной IANA-таймзоне (сам timestamp внутри объекта
 * при этом смещён — важны только getHours/getMinutes/getDate для сравнения
 * с временем намазов, которое тоже приходит в виде стенных часов локации).
 */
function getNowInTimezone(timezone: string): Date {
  try {
    return new Date(new Date().toLocaleString('en-US', { timeZone: timezone }));
  } catch {
    return new Date();
  }
}

function formatDurationMs(ms: number): string {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}ч ${minutes}м`;
}

/**
 * Обрабатывает ответ от API Aladhan
 */
function processPrayerTimesResponse(
  data: any,
  coordinates: { lat: number; lng: number } | null,
  autoDetected: boolean
): PrayerTimesSystem {
  const timings = data.timings;
  const meta = data.meta;
  const date = data.date;

  // Считаем "сейчас" в таймзоне искомой локации, а не в таймзоне устройства —
  // иначе для города в другом часовом поясе "время до намаза" будет неверным.
  const currentTime = getNowInTimezone(meta.timezone);
  const prayerNames = [
    { key: 'Fajr', name: 'Фаджр', arabic: 'الفجر' },
    { key: 'Dhuhr', name: 'Зухр', arabic: 'الظهر' },
    { key: 'Asr', name: 'Аср', arabic: 'العصر' },
    { key: 'Maghrib', name: 'Магриб', arabic: 'المغرب' },
    { key: 'Isha', name: 'Иша', arabic: 'العشاء' }
  ];

  let nextPrayer = prayerNames[0];
  let timeUntil = '';

  // Находим следующий намаз
  for (const prayer of prayerNames) {
    const prayerTime = new Date(currentTime);
    const [hours, minutes] = timings[prayer.key].split(':');
    prayerTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    if (prayerTime > currentTime) {
      nextPrayer = prayer;
      timeUntil = formatDurationMs(prayerTime.getTime() - currentTime.getTime());
      break;
    }
  }

  // Если все намазы на сегодня прошли, следующий - завтрашний фаджр;
  // считаем реальное время ожидания, а не показываем статичную надпись.
  if (!timeUntil) {
    nextPrayer = prayerNames[0];
    const tomorrowFajr = new Date(currentTime);
    tomorrowFajr.setDate(tomorrowFajr.getDate() + 1);
    const [fajrHours, fajrMinutes] = timings.Fajr.split(':');
    tomorrowFajr.setHours(parseInt(fajrHours), parseInt(fajrMinutes), 0, 0);
    timeUntil = formatDurationMs(tomorrowFajr.getTime() - currentTime.getTime());
  }

  return {
    location: {
      autoDetected,
      city: meta.timezone.split('/')[1]?.replace('_', ' ') || 'Неизвестно',
      country: meta.timezone.split('/')[0] || 'Неизвестно',
      coordinates: coordinates || { lat: meta.latitude || 0, lng: meta.longitude || 0 },
      timezone: meta.timezone
    },
    calculationMethod: CALCULATION_METHODS.find(m => m.id === meta.method.id) || CALCULATION_METHODS[0],
    prayerTimes: {
      fajr: timings.Fajr,
      sunrise: timings.Sunrise,
      dhuhr: timings.Dhuhr,
      asr: timings.Asr,
      maghrib: timings.Maghrib,
      isha: timings.Isha,
      nextPrayer: {
        name: nextPrayer.name,
        time: timings[nextPrayer.key],
        timeUntil,
        arabic: nextPrayer.arabic
      },
      date: {
        hijri: `${date.hijri.day} ${date.hijri.month.ar} ${date.hijri.year}`,
        gregorian: date.readable
      }
    },
    lastUpdated: new Date()
  };
}

/**
 * Получает информацию о городе по координатам через обратное геокодирование
 */
export async function getCityFromCoordinates(lat: number, lng: number): Promise<{ city?: string; country?: string }> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'Al-Quran-PrayerTimes/1.0'
        }
      }
    );
    
    if (!response.ok) throw new Error('Геокодирование недоступно');
    
    const data = await response.json();
    const address = data.address || {};
    
    return {
      city: address.city || address.town || address.village || address.state,
      country: address.country
    };
  } catch (error) {
    console.warn('Не удалось получить информацию о городе:', error);
    return {};
  }
}

/**
 * Поиск городов для автодополнения
 */
export async function searchCities(query: string): Promise<SearchResult[]> {
  if (query.length < 2) return [];

  try {
    // Используем наш API роут для избежания CORS
    const response = await fetch(`/api/search-cities?q=${encodeURIComponent(query)}`);

    if (!response.ok) {
      // Если API роут не работает, используем резервный метод
      return getPopularCities(query);
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.warn('Ошибка поиска городов через API:', error);
    // Возвращаем популярные города как резерв
    return getPopularCities(query);
  }
}

/**
 * Резервный список популярных городов для поиска
 */
function getPopularCities(query: string): SearchResult[] {
  const popularCities = [
    { city: 'Moscow', country: 'Russia', coordinates: { lat: 55.7558, lng: 37.6176 } },
    { city: 'London', country: 'United Kingdom', coordinates: { lat: 51.5074, lng: -0.1278 } },
    { city: 'Istanbul', country: 'Turkey', coordinates: { lat: 41.0082, lng: 28.9784 } },
    { city: 'Dubai', country: 'UAE', coordinates: { lat: 25.2048, lng: 55.2708 } },
    { city: 'Mecca', country: 'Saudi Arabia', coordinates: { lat: 21.3891, lng: 39.8579 } },
    { city: 'Medina', country: 'Saudi Arabia', coordinates: { lat: 24.5247, lng: 39.5692 } },
    { city: 'Cairo', country: 'Egypt', coordinates: { lat: 30.0444, lng: 31.2357 } },
    { city: 'Tashkent', country: 'Uzbekistan', coordinates: { lat: 41.2995, lng: 69.2401 } },
    { city: 'Almaty', country: 'Kazakhstan', coordinates: { lat: 43.2220, lng: 76.8512 } },
    { city: 'New York', country: 'USA', coordinates: { lat: 40.7128, lng: -74.0060 } },
    { city: 'Paris', country: 'France', coordinates: { lat: 48.8566, lng: 2.3522 } },
    { city: 'Berlin', country: 'Germany', coordinates: { lat: 52.5200, lng: 13.4050 } },
    { city: 'Madrid', country: 'Spain', coordinates: { lat: 40.4168, lng: -3.7038 } },
    { city: 'Rome', country: 'Italy', coordinates: { lat: 41.9028, lng: 12.4964 } },
    { city: 'Tokyo', country: 'Japan', coordinates: { lat: 35.6762, lng: 139.6503 } },
    { city: 'Seoul', country: 'South Korea', coordinates: { lat: 37.5665, lng: 126.9780 } },
    { city: 'Mumbai', country: 'India', coordinates: { lat: 19.0760, lng: 72.8777 } },
    { city: 'Delhi', country: 'India', coordinates: { lat: 28.7041, lng: 77.1025 } },
    { city: 'Karachi', country: 'Pakistan', coordinates: { lat: 24.8607, lng: 67.0011 } },
    { city: 'Tehran', country: 'Iran', coordinates: { lat: 35.6892, lng: 51.3890 } }
  ];

  const lowerQuery = query.toLowerCase();
  return popularCities.filter(city => 
    city.city.toLowerCase().includes(lowerQuery) ||
    city.country.toLowerCase().includes(lowerQuery)
  ).slice(0, 5);
}

/**
 * Получает настройки расчета по умолчанию для региона
 */
export function getDefaultCalculationSettings(coordinates?: { lat: number; lng: number }): { method: number; school: number } {
  let method = 3; // Muslim World League по умолчанию
  let school = 1; // Shafi по умолчанию
  
  if (coordinates) {
    const { lat, lng } = coordinates;
    
    // Северная Америка
    if (lat > 25 && lat < 75 && lng > -170 && lng < -60) {
      method = 2; // ISNA
    }
    // Средний Восток и Саудовская Аравия
    else if (lat > 12 && lat < 42 && lng > 30 && lng < 75) {
      method = 4; // Umm al-Qura
    }
    // Пакистан, Индия, Бангладеш
    else if (lat > 5 && lat < 40 && lng > 60 && lng < 100) {
      method = 1; // Karachi
      school = 0; // Hanafi
    }
    // Иран
    else if (lat > 25 && lat < 40 && lng > 44 && lng < 64) {
      method = 7; // Tehran
    }
    // Египет и Африка
    else if (lat > -35 && lat < 35 && lng > -20 && lng < 55) {
      method = 5; // Egyptian
    }
  }
  
  return { method, school };
}

// ========== КЭШИРОВАНИЕ ==========

const cache = new Map<string, { data: PrayerTimesSystem; timestamp: number }>();
const CACHE_DURATION = 1000 * 60 * 60; // 1 час

/**
 * Проверяет актуальность кэша
 */
function isCacheValid(timestamp: number): boolean {
  return Date.now() - timestamp < CACHE_DURATION;
}

/**
 * Получает данные из кэша
 */
export function getCachedPrayerTimes(key: string): PrayerTimesSystem | null {
  const cached = cache.get(key);
  if (cached && isCacheValid(cached.timestamp)) {
    return cached.data;
  }
  return null;
}

/**
 * Сохраняет данные в кэш
 */
export function setCachedPrayerTimes(key: string, data: PrayerTimesSystem): void {
  cache.set(key, { data, timestamp: Date.now() });
}

/**
 * Получает время намазов на месяц по координатам
 */
export async function getPrayerTimesMonth(
  coordinates: { lat: number; lng: number },
  year: number,
  month: number,
  method: number = 3
): Promise<any> {
  try {
    const response = await fetch(
      `https://api.aladhan.com/v1/calendar?latitude=${coordinates.lat}&longitude=${coordinates.lng}&method=${method}&month=${month}&year=${year}&school=1`
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.code !== 200) {
      throw new Error(data.data || 'Ошибка получения данных');
    }

    return data.data;
  } catch (error) {
    console.error('Ошибка получения календаря намазов:', error);
    throw error;
  }
}

/**
 * Форматирует время в 12-часовой формат
 */
export function formatTimeTo12Hour(time24: string): string {
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours, 10);
  const minute = parseInt(minutes, 10);
  
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  
  return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
}

/**
 * Определяет прошедший ли намаз
 */
export function isPrayerPassed(prayerTime: string): boolean {
  const now = new Date();
  const [hours, minutes] = prayerTime.split(':');
  const prayerDate = new Date();
  prayerDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
  
  return now > prayerDate;
}