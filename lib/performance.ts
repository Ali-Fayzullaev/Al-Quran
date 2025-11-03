// lib/performance.ts
import { unstable_cache } from 'next/cache';
import { useEffect, useState } from 'react';

// Кеширование функций для лучшей производительности
export const createCachedFunction = <T extends (...args: any[]) => any>(
  fn: T,
  keyParts: string[],
  revalidate?: number
): T => {
  return unstable_cache(fn, keyParts, {
    revalidate: revalidate || 3600, // По умолчанию час
    tags: keyParts,
  }) as T;
};

// Дебаунс функция
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  };
};

// Throttle функция
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Мемоизация для React компонентов
export const memoize = <T extends (...args: any[]) => any>(fn: T): T => {
  const cache = new Map();
  return ((...args: any[]) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
};

// Утилиты для мониторинга производительности приложения
export class PerformanceMonitor {
  private static metrics: Map<string, number> = new Map();
  
  // Замеряем время загрузки компонентов
  static startTimer(name: string) {
    this.metrics.set(name, performance.now());
  }
  
  static endTimer(name: string) {
    const startTime = this.metrics.get(name);
    if (startTime) {
      const duration = performance.now() - startTime;
      console.log(`⚡ ${name}: ${duration.toFixed(2)}ms`);
      this.metrics.delete(name);
      return duration;
    }
    return 0;
  }
  
  // Проверяем размер бандла
  static checkBundleSize() {
    if (typeof window !== 'undefined') {
      const scripts = document.querySelectorAll('script[src]') as NodeListOf<HTMLScriptElement>;
      
      scripts.forEach(script => {
        if (script.src.includes('/_next/')) {
          console.log(`📦 Script: ${script.src}`);
        }
      });
    }
  }
  
  // Мониторим память
  static checkMemory() {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      console.log(`🧠 Memory: ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB used`);
    }
  }
  
  // Проверяем Core Web Vitals
  static measureWebVitals() {
    if (typeof window !== 'undefined') {
      // FCP - First Contentful Paint
      try {
        new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            console.log(`🎨 FCP: ${entry.startTime.toFixed(2)}ms`);
          }
        }).observe({ entryTypes: ['paint'] });
      } catch (e) {
        console.warn('FCP measurement not supported');
      }
      
      // LCP - Largest Contentful Paint
      try {
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          console.log(`🖼️ LCP: ${lastEntry.startTime.toFixed(2)}ms`);
        }).observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        console.warn('LCP measurement not supported');
      }
    }
  }
}

// Хук для оптимизированной загрузки данных
export function useOptimizedFetch<T>(
  url: string, 
  options?: RequestInit
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    let cancelled = false;
    
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        PerformanceMonitor.startTimer(`fetch-${url}`);
        
        const response = await fetch(url, {
          ...options,
          // Оптимизируем запросы
          headers: {
            'Cache-Control': 'max-age=300', // 5 минут кеша
            ...options?.headers,
          },
        });
        
        if (!cancelled) {
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          
          const result = await response.json();
          setData(result);
        }
        
        PerformanceMonitor.endTimer(`fetch-${url}`);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Ошибка загрузки');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    
    fetchData();
    
    return () => {
      cancelled = true;
    };
  }, [url, JSON.stringify(options)]);
  
  return { data, loading, error };
}

// Дебаунс для поиска
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
}

// Инициализация мониторинга (только в dev режиме)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  PerformanceMonitor.measureWebVitals();
  PerformanceMonitor.checkBundleSize();
  
  // Проверяем память каждые 30 секунд
  setInterval(() => {
    PerformanceMonitor.checkMemory();
  }, 30000);
}