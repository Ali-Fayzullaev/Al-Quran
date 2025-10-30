"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, Maximize2, Minimize2, RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import PageSpread from "./PageSpread";
import PremiumNavigation from "./PremiumNavigation";

import {
  ViewMode,
  ZoomState,
  NavigationState,
  MushafTheme,
  MushafSettings,
  ReadingProgress,
  Achievement,
  DEFAULT_ACHIEVEMENTS,
  MUSHAF_CONFIG,
} from "@/lib/mushafTypes";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from 'next-themes';
import { useQuranStore } from '@/lib/store';
import { useColorTheme } from '@/lib/useColorTheme';

interface QuranBookProps {
  initialPage?: number;
  className?: string;
}

// Хук для управления состоянием Мусхафа
function useMushafState(initialPage: number = 1) {
  const [navigationState, setNavigationState] = useState<NavigationState>({
    currentPage: initialPage,
    totalPages: MUSHAF_CONFIG.TOTAL_PAGES,
    currentSpreadPages: [initialPage],
    history: [],
    canGoBack: initialPage > 1,
    canGoForward: initialPage < MUSHAF_CONFIG.TOTAL_PAGES,
  });

  const [viewMode, setViewMode] = useState<ViewMode>({
    type: "spread",
    zoom: 1,
    position: { x: 0, y: 0 },
  });

  const [zoomState, setZoomState] = useState<ZoomState>({
    level: MUSHAF_CONFIG.DEFAULT_ZOOM,
    minZoom: MUSHAF_CONFIG.MIN_ZOOM,
    maxZoom: MUSHAF_CONFIG.MAX_ZOOM,
    zoomLevels: [...MUSHAF_CONFIG.ZOOM_LEVELS],
    position: { x: 0, y: 0 },
    isZooming: false,
  });

  const [currentTheme, setCurrentTheme] = useState<MushafTheme>({
    id: "light",
    name: "Светлая",
    nameArabic: "فاتح",
    icon: "☀️",
    colors: {
      background: "#ffffff",
      pageBackground: "#fefefe",
      pageShadow: "#e2e8f0",
      text: "#1a202c",
      accent: "#3182ce",
      border: "#e2e8f0",
    },
    effects: {
      pageRadius: "8px",
      shadowBlur: "20px",
      perspective: "1200px",
    },
  });

  const [settings, setSettings] = useState<MushafSettings>({
    viewMode: "spread",
    theme: "light",
    autoZoom: false,
    preloadPages: 2,
    animationSpeed: "normal",
    touchSensitivity: 1,
    showPageNumbers: true,
    showProgress: true,
    enableSounds: false,
    keyboardShortcuts: [],
  });

  const [bookmarks, setBookmarks] = useState<number[]>([]);

  const [readingProgress, setReadingProgress] = useState<ReadingProgress>({
    currentPage: initialPage,
    totalPages: MUSHAF_CONFIG.TOTAL_PAGES,
    percentage: (initialPage / MUSHAF_CONFIG.TOTAL_PAGES) * 100,
    lastReadTime: new Date(),
    readingDuration: 0,
    pagesRead: [initialPage],
    bookmarks: [],
    achievements: DEFAULT_ACHIEVEMENTS,
  });

  const [achievements, setAchievements] =
    useState<Achievement[]>(DEFAULT_ACHIEVEMENTS);

  return {
    navigationState,
    setNavigationState,
    viewMode,
    setViewMode,
    zoomState,
    setZoomState,
    currentTheme,
    setCurrentTheme,
    settings,
    setSettings,
    bookmarks,
    setBookmarks,
    readingProgress,
    setReadingProgress,
    achievements,
    setAchievements,
  };
}

