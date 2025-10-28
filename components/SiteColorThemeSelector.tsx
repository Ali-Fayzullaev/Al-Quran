"use client";

import { useState } from "react";
import { useQuranStore } from "@/lib/store";
import { SITE_COLOR_THEMES } from "@/lib/colorThemes";
import { useColorTheme } from "@/lib/useColorTheme";
import { Button } from "@/components/ui/button";
import { Check, Palette } from "lucide-react";

interface SiteColorThemeSelectorProps {
  title?: string;
  description?: string;
}

export default function SiteColorThemeSelector({ 
  title = "Цветовая тема сайта",
  description = "Выберите цветовую схему для всего интерфейса"
}: SiteColorThemeSelectorProps) {
  const { siteColorTheme, setSiteColorTheme } = useQuranStore();
  const { applySiteTheme } = useColorTheme();
  const [previewTheme, setPreviewTheme] = useState<string | null>(null);

  const handleThemeSelect = (themeId: string) => {
    setSiteColorTheme(themeId);
    applySiteTheme(themeId);
    setPreviewTheme(null);
  };

  const handlePreview = (themeId: string) => {
    setPreviewTheme(themeId);
    applySiteTheme(themeId);
  };

  const handleStopPreview = () => {
    if (previewTheme) {
      setPreviewTheme(null);
      applySiteTheme(siteColorTheme);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <Palette className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
          {title}
        </h3>
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {description}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {SITE_COLOR_THEMES.map((theme) => {
          const isSelected = siteColorTheme === theme.id;
          const isPreviewing = previewTheme === theme.id;
          
          return (
            <div
              key={theme.id}
              className="relative group"
            >
              <Button
                variant="ghost"
                className={`w-full h-auto p-0 overflow-hidden rounded-xl border-2 transition-all duration-300 ${
                  isSelected ? 'border-opacity-100 ring-2 ring-opacity-50' : 'border-gray-200 dark:border-gray-700 hover:border-opacity-70'
                }`}
                style={{
                  borderColor: isSelected ? theme.lightMode.primary : undefined,
                  '--tw-ring-color': isSelected ? theme.lightMode.primary : undefined
                } as React.CSSProperties}
                onClick={() => handleThemeSelect(theme.id)}
                onMouseEnter={() => handlePreview(theme.id)}
                onMouseLeave={handleStopPreview}
              >
                <div className="w-full p-4">
                  {/* Color Preview */}
                  <div className="flex gap-2 mb-3">
                    <div
                      className="w-8 h-8 rounded-full"
                      style={{ backgroundColor: theme.lightMode.primary }}
                    />
                    <div
                      className="w-8 h-8 rounded-full"
                      style={{ backgroundColor: theme.lightMode.accent }}
                    />
                    <div
                      className="w-8 h-8 rounded-full"
                      style={{ backgroundColor: theme.lightMode.secondary }}
                    />
                  </div>
                  
                  {/* Theme Name */}
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {theme.name}
                  </div>
                  
                  {/* Sample Card */}
                  <div className="mt-3 p-3 rounded-lg" style={{
                    backgroundColor: theme.lightMode.surface,
                    borderColor: theme.lightMode.border,
                    border: '1px solid'
                  }}>
                    <div className="text-xs mb-2" style={{ color: theme.lightMode.text }}>
                      Пример текста
                    </div>
                    <div 
                      className="w-full h-2 rounded-full"
                      style={{ backgroundColor: theme.lightMode.primary }}
                    />
                  </div>
                </div>
              </Button>

              {/* Selected Indicator */}
              {isSelected && (
                <div 
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: theme.lightMode.primary }}
                >
                  <Check className="w-4 h-4" />
                </div>
              )}

              {/* Preview Indicator */}
              {isPreviewing && !isSelected && (
                <div className="absolute inset-0 bg-black bg-opacity-20 rounded-xl flex items-center justify-center">
                  <div className="bg-white bg-opacity-90 px-3 py-1 rounded-full text-xs font-medium">
                    Предварительный просмотр
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {previewTheme && (
        <div className="flex items-center justify-between p-4 rounded-lg border border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20">
          <div className="flex items-center gap-2 text-sm">
            <Palette className="w-4 h-4 text-yellow-600" />
            <span>Предварительный просмотр активен</span>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleStopPreview}
            >
              Отмена
            </Button>
            <Button
              size="sm"
              onClick={() => handleThemeSelect(previewTheme)}
              style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
            >
              Применить
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}