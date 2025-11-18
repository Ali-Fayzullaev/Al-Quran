/**
 * Система кэширования для мечетей
 */

import { CacheItem } from '@/types/mosque';

export class LocalStorageCache {
  constructor(
    private prefix: string, 
    private defaultTtl: number = 7 * 24 * 60 * 60 * 1000 // 7 дней
  ) {}

  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(`${this.prefix}-${key}`);
      if (!item) return null;

      const cached: CacheItem<T> = JSON.parse(item);
      
      // Проверяем TTL
      if (Date.now() - cached.timestamp > cached.ttl) {
        this.delete(key);
        return null;
      }

      return cached.value;
    } catch (error) {
      console.warn('Ошибка чтения кэша:', error);
      return null;
    }
  }

  set<T>(key: string, value: T, customTtl?: number): void {
    try {
      const item: CacheItem<T> = {
        value,
        timestamp: Date.now(),
        ttl: customTtl || this.defaultTtl
      };
      
      localStorage.setItem(`${this.prefix}-${key}`, JSON.stringify(item));
    } catch (error) {
      console.warn('LocalStorage переполнен или недоступен:', error);
      // Очищаем старые записи и пробуем снова
      this.cleanup();
      try {
        localStorage.setItem(`${this.prefix}-${key}`, JSON.stringify({
          value,
          timestamp: Date.now(),
          ttl: customTtl || this.defaultTtl
        }));
      } catch {
        // Если все еще не работает, игнорируем
        console.warn('Не удалось сохранить в кэш');
      }
    }
  }

  delete(key: string): void {
    localStorage.removeItem(`${this.prefix}-${key}`);
  }

  cleanup(): void {
    const keys = Object.keys(localStorage);
    const now = Date.now();
    
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        try {
          const item = JSON.parse(localStorage.getItem(key) || '');
          if (now - item.timestamp > item.ttl) {
            localStorage.removeItem(key);
          }
        } catch {
          // Поврежденные данные - удаляем
          localStorage.removeItem(key);
        }
      }
    });
  }

  clear(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key);
      }
    });
  }

  getStats(): { totalItems: number; totalSize: number } {
    const keys = Object.keys(localStorage);
    let totalItems = 0;
    let totalSize = 0;
    
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        totalItems++;
        totalSize += localStorage.getItem(key)?.length || 0;
      }
    });
    
    return { totalItems, totalSize };
  }
}