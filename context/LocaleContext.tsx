"use client";

import { createContext, useContext, useState, useEffect } from "react";

type Messages = Record<string, string>;

type LocaleContextType = {
  locale: string;
  setLocale: (loc: string) => void;
  messages: Messages;
  t: (key: string) => string;
  isLoading: boolean;
};

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState("en");
  const [messages, setMessages] = useState<Messages>({});
  const [isLoading, setIsLoading] = useState(true);

  // Загружаем переводы при изменении языка
  useEffect(() => {
    const loadMessages = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/messages/${locale}.json`);
        if (response.ok) {
          const msgs = await response.json();
          setMessages(msgs);
        } else {
          console.error(`Failed to fetch messages for locale ${locale}: HTTP ${response.status}`);
          // Fallback to English if current locale fails
          if (locale !== 'en') {
            const fallbackResponse = await fetch('/messages/en.json');
            if (fallbackResponse.ok) {
              const fallbackMsgs = await fallbackResponse.json();
              setMessages(fallbackMsgs);
            }
          }
        }
      } catch (error) {
        console.error(`Failed to load messages for locale ${locale}:`, error);
        // Fallback to English
        if (locale !== 'en') {
          try {
            const fallbackResponse = await fetch('/messages/en.json');
            if (fallbackResponse.ok) {
              const fallbackMsgs = await fallbackResponse.json();
              setMessages(fallbackMsgs);
            }
          } catch (fallbackError) {
            console.error('Failed to load fallback messages:', fallbackError);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [locale]);

  // Сохраняем выбранный язык в localStorage
  const setLocale = (newLocale: string) => {
    if (newLocale === locale) return; // Избегаем ненужных перезагрузок
    setLocaleState(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferred-locale', newLocale);
    }
  };

  // Загружаем сохраненный язык при инициализации
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLocale = localStorage.getItem('preferred-locale');
      if (savedLocale && (savedLocale === 'en' || savedLocale === 'ru' || savedLocale === 'uz')) {
        setLocaleState(savedLocale);
      }
    }
  }, []);

  // Функция перевода с поддержкой вложенных ключей
  const t = (key: string): any => {
    const keys = key.split('.');
    let value: any = messages;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Возвращаем ключ если перевод не найден
      }
    }
    
    return value || key;
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale, messages, t, isLoading }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used inside LocaleProvider");
  return ctx;
}
