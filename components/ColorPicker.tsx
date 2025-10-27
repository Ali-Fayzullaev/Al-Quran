"use client";

import { useState, useEffect } from "react";
import { useLocale } from "@/context/LocaleContext";
import { useQuranStore } from "@/lib/store";
import { useColorTheme } from "@/lib/useColorTheme";
import { 
  SITE_COLOR_THEMES, 
  QURAN_TEXT_COLOR_SCHEMES, 
  getThemeByName,
  getQuranColorSchemeByName,
  ColorTheme,
  QuranTextColorScheme,
  debugCSSVariables
} from "@/lib/colorThemes";
import { Button } from "@/components/ui/button";
import { Check, Palette, Eye, RefreshCw } from "lucide-react";

interface ColorPickerProps {
  type: 'site' | 'quran';
  title: string;
  description?: string;
}

export default function ColorPicker({ type, title, description }: ColorPickerProps) {
  const { t } = useLocale();
  const { 
    siteColorTheme, 
    quranTextColorScheme, 
    setSiteColorTheme, 
    setQuranTextColorScheme 
  } = useQuranStore();
  const { applySiteTheme, applyQuranTheme, applyCurrentColors } = useColorTheme();
  
  const [previewTheme, setPreviewTheme] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const themes = type === 'site' ? SITE_COLOR_THEMES : QURAN_TEXT_COLOR_SCHEMES;
  const currentTheme = type === 'site' ? siteColorTheme : quranTextColorScheme;

  // Предварительный просмотр цветовой схемы
  const handlePreview = (themeId: string) => {
    setPreviewTheme(themeId);
    setIsPreviewMode(true);
    
    if (type === 'site') {
      console.log('Previewing site theme:', themeId);
      applySiteTheme(themeId);
    } else {
      console.log('Previewing quran scheme:', themeId);
      applyQuranTheme(themeId);
    }
  };

  // Применить выбранную схему
  const handleApply = (themeId: string) => {
    console.log('Applying theme:', themeId, 'type:', type);
    
    if (type === 'site') {
      setSiteColorTheme(themeId);
      applySiteTheme(themeId);
    } else {
      setQuranTextColorScheme(themeId);
      applyQuranTheme(themeId);
    }
    setIsPreviewMode(false);
    setPreviewTheme(null);
  };

  // Сброс превью
  const handleCancelPreview = () => {
    setIsPreviewMode(false);
    setPreviewTheme(null);
    
    // Восстанавливаем текущую тему
    applyCurrentColors();
  };

  // Сброс к стандартной теме
  const handleReset = () => {
    const defaultTheme = type === 'site' ? 'emerald' : 'classic';
    handleApply(defaultTheme);
  };

  // Принудительное обновление цветов
  const handleForceUpdate = () => {
    console.log('Force updating colors...');
    applyCurrentColors();
  };

  // Переводы названий тем
  const getThemeName = (theme: any) => {
    const names = {
      emerald: t('emerald') || 'Изумрудный',
      blue: t('blue') || 'Синий', 
      purple: t('purple') || 'Фиолетовый',
      pink: t('pink') || 'Розовый',
      orange: t('orange') || 'Оранжевый',
      teal: t('teal') || 'Бирюзовый',
      indigo: t('indigo') || 'Индиго',
      classic: t('classic') || 'Классический',
      elegant: t('elegant') || 'Элегантный',
      modern: t('modern') || 'Современный',
      vibrant: t('vibrant') || 'Яркий',
      forest: t('forest') || 'Лесной',
      sunset: t('sunset') || 'Закат',
      ocean: t('ocean') || 'Океанский',
    };
    return names[theme.name as keyof typeof names] || theme.name;
  };

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Palette className="w-5 h-5" />
            {title}
          </h3>
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</p>
          )}
        </div>

        {/* Кнопки управления */}
        <div className="flex items-center gap-2">
          {isPreviewMode && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelPreview}
                className="text-gray-600 dark:text-gray-400"
              >
                Отмена
              </Button>
              <Button
                size="sm"
                onClick={() => previewTheme && handleApply(previewTheme)}
                className="theme-btn-primary"
              >
                <Check className="w-4 h-4 mr-1" />
                {t("applyColor") || "Применить"}
              </Button>
            </>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Сброс
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleForceUpdate}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Обновить
          </Button>
        </div>
      </div>

      {/* Режим предпросмотра */}
      {isPreviewMode && previewTheme && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
            <Eye className="w-4 h-4" />
            <span className="text-sm font-medium">Предпросмотр - {getThemeName(themes.find(t => t.id === previewTheme))}</span>
          </div>
        </div>
      )}

      {/* Цветовые схемы */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {themes.map((theme) => {
          const isActive = theme.id === currentTheme;
          const isPreviewing = previewTheme === theme.id;
          
          return (
            <div key={theme.id} className="relative">
              {/* Карточка цветовой схемы */}
              <div 
                className={`
                  relative p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer hover:scale-105 group
                  ${isActive 
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-lg' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }
                  ${isPreviewing ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}
                `}
                onClick={() => handlePreview(theme.id)}
              >
                {/* Цветовая палитра */}
                <div className="mb-3">
                  {type === 'site' ? (
                    <SiteColorPreview theme={theme as ColorTheme} />
                  ) : (
                    <QuranTextColorPreview scheme={theme as QuranTextColorScheme} />
                  )}
                </div>
                
                {/* Название */}
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {getThemeName(theme)}
                  </p>
                  {isActive && (
                    <div className="flex items-center justify-center mt-1">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                  )}
                </div>

                {/* Кнопка применения */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2">
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApply(theme.id);
                    }}
                    className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-md"
                  >
                    <Check className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Предварительный просмотр текста Корана */}
      {type === 'quran' && (
        <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {t("colorPreview") || "Предпросмотр цветов"}
          </h4>
          
          <div className="space-y-4">
            {/* Арабский текст */}
            <div 
              className="text-right text-2xl font-arabic leading-relaxed"
              style={{ color: 'var(--quran-arabic-color)' }}
            >
              بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
            </div>
            
            {/* Перевод */}
            <div 
              className="text-left text-base leading-relaxed"
              style={{ color: 'var(--quran-translation-color)' }}
            >
              Во имя Аллаха, Милостивого, Милосердного!
            </div>
            
            {/* Номер аята */}
            <div className="flex items-center gap-2">
              <span 
                className="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold"
                style={{ 
                  color: 'var(--quran-verse-number-color)',
                  backgroundColor: 'var(--quran-highlight-color)'
                }}
              >
                1
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Номер аята
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Компонент превью цветовой схемы сайта
function SiteColorPreview({ theme }: { theme: ColorTheme }) {
  return (
    <div className="space-y-2">
      {/* Светлый режим */}
      <div>
        <p className="text-xs text-gray-500 mb-1">Светлый</p>
        <div className="flex gap-1">
          <div 
            className="w-6 h-6 rounded-full border border-white shadow-sm"
            style={{ backgroundColor: theme.lightMode.primary }}
            title="Primary"
          />
          <div 
            className="w-6 h-6 rounded-full border border-white shadow-sm"
            style={{ backgroundColor: theme.lightMode.secondary }}
            title="Secondary"
          />
          <div 
            className="w-6 h-6 rounded-full border border-white shadow-sm"
            style={{ backgroundColor: theme.lightMode.accent }}
            title="Accent"
          />
          <div 
            className="w-4 h-4 rounded border border-white shadow-sm mt-1"
            style={{ backgroundColor: theme.lightMode.background }}
            title="Background"
          />
        </div>
      </div>
      
      {/* Темный режим */}
      <div>
        <p className="text-xs text-gray-500 mb-1">Темный</p>
        <div className="flex gap-1">
          <div 
            className="w-6 h-6 rounded-full border border-gray-600 shadow-sm"
            style={{ backgroundColor: theme.darkMode.primary }}
            title="Primary Dark"
          />
          <div 
            className="w-6 h-6 rounded-full border border-gray-600 shadow-sm"
            style={{ backgroundColor: theme.darkMode.secondary }}
            title="Secondary Dark"
          />
          <div 
            className="w-6 h-6 rounded-full border border-gray-600 shadow-sm"
            style={{ backgroundColor: theme.darkMode.accent }}
            title="Accent Dark"
          />
          <div 
            className="w-4 h-4 rounded border border-gray-600 shadow-sm mt-1"
            style={{ backgroundColor: theme.darkMode.background }}
            title="Background Dark"
          />
        </div>
      </div>
    </div>
  );
}

// Компонент превью цветов текста Корана
function QuranTextColorPreview({ scheme }: { scheme: QuranTextColorScheme }) {
  return (
    <div className="space-y-2">
      {/* Светлый режим */}
      <div>
        <p className="text-xs text-gray-500 mb-1">Светлый</p>
        <div className="flex gap-1">
          <div 
            className="w-8 h-3 rounded border border-white shadow-sm"
            style={{ backgroundColor: scheme.lightMode.arabicColor }}
            title="Arabic text"
          />
          <div 
            className="w-8 h-3 rounded border border-white shadow-sm"
            style={{ backgroundColor: scheme.lightMode.translationColor }}
            title="Translation text"
          />
          <div 
            className="w-4 h-4 rounded-full border border-white shadow-sm"
            style={{ backgroundColor: scheme.lightMode.verseNumberColor }}
            title="Verse number"
          />
        </div>
      </div>
      
      {/* Темный режим */}
      <div>
        <p className="text-xs text-gray-500 mb-1">Темный</p>
        <div className="flex gap-1">
          <div 
            className="w-8 h-3 rounded border border-gray-600 shadow-sm"
            style={{ backgroundColor: scheme.darkMode.arabicColor }}
            title="Arabic text dark"
          />
          <div 
            className="w-8 h-3 rounded border border-gray-600 shadow-sm"
            style={{ backgroundColor: scheme.darkMode.translationColor }}
            title="Translation text dark"
          />
          <div 
            className="w-4 h-4 rounded-full border border-gray-600 shadow-sm"
            style={{ backgroundColor: scheme.darkMode.verseNumberColor }}
            title="Verse number dark"
          />
        </div>
      </div>
    </div>
  );
}