'use client';

import { memo, useCallback } from 'react';
import { Palette, Monitor, Sun, Moon, Check } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { useColorTheme } from '@/lib/useColorTheme';
import { SITE_COLOR_THEMES } from '@/lib/colorThemes';
import { useQuranStore } from '@/lib/store';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface ThemeDrawerProps {
  children: React.ReactNode;
}

const ThemeDrawer = memo(function ThemeDrawer({ children }: ThemeDrawerProps) {
  const { theme, setTheme } = useTheme();
  const { siteColorTheme, setSiteColorTheme } = useQuranStore();
  const { applySiteTheme } = useColorTheme();

  const handleThemeChange = useCallback((themeId: string) => {
    setSiteColorTheme(themeId);
    applySiteTheme(themeId);
  }, [setSiteColorTheme, applySiteTheme]);

  return (
    <Sheet>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent className="w-80 bg-white dark:bg-gray-950 border-l border-gray-200 dark:border-gray-800">
        <SheetHeader className="pb-6">
          <SheetTitle className="flex items-center gap-2 text-left">
            <Palette className="w-5 h-5" />
            Настройки темы
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6">
          {/* Display Mode */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Режим отображения
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'light', icon: Sun, label: 'Светлый' },
                { id: 'dark', icon: Moon, label: 'Темный' },
                { id: 'system', icon: Monitor, label: 'Авто' }
              ].map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => setTheme(id)}
                  className={cn(
                    "flex flex-col items-center gap-2 px-3 py-3 rounded-lg text-xs transition-all border",
                    theme === id
                      ? "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                      : "hover:bg-gray-50 dark:hover:bg-gray-900 border-gray-200 dark:border-gray-800"
                  )}
                >
                  <Icon size={18} className="text-gray-700 dark:text-gray-300" />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">{label}</span>
                  {theme === id && <Check size={12} className="text-primary" />}
                </button>
              ))}
            </div>
          </div>

          {/* Color Themes */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Цветовые темы
            </h3>
            <div className="space-y-2">
              {SITE_COLOR_THEMES.map((colorTheme) => (
                <button
                  key={colorTheme.id}
                  onClick={() => handleThemeChange(colorTheme.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-all border",
                    siteColorTheme === colorTheme.id
                      ? "bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                      : "hover:bg-gray-50 dark:hover:bg-gray-900 border-gray-200 dark:border-gray-800"
                  )}
                >
                  {/* Color Preview */}
                  <div className="flex gap-1">
                    <div 
                      className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600"
                      style={{ backgroundColor: colorTheme.lightMode.primary }}
                    />
                    <div 
                      className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600"
                      style={{ backgroundColor: colorTheme.darkMode.primary }}
                    />
                  </div>
                  
                  <span className="flex-1 text-left font-medium text-gray-900 dark:text-gray-100">
                    {colorTheme.name}
                  </span>
                  
                  {siteColorTheme === colorTheme.id && (
                    <Check size={16} className="text-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-800">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Настройки автоматически сохраняются
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
});

export default ThemeDrawer;