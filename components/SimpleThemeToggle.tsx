"use client"

import { useTheme } from "next-themes"
import { Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { useLocale } from "@/context/LocaleContext"
import useVibration from "@luxonauta/use-vibration"

export function SimpleThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const { t } = useLocale()
  const [mounted, setMounted] = useState(false)

  const [{ isSupported, isVibrating }, { vibrate, stop }] = useVibration();
const [isShaking, setIsShaking] = useState(false);
const triggerVibration = (
  pattern: number | number[] | any,
  fallback?: () => void
) => {
  let success = false;

  try {
    // Подход 1: Прямой нативный API (как в работающем примере)
    if (navigator.vibrate) {
      const result = navigator.vibrate(pattern);
      success = !!result;
    }

    // Подход 2: Библиотека как резерв
    if (!success && isSupported && vibrate) {
      vibrate(pattern);
      success = true;
    }

    // Подход 3: iOS fallback (как в работающем примере)
    if (!success && /iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      // iOS fallback: создаем невидимый checkbox и кликаем по label
      const el = document.createElement("div");
      const id = Math.random().toString(36).slice(2);
      el.innerHTML = `<input type="checkbox" id="${id}" switch /><label for="${id}"></label>`;
      el.setAttribute(
        "style",
        "display:none !important;opacity:0 !important;visibility:hidden !important;"
      );
      document.querySelector("body")?.appendChild(el);
      el.querySelector("label")?.click();
      setTimeout(() => {
        el.remove();
      }, 1500);
      success = true;
    }

    if (!success && fallback) {
      fallback();
    }

    return success;
  } catch (error) {
    console.error("Ошибка вибрации:", error);
    fallback?.();
    return false;
  }
};

const handleClick = () => {
  triggerVibration(50);
  setIsShaking(true);
  setTimeout(() => setIsShaking(false), 50);
};

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    const newTheme = resolvedTheme === "dark" ? "light" : "dark"
    console.log('SimpleThemeToggle: Switching from', resolvedTheme, 'to', newTheme)
    setTheme(newTheme)
  }

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="w-10 h-10">
        <Sun className="w-5 h-5" />
        <span className="sr-only">Theme</span>
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => { toggleTheme(); handleClick(); }}
      className="w-8 h-8 rounded-full bg-[var(--color-primary)] text-white"
      title={t("toggleTheme") || "Toggle theme"}
    >
      {resolvedTheme === "dark" ? (
        <Sun className="w-4 h-4" />
      ) : (
        <Moon className="w-4 h-4" />
      )}
      <span className="sr-only">{t("toggleTheme") || "Toggle theme"}</span>
    </Button>
  )
}