// src/components/ThemeDrawer.tsx
'use client';

import { memo, useCallback, useState } from 'react';
import { Palette, Monitor, Sun, Moon, Check } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { useColorTheme } from '@/lib/useColorTheme';
import { useLocale } from '@/context/LocaleContext';
import { SITE_COLOR_THEMES } from '@/lib/colorThemes';
import { useQuranStore } from '@/lib/store';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import useVibration from '@luxonauta/use-vibration';

interface ThemeDrawerProps {
  children: React.ReactNode;
}

const ThemeDrawer = memo(function ThemeDrawer({ children }: ThemeDrawerProps) {
  const { theme, setTheme } = useTheme();
  const { siteColorTheme, setSiteColorTheme } = useQuranStore();
  const { applySiteTheme } = useColorTheme();
  const { t } = useLocale();

  const [{ isSupported, isVibrating }, { vibrate, stop }] = useVibration();
const [isShaking, setIsShaking] = useState(false);
const triggerVibration = (
  pattern: number | number[] | any,
  fallback?: () => void
) => {
  let success = false;

  try {
    // Подход 1: Прямой нативный API (как в работающем примере)
    if (navigator.vibrate) {
      const result = navigator.vibrate(pattern);
      success = !!result;
    }

    // Подход 2: Библиотека как резерв
    if (!success && isSupported && vibrate) {
      vibrate(pattern);
      success = true;
    }

    // Подход 3: iOS fallback (как в работающем примере)
    if (!success && /iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      // iOS fallback: создаем невидимый checkbox и кликаем по label
      const el = document.createElement("div");
      const id = Math.random().toString(36).slice(2);
      el.innerHTML = `<input type="checkbox" id="${id}" switch /><label for="${id}"></label>`;
      el.setAttribute(
        "style",
        "display:none !important;opacity:0 !important;visibility:hidden !important;"
      );
      document.querySelector("body")?.appendChild(el);
      el.querySelector("label")?.click();
      setTimeout(() => {
        el.remove();
      }, 1500);
      success = true;
    }

    if (!success && fallback) {
      fallback();
    }

    return success;
  } catch (error) {
    console.error("Ошибка вибрации:", error);
    fallback?.();
    return false;
  }
};

const handleClick = () => {
  triggerVibration(50);
  setIsShaking(true);
  setTimeout(() => setIsShaking(false), 50);
};

  const handleThemeChange = useCallback((themeId: string) => {
    setSiteColorTheme(themeId);
    applySiteTheme(themeId);
  }, [setSiteColorTheme, applySiteTheme]);

  return (
    <Sheet>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent 
        className="w-80 border-l  overflow-y-auto"
       style={{ backgroundColor: 'var(--color-background-secondary)', borderColor: 'var(--color-border)', borderWidth: '1px' }}
      >
        <SheetHeader className="pb-6">
          <SheetTitle className="flex items-center gap-2 text-left" style={{ color: 'var(--fixed-text)' }}>
            <Palette className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
            {t('themeSettings')}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6">
          {/* Display Mode */}
          <div>
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--fixed-text)' }}>
              {t('displayMode')}
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'light', icon: Sun, label: t('lightMode') },
                { id: 'dark', icon: Moon, label: t('darkMode') },
                { id: 'system', icon: Monitor, label: t('autoMode') }
              ].map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => { setTheme(id); handleClick(); }}
                  className="flex flex-col items-center gap-2 px-3 py-3 rounded-lg text-xs transition-all border"
                  style={{
                    backgroundColor: theme === id ? 'var(--verse-background)' : 'transparent',
                    borderColor: theme === id ? 'var(--color-primary)' : 'var(--color-border)',
                    color: 'var(--fixed-text)'
                  }}
                  onMouseEnter={(e) => {
                    if (theme !== id) {
                      e.currentTarget.style.backgroundColor = 'var(--color-border)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (theme !== id) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <Icon size={18} style={{ color: 'var(--fixed-text-secondary)' }} />
                  <span className="font-medium" style={{ color: 'var(--fixed-text-secondary)' }}>{label}</span>
                  {theme === id && <Check size={12} style={{ color: 'var(--color-primary)' }} />}
                </button>
              ))}
            </div>
          </div>

          {/* Color Themes */}
          <div>
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--fixed-text)' }}>
              {t('colorThemes')}
            </h3>
            <div className="space-y-2 overflow-y-scroll" style={{ maxHeight: '60vh' }}>
              {SITE_COLOR_THEMES.map((colorTheme) => (
                <button
                  key={colorTheme.id}
                  onClick={() => { handleThemeChange(colorTheme.id); handleClick(); }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-all border"
                  style={{
                    backgroundColor: siteColorTheme === colorTheme.id ? 'var(--verse-background)' : 'transparent',
                    borderColor: siteColorTheme === colorTheme.id ? 'var(--color-primary)' : 'var(--color-border)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--verse-background)';
                  }}
                  onMouseLeave={(e) => {
                    if (siteColorTheme !== colorTheme.id) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {/* Color Preview */}
                  <div className="flex gap-1">
                    <div 
                      className="w-4 h-4 rounded-full border"
                      style={{ 
                        backgroundColor: colorTheme.lightMode.primary,
                        borderColor: 'var(--color-border)'
                      }}
                    />
                    <div 
                      className="w-4 h-4 rounded-full border"
                      style={{ 
                        backgroundColor: colorTheme.darkMode.primary,
                        borderColor: 'var(--color-border)'
                      }}
                    />
                  </div>
                  
                  <span className="flex-1 text-left font-medium" style={{ color: 'var(--fixed-text)' }}>
                    {colorTheme.name}
                  </span>
                  
                  {siteColorTheme === colorTheme.id && (
                    <Check size={16} style={{ color: 'var(--color-primary)' }} />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <p className="text-xs text-center" style={{ color: 'var(--fixed-text-secondary)' }}>
            {t('autoSave')}
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
});

export default ThemeDrawer;