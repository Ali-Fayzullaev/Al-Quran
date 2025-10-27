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

export function useColorTheme() {
  const { theme, systemTheme } = useTheme();
  const { siteColorTheme, quranTextColorScheme } = useQuranStore();

  const getCurrentTheme = () => {
    if (theme === 'system') {
      return systemTheme || 'light';
    }
    return theme || 'light';
  };

  const applyCurrentColors = () => {
    if (typeof window === 'undefined') return;
    
    const currentTheme = getCurrentTheme();
    const isDark = currentTheme === 'dark';

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
  };

  const applySiteTheme = (themeId: string) => {
    if (typeof window === 'undefined') return;
    
    const currentTheme = getCurrentTheme();
    const isDark = currentTheme === 'dark';
    const theme = getThemeByName(themeId);
    
    if (theme) {
      applySiteColorTheme(theme, isDark);
    }
  };

  const applyQuranTheme = (schemeId: string) => {
    if (typeof window === 'undefined') return;
    
    const currentTheme = getCurrentTheme();
    const isDark = currentTheme === 'dark';
    const scheme = getQuranColorSchemeByName(schemeId);
    
    if (scheme) {
      applyQuranTextColors(scheme, isDark);
    }
  };

  return {
    applyCurrentColors,
    applySiteTheme,
    applyQuranTheme,
    isDark: getCurrentTheme() === 'dark'
  };
}