// components/LanguageSwitcher.tsx
"use client";

import { useState } from "react";


export default function LanguageSwitcher({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState("en");
  const messages = require(`../messages/${locale}.json`);

  return (
    <div>
      <div className="flex justify-end p-4 gap-2 bb">
        <button onClick={() => setLocale("en")}>🇬🇧 EN</button>
        <button onClick={() => setLocale("ru")}>🇷🇺 RU</button>
        <button onClick={() => setLocale("uz")}>🇺🇿 UZ</button>
      </div>
      {children}
    </div>
  );
}
