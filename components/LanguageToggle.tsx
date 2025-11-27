"use client";

import { useState, useEffect } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Globe, Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/context/LocaleContext";
import { Locale } from "@/lib/translations";

export function LanguageToggle() {
  const { locale, setLocale, isLoading } = useLocale();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Монтируем компонент только на клиенте
  useEffect(() => {
    setMounted(true);
  }, []);

  const languages = [
    { code: "ru" as Locale, name: "Русский", flag: "🇷🇺" },
    { code: "en" as Locale, name: "English", flag: "🇺🇸" },
    { code: "uz" as Locale, name: "O'zbek", flag: "🇺🇿" },
    { code: "уз" as Locale, name: "Ўзбек (Кирилл)", flag: "🇺🇿" },
    { code: "kz" as Locale, name: "Қазақша", flag: "🇰🇿" }
  ];

  const currentLanguage =
    languages.find((lang) => lang.code === locale) || languages[0];

  const handleLanguageChange = (newLocale: Locale) => {
    if (isLoading) return;
    setLocale(newLocale);
    setOpen(false);
  };

  // Не рендерим до монтирования
  if (!mounted) {
    return (
      <div className="flex-shrink-0" style={{ minWidth: '100px', height: '36px' }}>
        <div className="animate-pulse bg-gray-200 rounded-md h-9 w-full"></div>
      </div>
    );
  }

  return (
    <div className="flex-shrink-0" style={{ minWidth: '100px' }}>
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger asChild>
        <button
          disabled={isLoading}
          className={cn(
            "flex items-center gap-2 h-8 px-3 rounded-md text-sm font-medium",
            "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
            "transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            "disabled:opacity-50 disabled:pointer-events-none",
            "min-w-[100px] justify-between"
          )}
          style={{ 
            backgroundColor: 'var(--color-primary)', 
            borderColor: 'var(--color-border)', 
            borderWidth: '1px',
            color: 'var(--color-text)',
            minWidth: '100px',
            height: '36px',
            display: 'flex'
          }}
        >
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-white" />
            <span className="font-medium text-white">{currentLanguage.flag}</span>
            <span className="hidden sm:inline text-white">
              {currentLanguage.code.toUpperCase()}
            </span>
          </div>
          <ChevronDown className="w-4 h-4  text-white" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className={cn(
            "min-w-[200px] rounded-md border bg-popover p-2 text-popover-foreground shadow-md",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
            "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
            "z-50"
          )}
          style={{ backgroundColor: 'var(--color-primary)', borderColor: 'var(--color-border)', borderWidth: '1px' }}
          align="end"
          sideOffset={5}
        >
          {languages.map((language) => (
            <DropdownMenu.Item
              key={language.code}
              onSelect={() => handleLanguageChange(language.code)}
              className={cn(
                "relative flex items-center justify-between rounded-sm px-3 py-2 text-sm",
                "cursor-default select-none outline-none",
                "focus:bg-accent focus:text-accent-foreground",
                "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                "transition-colors"
              )}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg text-white">{language.flag}</span>
                <span className="font-medium text-white">{language.name}</span>
              </div>
              {locale === language.code && (
                <Check className="w-4 h-4 text-primary text-white" />
              )}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
    </div>
  );
}
