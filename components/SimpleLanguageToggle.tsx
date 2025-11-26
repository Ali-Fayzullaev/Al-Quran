"use client";

import { useState, useRef, useEffect } from "react";
import { Globe, Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/context/LocaleContext";
import { Locale } from "@/lib/translations";

export function SimpleLanguageToggle() {
  const { locale, setLocale, isLoading } = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: "ru" as Locale, name: "Русский", flag: "🇷🇺" },
    { code: "en" as Locale, name: "English", flag: "🇺🇸" },
    { code: "uz" as Locale, name: "O'zbek", flag: "🇺🇿" },
    { code: "уз" as Locale, name: "Ўзбек (Кирилл)", flag: "🇺🇿" },
    { code: "kz" as Locale, name: "Қазақша", flag: "🇰🇿" }
  ];

  const currentLanguage = languages.find((lang) => lang.code === locale) || languages[0];

  const handleLanguageChange = (newLocale: Locale) => {
    if (isLoading) return;
    setLocale(newLocale);
    setIsOpen(false);
  };

  // Закрытие при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  console.log('SimpleLanguageToggle rendered with locale:', locale, 'isLoading:', isLoading);

  return (
    <div className="relative flex-shrink-0" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className={cn(
          "flex items-center gap-2 h-9 px-3 rounded-md text-sm font-medium",
          "border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
          "disabled:opacity-50 disabled:pointer-events-none",
          "min-w-[100px] justify-between",
          "hover:opacity-80"
        )}
        style={{ 
          backgroundColor: 'var(--color-background-secondary)', 
          borderColor: 'var(--color-border)', 
          borderWidth: '1px',
          color: 'var(--color-text)',
        }}
      >
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4" />
          <span className="font-medium">{currentLanguage.flag}</span>
          <span className="hidden sm:inline">
            {currentLanguage.code.toUpperCase()}
          </span>
        </div>
        <ChevronDown className={cn(
          "w-4 h-4 opacity-50 transition-transform",
          isOpen && "rotate-180"
        )} />
      </button>

      {isOpen && (
        <div 
          className={cn(
            "absolute right-0 top-full mt-1 min-w-[200px] rounded-md border shadow-lg z-50",
            "animate-in fade-in-0 zoom-in-95 slide-in-from-top-2"
          )}
          style={{ 
            backgroundColor: 'var(--color-background-secondary)', 
            borderColor: 'var(--color-border)',
          }}
        >
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 text-sm",
                "hover:bg-opacity-80 transition-colors first:rounded-t-md last:rounded-b-md"
              )}
              style={{ 
                color: 'var(--color-text)',
                backgroundColor: locale === language.code ? 'var(--color-primary-alpha)' : 'transparent'
              }}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{language.flag}</span>
                <span className="font-medium">{language.name}</span>
              </div>
              {locale === language.code && (
                <Check className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}