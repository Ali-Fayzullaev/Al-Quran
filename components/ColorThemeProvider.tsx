"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import { useQuranStore } from "@/lib/store";
import { 
  applySiteColorTheme, 
  applyQuranTextColors, 
  getThemeByName, 
  getQuranColorSchemeByName 
} from "@/lib/colorThemes";

export function ColorThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, systemTheme } = useTheme();
  const { siteColorTheme, quranTextColorScheme } = useQuranStore();

  // Функция для определения текущей темы
  const getCurrentTheme = () => {
    if (theme === 'system') {
      return systemTheme || 'light';
    }
    return theme || 'light';
  };

  // Применяем цветовые схемы при загрузке или изменении темы
  useEffect(() => {
    // Ждем пока тема загрузится и DOM будет готов
    if (!theme) return;

    const applyColors = () => {
      const currentTheme = getCurrentTheme();
      const isDark = currentTheme === 'dark';

      console.log('Applying color themes:', { siteColorTheme, quranTextColorScheme, isDark });

      // Применяем цветовую схему сайта
      const siteTheme = getThemeByName(siteColorTheme);
      if (siteTheme) {
        console.log('Applying site theme:', siteTheme);
        applySiteColorTheme(siteTheme, isDark);
      }

      // Применяем цветовую схему текста Корана
      const quranScheme = getQuranColorSchemeByName(quranTextColorScheme);
      if (quranScheme) {
        console.log('Applying quran scheme:', quranScheme);
        applyQuranTextColors(quranScheme, isDark);
      }
    };

    // Применяем сразу
    applyColors();
    
    // И еще раз через небольшую задержку для уверенности
    const timeoutId = setTimeout(applyColors, 100);
    
    return () => clearTimeout(timeoutId);
  }, [theme, systemTheme, siteColorTheme, quranTextColorScheme]);

  return <>{children}</>;
}