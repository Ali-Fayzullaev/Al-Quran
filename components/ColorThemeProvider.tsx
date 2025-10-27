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
  const { theme } = useTheme();
  const { siteColorTheme, quranTextColorScheme } = useQuranStore();

  // Применяем цветовые схемы при загрузке или изменении темы
  useEffect(() => {
    const isDark = theme === 'dark' || 
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    // Применяем цветовую схему сайта
    const siteTheme = getThemeByName(siteColorTheme);
    if (siteTheme) {
      applySiteColorTheme(siteTheme, isDark);
    }

    // Применяем цветовую схему текста Корана
    const quranScheme = getQuranColorSchemeByName(quranTextColorScheme);
    if (quranScheme) {
      applyQuranTextColors(quranScheme, isDark);
    }
  }, [theme, siteColorTheme, quranTextColorScheme]);

  // Слушаем изменения системной темы
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (theme === 'system') {
        const isDark = mediaQuery.matches;
        
        const siteTheme = getThemeByName(siteColorTheme);
        if (siteTheme) {
          applySiteColorTheme(siteTheme, isDark);
        }

        const quranScheme = getQuranColorSchemeByName(quranTextColorScheme);
        if (quranScheme) {
          applyQuranTextColors(quranScheme, isDark);
        }
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, siteColorTheme, quranTextColorScheme]);

  return <>{children}</>;
}