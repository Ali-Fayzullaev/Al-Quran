"use client"

import { useTheme } from "next-themes"
import { Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { useLocale } from "@/context/LocaleContext"

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const { t } = useLocale()
  const [mounted, setMounted] = useState(false)

  // Избегаем hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="w-10 h-10">
        <Sun className="w-5 h-5" />
        <span className="sr-only">{t("toggleTheme")}</span>
      </Button>
    )
  }

  const toggleTheme = () => {
    if (resolvedTheme === "dark") {
      setTheme("light")
    } else {
      setTheme("dark")
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="w-10 h-10 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      aria-label={t("toggleTheme")}
    >
      {resolvedTheme === "dark" ? (
        <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      ) : (
        <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      )}
      <span className="sr-only">{t("toggleTheme")}</span>
    </Button>
  )
}
