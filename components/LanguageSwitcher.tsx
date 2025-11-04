// components/LanguageSwitcher.tsx
"use client";

import { useState } from "react";
import { NextIntlClientProvider } from "next-intl";

export default function LanguageSwitcher({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState("en");
  const messages = require(`../messages/${locale}.json`);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className="flex justify-end p-4 gap-2 bb">
        <button onClick={() => setLocale("en")}>🇬🇧 EN</button>
        <button onClick={() => setLocale("ru")}>🇷🇺 RU</button>
        <button onClick={() => setLocale("uz")}>🇺🇿 UZ</button>
      </div>
      {children}
    </NextIntlClientProvider>
  );
}
