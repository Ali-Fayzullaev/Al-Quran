"use client";

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Palette, 
  Sun, 
  Moon, 
  FileText,
  Check,
  Settings,
  Volume2,
  VolumeX,
  Sliders
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  MushafTheme,
  MushafSettings,
  DEFAULT_THEMES,
  MUSHAF_CONFIG 
} from '@/lib/mushafTypes';
import { useLocale } from '@/context/LocaleContext';

interface ThemeSystemProps {
  currentTheme: MushafTheme;
  settings: MushafSettings;
  onThemeChange: (theme: MushafTheme) => void;
  onSettingsChange: (settings: Partial<MushafSettings>) => void;
  className?: string;
}

interface ThemePreviewProps {
  theme: MushafTheme;
  isSelected: boolean;
  onSelect: () => void;
}

function ThemePreview({ theme, isSelected, onSelect }: ThemePreviewProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={cn(
        "relative cursor-pointer rounded-xl overflow-hidden border-2 transition-all duration-300",
        isSelected 
          ? "border-blue-500 shadow-lg shadow-blue-200" 
          : "border-transparent hover:border-gray-300"
      )}
      style={{
        background: theme.colors.background
      }}
    >
      {/* Предварительный просмотр */}
      <div className="p-4 h-32">
        {/* Имитация страницы */}
        <div 
          className="w-full h-20 rounded-lg shadow-md border relative overflow-hidden"
          style={{
            background: theme.effects.pageGradient || theme.colors.pageBackground,
            borderColor: theme.colors.border,
            boxShadow: `0 4px 12px ${theme.colors.pageShadow}`
          }}
        >
          {/* Имитация текста */}
          <div className="p-2 space-y-1">
            <div 
              className="h-1.5 rounded w-3/4"
              style={{ backgroundColor: theme.colors.text }}
            />
            <div 
              className="h-1 rounded w-full opacity-70"
              style={{ backgroundColor: theme.colors.text }}
            />
            <div 
              className="h-1 rounded w-2/3 opacity-50"
              style={{ backgroundColor: theme.colors.text }}
            />
          </div>
          
          {/* Имитация номера страницы */}
          <div 
            className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center text-xs"
            style={{
              backgroundColor: theme.colors.accent,
              color: theme.colors.background
            }}
          >
            ١
          </div>
        </div>
      </div>
      
      {/* Информация о теме */}
      <div 
        className="p-3 border-t"
        style={{
          backgroundColor: theme.colors.pageBackground,
          borderColor: theme.colors.border
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h4 
              className="font-semibold text-sm mb-1"
              style={{ color: theme.colors.text }}
            >
              {theme.name}
            </h4>
            <p 
              className="text-xs opacity-75"
              style={{ color: theme.colors.text }}
            >
              {theme.nameArabic}
            </p>
          </div>
          <div className="text-lg">{theme.icon}</div>
        </div>
      </div>
      
      {/* Индикатор выбора */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="absolute top-2 left-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
          >
            <Check className="w-3 h-3 text-white" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function ThemeSystem({
  currentTheme,
  settings,
  onThemeChange,
  onSettingsChange,
  className
}: ThemeSystemProps) {
  const { locale } = useLocale();
  const [showSettings, setShowSettings] = useState(false);

  // Применение темы к документу
  const applyThemeToDocument = useCallback((theme: MushafTheme) => {
    const root = document.documentElement;
    
    // Устанавливаем CSS переменные
    root.style.setProperty('--mushaf-bg', theme.colors.background);
    root.style.setProperty('--mushaf-page-bg', theme.colors.pageBackground);
    root.style.setProperty('--mushaf-text', theme.colors.text);
    root.style.setProperty('--mushaf-accent', theme.colors.accent);
    root.style.setProperty('--mushaf-border', theme.colors.border);
    root.style.setProperty('--mushaf-shadow', theme.colors.pageShadow);
    root.style.setProperty('--mushaf-page-gradient', theme.effects.pageGradient || theme.colors.pageBackground);
    root.style.setProperty('--mushaf-page-radius', theme.effects.pageRadius);
    root.style.setProperty('--mushaf-shadow-blur', theme.effects.shadowBlur);
    root.style.setProperty('--mushaf-perspective', theme.effects.perspective);
  }, []);

  // Обработка смены темы
  const handleThemeSelect = useCallback((theme: MushafTheme) => {
    applyThemeToDocument(theme);
    onThemeChange(theme);
  }, [onThemeChange, applyThemeToDocument]);

  // Применяем текущую тему при загрузке
  React.useEffect(() => {
    applyThemeToDocument(currentTheme);
  }, [currentTheme, applyThemeToDocument]);

  const containerClasses = cn(
    "space-y-6",
    className
  );

  return (
    <div className={containerClasses}>
      {/* Заголовок секции */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Palette className="w-6 h-6 text-purple-600" />
          <div>
            <h3 className="text-lg font-bold text-gray-800">
              {locale === 'en' ? 'Visual Themes' : 'المظاهر البصرية'}
            </h3>
            <p className="text-sm text-gray-600">
              {locale === 'en' 
                ? 'Choose your reading experience' 
                : 'اختر تجربة القراءة المفضلة لك'}
            </p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSettings(!showSettings)}
          className="text-gray-600 hover:text-gray-800"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>

      {/* Сетка тем */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {DEFAULT_THEMES.map(theme => (
          <ThemePreview
            key={theme.id}
            theme={theme}
            isSelected={currentTheme.id === theme.id}
            onSelect={() => handleThemeSelect(theme)}
          />
        ))}
      </div>

      {/* Расширенные настройки */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="bg-gray-50 rounded-2xl p-6 space-y-6 border border-gray-200"
          >
            <h4 className="text-md font-semibold text-gray-800 flex items-center gap-2">
              <Sliders className="w-4 h-4" />
              {locale === 'en' ? 'Advanced Settings' : 'الإعدادات المتقدمة'}
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Режим просмотра по умолчанию */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {locale === 'en' ? 'Default View Mode' : 'وضع العرض الافتراضي'}
                </label>
                <Select 
                  value={settings.viewMode} 
                  onValueChange={(value: 'single' | 'spread') => 
                    onSettingsChange({ viewMode: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">
                      {locale === 'en' ? 'Single Page' : 'صفحة واحدة'}
                    </SelectItem>
                    <SelectItem value="spread">
                      {locale === 'en' ? 'Two Pages' : 'صفحتان'}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Скорость анимации */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {locale === 'en' ? 'Animation Speed' : 'سرعة الحركة'}
                </label>
                <Select 
                  value={settings.animationSpeed} 
                  onValueChange={(value: 'fast' | 'normal' | 'slow') => 
                    onSettingsChange({ animationSpeed: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fast">
                      {locale === 'en' ? 'Fast' : 'سريع'}
                    </SelectItem>
                    <SelectItem value="normal">
                      {locale === 'en' ? 'Normal' : 'عادي'}
                    </SelectItem>
                    <SelectItem value="slow">
                      {locale === 'en' ? 'Slow' : 'بطيء'}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Количество предзагружаемых страниц */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {locale === 'en' ? 'Preload Pages' : 'تحميل الصفحات مسبقاً'}
                </label>
                <Select 
                  value={settings.preloadPages.toString()} 
                  onValueChange={(value) => 
                    onSettingsChange({ preloadPages: parseInt(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Чувствительность касаний */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {locale === 'en' ? 'Touch Sensitivity' : 'حساسية اللمس'}
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={settings.touchSensitivity}
                    onChange={(e) => 
                      onSettingsChange({ touchSensitivity: parseFloat(e.target.value) })
                    }
                    className="flex-1"
                  />
                  <span className="text-sm font-mono w-8">
                    {settings.touchSensitivity.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Переключатели */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Автоматический зум */}
              <label className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="text-blue-600">
                    📱
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">
                      {locale === 'en' ? 'Auto Zoom' : 'التكبير التلقائي'}
                    </div>
                    <div className="text-xs text-gray-600">
                      {locale === 'en' ? 'Fit pages to screen' : 'ملائمة الصفحات للشاشة'}
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoZoom}
                  onChange={(e) => onSettingsChange({ autoZoom: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
              </label>

              {/* Показывать номера страниц */}
              <label className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="text-purple-600">
                    🔢
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">
                      {locale === 'en' ? 'Page Numbers' : 'أرقام الصفحات'}
                    </div>
                    <div className="text-xs text-gray-600">
                      {locale === 'en' ? 'Show page indicators' : 'إظهار مؤشرات الصفحات'}
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.showPageNumbers}
                  onChange={(e) => onSettingsChange({ showPageNumbers: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
              </label>

              {/* Показывать прогресс */}
              <label className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="text-green-600">
                    📊
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">
                      {locale === 'en' ? 'Progress Bar' : 'شريط التقدم'}
                    </div>
                    <div className="text-xs text-gray-600">
                      {locale === 'en' ? 'Show reading progress' : 'إظهار تقدم القراءة'}
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.showProgress}
                  onChange={(e) => onSettingsChange({ showProgress: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
              </label>

              {/* Звуковые эффекты */}
              <label className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="text-yellow-600">
                    {settings.enableSounds ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">
                      {locale === 'en' ? 'Sound Effects' : 'المؤثرات الصوتية'}
                    </div>
                    <div className="text-xs text-gray-600">
                      {locale === 'en' ? 'Page turn sounds' : 'أصوات تقليب الصفحات'}
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.enableSounds}
                  onChange={(e) => onSettingsChange({ enableSounds: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}