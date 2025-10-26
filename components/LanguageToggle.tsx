"use client"

import { Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLocale } from "@/context/LocaleContext"

export function LanguageToggle() {
  const { locale, setLocale, t } = useLocale()
  
  const handleLanguageChange = (newLocale: string) => {
    setLocale(newLocale)
  }
  
  return (
    <div className="flex items-center gap-2">
      <Button 
        variant={locale === 'en' ? 'default' : 'outline'} 
        size="sm" 
        onClick={() => handleLanguageChange('en')}
        className="min-w-[60px]"
      >
        🇬🇧 EN
      </Button>
      <Button 
        variant={locale === 'ru' ? 'default' : 'outline'} 
        size="sm" 
        onClick={() => handleLanguageChange('ru')}
        className="min-w-[60px]"
      >
        🇷🇺 RU
      </Button>
      <Globe className="w-4 h-4 text-muted-foreground ml-1" />
    </div>
  )
}
