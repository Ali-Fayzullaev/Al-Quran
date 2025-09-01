"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";

export default function Header() {
  const { theme, setTheme } = useTheme();
  const { locale, setLocale } = useLocale();

  return (
    <header className="flex justify-between items-center px-6 py-4 shadow-md bg-green-600 dark:bg-green-700 text-white">
      <h1 className="text-2xl font-bold">Al-Quran AI</h1>

      <div className="flex items-center gap-4">
        {/* Language Switcher */}
        <div className="flex gap-2">
          <button
            onClick={() => setLocale("en")}
            className={`px-3 py-1 rounded ${
              locale === "en"
                ? "bg-yellow-500 text-white"
                : "bg-white text-green-700 dark:bg-neutral-800 dark:text-white"
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLocale("ru")}
            className={`px-3 py-1 rounded ${
              locale === "ru"
                ? "bg-yellow-500 text-white"
                : "bg-white text-green-700 dark:bg-neutral-800 dark:text-white"
            }`}
          >
            RU
          </button>
        </div>

        {/* Theme Switcher */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-full bg-white dark:bg-neutral-800"
        >
          {theme === "dark" ? <Sun size={20} /> : <Moon className="text-black" size={20} />}
        </button>
      </div>
    </header>
  );
}
