"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function PerformanceMonitor() {
  const pathname = usePathname();

  useEffect(() => {
    const startTime = performance.now();
    
    // Мониторим время загрузки страницы
    const onLoad = () => {
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      console.log(`🚀 Page "${pathname}" loaded in ${loadTime.toFixed(2)}ms`);
      
      // Если загрузка слишком медленная, выводим предупреждение
      if (loadTime > 2000) {
        console.warn(`⚠️ Slow page load detected: ${loadTime.toFixed(2)}ms`);
      }
    };

    // Ждём полной загрузки DOM
    if (document.readyState === 'complete') {
      onLoad();
    } else {
      window.addEventListener('load', onLoad);
    }

    return () => {
      window.removeEventListener('load', onLoad);
    };
  }, [pathname]);

  return null; // Этот компонент не рендерит ничего
}

export default PerformanceMonitor;