export default function QuranBook({
  initialPage = 1,
  className,
}: QuranBookProps) {
  const { locale, t } = useLocale();
  const { theme } = useTheme();
  const { siteColorTheme } = useQuranStore();
  const { applyCurrentColors } = useColorTheme();
  
  // Отладка тем
  console.log('QuranBook render:', { theme, siteColorTheme });
  
  // Принудительное применение темной темы в самом начале
  useEffect(() => {
    console.log('QuranBook mounted with theme:', theme);
    if (typeof window !== 'undefined') {
      document.body.setAttribute('data-mushaf-theme', theme || 'light');
    }
  }, [theme]);

  // Состояние для мобильной ориентации
  const [isMobile, setIsMobile] = useState(false);
  const [isPortrait, setIsPortrait] = useState(true);
  const [showRotationMessage, setShowRotationMessage] = useState(false);
  const {
    navigationState,
    setNavigationState,
    viewMode,
    setViewMode,
    zoomState,
    setZoomState,
    currentTheme,
    setCurrentTheme,
    settings,
    setSettings,
    bookmarks,
    setBookmarks,
    readingProgress,
    setReadingProgress,
    achievements,
    setAchievements,
  } = useMushafState(initialPage);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isImmersiveMode, setIsImmersiveMode] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const readingStartTime = useRef<number>(Date.now());

  // Обработчики навигации
  const handleNavigationChange = useCallback(
    (changes: Partial<NavigationState>) => {
      setNavigationState((prev) => {
        const newState = { ...prev, ...changes };

        // Обновляем прогресс чтения
        if (changes.currentPage) {
          setReadingProgress((prevProgress) => ({
            ...prevProgress,
            currentPage: changes.currentPage!,
            percentage:
              (changes.currentPage! / MUSHAF_CONFIG.TOTAL_PAGES) * 100,
            lastReadTime: new Date(),
            pagesRead: Array.from(
              new Set([...prevProgress.pagesRead, changes.currentPage!])
            ),
          }));
        }

        return newState;
      });
    },
    []
  );

  // Обработчики зума
  const handleZoomChange = useCallback((changes: Partial<ZoomState>) => {
    setZoomState((prev) => ({ ...prev, ...changes }));
  }, []);

  // Обработчики режима просмотра
  const handleViewModeChange = useCallback((changes: Partial<ViewMode>) => {
    setViewMode((prev) => ({ ...prev, ...changes }));
  }, []);

  // Обработчики закладок
  const handleBookmarkToggle = useCallback((page: number) => {
    setBookmarks((prev) => {
      const newBookmarks = prev.includes(page)
        ? prev.filter((p) => p !== page)
        : [...prev, page].sort((a, b) => a - b);

      setReadingProgress((prevProgress) => ({
        ...prevProgress,
        bookmarks: newBookmarks,
      }));

      return newBookmarks;
    });
  }, []);

  // Навигация по страницам
  const goToPreviousPage = useCallback(() => {
    const newPage = Math.max(
      1,
      navigationState.currentPage - (viewMode.type === "spread" ? 2 : 1)
    );
    handleNavigationChange({ currentPage: newPage });
  }, [navigationState.currentPage, viewMode.type, handleNavigationChange]);

  const goToNextPage = useCallback(() => {
    const newPage = Math.min(
      MUSHAF_CONFIG.TOTAL_PAGES,
      navigationState.currentPage + (viewMode.type === "spread" ? 2 : 1)
    );
    handleNavigationChange({ currentPage: newPage });
  }, [navigationState.currentPage, viewMode.type, handleNavigationChange]);

  // Управление зумом
  const zoomIn = useCallback(() => {
    const currentIndex = zoomState.zoomLevels.findIndex(
      (level) => level === zoomState.level
    );
    const nextIndex = Math.min(
      currentIndex + 1,
      zoomState.zoomLevels.length - 1
    );
    const newZoom = zoomState.zoomLevels[nextIndex];
    handleZoomChange({ level: newZoom });
  }, [zoomState, handleZoomChange]);

  const zoomOut = useCallback(() => {
    const currentIndex = zoomState.zoomLevels.findIndex(
      (level) => level === zoomState.level
    );
    const prevIndex = Math.max(currentIndex - 1, 0);
    const newZoom = zoomState.zoomLevels[prevIndex];
    handleZoomChange({ level: newZoom });
  }, [zoomState, handleZoomChange]);

  const resetZoom = useCallback(() => {
    handleZoomChange({
      level: MUSHAF_CONFIG.DEFAULT_ZOOM,
      position: { x: 0, y: 0 },
    });
  }, [handleZoomChange]);

  // Переключение полноэкранного режима
  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      await containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Обработчики жестов
  const handleSwipeLeft = useCallback(() => {
    if (!isImmersiveMode) goToNextPage();
  }, [goToNextPage, isImmersiveMode]);

  const handleSwipeRight = useCallback(() => {
    if (!isImmersiveMode) goToPreviousPage();
  }, [goToPreviousPage, isImmersiveMode]);

  const handlePinchIn = useCallback(() => {
    zoomOut();
  }, [zoomOut]);

  const handlePinchOut = useCallback(() => {
    zoomIn();
  }, [zoomIn]);

  const handleDoubleTap = useCallback(() => {
    setViewMode((prev) => ({
      ...prev,
      type: prev.type === "single" ? "spread" : "single",
    }));
  }, []);

  const handleKeyboardShortcut = useCallback(
    (action: string) => {
      switch (action) {
        case "firstPage":
          handleNavigationChange({ currentPage: 1 });
          break;
        case "lastPage":
          handleNavigationChange({ currentPage: MUSHAF_CONFIG.TOTAL_PAGES });
          break;
        case "resetZoom":
          resetZoom();
          break;
        case "toggleView":
          handleDoubleTap();
          break;
        case "toggleFullscreen":
          toggleFullscreen();
          break;
        case "bookmark":
          handleBookmarkToggle(navigationState.currentPage);
          break;
        case "exitMode":
          setIsImmersiveMode(false);
          setShowSettings(false);
          break;
      }
    },
    [
      handleNavigationChange,
      resetZoom,
      handleDoubleTap,
      toggleFullscreen,
      handleBookmarkToggle,
      navigationState.currentPage,
    ]
  );

  // Подключаем систему жестов (упрощенная версия)
  const gestureHandlers = {
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    onPinchIn: handlePinchIn,
    onPinchOut: handlePinchOut,
    onDoubleTap: handleDoubleTap,
  };

  // Обновление времени чтения
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const duration = Math.floor((now - readingStartTime.current) / 1000 / 60); // в минутах

      setReadingProgress((prev) => ({
        ...prev,
        readingDuration: duration,
      }));
    }, 60000); // каждую минуту

    return () => clearInterval(interval);
  }, []);

  // Отслеживание ориентации экрана для мобильных устройств
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth <= MUSHAF_CONFIG.BREAKPOINTS.MOBILE;
      const portrait = window.innerHeight > window.innerWidth;

      setIsMobile(mobile);
      setIsPortrait(portrait);

      // Показать сообщение о повороте если:
      // 1. Это мобильное устройство
      // 2. Портретная ориентация
      // 3. Режим двух страниц
      const shouldShowRotation =
        mobile && portrait && viewMode.type === "spread";
      setShowRotationMessage(shouldShowRotation);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    window.addEventListener("orientationchange", checkScreenSize);

    return () => {
      window.removeEventListener("resize", checkScreenSize);
      window.removeEventListener("orientationchange", checkScreenSize);
    };
  }, [viewMode.type]);

  // Применение тем при их изменении
  useEffect(() => {
    const applyDarkThemeAggressively = () => {
      const currentTheme = getCurrentTheme();
      console.log('Applying theme aggressively:', currentTheme);
      
      if (currentTheme === 'dark') {
        const container = containerRef.current;
        if (container) {
          // Определяем цвета на основе темы
          let darkColors;
          switch (siteColorTheme) {
            case 'blue':
              darkColors = { bg: '#0f1629', text: '#e2e8f0', accent: '#60a5fa' };
              break;
            case 'green':
              darkColors = { bg: '#0a1f14', text: '#e2f5e2', accent: '#34d399' };
              break;
            case 'purple':
              darkColors = { bg: '#1a0d2e', text: '#f0e6ff', accent: '#a78bfa' };
              break;
            case 'amber':
              darkColors = { bg: '#1f1611', text: '#fef3c7', accent: '#fbbf24' };
              break;
            case 'pink':
              darkColors = { bg: '#1f0b19', text: '#fce7f3', accent: '#f472b6' };
              break;
            case 'sepia':
              darkColors = { bg: '#1c140a', text: '#f5e6d3', accent: '#d2b48c' };
              break;
            case 'orange':
              darkColors = { bg: '#1c0f06', text: '#fed7aa', accent: '#fb923c' };
              break;
            case 'teal':
              darkColors = { bg: '#042f2e', text: '#a7f3d0', accent: '#2dd4bf' };
              break;
            case 'indigo':
              darkColors = { bg: '#1e1b4b', text: '#e0e7ff', accent: '#818cf8' };
              break;
            case 'red':
              darkColors = { bg: '#450a0a', text: '#fecaca', accent: '#ef4444' };
              break;
            case 'yellow':
              darkColors = { bg: '#1f1611', text: '#fef3c7', accent: '#facc15' };
              break;
            case 'gray':
              darkColors = { bg: '#111827', text: '#f9fafb', accent: '#9ca3af' };
              break;
            default:
              darkColors = { bg: '#064e3b', text: '#d1fae5', accent: '#34d399' };
          }
          
          // Применяем стили к контейнеру
          container.style.setProperty('background-color', darkColors.bg, 'important');
          container.style.setProperty('color', darkColors.text, 'important');
          
          // Принудительно применяем к ВСЕМ элементам
          const allElements = container.querySelectorAll('*:not(button):not(svg):not(path)');
          allElements.forEach(element => {
            const htmlElement = element as HTMLElement;
            htmlElement.style.setProperty('color', darkColors.text, 'important');
            htmlElement.style.setProperty('background-color', 'transparent', 'important');
          });
          
          // Специально для кнопок - делаем их цветными
          const buttons = container.querySelectorAll('button');
          buttons.forEach(button => {
            button.style.setProperty('color', darkColors.text, 'important');
            button.style.setProperty('background', `${darkColors.accent}20`, 'important');
            button.style.setProperty('border', `1px solid ${darkColors.accent}40`, 'important');
          });
        }
      }
    };

    const timeout = setTimeout(() => {
      applyCurrentColors();
      applyDarkThemeAggressively();
    }, 100);
    
    // Повторяем каждые 500ms для гарантии
    const interval = setInterval(applyDarkThemeAggressively, 500);
    
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [theme, siteColorTheme, applyCurrentColors]);

  // Проверка достижений
  useEffect(() => {
    const checkAchievements = () => {
      setAchievements((prev) =>
        prev.map((achievement) => {
          if (achievement.unlocked) return achievement;

          let shouldUnlock = false;
          const now = new Date();

          switch (achievement.id) {
            case "first-page":
              shouldUnlock = readingProgress.pagesRead.length > 0;
              break;
            case "page-10":
              shouldUnlock = readingProgress.pagesRead.length >= 10;
              break;
            case "page-50":
              shouldUnlock = readingProgress.pagesRead.length >= 50;
              break;
            case "fast-reader":
              shouldUnlock =
                readingProgress.pagesRead.length >= 30 &&
                readingProgress.readingDuration <= 60;
              break;
            case "bookmark-master":
              shouldUnlock = bookmarks.length >= 10;
              break;
          }

          if (shouldUnlock) {
            return {
              ...achievement,
              unlocked: true,
              unlockedAt: now,
            };
          }

          return achievement;
        })
      );
    };

    checkAchievements();
  }, [readingProgress, bookmarks]);

  // Определяем текущую тему
  const getCurrentTheme = () => {
    console.log('Current theme check:', { theme, siteColorTheme });
    if (theme === 'system') {
      const isDarkSystem = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
      console.log('System theme is dark:', isDarkSystem);
      return isDarkSystem ? 'dark' : 'light';
    }
    const finalTheme = theme || 'light';
    console.log('Final theme:', finalTheme);
    return finalTheme;
  };

  const getThemeClass = () => {
    const currentTheme = getCurrentTheme();
    if (currentTheme === 'dark') return 'theme-dark';
    if (siteColorTheme === 'sepia') return 'theme-sepia';
    return 'theme-light';
  };

  // Определяем inline стили для гарантированного применения цветов
  const getContainerStyles = () => {
    const currentTheme = getCurrentTheme();
    const isDark = currentTheme === 'dark';
    
    console.log('Getting container styles, isDark:', isDark);
    
    if (isDark) {
      // Определяем цвета для темной темы на основе выбранной схемы
      let darkColors;
      switch (siteColorTheme) {
        case 'blue':
          darkColors = {
            bg: '#0f1629',
            text: '#e2e8f0',
            accent: '#60a5fa',
          };
          break;
        case 'green':
          darkColors = {
            bg: '#0a1f14',
            text: '#e2f5e2',
            accent: '#34d399',
          };
          break;
        case 'purple':
          darkColors = {
            bg: '#1a0d2e',
            text: '#f0e6ff',
            accent: '#a78bfa',
          };
          break;
        case 'amber':
          darkColors = {
            bg: '#1f1611',
            text: '#fef3c7',
            accent: '#fbbf24',
          };
          break;
        case 'pink':
          darkColors = {
            bg: '#1f0b19',
            text: '#fce7f3',
            accent: '#f472b6',
          };
          break;
        case 'sepia':
          darkColors = {
            bg: '#1c140a',
            text: '#f5e6d3',
            accent: '#d2b48c',
          };
          break;
        case 'orange':
          darkColors = {
            bg: '#1c0f06',
            text: '#fed7aa',
            accent: '#fb923c',
          };
          break;
        case 'teal':
          darkColors = {
            bg: '#042f2e',
            text: '#a7f3d0',
            accent: '#2dd4bf',
          };
          break;
        case 'indigo':
          darkColors = {
            bg: '#1e1b4b',
            text: '#e0e7ff',
            accent: '#818cf8',
          };
          break;
        case 'red':
          darkColors = {
            bg: '#450a0a',
            text: '#fecaca',
            accent: '#ef4444',
          };
          break;
        case 'yellow':
          darkColors = {
            bg: '#1f1611',
            text: '#fef3c7',
            accent: '#facc15',
          };
          break;
        case 'gray':
          darkColors = {
            bg: '#111827',
            text: '#f9fafb',
            accent: '#9ca3af',
          };
          break;
        default:
          darkColors = {
            bg: '#064e3b',
            text: '#d1fae5',
            accent: '#34d399',
          };
      }
      
      return {
        backgroundColor: darkColors.bg,
        color: darkColors.text,
        '--mushaf-bg': darkColors.bg,
        '--mushaf-page-bg': darkColors.bg,
        '--mushaf-text': darkColors.text,
        '--mushaf-accent': darkColors.accent,
        '--mushaf-border': darkColors.accent,
        '--mushaf-shadow': `rgba(0, 0, 0, 0.4)`,
        minHeight: '100vh',
        width: '100%',
      } as React.CSSProperties;
    } else {
      // Определяем цвета для светлой темы на основе выбранной схемы
      let lightColors;
      switch (siteColorTheme) {
        case 'sepia':
          lightColors = {
            bg: '#f8f0e0',
            text: '#4a4a4a',
            accent: '#8b4513',
          };
          break;
        case 'blue':
          lightColors = {
            bg: '#f0f9ff',
            text: '#1e3a8a',
            accent: '#3b82f6',
          };
          break;
        case 'purple':
          lightColors = {
            bg: '#faf5ff',
            text: '#581c87',
            accent: '#8b5cf6',
          };
          break;
        case 'amber':
          lightColors = {
            bg: '#fffbeb',
            text: '#92400e',
            accent: '#f59e0b',
          };
          break;
        case 'orange':
          lightColors = {
            bg: '#fff7ed',
            text: '#9a3412',
            accent: '#ea580c',
          };
          break;
        case 'teal':
          lightColors = {
            bg: '#f0fdfa',
            text: '#134e4a',
            accent: '#14b8a6',
          };
          break;
        case 'indigo':
          lightColors = {
            bg: '#eef2ff',
            text: '#3730a3',
            accent: '#6366f1',
          };
          break;
        case 'red':
          lightColors = {
            bg: '#fef2f2',
            text: '#7f1d1d',
            accent: '#dc2626',
          };
          break;
        case 'yellow':
          lightColors = {
            bg: '#fefce8',
            text: '#713f12',
            accent: '#eab308',
          };
          break;
        case 'gray':
          lightColors = {
            bg: '#f9fafb',
            text: '#374151',
            accent: '#6b7280',
          };
          break;
        case 'pink':
          lightColors = {
            bg: '#fdf2f8',
            text: '#831843',
            accent: '#ec4899',
          };
          break;
        default: // green
          lightColors = {
            bg: '#f0fdf4',
            text: '#1a202c',
            accent: '#10b981',
          };
      }
      
      return {
        backgroundColor: lightColors.bg,
        color: lightColors.text,
        '--mushaf-bg': lightColors.bg,
        '--mushaf-page-bg': '#fefefe',
        '--mushaf-text': lightColors.text,
        '--mushaf-accent': lightColors.accent,
        '--mushaf-border': lightColors.accent,
        '--mushaf-shadow': 'rgba(0, 0, 0, 0.1)',
        minHeight: '100vh',
        width: '100%',
      } as React.CSSProperties;
    }
  };

  const containerClasses = cn(
    "mushaf-container relative w-full h-screen overflow-hidden",
    getThemeClass(),
    {
      "cursor-none": isImmersiveMode,
    },
    className
  );

  return (
    <div 
      ref={containerRef} 
      className={containerClasses} 
      style={getContainerStyles()}
      data-theme={getCurrentTheme()}
      data-color-theme={siteColorTheme}
    >
      {/* Система жестов - упрощенная версия */}
      <div className="absolute inset-0 pointer-events-none z-0" />

      {/* Главная область просмотра */}
      <div className="relative w-full h-full flex flex-col">
        {/* Верхняя панель управления */}
        <AnimatePresence>
          {!isImmersiveMode && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-0 left-0 right-0 z-20 p-4"
            >
              <div className="flex items-center justify-between">
                {/* Левая группа */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSettings(!showSettings)}
                    className="bg-white/80 hover:bg-white/90 shadow-md"
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleFullscreen}
                    className="bg-white/80 hover:bg-white/90 shadow-md"
                  >
                    {isFullscreen ? (
                      <Minimize2 className="w-4 h-4" />
                    ) : (
                      <Maximize2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                {/* Правая группа */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsImmersiveMode(!isImmersiveMode)}
                    className="bg-white/80 hover:bg-white/90 shadow-md"
                  >
                    <RotateCw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Основная область со страницами */}
        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <PageSpread
            navigationState={navigationState}
            viewMode={viewMode}
            zoomState={zoomState}
            onNavigationChange={handleNavigationChange}
            onZoomChange={handleZoomChange}
            onViewModeChange={handleViewModeChange}
          />
        </div>

        {/* Нижняя панель навигации */}
        <AnimatePresence>
          {!isImmersiveMode && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-0 left-0 right-0 z-20 p-4"
            >
              <PremiumNavigation
                navigationState={navigationState}
                onNavigationChange={handleNavigationChange}
                bookmarks={bookmarks}
                onBookmarkToggle={handleBookmarkToggle}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Боковые панели */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            className="absolute top-0 left-0 w-80 h-full bg-white shadow-2xl z-30 overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  {t("settings")}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(false)}
                >
                  ×
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Сообщение о повороте экрана для мобильных устройств */}
      <AnimatePresence>
        {showRotationMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-lg p-6 text-center max-w-sm"
            >
              <div className="text-4xl mb-4">📱➡️📱</div>
              <h3 className="text-lg font-bold mb-2">
                {t("mushaf.rotateDevice")}
              </h3>
              <p className="text-gray-600 mb-4">
                {t("mushaf.rotateDeviceMessage")}
              </p>
              <Button
                onClick={() => setShowRotationMessage(false)}
                className="w-full"
              >
                {t("mushaf.gotIt")}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
