"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Sun, Moon, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { MushafTheme, MushafSettings } from '@/lib/mushafTypes';
import { useLocale } from '@/context/LocaleContext';

interface ThemeSystemProps {
  currentTheme: MushafTheme;
  settings: MushafSettings;
  onThemeChange: (theme: MushafTheme) => void;
  onSettingsChange: (settings: Partial<MushafSettings>) => void;
  className?: string;
}

// Простые темы - названия будут переведены в компоненте
const SIMPLE_THEMES_BASE = [
  {
    id: 'light',
    nameKey: 'lightTheme',
    nameArabic: 'فاتح',
    icon: '☀️',
    colors: {
      background: '#ffffff',
      pageBackground: '#fefefe',
      pageShadow: '#e2e8f0',
      text: '#1a202c',
      accent: '#3182ce',
      border: '#e2e8f0'
    },
    effects: {
      pageRadius: '8px',
      shadowBlur: '20px',
      perspective: '1200px'
    }
  },
  {
    id: 'sepia',
    nameKey: 'sepiaTheme',
    nameArabic: 'بني',
    icon: '📜',
    colors: {
      background: '#f7f3e9',
      pageBackground: '#f4f1e8',
      pageShadow: '#d4c5a1',
      text: '#4a4a4a',
      accent: '#8b4513',
      border: '#d4c5a1'
    },
    effects: {
      pageRadius: '8px',
      shadowBlur: '20px',
      perspective: '1200px'
    }
  },
  {
    id: 'dark',
    nameKey: 'darkTheme',
    nameArabic: 'غامق',
    icon: '🌙',
    colors: {
      background: '#1a202c',
      pageBackground: '#2d3748',
      pageShadow: '#4a5568',
      text: '#f7fafc',
      accent: '#63b3ed',
      border: '#4a5568'
    },
    effects: {
      pageRadius: '8px',
      shadowBlur: '20px',
      perspective: '1200px'
    }
  }
];

export default function ThemeSystem({
  currentTheme,
  settings,
  onThemeChange,
  onSettingsChange,
  className
}: ThemeSystemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { locale, t } = useLocale();
  
  console.log('ThemeSystem props:', { currentTheme, settings, locale });

  // Создаем темы с переводами
  const SIMPLE_THEMES: MushafTheme[] = SIMPLE_THEMES_BASE.map(theme => {
    const translatedName = t(`mushaf.${theme.nameKey}`);
    console.log(`Theme ${theme.nameKey} translation:`, translatedName);
    return {
      ...theme,
      name: translatedName
    };
  });

  // Применить тему при загрузке
  React.useEffect(() => {
    if (currentTheme) {
      const root = document.documentElement;
      root.style.setProperty('--mushaf-bg', currentTheme.colors.background);
      root.style.setProperty('--mushaf-page-bg', currentTheme.colors.pageBackground);
      root.style.setProperty('--mushaf-text', currentTheme.colors.text);
      root.style.setProperty('--mushaf-accent', currentTheme.colors.accent);
      root.style.setProperty('--mushaf-border', currentTheme.colors.border);
    }
  }, [currentTheme]);

  const handleThemeSelect = (theme: MushafTheme) => {
    console.log('Selecting theme:', theme);
    onThemeChange(theme);
    
    // Применяем тему к документу с максимальной силой
    const root = document.documentElement;
    root.style.setProperty('--mushaf-bg', theme.colors.background);
    root.style.setProperty('--mushaf-page-bg', theme.colors.pageBackground);
    root.style.setProperty('--mushaf-text', theme.colors.text);
    root.style.setProperty('--mushaf-accent', theme.colors.accent);
    root.style.setProperty('--mushaf-border', theme.colors.border);
    
    // Принудительно обновляем фон контейнера
    const container = document.querySelector('.mushaf-container');
    if (container) {
      (container as HTMLElement).style.backgroundColor = theme.colors.background;
      (container as HTMLElement).style.color = theme.colors.text;
    }
    
    // Принудительно обновляем все страницы
    const pages = document.querySelectorAll('.mushaf-page-container');
    pages.forEach(page => {
      (page as HTMLElement).style.backgroundColor = theme.colors.pageBackground;
      (page as HTMLElement).style.borderColor = theme.colors.border;
    });
    
    console.log('Applied theme:', theme.name, {
      background: theme.colors.background,
      pageBackground: theme.colors.pageBackground,
      text: theme.colors.text
    });
    
    setIsOpen(false);
  };

  return (
    <>
      {/* Кнопка открытия */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className={cn("bg-white/80 hover:bg-white/90 shadow-md", className)}
      >
        <Palette className="w-4 h-4" />
      </Button>

      {/* Панель тем */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="fixed top-20 right-4 bg-white rounded-lg shadow-xl border p-4 z-40 min-w-[280px]"
          >
            {/* Заголовок */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">
                {t('mushaf.themes')}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="p-1"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Список тем */}
            <div className="space-y-2">
              <div className="text-xs text-gray-500 mb-2">
                Доступные темы: {SIMPLE_THEMES.length}
              </div>
              {SIMPLE_THEMES.map(theme => (
                <motion.div
                  key={theme.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleThemeSelect(theme)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all",
                    currentTheme.id === theme.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  {/* Превью темы */}
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-full border-2"
                      style={{ backgroundColor: theme.colors.pageBackground, borderColor: theme.colors.border }}
                    />
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: theme.colors.text }}
                    />
                    {theme.id === 'light' && <Sun className="w-4 h-4 text-yellow-500" />}
                    {theme.id === 'dark' && <Moon className="w-4 h-4 text-blue-500" />}
                    {theme.id === 'sepia' && <Palette className="w-4 h-4 text-amber-600" />}
                  </div>

                  {/* Название темы */}
                  <span className="flex-1 text-sm font-medium">
                    {theme.name}
                  </span>

                  {/* Индикатор выбора */}
                  {currentTheme.id === theme.id && (
                    <Check className="w-4 h-4 text-blue-500" />
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}