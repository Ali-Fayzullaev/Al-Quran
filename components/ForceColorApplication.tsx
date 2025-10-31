"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import { useQuranStore } from "@/lib/store";
import { useColorTheme } from "@/lib/useColorTheme";

export function ForceColorApplication() {
  const { theme, systemTheme } = useTheme();
  const { siteColorTheme, quranTextColorScheme } = useQuranStore();
  const { applyCurrentColors } = useColorTheme();

  useEffect(() => {
    // Применяем цвета только при изменении темы/схем, без постоянного interval
    applyCurrentColors();
    
    // Одна дополнительная проверка через небольшую задержку
    const timeout = setTimeout(() => {
      applyCurrentColors();
    }, 100);

    return () => clearTimeout(timeout);
  }, [theme, systemTheme, siteColorTheme, quranTextColorScheme, applyCurrentColors]);

  return null;
}