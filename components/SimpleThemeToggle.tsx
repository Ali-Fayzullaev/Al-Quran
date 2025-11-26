"use client"

import { useTheme } from "next-themes"
import { Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { useLocale } from "@/context/LocaleContext"

export function SimpleThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const { t } = useLocale()
  const [mounted, setMounted] = useState(false)

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
      onClick={toggleTheme}
      className="w-10 h-10 hover:bg-[var(--color-primary)] text-white dark:hover:bg-[var(--color-primary)]"
      title={t("toggleTheme") || "Toggle theme"}
    >
      {resolvedTheme === "dark" ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
      <span className="sr-only">{t("toggleTheme") || "Toggle theme"}</span>
    </Button>
  )
}