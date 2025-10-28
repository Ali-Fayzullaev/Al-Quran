"use client";

import { useState, useEffect } from "react";
import { useQuranStore } from "@/lib/store";
import { useLocale } from "@/context/LocaleContext";
import { Button } from "@/components/ui/button";
import { Palette, RotateCcw, Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

// Готовые цветовые схемы для удобного выбора
const COLOR_SCHEMES = [
  {
    id: 'classic',
    name: { en: 'Classic Green', ru: 'Классический зеленый' },
    description: { en: 'Traditional Islamic color scheme', ru: 'Традиционная исламская палитра' },
    buttonColor: '#10b981',
    textColor: '#1C1E21',
    translationColor: '#5A5D61',
    backgroundColor: '#f0fdf4',
    preview: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
  },
  {
    id: 'ocean',
    name: { en: 'Ocean Blue', ru: 'Морской синий' },
    description: { en: 'Calm and focused reading', ru: 'Спокойное и сосредоточенное чтение' },
    buttonColor: '#3b82f6',
    textColor: '#1e293b',
    translationColor: '#64748b',
    backgroundColor: '#eff6ff',
    preview: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
  },
  {
    id: 'royal',
    name: { en: 'Royal Purple', ru: 'Королевский фиолетовый' },
    description: { en: 'Elegant and refined', ru: 'Элегантный и изысканный' },
    buttonColor: '#8b5cf6',
    textColor: '#1f2937',
    translationColor: '#6b7280',
    backgroundColor: '#faf5ff',
    preview: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
  },
  {
    id: 'sunset',
    name: { en: 'Sunset Orange', ru: 'Закатный оранжевый' },
    description: { en: 'Warm and inviting', ru: 'Теплый и приветливый' },
    buttonColor: '#f97316',
    textColor: '#292524',
    translationColor: '#78716c',
    backgroundColor: '#fff7ed',
    preview: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)'
  },
  {
    id: 'forest',
    name: { en: 'Forest Teal', ru: 'Лесной бирюзовый' },
    description: { en: 'Natural and peaceful', ru: 'Естественный и умиротворяющий' },
    buttonColor: '#14b8a6',
    textColor: '#134e4a',
    translationColor: '#4b5563',
    backgroundColor: '#f0fdfa',
    preview: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)'
  },
  {
    id: 'rose',
    name: { en: 'Rose Pink', ru: 'Розовый' },
    description: { en: 'Soft and comfortable', ru: 'Мягкий и комфортный' },
    buttonColor: '#f43f5e',
    textColor: '#1f2937',
    translationColor: '#6b7280',
    backgroundColor: '#fff1f2',
    preview: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)'
  },
  {
    id: 'sepia',
    name: { en: 'Sepia Classic', ru: 'Классическая сепия' },
    description: { en: 'Vintage book style', ru: 'Стиль винтажной книги' },
    buttonColor: '#92400e',
    textColor: '#451a03',
    translationColor: '#78350f',
    backgroundColor: '#fefce8',
    preview: 'linear-gradient(135deg, #92400e 0%, #78350f 100%)'
  },
  {
    id: 'dark-emerald',
    name: { en: 'Dark Emerald', ru: 'Темный изумруд' },
    description: { en: 'For night reading', ru: 'Для ночного чтения' },
    buttonColor: '#10b981',
    textColor: '#d1fae5',
    translationColor: '#86efac',
    backgroundColor: '#064e3b',
    preview: 'linear-gradient(135deg, #065f46 0%, #047857 100%)'
  },
  {
    id: 'dark-amber',
    name: { en: 'Dark Amber', ru: 'Темный янтарь' },
    description: { en: 'Warm night mode', ru: 'Теплый ночной режим' },
    buttonColor: '#f59e0b',
    textColor: '#fef3c7',
    translationColor: '#fde68a',
    backgroundColor: '#78350f',
    preview: 'linear-gradient(135deg, #78350f 0%, #92400e 100%)'
  },
  {
    id: 'midnight',
    name: { en: 'Midnight Blue', ru: 'Полуночный синий' },
    description: { en: 'Deep focus mode', ru: 'Глубокая концентрация' },
    buttonColor: '#3b82f6',
    textColor: '#dbeafe',
    translationColor: '#bfdbfe',
    backgroundColor: '#1e3a8a',
    preview: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)'
  },
];

