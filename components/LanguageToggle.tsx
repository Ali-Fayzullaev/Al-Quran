"use client"

import { Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLocale } from "@/context/LocaleContext"

export function LanguageToggle() {
  const { locale, setLocale, t, isLoading } = useLocale()
  
  const handleLanguageChange = (newLocale: string) => {
    if (isLoading) return; // Предотвращаем переключение во время загрузки
    setLocale(newLocale)
  }
  
  return (
    <div className="flex items-center gap-2">
      <Button 
        variant={locale === 'en' ? 'default' : 'outline'} 
        size="sm" 
        onClick={() => handleLanguageChange('en')}
        className="min-w-[60px]"
        disabled={isLoading}
      >
        🇬🇧 EN
      </Button>
      <Button 
        variant={locale === 'ru' ? 'default' : 'outline'} 
        size="sm" 
        onClick={() => handleLanguageChange('ru')}
        className="min-w-[60px]"
        disabled={isLoading}
      >
        🇷🇺 RU
      </Button>
      <Globe className="w-4 h-4 text-muted-foreground ml-1" />
    </div>
  )
}
