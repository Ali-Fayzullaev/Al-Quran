"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, Book, BookOpen, Maximize2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import QuranPage from "./QuranPage";
import PageSizeControls from "./PageSizeControls";
import { MUSHAF_CONFIG } from "@/lib/mushafTypes";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "next-themes";
import { useQuranStore } from "@/lib/store";
import { useColorTheme } from "@/lib/useColorTheme";

interface QuranInfiniteScrollProps {
  initialPage?: number;
  className?: string;
}

// Page Skeleton Component
const PageSkeleton = ({ isSpread = false }: { isSpread?: boolean }) => (
  <div className={cn(
    "animate-pulse bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-lg shadow-lg",
    isSpread ? "w-[280px] h-[400px] md:w-[350px] md:h-[500px] lg:w-[420px] lg:h-[600px]" : 
    "w-[400px] h-[600px] md:w-[500px] md:h-[700px] lg:w-[600px] lg:h-[800px]"
  )}>
    <div className="p-8 space-y-4 h-full">
      {/* Header skeleton */}
      <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded-full w-3/4 mx-auto"></div>
      
      {/* Content lines skeleton */}
      {Array.from({ length: isSpread ? 12 : 20 }).map((_, i) => (
        <div key={i} className={cn(
          "h-4 bg-gray-300 dark:bg-gray-600 rounded-full",
          i % 3 === 0 ? "w-4/5" : i % 3 === 1 ? "w-full" : "w-3/4",
          "mx-auto"
        )}></div>
      ))}
      
      {/* Footer skeleton */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded-full w-1/4 mx-auto"></div>
      </div>
    </div>
  </div>
);

export default function QuranInfiniteScroll({
  initialPage = 1,
  className,
}: QuranInfiniteScrollProps) {
  const { locale, t } = useLocale();
  const { theme } = useTheme();
  const { siteColorTheme, mushafPageSize } = useQuranStore();
  const { applyCurrentColors } = useColorTheme();

  // State
  const [loadedPages, setLoadedPages] = useState<Set<number>>(new Set([initialPage]));
  const [loadingPages, setLoadingPages] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [viewMode, setViewMode] = useState<'single' | 'spread'>('single');
  const [isMobile, setIsMobile] = useState(false);
  const [isImmersiveMode, setIsImmersiveMode] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Определяем текущую тему
  const getCurrentTheme = () => {
    if (theme === "system") {
      return typeof window !== "undefined" && 
        window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return theme || "light";
  };

  // Стили контейнера
  const getContainerStyles = () => {
    const currentTheme = getCurrentTheme();
    const isDark = currentTheme === "dark";

    if (isDark) {
      let darkColors;
      switch (siteColorTheme) {
        case "blue": darkColors = { bg: "#0f1629", text: "#e2e8f0", accent: "#60a5fa" }; break;
        case "green": darkColors = { bg: "#0a1f14", text: "#e2f5e2", accent: "#34d399" }; break;
        case "purple": darkColors = { bg: "#1a0d2e", text: "#f0e6ff", accent: "#a78bfa" }; break;
        case "amber": darkColors = { bg: "#1f1611", text: "#fef3c7", accent: "#fbbf24" }; break;
        case "pink": darkColors = { bg: "#1f0b19", text: "#fce7f3", accent: "#f472b6" }; break;
        case "sepia": darkColors = { bg: "#1c140a", text: "#f5e6d3", accent: "#d2b48c" }; break;
        default: darkColors = { bg: "#064e3b", text: "#d1fae5", accent: "#34d399" };
      }
      return {
        backgroundColor: darkColors.bg,
        color: darkColors.text,
        "--mushaf-bg": darkColors.bg,
        "--mushaf-text": darkColors.text,
        "--mushaf-accent": darkColors.accent,
      } as React.CSSProperties;
    } else {
      let lightColors;
      switch (siteColorTheme) {
        case "sepia": lightColors = { bg: "#f8f0e0", text: "#4a4a4a", accent: "#8b4513" }; break;
        case "blue": lightColors = { bg: "#f0f9ff", text: "#1e3a8a", accent: "#3b82f6" }; break;
        case "purple": lightColors = { bg: "#faf5ff", text: "#581c87", accent: "#8b5cf6" }; break;
        default: lightColors = { bg: "#f0fdf4", text: "#1a202c", accent: "#10b981" };
      }
      return {
        backgroundColor: lightColors.bg,
        color: lightColors.text,
        "--mushaf-bg": lightColors.bg,
        "--mushaf-text": lightColors.text,
        "--mushaf-accent": lightColors.accent,
      } as React.CSSProperties;
    }
  };

  // Загрузка страниц
  const loadPage = useCallback((pageNumber: number) => {
    if (loadedPages.has(pageNumber) || loadingPages.has(pageNumber) || 
        pageNumber < 1 || pageNumber > MUSHAF_CONFIG.TOTAL_PAGES) {
      return;
    }

    setLoadingPages(prev => new Set([...prev, pageNumber]));

    // Симулируем загрузку страницы
    setTimeout(() => {
      setLoadedPages(prev => new Set([...prev, pageNumber]));
      setLoadingPages(prev => {
        const newSet = new Set(prev);
        newSet.delete(pageNumber);
        return newSet;
      });
    }, 1000 + Math.random() * 1000); // 1-2 секунды
  }, [loadedPages, loadingPages]);

  // Предзагрузка следующих страниц
  const preloadNextPages = useCallback((currentPageNum: number) => {
    const increment = viewMode === 'spread' ? 2 : 1;
    const pagesToLoad = [];
    
    // Загружаем следующие 3-5 страниц
    for (let i = 1; i <= 5; i++) {
      const nextPage = currentPageNum + (i * increment);
      if (nextPage <= MUSHAF_CONFIG.TOTAL_PAGES) {
        pagesToLoad.push(nextPage);
      }
    }
    
    pagesToLoad.forEach(pageNum => loadPage(pageNum));
  }, [viewMode, loadPage]);

  // Intersection Observer для отслеживания видимых страниц
  useEffect(() => {
    if (!containerRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        let visiblePage = currentPage;
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const pageNumber = parseInt(entry.target.getAttribute('data-page') || '1');
            visiblePage = pageNumber;
          }
        });
        
        if (visiblePage !== currentPage) {
          setCurrentPage(visiblePage);
          preloadNextPages(visiblePage);
        }
      },
      {
        threshold: 0.5,
        rootMargin: '100px 0px 500px 0px', // Загружаем заранее
      }
    );

    return () => {
      observerRef.current?.disconnect();
    };
  }, [currentPage, preloadNextPages]);

  // Обработка скролла
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setShowScrollToTop(scrollY > 1000);
      
      // Автоматическая загрузка при приближении к концу
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      if (scrollY + windowHeight > documentHeight - 2000) {
        const lastLoadedPage = Math.max(...Array.from(loadedPages));
        const increment = viewMode === 'spread' ? 2 : 1;
        for (let i = 1; i <= 3; i++) {
          loadPage(lastLoadedPage + (i * increment));
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadedPages, viewMode, loadPage]);

  // Определение мобильного устройства
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= MUSHAF_CONFIG.BREAKPOINTS.MOBILE;
      setIsMobile(mobile);
      
      // На мобильных устройствах принудительно одна страница
      if (mobile && viewMode === 'spread') {
        setViewMode('single');
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [viewMode]);

  // Инициальная загрузка
  useEffect(() => {
    preloadNextPages(initialPage);
  }, [initialPage, preloadNextPages]);

  // Применение тем
  useEffect(() => {
    applyCurrentColors();
  }, [theme, siteColorTheme, applyCurrentColors]);

  // Генерация страниц для отображения
  const generatePagesToShow = () => {
    const pages = Array.from(loadedPages).sort((a, b) => a - b);
    const pagesWithLoading = [...pages];
    
    // Добавляем loading placeholders
    loadingPages.forEach(pageNum => {
      if (!pagesWithLoading.includes(pageNum)) {
        pagesWithLoading.push(pageNum);
      }
    });
    
    return pagesWithLoading.sort((a, b) => a - b);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const pagesToShow = generatePagesToShow();

  return (
    <div
      ref={containerRef}
      className={cn("mushaf-container min-h-screen w-full", className)}
      style={getContainerStyles()}
      data-theme={getCurrentTheme()}
      data-color-theme={siteColorTheme}
    >
      {/* Верхняя панель управления */}
      <AnimatePresence>
        {!isImmersiveMode && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="sticky top-0 z-30 bg-black/10 backdrop-blur-md border-b border-white/10"
          >
            <div className={cn(
              "flex items-center p-4",
              isMobile ? "justify-center" : "justify-between"
            )}>
              {isMobile ? (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsImmersiveMode(true)}
                    className="bg-white/10 hover:bg-white/20 text-white"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </Button>
                  <PageSizeControls />
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewMode(prev => prev === 'single' ? 'spread' : 'single')}
                      className="bg-white/10 hover:bg-white/20 text-white"
                      title={viewMode === 'single' ? 'Две страницы' : 'Одна страница'}
                    >
                      {viewMode === 'single' ? <BookOpen className="w-4 h-4" /> : <Book className="w-4 h-4" />}
                    </Button>
                  </div>
                  
                  <PageSizeControls />
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsImmersiveMode(true)}
                      className="bg-white/10 hover:bg-white/20 text-white"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Скрытая кнопка выхода из иммерсивного режима */}
      <AnimatePresence>
        {isImmersiveMode && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsImmersiveMode(false)}
            className="fixed top-4 right-4 z-50 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full shadow-lg opacity-50 hover:opacity-100 transition-opacity"
          >
            <Minimize2 className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Основной контент - страницы */}
      <div className="py-8 space-y-8">
        {pagesToShow.map((pageNumber, index) => {
          const isLoading = loadingPages.has(pageNumber);
          const isLoaded = loadedPages.has(pageNumber);
          
          return (
            <motion.div
              key={pageNumber}
              data-page={pageNumber}
              ref={(el) => {
                if (el && observerRef.current) {
                  observerRef.current.observe(el);
                }
              }}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex justify-center px-4"
              style={{
                transform: `scale(${MUSHAF_CONFIG.PAGE_SIZES[mushafPageSize].scale})`,
                transformOrigin: "center center",
              }}
            >
              {viewMode === 'spread' && !isMobile && pageNumber < MUSHAF_CONFIG.TOTAL_PAGES ? (
                // Режим разворота (две страницы)
                <div className="flex gap-2">
                  {isLoading ? (
                    <>
                      <PageSkeleton isSpread />
                      <PageSkeleton isSpread />
                    </>
                  ) : isLoaded ? (
                    <>
                      <QuranPage
                        pageNumber={pageNumber}
                        side="left"
                        isActive={pageNumber === currentPage}
                        zoomState={{
                          level: 1,
                          minZoom: 1,
                          maxZoom: 3,
                          zoomLevels: [1, 1.5, 2, 3],
                          position: { x: 0, y: 0 },
                          isZooming: false
                        }}
                        onZoomChange={() => {}}
                        priority={pageNumber <= initialPage + 2}
                      />
                      {pageNumber + 1 <= MUSHAF_CONFIG.TOTAL_PAGES && (
                        <QuranPage
                          pageNumber={pageNumber + 1}
                          side="right"
                          isActive={pageNumber + 1 === currentPage}
                          zoomState={{
                            level: 1,
                            minZoom: 1,
                            maxZoom: 3,
                            zoomLevels: [1, 1.5, 2, 3],
                            position: { x: 0, y: 0 },
                            isZooming: false
                          }}
                          onZoomChange={() => {}}
                          priority={pageNumber <= initialPage + 2}
                        />
                      )}
                    </>
                  ) : null}
                </div>
              ) : (
                // Режим одной страницы
                <>
                  {isLoading ? (
                    <PageSkeleton />
                  ) : isLoaded ? (
                    <QuranPage
                      pageNumber={pageNumber}
                      side="single"
                      isActive={pageNumber === currentPage}
                      zoomState={{
                        level: 1,
                        minZoom: 1,
                        maxZoom: 3,
                        zoomLevels: [1, 1.5, 2, 3],
                        position: { x: 0, y: 0 },
                        isZooming: false
                      }}
                      onZoomChange={() => {}}
                      priority={pageNumber <= initialPage + 2}
                    />
                  ) : null}
                </>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Кнопка "Наверх" */}
      <AnimatePresence>
        {showScrollToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-40 p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-colors"
          >
            <ChevronUp className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Индикатор текущей страницы */}
      <div className="fixed bottom-4 left-4 z-40 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
        Страница {currentPage} / {MUSHAF_CONFIG.TOTAL_PAGES}
      </div>
    </div>
  );
}