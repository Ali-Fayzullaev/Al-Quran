"use client";

import { createContext, useContext, useState, useEffect } from "react";

type Messages = Record<string, string>;

type LocaleContextType = {
  locale: string;
  setLocale: (loc: string) => void;
  messages: Messages;
  t: (key: string) => string;
};

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState("en");
  const [messages, setMessages] = useState<Messages>({});

  // Загружаем переводы при изменении языка
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const response = await fetch(`/messages/${locale}.json`);
        if (response.ok) {
          const msgs = await response.json();
          setMessages(msgs);
        }
      } catch (error) {
        console.error(`Failed to load messages for locale ${locale}:`, error);
      }
    };

    loadMessages();
  }, [locale]);

  // Сохраняем выбранный язык в localStorage
  const setLocale = (newLocale: string) => {
    setLocaleState(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferred-locale', newLocale);
    }
  };

  // Загружаем сохраненный язык при инициализации
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLocale = localStorage.getItem('preferred-locale');
      if (savedLocale && (savedLocale === 'en' || savedLocale === 'ru')) {
        setLocaleState(savedLocale);
      }
    }
  }, []);

  // Функция перевода
  const t = (key: string): string => {
    return messages[key] || key;
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale, messages, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used inside LocaleProvider");
  return ctx;
}
