"use client";

import { useEffect } from "react";
import { useQuranStore } from "@/lib/store";
import { useColorTheme } from "@/lib/useColorTheme";

export function ForceColorApplication() {
  const { siteColorTheme, quranTextColorScheme } = useQuranStore();
  const { applyCurrentColors } = useColorTheme();

  useEffect(() => {
    // Принудительно применяем цвета ко всем подходящим элементам
    const forceApplyColors = () => {
      // Применяем цвета
      applyCurrentColors();
      
      // Добавляем дополнительные классы к элементам
      const buttons = document.querySelectorAll('button:not(.force-colored)');
      buttons.forEach(button => {
        if (button.classList.contains('bg-green-600') || 
            button.classList.contains('bg-green-500') ||
            button.classList.contains('from-green-600')) {
          button.classList.add('theme-override-primary', 'force-colored');
        }
      });

      // Применяем к ссылкам
      const links = document.querySelectorAll('a:not(.force-colored)');
      links.forEach(link => {
        if (link.classList.contains('text-green-600') || 
            link.classList.contains('text-green-700')) {
          link.classList.add('theme-override-text-primary', 'force-colored');
        }
      });

      // Применяем к элементам с градиентами
      const gradients = document.querySelectorAll('[class*="from-green"]:not(.force-colored)');
      gradients.forEach(element => {
        element.classList.add('theme-gradient-primary', 'force-colored');
      });
    };

    // Применяем сразу
    forceApplyColors();
    
    // И через интервал для динамически создаваемых элементов
    const interval = setInterval(forceApplyColors, 1000);
    
    return () => clearInterval(interval);
  }, [siteColorTheme, quranTextColorScheme, applyCurrentColors]);

  return null;
}