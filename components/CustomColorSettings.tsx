"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useQuranStore } from "@/lib/store";
import { useLocale } from "@/context/LocaleContext";
import { Button } from "@/components/ui/button";
import { Palette, RotateCcw, Check, Sparkles, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { SITE_COLOR_THEMES } from "@/lib/colorThemes";


// Дополнительные цвета для текста Корана
const QUICK_TEXT_COLORS = [
  { name: { en: 'Black', ru: 'Черный' }, color: '#1C1E21' },
  { name: { en: 'Dark Gray', ru: 'Темно-серый' }, color: '#374151' },
  { name: { en: 'Brown', ru: 'Коричневый' }, color: '#78350f' },
  { name: { en: 'Navy', ru: 'Темно-синий' }, color: '#1e3a8a' },
  { name: { en: 'Slate', ru: 'Шифер' }, color: '#334155' },
  { name: { en: 'Emerald', ru: 'Изумруд' }, color: '#065f46' },
  { name: { en: 'Light (Dark Mode)', ru: 'Светлый (Темный режим)' }, color: '#d1fae5' },
  { name: { en: 'Warm Light', ru: 'Теплый светлый' }, color: '#fef3c7' },
];

// Дополнительные цвета для переводов
const QUICK_TRANSLATION_COLORS = [
  { name: { en: 'Medium Gray', ru: 'Средний серый' }, color: '#5A5D61' },
  { name: { en: 'Light Gray', ru: 'Светло-серый' }, color: '#6b7280' },
  { name: { en: 'Slate', ru: 'Шифер' }, color: '#64748b' },
  { name: { en: 'Blue Gray', ru: 'Сине-серый' }, color: '#475569' },
  { name: { en: 'Stone', ru: 'Каменный' }, color: '#78716c' },
  { name: { en: 'Zinc', ru: 'Цинковый' }, color: '#71717a' },
];

export default function CustomColorSettings() {
  const { locale, t } = useLocale();
  const { theme, setTheme } = useTheme();


 
  const {
    customButtonColor,
    customQuranTextColor,
    customQuranTranslationColor,
    siteColorTheme,
    setCustomButtonColor,
    setCustomQuranTextColor,
    setCustomQuranTranslationColor,
    setSiteColorTheme,
  } = useQuranStore();

  const [buttonColor, setButtonColor] = useState(customButtonColor || "#10b981");
  const [quranTextColor, setQuranTextColor] = useState(customQuranTextColor || "#1C1E21");
  const [translationColor, setTranslationColor] = useState(customQuranTranslationColor || "#5A5D61");
  const [selectedScheme, setSelectedScheme] = useState<string | null>(null);

  



  

 

  return (
    <div className="space-y-8">
      {/* Заголовок */}
      <div className="text-center">
        <div className="inline-flex items-center gap-3 mb-3">
          <Palette className="w-6 h-6" style={{ color: customButtonColor || '#10b981' }} />
          <h2 className="text-2xl font-bold" style={{ color: 'var(--fixed-text)' }}>
            {t('settingsSection.customColors')}
          </h2>
        </div>
        <p className="text-sm" style={{ color: 'var(--fixed-text-secondary)' }}>
          {t('settingsSection.customColorsDesc')}
        </p>
      </div>

      {/* Переключатель темы (светлая/темная) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {theme === 'light' ? <Sun className="w-5 h-5" style={{ color: 'var(--color-primary)' }} /> : <Moon className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />}
          </div>
          <h3 className="text-xl font-semibold" style={{ color: 'var(--fixed-text)' }}>
            {t('settingsSection.themeMode')}
          </h3>
        </div>
        <p className="text-sm" style={{ color: 'var(--fixed-text-secondary)' }}>
          {t('settingsSection.themeModeDesc')}
        </p>
        
        <div className="flex gap-4">
          <button
            onClick={() => setTheme('light')}
            className={cn(
              "flex items-center gap-3 px-6 py-4 rounded-xl border-2 transition-all duration-300 hover:scale-105",
              theme === 'light' 
                ? "border-current shadow-md" 
                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
            )}
            style={{
              borderColor: theme === 'light' ? 'var(--color-primary)' : undefined,
              backgroundColor: theme === 'light' ? 'var(--color-primary)10' : undefined
            }}
          >
            <Sun className="w-6 h-6" style={{ color: theme === 'light' ? 'var(--color-primary)' : 'var(--fixed-text-secondary)' }} />
            <div className="text-left">
              <div className="font-semibold" style={{ color: 'var(--fixed-text)' }}>
                {t('settingsSection.lightTheme')}
              </div>
              <div className="text-sm" style={{ color: 'var(--fixed-text-secondary)' }}>
                {t('settingsSection.lightThemeDesc')}
              </div>
            </div>
            {theme === 'light' && (
              <Check className="w-5 h-5 ml-auto" style={{ color: 'var(--color-primary)' }} />
            )}
          </button>
          
          <button
            onClick={() => setTheme('dark')}
            className={cn(
              "flex items-center gap-3 px-6 py-4 rounded-xl border-2 transition-all duration-300 hover:scale-105",
              theme === 'dark' 
                ? "border-current shadow-md" 
                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
            )}
            style={{
              borderColor: theme === 'dark' ? 'var(--color-primary)' : undefined,
              backgroundColor: theme === 'dark' ? 'var(--color-primary)10' : undefined
            }}
          >
            <Moon className="w-6 h-6" style={{ color: theme === 'dark' ? 'var(--color-primary)' : 'var(--fixed-text-secondary)' }} />
            <div className="text-left">
              <div className="font-semibold" style={{ color: 'var(--fixed-text)' }}>
                {t('settingsSection.darkTheme')}
              </div>
              <div className="text-sm" style={{ color: 'var(--fixed-text-secondary)' }}>
                {t('settingsSection.darkThemeDesc')}
              </div>
            </div>
            {theme === 'dark' && (
              <Check className="w-5 h-5 ml-auto" style={{ color: 'var(--color-primary)' }} />
            )}
          </button>
        </div>
      </div>

      {/* Цветовые схемы сайта */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
          <h3 className="text-xl font-semibold" style={{ color: 'var(--fixed-text)' }}>
            {t('settingsSection.siteColorTheme')}
          </h3>
        </div>
        <p className="text-sm" style={{ color: 'var(--fixed-text-secondary)' }}>
          {t('settingsSection.siteColorThemeDesc')}
        </p>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {SITE_COLOR_THEMES.map((theme) => (
            <button
              key={theme.id}
              onClick={() => setSiteColorTheme(theme.id as any)}
              className={cn(
                "group relative overflow-hidden rounded-xl border-2 p-4 transition-all duration-300 hover:scale-105 hover:shadow-lg",
                siteColorTheme === theme.id 
                  ? "border-current shadow-md ring-2 ring-offset-2" 
                  : "border-gray-200 dark:border-gray-700"
              )}
              style={{
                borderColor: siteColorTheme === theme.id ? theme.lightMode.accent : undefined
              }}
            >
              <div className="flex flex-col items-center gap-2">
                <div 
                  className="w-8 h-8 rounded-full shadow-md"
                  style={{ backgroundColor: theme.lightMode.accent }}
                />
                <span className="text-xs font-medium text-center" style={{ color: 'var(--fixed-text)' }}>
                  {theme.name}
                </span>
              </div>
              {siteColorTheme === theme.id && (
                <div className="absolute top-1 right-1">
                  <Check className="w-4 h-4 text-white bg-current rounded-full p-0.5" style={{ color: theme.lightMode.primary }} />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
