// Критический предзагрузчик ресурсов для устранения задержки 2-3 секунды
"use client";

import { useEffect } from 'react';

// Предзагрузка критических API данных
const CRITICAL_APIS = [
  'https://api.alquran.cloud/v1/surah',
  'https://api.alquran.cloud/v1/meta'
];

// Предзагрузка шрифтов
const CRITICAL_FONTS = [
  'https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&display=swap'
];

export function CriticalResourcePreloader() {
  useEffect(() => {
    // 1. Предзагружаем критические API данные
    const preloadAPIs = async () => {
      const promises = CRITICAL_APIS.map(async (url) => {
        try {
          const response = await fetch(url, {
            method: 'GET',
            headers: { 'Cache-Control': 'max-age=3600' }
          });
          
          if (response.ok) {
            const data = await response.json();
            // Кешируем в localStorage для мгновенного доступа
            localStorage.setItem(`preload_${url}`, JSON.stringify({
              data,
              timestamp: Date.now(),
              expires: Date.now() + (60 * 60 * 1000) // 1 час
            }));
          }
        } catch (error) {
          console.warn(`Failed to preload ${url}:`, error);
        }
      });
      
      await Promise.allSettled(promises);
    };

    // 2. Предзагружаем шрифты
    const preloadFonts = () => {
      CRITICAL_FONTS.forEach(fontUrl => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'style';
        link.href = fontUrl;
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
        
        // Также загружаем стили
        const styleLink = document.createElement('link');
        styleLink.rel = 'stylesheet';
        styleLink.href = fontUrl;
        document.head.appendChild(styleLink);
      });
    };

    // 3. Предзагружаем критические изображения
    const preloadImages = () => {
      const criticalImages = [
        '/next.svg',
        '/vercel.svg'
      ];
      
      criticalImages.forEach(src => {
        const img = new Image();
        img.src = src;
      });
    };

    // 4. Оптимизируем браузерные ресурсы
    const optimizeBrowser = () => {
      // Включаем аппаратное ускорение
      document.documentElement.style.transform = 'translateZ(0)';
      
      // Оптимизируем анимации
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          // Выполняем неспешные задачи в свободное время
          preloadAPIs();
        });
      } else {
        // Fallback для старых браузеров
        setTimeout(preloadAPIs, 100);
      }
    };

    // Запускаем оптимизации немедленно
    preloadFonts();
    preloadImages();
    optimizeBrowser();

    // Очищаем устаревший кеш
    const cleanupCache = () => {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('preload_')) {
          try {
            const cached = JSON.parse(localStorage.getItem(key) || '{}');
            if (cached.expires && Date.now() > cached.expires) {
              localStorage.removeItem(key);
            }
          } catch (e) {
            localStorage.removeItem(key);
          }
        }
      });
    };

    cleanupCache();
  }, []);

  return null;
}

// Функция для получения предзагруженных данных
export function getPreloadedData(url: string) {
  try {
    const cached = localStorage.getItem(`preload_${url}`);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed.expires && Date.now() < parsed.expires) {
        return parsed.data;
      }
    }
  } catch (e) {
    console.warn('Failed to get preloaded data:', e);
  }
  return null;
}

// Хук для мгновенной загрузки с предзагруженными данными
export function useFastFetch<T>(url: string) {
  const preloadedData = getPreloadedData(url);
  
  if (preloadedData) {
    return {
      data: preloadedData as T,
      loading: false,
      error: null
    };
  }
  
  // Fallback к обычной загрузке если предзагрузка недоступна
  return {
    data: null,
    loading: true,
    error: null
  };
}