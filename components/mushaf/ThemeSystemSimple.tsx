"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Sun, Moon, Check, X, BookOpen, Sparkles, Leaf, Eye, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MushafTheme, MushafSettings } from '@/lib/mushafTypes';
import { useLocale } from '@/context/LocaleContext';
import { useTheme } from 'next-themes';
import { useQuranStore } from '@/lib/store';
import { useColorTheme } from '@/lib/useColorTheme';
import { SITE_COLOR_THEMES } from '@/lib/colorThemes';

interface ThemeSystemProps {
  currentTheme: MushafTheme;
  settings: MushafSettings;
  onThemeChange: (theme: MushafTheme) => void;
  onSettingsChange: (settings: Partial<MushafSettings>) => void;
  className?: string;
}

// Расширенные темы с красивыми цветовыми схемами
const SIMPLE_THEMES_BASE = [
  {
    id: 'light',
    nameKey: 'lightTheme',
    nameArabic: 'النور الأبيض',
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
    nameArabic: 'البرشمان العتيق',
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
    nameArabic: 'الليل الهادئ',
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
  },
  {
    id: 'green',
    nameKey: 'greenTheme',
    nameArabic: 'الطبيعة الخضراء',
    icon: '🌿',
    colors: {
      background: '#f0fff4',
      pageBackground: '#f7fffa',
      pageShadow: '#c6f6d5',
      text: '#1a202c',
      accent: '#38a169',
      border: '#c6f6d5'
    },
    effects: {
      pageRadius: '8px',
      shadowBlur: '20px',
      perspective: '1200px'
    }
  },
  {
    id: 'blue',
    nameKey: 'blueTheme',
    nameArabic: 'السماء الصافية',
    icon: '🌊',
    colors: {
      background: '#f7faff',
      pageBackground: '#fbfdff',
      pageShadow: '#bee3f8',
      text: '#1a202c',
      accent: '#3182ce',
      border: '#bee3f8'
    },
    effects: {
      pageRadius: '8px',
      shadowBlur: '20px',
      perspective: '1200px'
    }
  },
  {
    id: 'oled',
    nameKey: 'oledTheme',
    nameArabic: 'الأسود العميق',
    icon: '⚫',
    colors: {
      background: '#000000',
      pageBackground: '#111111',
      pageShadow: '#333333',
      text: '#ffffff',
      accent: '#60a5fa',
      border: '#333333'
    },
    effects: {
      pageRadius: '8px',
      shadowBlur: '20px',
      perspective: '1200px'
    }
  }
];

// SVG превью страницы Корана для каждой темы
const ThemePreviewSVG = ({ theme, isActive }: { theme: MushafTheme; isActive: boolean }) => {
  return (
    <div className="relative">
      <svg
        width="140"
        height="180"
        viewBox="0 0 140 180"
        className={cn(
          "rounded-xl shadow-lg transition-all duration-300 cursor-pointer",
          isActive && "ring-4 ring-blue-500 shadow-2xl"
        )}
        style={{ backgroundColor: theme.colors.background }}
      >
        {/* Фон страницы */}
        <rect
          x="8"
          y="8"
          width="124"
          height="164"
          rx="8"
          fill={theme.colors.pageBackground}
          stroke={theme.colors.border}
          strokeWidth="2"
        />
        
        {/* Декоративная рамка */}
        <rect
          x="16"
          y="16"
          width="108"
          height="148"
          rx="4"
          fill="none"
          stroke={theme.colors.accent}
          strokeWidth="1"
          opacity="0.3"
        />
        
        {/* Имитация бисмиллы */}
        <text
          x="70"
          y="35"
          textAnchor="middle"
          fontSize="10"
          fontWeight="bold"
          fill={theme.colors.text}
          opacity="0.8"
        >
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </text>
        
        {/* Декоративная линия под бисмиллой */}
        <line
          x1="25"
          y1="45"
          x2="115"
          y2="45"
          stroke={theme.colors.accent}
          strokeWidth="1"
          opacity="0.5"
        />
        
        {/* Имитация аятов (арабский текст) */}
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            {/* Основная линия аята */}
            <rect
              x="25"
              y={55 + i * 22}
              width="90"
              height="3"
              rx="1.5"
              fill={theme.colors.text}
              opacity="0.7"
            />
            {/* Вторая линия аята */}
            <rect
              x="25"
              y={60 + i * 22}
              width="75"
              height="3"
              rx="1.5"
              fill={theme.colors.text}
              opacity="0.5"
            />
            {/* Третья линия (короче) */}
            <rect
              x="25"
              y={65 + i * 22}
              width="60"
              height="3"
              rx="1.5"
              fill={theme.colors.text}
              opacity="0.3"
            />
          </g>
        ))}
        
        {/* Номер суры в круге */}
        <circle
          cx="70"
          cy="155"
          r="12"
          fill={theme.colors.accent}
          opacity="0.8"
        />
        <text
          x="70"
          y="159"
          textAnchor="middle"
          fontSize="8"
          fill="white"
          fontWeight="bold"
        >
          ١
        </text>
        
        {/* Декоративные элементы по углам */}
        <circle cx="20" cy="20" r="2" fill={theme.colors.accent} opacity="0.6" />
        <circle cx="120" cy="20" r="2" fill={theme.colors.accent} opacity="0.6" />
        <circle cx="20" cy="160" r="2" fill={theme.colors.accent} opacity="0.6" />
        <circle cx="120" cy="160" r="2" fill={theme.colors.accent} opacity="0.6" />
        
        {/* Индикатор выбора */}
        {isActive && (
          <g>
            <circle
              cx="125"
              cy="15"
              r="10"
              fill="#3b82f6"
            />
            <path
              d="M 121 15 L 124 18 L 129 13"
              stroke="white"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        )}
      </svg>
      
      {/* Эффект свечения для активной темы */}
      {isActive && (
        <div 
          className="absolute inset-0 -z-10 rounded-xl blur-xl opacity-30"
          style={{ backgroundColor: theme.colors.accent }}
        />
      )}
    </div>
  );
};

