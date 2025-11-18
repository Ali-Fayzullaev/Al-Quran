/**
 * Основной сервис поиска мечетей
 */

import { Mosque, SearchParams, UserLocation, MosqueSearchFilters } from '@/types/mosque';
import { LocalStorageCache } from '@/lib/mosqueCache';
import { GeolocationService } from '@/lib/geolocation';
import { popularMosques, getMosquesByLocation, searchMosquesByKeyword } from '@/data/popularMosques';

class MosqueFinderService {
  private cache = new LocalStorageCache('mosque-finder', 24 * 60 * 60 * 1000); // 24 часа
  private geolocation = GeolocationService.getInstance();
  private dailyRequestCount = 0;
  private readonly maxDailyRequests = 100; // Лимит для экономии

  /**
   * Поиск мечетей по координатам
   */
  async searchMosques(
    lat: number, 
    lng: number, 
    radius: number = 5000,
    filters?: MosqueSearchFilters
  ): Promise<Mosque[]> {
    const cacheKey = `mosques-${lat}-${lng}-${radius}-${JSON.stringify(filters || {})}`;
    
    // Проверяем кэш
    const cached = this.cache.get<Mosque[]>(cacheKey);
    if (cached) {
      console.log('📋 Мечети загружены из кэша');
      return this.addDistancesToMosques(cached, lat, lng);
    }

    try {
      // Проверяем лимит запросов
      if (this.dailyRequestCount >= this.maxDailyRequests) {
        console.warn('⚠️ Достигнут дневной лимит запросов. Используем локальную базу.');
        return this.getLocalMosques(lat, lng, radius);
      }

      // Поиск через API
      const response = await fetch(`/api/search-mosques?lat=${lat}&lng=${lng}&radius=${radius}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      let mosques = data.mosques || [];
      
      // Применяем фильтры
      if (filters) {
        mosques = this.applyFilters(mosques, filters);
      }

      // Добавляем расстояния
      mosques = this.addDistancesToMosques(mosques, lat, lng);
      
      // Сортируем по расстоянию
      mosques.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      
      // Сохраняем в кэш
      this.cache.set(cacheKey, mosques);
      this.dailyRequestCount++;
      
      return mosques.slice(0, 20); // Ограничиваем 20 результатами
      
    } catch (error) {
      console.error('❌ Ошибка поиска через API:', error);
      // Fallback на локальную базу
      return this.getLocalMosques(lat, lng, radius);
    }
  }

  /**
   * Поиск мечетей по городу
   */
  async searchMosquesByCity(city: string, country?: string): Promise<Mosque[]> {
    try {
      // Получаем координаты города
      const location = await this.geolocation.geocodeAddress(`${city}${country ? ', ' + country : ''}`);
      
      if (!location) {
        throw new Error('Не удалось найти город');
      }

      return await this.searchMosques(location.lat, location.lng);
    } catch (error) {
      console.error('Ошибка поиска по городу:', error);
      // Fallback на локальную базу
      return getMosquesByLocation(city, country);
    }
  }

  /**
   * Поиск по ключевым словам
   */
  searchMosquesByKeyword(keyword: string): Mosque[] {
    return searchMosquesByKeyword(keyword);
  }

  /**
   * Получение мечетей из локальной базы
   */
  private getLocalMosques(lat: number, lng: number, radius: number): Mosque[] {
    const allMosques = Object.values(popularMosques).flat();
    
    // Фильтруем по расстоянию
    const nearbyMosques = allMosques.filter(mosque => {
      const distance = this.geolocation.calculateDistance(
        lat, lng, 
        mosque.location.lat, mosque.location.lng
      );
      return distance <= radius / 1000; // Переводим в км
    });

    return this.addDistancesToMosques(nearbyMosques, lat, lng);
  }

  /**
   * Добавляем расстояния к мечетям
   */
  private addDistancesToMosques(mosques: Mosque[], userLat: number, userLng: number): Mosque[] {
    return mosques.map(mosque => ({
      ...mosque,
      distance: this.geolocation.calculateDistance(
        userLat, userLng,
        mosque.location.lat, mosque.location.lng
      )
    }));
  }

  /**
   * Применяем фильтры
   */
  private applyFilters(mosques: Mosque[], filters: MosqueSearchFilters): Mosque[] {
    return mosques.filter(mosque => {
      // Фильтр по рейтингу
      if (filters.minRating && mosque.rating && mosque.rating < filters.minRating) {
        return false;
      }

      // Фильтр по пятничному намазу
      if (filters.hasJumuah && (!mosque.jumuah_times || mosque.jumuah_times.length === 0)) {
        return false;
      }

      return true;
    });
  }

  /**
   * Получение детальной информации о мечети
   */
  async getMosqueDetails(mosqueId: string): Promise<Mosque | null> {
    const cacheKey = `mosque-details-${mosqueId}`;
    const cached = this.cache.get<Mosque>(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const response = await fetch(`/api/mosque-details?id=${mosqueId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      const mosque = data.mosque;
      this.cache.set(cacheKey, mosque, 7 * 24 * 60 * 60 * 1000); // 7 дней
      
      return mosque;
    } catch (error) {
      console.error('Ошибка получения деталей:', error);
      return null;
    }
  }

  /**
   * Очистка кэша
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Получение статистики
   */
  getStats(): { requestsToday: number; maxRequests: number; cacheStats: { totalItems: number; totalSize: number } } {
    return {
      requestsToday: this.dailyRequestCount,
      maxRequests: this.maxDailyRequests,
      cacheStats: this.cache.getStats()
    };
  }
}

// Синглтон
export const mosqueFinderService = new MosqueFinderService();
export default mosqueFinderService;