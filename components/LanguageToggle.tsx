"use client";

import { useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Globe, Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/context/LocaleContext";

export function LanguageToggle() {
  const { locale, setLocale, isLoading } = useLocale();
  const [open, setOpen] = useState(false);

  const languages = [
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "ru", name: "Русский", flag: "🇷🇺" },
    { code: "uz", name: "O'zbek", flag: "🇺🇿" },
  ];

  const currentLanguage =
    languages.find((lang) => lang.code === locale) || languages[0];

  const handleLanguageChange = (newLocale: string) => {
    if (isLoading) return;
    setLocale(newLocale);
    setOpen(false);
  };

  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger asChild>
        <button
          disabled={isLoading}
          className={cn(
            "flex items-center gap-2 h-9 px-3 rounded-md text-sm font-medium",
            "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
            "transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            "disabled:opacity-50 disabled:pointer-events-none",
            "min-w-[100px] justify-between"
          )}
        >
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            <span className="font-medium">{currentLanguage.flag}</span>
            <span className="hidden sm:inline">
              {currentLanguage.code.toUpperCase()}
            </span>
          </div>
          <ChevronDown className="w-4 h-4 opacity-50" />
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
                <span className="text-lg">{language.flag}</span>
                <span className="font-medium">{language.name}</span>
              </div>
              {locale === language.code && (
                <Check className="w-4 h-4 text-primary" />
              )}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
