"use client";

import { createContext, useContext, useMemo, useState, useEffect, type ReactNode } from "react";
import { translations, getTranslation, type Locale } from "@/lib/translations";

type LocaleContextType = {
  locale: Locale;
  setLocale: (loc: Locale) => void;
  t: (key: string) => string;
  isLoading: boolean;
};

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setCurrentLocale] = useState<Locale>('ru'); // Всегда начинаем с 'ru' для предотвращения ошибок гидратации
  const [isClientReady, setIsClientReady] = useState(false);
  
  // Восстанавливаем язык из localStorage после монтирования
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('locale') as Locale;
      if (saved && ['ru', 'en', 'uz'].includes(saved) && saved !== locale) {
        setCurrentLocale(saved);
      }
      setIsClientReady(true);
    }
  }, []);
  
  const [isLoading, setIsLoading] = useState(false);

  // Сохраняем выбранный язык в localStorage
  const setLocale = (newLocale: Locale) => {
    console.log('Setting locale to:', newLocale);
    setCurrentLocale(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', newLocale);
    }
  };

  // Функция для получения переводов
  const t = (key: string): string => {
    const result = getTranslation(locale, key);
    // Дополнительная защита от возврата объектов
    if (typeof result !== 'string') {
      console.error(`Translation function returned non-string value for key: ${key}`, result);
      return key; // Возвращаем сам ключ как fallback
    }
    return result;
  };

  const value = useMemo(() => ({
    locale,
    setLocale,
    t,
    isLoading
  }), [locale, isLoading]);

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used inside LocaleProvider");
  return ctx;
}
