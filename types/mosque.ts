/**
 * Типы для системы поиска мечетей
 */

export interface Mosque {
  id: string;
  name: string;
  alternativeNames?: string[]; // Альтернативные названия для поиска
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  rating?: number;
  user_ratings_total?: number;
  opening_hours?: {
    open_now: boolean;
    weekday_text?: string[];
  };
  photos?: string[];
  jumuah_times?: string[];
  services?: string[];
  distance?: number; // в км
  phone?: string;
  website?: string;
  place_id?: string;
}

export interface SearchParams {
  location: string;
  radius: number; // в метрах
  sortBy: 'distance' | 'rating';
}

export interface UserLocation {
  lat: number;
  lng: number;
  city?: string;
  country?: string;
}

export interface MosqueSearchFilters {
  hasJumuah: boolean;
  hasParking: boolean;
  wheelchairAccessible: boolean;
  minRating: number;
}

export interface CacheItem<T> {
  value: T;
  timestamp: number;
  ttl: number;
}