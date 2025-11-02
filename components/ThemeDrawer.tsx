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
      <SheetContent 
        className="w-80 border-l  overflow-y-auto"
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
          {/* Display Mode */}
          <div>
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--fixed-text)' }}>
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
              Цветовые темы
            </h3>
            <div className="space-y-2">
              {SITE_COLOR_THEMES.map((colorTheme) => (
                <button
                  key={colorTheme.id}
                  onClick={() => handleThemeChange(colorTheme.id)}
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
            Настройки автоматически сохраняются
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
});

export default ThemeDrawer;