// Дополнительные быстрые цвета для кнопок
const QUICK_BUTTON_COLORS = [
  { name: { en: 'Green', ru: 'Зеленый' }, color: '#10b981' },
  { name: { en: 'Blue', ru: 'Синий' }, color: '#3b82f6' },
  { name: { en: 'Purple', ru: 'Фиолетовый' }, color: '#8b5cf6' },
  { name: { en: 'Rose', ru: 'Розовый' }, color: '#f43f5e' },
  { name: { en: 'Orange', ru: 'Оранжевый' }, color: '#f97316' },
  { name: { en: 'Teal', ru: 'Бирюзовый' }, color: '#14b8a6' },
  { name: { en: 'Indigo', ru: 'Индиго' }, color: '#6366f1' },
  { name: { en: 'Amber', ru: 'Янтарный' }, color: '#f59e0b' },
];

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
  const { locale } = useLocale();
  const {
    customButtonColor,
    customQuranTextColor,
    customQuranTranslationColor,
    setCustomButtonColor,
    setCustomQuranTextColor,
    setCustomQuranTranslationColor,
  } = useQuranStore();

  const [buttonColor, setButtonColor] = useState(customButtonColor || "#10b981");
  const [quranTextColor, setQuranTextColor] = useState(customQuranTextColor || "#1C1E21");
  const [translationColor, setTranslationColor] = useState(customQuranTranslationColor || "#5A5D61");
  const [selectedScheme, setSelectedScheme] = useState<string | null>(null);

  // Применить цвета в реальном времени
  useEffect(() => {
    if (typeof window !== "undefined") {
      const root = document.documentElement;
      
      // Применяем цвет кнопок
      if (customButtonColor) {
        root.style.setProperty('--color-primary', customButtonColor);
        root.style.setProperty('--color-accent', customButtonColor);
      }
      
      // Применяем цвета текста Корана
      if (customQuranTextColor) {
        root.style.setProperty('--quran-arabic-color', customQuranTextColor);
      }
      
      if (customQuranTranslationColor) {
        root.style.setProperty('--quran-translation-color', customQuranTranslationColor);
      }
    }
  }, [customButtonColor, customQuranTextColor, customQuranTranslationColor]);

  const handleApplyButtonColor = () => {
    setCustomButtonColor(buttonColor);
    // Применяем сразу в CSS
    if (typeof window !== "undefined") {
      const root = document.documentElement;
      root.style.setProperty('--color-primary', buttonColor);
      root.style.setProperty('--color-accent', buttonColor);
    }
  };

  const handleApplyQuranTextColor = () => {
    setCustomQuranTextColor(quranTextColor);
    // Применяем сразу в CSS
    if (typeof window !== "undefined") {
      const root = document.documentElement;
      root.style.setProperty('--quran-arabic-color', quranTextColor);
    }
  };

  const handleApplyTranslationColor = () => {
    setCustomQuranTranslationColor(translationColor);
    // Применяем сразу в CSS
    if (typeof window !== "undefined") {
      const root = document.documentElement;
      root.style.setProperty('--quran-translation-color', translationColor);
    }
  };

  const handleResetButtonColor = () => {
    setButtonColor("#10b981");
    setCustomButtonColor(null);
    if (typeof window !== "undefined") {
      const root = document.documentElement;
      root.style.removeProperty('--color-primary');
      root.style.removeProperty('--color-accent');
    }
  };

  const handleResetQuranTextColor = () => {
    setQuranTextColor("#1C1E21");
    setCustomQuranTextColor(null);
    if (typeof window !== "undefined") {
      const root = document.documentElement;
      root.style.removeProperty('--quran-arabic-color');
    }
  };

  const handleResetTranslationColor = () => {
    setTranslationColor("#5A5D61");
    setCustomQuranTranslationColor(null);
    if (typeof window !== "undefined") {
      const root = document.documentElement;
      root.style.removeProperty('--quran-translation-color');
    }
  };

  // Применить готовую цветовую схему
  const applyColorScheme = (scheme: typeof COLOR_SCHEMES[0]) => {
    setButtonColor(scheme.buttonColor);
    setQuranTextColor(scheme.textColor);
    setTranslationColor(scheme.translationColor);
    setSelectedScheme(scheme.id);
    
    // Сразу применяем в store
    setCustomButtonColor(scheme.buttonColor);
    setCustomQuranTextColor(scheme.textColor);
    setCustomQuranTranslationColor(scheme.translationColor);
    
    // Применяем в CSS переменные - ТОЛЬКО цвета текста, БЕЗ фона
    if (typeof window !== "undefined") {
      const root = document.documentElement;
      root.style.setProperty('--color-primary', scheme.buttonColor);
      root.style.setProperty('--color-accent', scheme.buttonColor);
      root.style.setProperty('--quran-arabic-color', scheme.textColor);
      root.style.setProperty('--quran-translation-color', scheme.translationColor);
    }
  };

  // Быстрое применение цвета кнопок
  const quickApplyButtonColor = (color: string) => {
    setButtonColor(color);
    setCustomButtonColor(color);
    if (typeof window !== "undefined") {
      const root = document.documentElement;
      root.style.setProperty('--color-primary', color);
      root.style.setProperty('--color-accent', color);
    }
  };

  // Быстрое применение цвета текста Корана
  const quickApplyTextColor = (color: string) => {
    setQuranTextColor(color);
    setCustomQuranTextColor(color);
    if (typeof window !== "undefined") {
      const root = document.documentElement;
      root.style.setProperty('--quran-arabic-color', color);
    }
  };

  // Быстрое применение цвета перевода
  const quickApplyTranslationColor = (color: string) => {
    setTranslationColor(color);
    setCustomQuranTranslationColor(color);
    if (typeof window !== "undefined") {
      const root = document.documentElement;
      root.style.setProperty('--quran-translation-color', color);
    }
  };

  return (
    <div className="space-y-8">
      {/* Заголовок */}
      <div className="text-center">
        <div className="inline-flex items-center gap-3 mb-3">
          <Palette className="w-6 h-6" style={{ color: customButtonColor || '#10b981' }} />
          <h2 className="text-2xl font-bold" style={{ color: 'var(--fixed-text)' }}>
            {locale === 'en' ? 'Custom Colors' : 'Настройки цветов'}
          </h2>
        </div>
        <p className="text-sm" style={{ color: 'var(--fixed-text-secondary)' }}>
          {locale === 'en' 
            ? 'Choose a ready-made color scheme or create your own' 
            : 'Выберите готовую цветовую схему или создайте свою'}
        </p>
      </div>

      {/* Готовые цветовые схемы */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
            <h3 className="text-xl font-semibold" style={{ color: 'var(--fixed-text)' }}>
              {locale === 'en' ? 'Ready-Made Color Schemes' : 'Готовые цветовые схемы'}
            </h3>
          </div>
          <p className="text-xs px-3 py-1 rounded-full" style={{ 
            backgroundColor: 'var(--color-primary)',
            color: 'white'
          }}>
            {locale === 'en' ? 'Click to apply instantly' : 'Нажмите для мгновенного применения'}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {COLOR_SCHEMES.map((scheme) => (
            <button
              key={scheme.id}
              onClick={() => applyColorScheme(scheme)}
              className={cn(
                "group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-xl",
                selectedScheme === scheme.id 
                  ? "border-current shadow-lg ring-4 ring-offset-2" 
                  : "border-gray-200 dark:border-gray-700"
              )}
              style={{
                borderColor: selectedScheme === scheme.id ? scheme.buttonColor : undefined
              }}
            >
              {/* Gradient Preview */}
              <div 
                className="h-20 w-full"
                style={{ background: scheme.preview }}
              />
              
              {/* Verse Preview */}
              <div 
                className="p-4 space-y-2"
                style={{ backgroundColor: scheme.backgroundColor }}
              >
                <p 
                  className="text-2xl text-right font-arabic leading-loose"
                  style={{ color: scheme.textColor }}
                >
                  بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ
                </p>
                <p 
                  className="text-sm leading-relaxed"
                  style={{ color: scheme.translationColor }}
                >
                  {locale === 'en' 
                    ? 'In the name of Allah, the Most Gracious, the Most Merciful' 
                    : 'Во имя Аллаха, Милостивого, Милосердного'}
                </p>
              </div>
              
              {/* Content */}
              <div className="p-4 space-y-2" style={{ backgroundColor: 'var(--fixed-background)' }}>
                <h4 className="font-bold text-base" style={{ color: 'var(--fixed-text)' }}>
                  {locale === 'en' ? scheme.name.en : scheme.name.ru}
                </h4>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--fixed-text-secondary)' }}>
                  {locale === 'en' ? scheme.description.en : scheme.description.ru}
                </p>
                
                {/* Color Preview Dots */}
                <div className="flex items-center gap-2 pt-2">
                  <div 
                    className="w-6 h-6 rounded-full border-2 border-white shadow-md"
                    style={{ backgroundColor: scheme.buttonColor }}
                    title={locale === 'en' ? 'Buttons' : 'Кнопки'}
                  />
                  <div 
                    className="w-6 h-6 rounded-full border-2 border-white shadow-md"
                    style={{ backgroundColor: scheme.textColor }}
                    title={locale === 'en' ? 'Arabic Text' : 'Арабский текст'}
                  />
                  <div 
                    className="w-6 h-6 rounded-full border-2 border-white shadow-md"
                    style={{ backgroundColor: scheme.translationColor }}
                    title={locale === 'en' ? 'Translation' : 'Перевод'}
                  />
                </div>
              </div>
              
              {/* Selected Indicator */}
              {selectedScheme === scheme.id && (
                <div 
                  className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
                  style={{ backgroundColor: scheme.buttonColor }}
                >
                  <Check className="w-5 h-5 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Разделитель */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t" style={{ borderColor: 'var(--color-border)' }}></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 font-medium" style={{ 
            backgroundColor: 'var(--fixed-background)',
            color: 'var(--fixed-text-secondary)' 
          }}>
            {locale === 'en' ? 'Or customize manually' : 'Или настройте вручную'}
          </span>
        </div>
      </div>

      {/* Цвет кнопок */}
      <div className="space-y-4 p-6 rounded-2xl border" style={{ 
        backgroundColor: 'var(--fixed-background)',
        borderColor: 'var(--color-border)'
      }}>
        <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--fixed-text)' }}>
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: buttonColor }}></div>
          {locale === 'en' ? 'Button Color' : 'Цвет кнопок'}
        </h3>
        
        {/* Цветовой пикер */}
        <div className="flex items-center gap-4">
          <input
            type="color"
            value={buttonColor}
            onChange={(e) => setButtonColor(e.target.value)}
            className="w-20 h-20 rounded-xl cursor-pointer border-2"
            style={{ borderColor: 'var(--color-border)' }}
          />
          <div className="flex-1">
            <input
              type="text"
              value={buttonColor}
              onChange={(e) => setButtonColor(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border font-mono text-sm"
              style={{ 
                backgroundColor: 'var(--fixed-background)',
                color: 'var(--fixed-text)',
                borderColor: 'var(--color-border)'
              }}
              placeholder="#10b981"
            />
          </div>
        </div>

        {/* Предустановленные цвета */}
        <div className="space-y-2">
          <p className="text-xs" style={{ color: 'var(--fixed-text-secondary)' }}>
            {locale === 'en' ? 'Quick colors (click to apply instantly)' : 'Быстрые цвета (нажмите для мгновенного применения)'}
          </p>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {QUICK_BUTTON_COLORS.map((preset) => (
              <button
                key={preset.color}
                onClick={() => quickApplyButtonColor(preset.color)}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all hover:scale-105",
                  buttonColor === preset.color ? "ring-2 ring-offset-2" : ""
                )}
                style={{ 
                  backgroundColor: 'var(--fixed-background)',
                  borderColor: buttonColor === preset.color ? preset.color : 'var(--color-border)',
                }}
                title={locale === 'en' ? preset.name.en : preset.name.ru}
              >
                <div className="w-8 h-8 rounded-full" style={{ backgroundColor: preset.color }}></div>
              </button>
            ))}
          </div>
        </div>

        {/* Кнопки действий */}
        <div className="flex gap-3">
          <Button
            onClick={handleApplyButtonColor}
            className="flex-1 gap-2"
            style={{ backgroundColor: buttonColor, color: 'white' }}
          >
            <Check className="w-4 h-4" />
            {locale === 'en' ? 'Apply' : 'Применить'}
          </Button>
          <Button
            onClick={handleResetButtonColor}
            variant="outline"
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            {locale === 'en' ? 'Reset' : 'Сбросить'}
          </Button>
        </div>
      </div>

      {/* Цвет арабского текста Корана */}
      <div className="space-y-4 p-6 rounded-2xl border" style={{ 
        backgroundColor: 'var(--fixed-background)',
        borderColor: 'var(--color-border)'
      }}>
        <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--fixed-text)' }}>
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: quranTextColor }}></div>
          {locale === 'en' ? 'Quran Text Color (Arabic)' : 'Цвет текста Корана (арабский)'}
        </h3>
        
        {/* Цветовой пикер */}
        <div className="flex items-center gap-4">
          <input
            type="color"
            value={quranTextColor}
            onChange={(e) => setQuranTextColor(e.target.value)}
            className="w-20 h-20 rounded-xl cursor-pointer border-2"
            style={{ borderColor: 'var(--color-border)' }}
          />
          <div className="flex-1">
            <input
              type="text"
              value={quranTextColor}
              onChange={(e) => setQuranTextColor(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border font-mono text-sm"
              style={{ 
                backgroundColor: 'var(--fixed-background)',
                color: 'var(--fixed-text)',
                borderColor: 'var(--color-border)'
              }}
              placeholder="#1C1E21"
            />
          </div>
        </div>

        {/* Предустановленные цвета */}
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {QUICK_TEXT_COLORS.map((preset) => (
            <button
              key={preset.color}
              onClick={() => quickApplyTextColor(preset.color)}
              className={cn(
                "flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all hover:scale-105",
                quranTextColor === preset.color ? "ring-2 ring-offset-2" : ""
              )}
              style={{ 
                backgroundColor: 'var(--fixed-background)',
                borderColor: quranTextColor === preset.color ? preset.color : 'var(--color-border)',
              }}
              title={locale === 'en' ? preset.name.en : preset.name.ru}
            >
              <div className="w-8 h-8 rounded-full" style={{ backgroundColor: preset.color }}></div>
            </button>
          ))}
        </div>

        {/* Предпросмотр */}
        <div className="p-4 rounded-lg border" style={{ borderColor: 'var(--color-border)' }}>
          <p className="text-2xl font-arabic text-center" style={{ color: quranTextColor }}>
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>
          <p className="text-xs text-center mt-2" style={{ color: 'var(--fixed-text-secondary)' }}>
            {locale === 'en' ? 'Preview' : 'Предпросмотр'}
          </p>
        </div>

        {/* Кнопки действий */}
        <div className="flex gap-3">
          <Button
            onClick={handleApplyQuranTextColor}
            className="flex-1 gap-2"
            style={{ backgroundColor: buttonColor, color: 'white' }}
          >
            <Check className="w-4 h-4" />
            {locale === 'en' ? 'Apply' : 'Применить'}
          </Button>
          <Button
            onClick={handleResetQuranTextColor}
            variant="outline"
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            {locale === 'en' ? 'Reset' : 'Сбросить'}
          </Button>
        </div>
      </div>

      {/* Цвет перевода */}
      <div className="space-y-4 p-6 rounded-2xl border" style={{ 
        backgroundColor: 'var(--fixed-background)',
        borderColor: 'var(--color-border)'
      }}>
        <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--fixed-text)' }}>
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: translationColor }}></div>
          {locale === 'en' ? 'Translation Text Color' : 'Цвет текста перевода'}
        </h3>
        
        {/* Цветовой пикер */}
        <div className="flex items-center gap-4">
          <input
            type="color"
            value={translationColor}
            onChange={(e) => setTranslationColor(e.target.value)}
            className="w-20 h-20 rounded-xl cursor-pointer border-2"
            style={{ borderColor: 'var(--color-border)' }}
          />
          <div className="flex-1">
            <input
              type="text"
              value={translationColor}
              onChange={(e) => setTranslationColor(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border font-mono text-sm"
              style={{ 
                backgroundColor: 'var(--fixed-background)',
                color: 'var(--fixed-text)',
                borderColor: 'var(--color-border)'
              }}
              placeholder="#5A5D61"
            />
          </div>
        </div>

        {/* Предустановленные цвета */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {QUICK_TRANSLATION_COLORS.map((preset) => (
            <button
              key={preset.color}
              onClick={() => quickApplyTranslationColor(preset.color)}
              className={cn(
                "flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all hover:scale-105",
                translationColor === preset.color ? "ring-2 ring-offset-2" : ""
              )}
              style={{ 
                backgroundColor: 'var(--fixed-background)',
                borderColor: translationColor === preset.color ? preset.color : 'var(--color-border)',
              }}
              title={locale === 'en' ? preset.name.en : preset.name.ru}
            >
              <div className="w-8 h-8 rounded-full" style={{ backgroundColor: preset.color }}></div>
            </button>
          ))}
        </div>

        {/* Предпросмотр */}
        <div className="p-4 rounded-lg border" style={{ borderColor: 'var(--color-border)' }}>
          <p className="text-base text-center" style={{ color: translationColor }}>
            {locale === 'en' 
              ? 'In the name of Allah, the Entirely Merciful, the Especially Merciful.' 
              : 'Во имя Аллаха, Милостивого, Милосердного!'}
          </p>
          <p className="text-xs text-center mt-2" style={{ color: 'var(--fixed-text-secondary)' }}>
            {locale === 'en' ? 'Preview' : 'Предпросмотр'}
          </p>
        </div>

        {/* Кнопки действий */}
        <div className="flex gap-3">
          <Button
            onClick={handleApplyTranslationColor}
            className="flex-1 gap-2"
            style={{ backgroundColor: buttonColor, color: 'white' }}
          >
            <Check className="w-4 h-4" />
            {locale === 'en' ? 'Apply' : 'Применить'}
          </Button>
          <Button
            onClick={handleResetTranslationColor}
            variant="outline"
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            {locale === 'en' ? 'Reset' : 'Сбросить'}
          </Button>
        </div>
      </div>
    </div>
  );
}
