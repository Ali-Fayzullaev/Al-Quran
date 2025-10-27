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
    // Принудительно применяем цвета при первой загрузке
    const applyColorsWithDelay = () => {
      setTimeout(() => {
        applyCurrentColors();
      }, 100);
    };

    // Применяем сразу и через небольшой интервал
    applyCurrentColors();
    applyColorsWithDelay();

    // Применяем при изменении темы или цветовых схем
    const interval = setInterval(() => {
      applyCurrentColors();
    }, 1000);

    // Очищаем интервал через 5 секунд
    setTimeout(() => {
      clearInterval(interval);
    }, 5000);

    return () => clearInterval(interval);
  }, [theme, systemTheme, siteColorTheme, quranTextColorScheme, applyCurrentColors]);

  return null;
}