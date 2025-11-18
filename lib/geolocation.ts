/**
 * Сервис геолокации пользователя
 */

import { UserLocation } from '@/types/mosque';

export class GeolocationService {
  private static instance: GeolocationService;
  
  public static getInstance(): GeolocationService {
    if (!GeolocationService.instance) {
      GeolocationService.instance = new GeolocationService();
    }
    return GeolocationService.instance;
  }

  async getCurrentPosition(): Promise<UserLocation> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Геолокация не поддерживается вашим браузером'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location: UserLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          // Получаем информацию о городе
          try {
            const cityInfo = await this.getCityFromCoordinates(location.lat, location.lng);
            location.city = cityInfo.city;
            location.country = cityInfo.country;
          } catch (error) {
            console.warn('Не удалось определить город:', error);
          }
          
          resolve(location);
        },
        (error) => {
          reject(this.handleGeolocationError(error));
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 300000, // 5 минут
        }
      );
    });
  }

  private async getCityFromCoordinates(lat: number, lng: number): Promise<{ city?: string; country?: string }> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'Al-Quran-MoscheFinder/1.0'
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
      console.warn('Ошибка геокодирования:', error);
      return {};
    }
  }

  private handleGeolocationError(error: GeolocationPositionError): Error {
    const errorMessages = {
      1: 'Разрешение на доступ к местоположению отклонено',
      2: 'Информация о местоположении недоступна',
      3: 'Время ожидания определения местоположения истекло',
    };
    
    return new Error(
      errorMessages[error.code as keyof typeof errorMessages] || 
      'Неизвестная ошибка геолокации'
    );
  }

  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Радиус Земли в км
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return Math.round(distance * 100) / 100; // Округляем до 2 знаков
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  // Получаем координаты по адресу
  async geocodeAddress(address: string): Promise<UserLocation | null> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
        {
          headers: {
            'User-Agent': 'Al-Quran-MoscheFinder/1.0'
          }
        }
      );
      
      if (!response.ok) throw new Error('Геокодирование недоступно');
      
      const data = await response.json();
      
      if (data.length === 0) {
        throw new Error('Адрес не найден');
      }
      
      const result = data[0];
      return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        city: result.display_name.split(',')[0],
        country: result.display_name.split(',').pop()?.trim()
      };
    } catch (error) {
      console.error('Ошибка геокодирования:', error);
      return null;
    }
  }
}