export default function ThemeSystem({
  currentTheme,
  settings,
  onThemeChange,
  onSettingsChange,
  className
}: ThemeSystemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { locale, t } = useLocale();
  const { theme, setTheme } = useTheme();
  const { siteColorTheme, setSiteColorTheme } = useQuranStore();
  const { applySiteTheme } = useColorTheme();

  // Функция для применения темы
  const handleThemeChange = (themeId: string) => {
    setSiteColorTheme(themeId);
    applySiteTheme(themeId);
  };

  // Функция для изменения режима темы
  const handleModeChange = (mode: 'light' | 'dark' | 'system') => {
    setTheme(mode);
  };

  const handleThemeSelect = (theme: MushafTheme) => {
    onThemeChange(theme);
    
    // Применяем тему к документу
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
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "bg-white/90 hover:bg-white shadow-lg backdrop-blur-sm",
            className
          )}
        >
          <Palette className="w-4 h-4" />
        </Button>
      </SheetTrigger>
      
      <SheetContent 
        className="w-80 border-l"
        style={{
          backgroundColor: 'var(--fixed-background)',
          borderColor: 'var(--color-border)'
        }}
      >
        <SheetHeader className="pb-6">
          <SheetTitle className="flex items-center gap-2 text-left" style={{ color: 'var(--fixed-text)' }}>
            <Palette className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
            Настройки темы
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6">
          {/* Режим отображения */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium" style={{ color: 'var(--fixed-text)' }}>
              Режим отображения
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'light', label: 'Светлый', icon: Sun },
                { id: 'dark', label: 'Темный', icon: Moon },
                { id: 'system', label: 'Авто', icon: Monitor },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => handleModeChange(id as 'light' | 'dark' | 'system')}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-lg border transition-all",
                    theme === id
                      ? "border-current shadow-sm"
                      : "border-transparent hover:border-gray-300"
                  )}
                  style={{
                    backgroundColor: theme === id ? 'var(--color-primary-light)' : 'var(--color-muted)',
                    color: theme === id ? 'white' : 'var(--fixed-text)',
                    borderColor: theme === id ? 'var(--color-primary)' : 'var(--color-border)'
                  }}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-xs font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Цветовые темы */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium" style={{ color: 'var(--fixed-text)' }}>
              Цветовые темы
            </h3>
            <div className="space-y-2">
              {SITE_COLOR_THEMES.map((colorTheme) => (
                <button
                  key={colorTheme.id}
                  onClick={() => handleThemeChange(colorTheme.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left",
                    siteColorTheme === colorTheme.id
                      ? "border-current shadow-sm"
                      : "border-transparent hover:border-gray-300"
                  )}
                  style={{
                    backgroundColor: siteColorTheme === colorTheme.id ? 'var(--color-primary-light)' : 'var(--color-muted)',
                    color: siteColorTheme === colorTheme.id ? 'white' : 'var(--fixed-text)',
                    borderColor: siteColorTheme === colorTheme.id ? 'var(--color-primary)' : 'var(--color-border)'
                  }}
                >
                  <div className="flex gap-1">
                    <div 
                      className="w-3 h-3 rounded-full border border-white/20"
                      style={{ backgroundColor: colorTheme.lightMode.primary }}
                    />
                    <div 
                      className="w-3 h-3 rounded-full border border-white/20"
                      style={{ backgroundColor: colorTheme.lightMode.secondary }}
                    />
                    <div 
                      className="w-3 h-3 rounded-full border border-white/20"
                      style={{ backgroundColor: colorTheme.lightMode.accent }}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{colorTheme.name}</div>
                  </div>
                  {siteColorTheme === colorTheme.id && (
                    <Check className="w-4 h-4" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Информация о темах */}
        <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: 'var(--color-muted)' }}>
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--fixed-text)' }}>
              Комфорт чтения
            </span>
          </div>
          <p className="text-xs" style={{ color: 'var(--fixed-text-secondary)' }}>
            Выберите тему, которая обеспечивает комфорт для глаз во время длительного чтения Корана
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}