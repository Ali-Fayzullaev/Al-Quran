"use client";

import React, { createContext, useContext, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useQuranStore } from '@/lib/store';
import { useColorTheme } from '@/lib/useColorTheme';

interface ColorThemeContextProps {
  currentSiteTheme: string;
  currentQuranScheme: string;
  applySiteTheme: (themeId: string) => void;
  applyQuranScheme: (schemeId: string) => void;
  applyCurrentColors: () => void;
}

const ColorThemeContext = createContext<ColorThemeContextProps | undefined>(undefined);

export function ColorThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const { siteColorTheme, quranTextColorScheme, setSiteColorTheme, setQuranTextColorScheme } = useQuranStore();
  const { applySiteTheme, applyQuranTheme, applyCurrentColors } = useColorTheme();

  // Применяем цвета при изменении темы или выбранных цветов
  useEffect(() => {
    // Небольшая задержка для корректной инициализации next-themes
    const timeout = setTimeout(() => {
      applyCurrentColors();
    }, 100);

    return () => clearTimeout(timeout);
  }, [theme, siteColorTheme, quranTextColorScheme, applyCurrentColors]);

  const handleSiteThemeChange = (themeId: string) => {
    setSiteColorTheme(themeId);
    applySiteTheme(themeId);
  };

  const handleQuranSchemeChange = (schemeId: string) => {
    setQuranTextColorScheme(schemeId);
    applyQuranTheme(schemeId);
  };

  const value: ColorThemeContextProps = {
    currentSiteTheme: siteColorTheme,
    currentQuranScheme: quranTextColorScheme,
    applySiteTheme: handleSiteThemeChange,
    applyQuranScheme: handleQuranSchemeChange,
    applyCurrentColors,
  };

  return (
    <ColorThemeContext.Provider value={value}>
      {children}
    </ColorThemeContext.Provider>
  );
}

export function useColorThemeContext() {
  const context = useContext(ColorThemeContext);
  if (context === undefined) {
    throw new Error('useColorThemeContext must be used within a ColorThemeProvider');
  }
  return context;
}