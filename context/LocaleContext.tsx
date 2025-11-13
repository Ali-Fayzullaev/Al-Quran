"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

import ruMessages from "../public/messages/ru.json";

type Messages = Record<string, unknown>;

type LocaleContextType = {
  locale: string;
  setLocale: (loc: string) => void;
  messages: Messages;
  t: (key: string) => string;
  isLoading: boolean;
};

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

// Helper to walk nested keys inside plain objects
const getMessageValue = (messages: Messages, key: string): string => {
  const segments = key.split(".");
  let current: unknown = messages;

  for (const segment of segments) {
    if (current && typeof current === "object" && segment in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[segment];
    } else {
      return key;
    }
  }

  return typeof current === "string" ? current : key;
};

export function LocaleProvider({ children }: { children: ReactNode }) {
  const locale = "ru";
  const messages = useMemo<Messages>(() => ruMessages as Messages, []);

  const t = (key: string) => getMessageValue(messages, key);

  const setLocale = () => {
    console.warn("Locale change is disabled. Russian locale is enforced for the planner module.");
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale, messages, t, isLoading: false }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used inside LocaleProvider");
  return ctx;
}
