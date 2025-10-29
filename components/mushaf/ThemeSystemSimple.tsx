"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Sun, Moon, Check, X, BookOpen, Sparkles, Leaf, Eye } from 'lucide-react';
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
  
  // Создаем темы с переводами
  const SIMPLE_THEMES: MushafTheme[] = SIMPLE_THEMES_BASE.map(theme => {
    const translatedName = t(`mushaf.${theme.nameKey}`) || theme.nameKey;
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
            "bg-white/90 hover:bg-white shadow-lg backdrop-blur-sm border border-white/20",
            className
          )}
        >
          <Palette className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">
            {locale === 'en' ? 'Themes' : 'Темы'}
          </span>
        </Button>
      </SheetTrigger>
      
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-lg overflow-y-auto border-l-0"
        style={{ 
          backgroundColor: currentTheme.colors.background,
          borderColor: currentTheme.colors.border 
        }}
      >
        <SheetHeader className="mb-8">
          <SheetTitle 
            className="flex items-center gap-3 text-2xl font-bold"
            style={{ color: currentTheme.colors.text }}
          >
            <div className="p-2 rounded-xl" style={{ backgroundColor: `${currentTheme.colors.accent}15` }}>
              <BookOpen className="w-6 h-6" style={{ color: currentTheme.colors.accent }} />
            </div>
            {locale === 'en' ? 'Reading Themes' : 'Темы для чтения'}
          </SheetTitle>
          <SheetDescription 
            className="text-base"
            style={{ color: `${currentTheme.colors.text}CC` }}
          >
            {locale === 'en' 
              ? 'Choose a comfortable theme for reading the Holy Quran' 
              : 'Выберите удобную тему для чтения Священного Корана'}
          </SheetDescription>
        </SheetHeader>

        {/* Превью текущей темы */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 rounded-2xl border-2 relative overflow-hidden"
          style={{ 
            backgroundColor: `${currentTheme.colors.accent}08`,
            borderColor: currentTheme.colors.accent 
          }}
        >
          <div className="relative z-10">
            <div className="text-sm font-medium mb-4 opacity-70" style={{ color: currentTheme.colors.text }}>
              {locale === 'en' ? 'Current Theme:' : 'Текущая тема:'}
            </div>
            <div className="flex items-center gap-4">
              <div className="text-4xl">{currentTheme.icon}</div>
              <div>
                <div className="font-bold text-xl mb-1" style={{ color: currentTheme.colors.text }}>
                  {currentTheme.name}
                </div>
                <div 
                  className="text-sm font-medium opacity-60" 
                  style={{ color: currentTheme.colors.text }}
                >
                  {currentTheme.nameArabic}
                </div>
              </div>
            </div>
          </div>
          
          {/* Декоративный фоновый элемент */}
          <div 
            className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-5 -mr-16 -mt-16"
            style={{ backgroundColor: currentTheme.colors.accent }}
          />
        </motion.div>

        {/* Сетка тем с превью */}
        <div className="space-y-8">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" style={{ color: currentTheme.colors.accent }} />
            <h3 
              className="font-bold text-lg"
              style={{ color: currentTheme.colors.text }}
            >
              {locale === 'en' ? 'Available Themes' : 'Доступные темы'}
            </h3>
            <div 
              className="px-2 py-1 rounded-full text-xs font-medium"
              style={{ 
                backgroundColor: `${currentTheme.colors.accent}20`,
                color: currentTheme.colors.accent 
              }}
            >
              {SIMPLE_THEMES.length}
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            {SIMPLE_THEMES.map((theme, index) => {
              const isActive = currentTheme.id === theme.id;
              
              return (
                <motion.div
                  key={theme.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleThemeSelect(theme)}
                  className={cn(
                    "cursor-pointer rounded-2xl p-5 border-2 transition-all duration-300 relative overflow-hidden",
                    isActive 
                      ? "shadow-2xl" 
                      : "hover:shadow-xl"
                  )}
                  style={{
                    backgroundColor: isActive 
                      ? `${theme.colors.accent}10` 
                      : 'transparent',
                    borderColor: isActive 
                      ? theme.colors.accent 
                      : `${currentTheme.colors.border}60`
                  }}
                >
                  {/* Заголовок темы */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{theme.icon}</div>
                      <div>
                        <div className="font-bold text-lg" style={{ color: currentTheme.colors.text }}>
                          {theme.name}
                        </div>
                        <div 
                          className="text-sm opacity-60" 
                          style={{ color: currentTheme.colors.text }}
                        >
                          {theme.nameArabic}
                        </div>
                      </div>
                    </div>
                    
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="p-2 rounded-full"
                        style={{ backgroundColor: theme.colors.accent }}
                      >
                        <Check className="w-4 h-4 text-white" />
                      </motion.div>
                    )}
                  </div>

                  {/* SVG превью */}
                  <div className="flex justify-center mb-5">
                    <ThemePreviewSVG theme={theme} isActive={isActive} />
                  </div>

                  {/* Цветовая палитра */}
                  <div className="flex gap-2 justify-center">
                    <div
                      className="w-10 h-10 rounded-xl border-2 border-white shadow-lg flex items-center justify-center"
                      style={{ backgroundColor: theme.colors.background }}
                      title={locale === 'en' ? 'Background' : 'Фон'}
                    >
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.colors.text, opacity: 0.3 }} />
                    </div>
                    <div
                      className="w-10 h-10 rounded-xl border-2 border-white shadow-lg"
                      style={{ backgroundColor: theme.colors.pageBackground }}
                      title={locale === 'en' ? 'Page' : 'Страница'}
                    />
                    <div
                      className="w-10 h-10 rounded-xl border-2 border-white shadow-lg"
                      style={{ backgroundColor: theme.colors.text }}
                      title={locale === 'en' ? 'Text' : 'Текст'}
                    />
                    <div
                      className="w-10 h-10 rounded-xl border-2 border-white shadow-lg"
                      style={{ backgroundColor: theme.colors.accent }}
                      title={locale === 'en' ? 'Accent' : 'Акцент'}
                    />
                  </div>

                  {/* Декоративные элементы */}
                  {isActive && (
                    <div 
                      className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 -mr-12 -mt-12"
                      style={{ backgroundColor: theme.colors.accent }}
                    />
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Дополнительная информация */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-10 p-6 rounded-2xl text-center relative overflow-hidden"
          style={{ 
            backgroundColor: `${currentTheme.colors.pageBackground}AA`,
            border: `1px solid ${currentTheme.colors.border}`
          }}
        >
          <Eye className="w-6 h-6 mx-auto mb-3" style={{ color: currentTheme.colors.accent }} />
          <p className="text-sm leading-relaxed" style={{ color: currentTheme.colors.text }}>
            {locale === 'en' 
              ? '💡 Choose a theme that provides comfort for your eyes during extended reading sessions of the Holy Quran'
              : '💡 Выберите тему, которая обеспечивает комфорт для ваших глаз во время длительного чтения Священного Корана'}
          </p>
          
          <div 
            className="absolute inset-0 rounded-2xl opacity-5"
            style={{ backgroundColor: currentTheme.colors.accent }}
          />
        </motion.div>
      </SheetContent>
    </Sheet>
  );
}