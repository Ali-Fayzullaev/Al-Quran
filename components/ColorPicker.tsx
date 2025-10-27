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
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="w-4 h-4 mr-1" />
                {t("applyColor")}
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
            {t("resetToDefault")}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleForceUpdate}
            className="text-blue-500 hover:text-blue-700 dark:hover:text-blue-300"
          >
            🔄 Обновить
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={debugCSSVariables}
            className="text-purple-500 hover:text-purple-700 dark:hover:text-purple-300"
          >
            🔍 Debug
          </Button>
        </div>
      </div>

      {/* Превью режим уведомление */}
      {isPreviewMode && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
            <Eye className="w-4 h-4" />
            <span className="text-sm font-medium">{t("preview")} - {previewTheme && t(themes.find(t => t.id === previewTheme)?.name || previewTheme)}</span>
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
                  relative p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer hover:scale-105
                  ${isActive 
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
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
                    {t(theme.name)}
                  </p>
                  {isActive && (
                    <div className="flex items-center justify-center mt-1">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                  )}
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
            {t("colorPreview")}
          </h4>
          
          <div className="space-y-4">
            {/* Арабский текст */}
            <div 
              className="text-right text-2xl font-arabic leading-relaxed"
              style={{ color: 'var(--quran-arabic-color)' }}
            >
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </div>
            
            {/* Номер аята */}
            <div className="flex items-center gap-2">
              <span 
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                style={{ 
                  color: 'var(--quran-verse-number-color)',
                  backgroundColor: 'var(--quran-highlight-color)'
                }}
              >
                1
              </span>
            </div>
            
            {/* Перевод */}
            <div 
              className="text-base leading-relaxed"
              style={{ color: 'var(--quran-translation-color)' }}
            >
              In the name of Allah, the Entirely Merciful, the Especially Merciful.
            </div>
            
            <div 
              className="text-base leading-relaxed"
              style={{ color: 'var(--quran-translation-color)' }}
            >
              Во имя Аллаха, Милостивого, Милосердного!
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Компонент превью цветовой схемы сайта
function SiteColorPreview({ theme }: { theme: ColorTheme }) {
  const colors = theme.colors;
  
  return (
    <div className="flex flex-wrap gap-1">
      <div 
        className="w-6 h-6 rounded-full border border-white dark:border-gray-800 shadow-sm"
        style={{ backgroundColor: colors.primary }}
        title="Primary"
      />
      <div 
        className="w-6 h-6 rounded-full border border-white dark:border-gray-800 shadow-sm"
        style={{ backgroundColor: colors.secondary }}
        title="Secondary"
      />
      <div 
        className="w-6 h-6 rounded-full border border-white dark:border-gray-800 shadow-sm"
        style={{ backgroundColor: colors.accent }}
        title="Accent"
      />
      <div 
        className="w-4 h-4 rounded border border-white dark:border-gray-800 shadow-sm"
        style={{ backgroundColor: colors.background }}
        title="Background"
      />
    </div>
  );
}

// Компонент превью цветов текста Корана
function QuranTextColorPreview({ scheme }: { scheme: QuranTextColorScheme }) {
  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        <div 
          className="w-8 h-3 rounded border border-white dark:border-gray-800 shadow-sm"
          style={{ backgroundColor: scheme.arabicColor }}
          title="Arabic text"
        />
        <div 
          className="w-8 h-3 rounded border border-white dark:border-gray-800 shadow-sm"
          style={{ backgroundColor: scheme.translationColor }}
          title="Translation text"
        />
      </div>
      <div className="flex gap-1">
        <div 
          className="w-4 h-4 rounded-full border border-white dark:border-gray-800 shadow-sm"
          style={{ backgroundColor: scheme.verseNumberColor }}
          title="Verse number"
        />
        <div 
          className="w-8 h-3 rounded border border-white dark:border-gray-800 shadow-sm"
          style={{ backgroundColor: scheme.highlightColor }}
          title="Highlight"
        />
      </div>
    </div>
  );
}