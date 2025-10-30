"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Book, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import QuranPage from './QuranPage';
import { 
  ViewMode, 
  ZoomState, 
  NavigationState,
  MUSHAF_CONFIG 
} from '@/lib/mushafTypes';

interface PageSpreadProps {
  navigationState: NavigationState;
  viewMode: ViewMode;
  zoomState: ZoomState;
  onNavigationChange: (navigation: Partial<NavigationState>) => void;
  onZoomChange: (zoomState: Partial<ZoomState>) => void;
  onViewModeChange: (viewMode: Partial<ViewMode>) => void;
  pageSize?: 'minimal' | 'small' | 'medium' | 'large' | 'maximum';
  className?: string;
}

export default function PageSpread({
  navigationState,
  viewMode,
  zoomState,
  onNavigationChange,
  onZoomChange,
  onViewModeChange,
  pageSize = 'medium',
  className
}: PageSpreadProps) {
  const [spreadPages, setSpreadPages] = useState<[number, number] | [number]>([1]);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Вычисляем страницы для текущего разворота
  useEffect(() => {
    if (viewMode.type === 'single') {
      setSpreadPages([navigationState.currentPage]);
    } else {
      // Для двухстраничного режима
      const currentPage = navigationState.currentPage;
      
      if (currentPage === 1) {
        // Первая страница всегда одна
        setSpreadPages([1]);
      } else if (currentPage % 2 === 0) {
        // Четная страница - левая сторона разворота
        setSpreadPages([currentPage, currentPage + 1]);
      } else {
        // Нечетная страница - начинаем с предыдущей четной
        setSpreadPages([currentPage - 1, currentPage]);
      }
    }
  }, [navigationState.currentPage, viewMode.type]);

  // Навигация к предыдущей странице/развороту
  const goToPrevious = useCallback(() => {
    if (navigationState.currentPage <= 1) return;
    
    setIsTransitioning(true);
    
    let newPage;
    if (viewMode.type === 'single') {
      newPage = navigationState.currentPage - 1;
    } else {
      // В режиме разворота перескакиваем на 2 страницы назад
      newPage = Math.max(1, navigationState.currentPage - 2);
    }
    
    const newHistory = [...navigationState.history, navigationState.currentPage];
    
    onNavigationChange({
      currentPage: newPage,
      history: newHistory.slice(-10), // Ограничиваем историю
      canGoBack: newPage > 1,
      canGoForward: newPage < navigationState.totalPages
    });

    setTimeout(() => setIsTransitioning(false), MUSHAF_CONFIG.ANIMATION_DURATION.PAGE_TURN);
  }, [navigationState, viewMode.type, onNavigationChange]);

  // Навигация к следующей странице/развороту
  const goToNext = useCallback(() => {
    if (navigationState.currentPage >= navigationState.totalPages) return;
    
    setIsTransitioning(true);
    
    let newPage;
    if (viewMode.type === 'single') {
      newPage = navigationState.currentPage + 1;
    } else {
      // В режиме разворота перескакиваем на 2 страницы вперед
      newPage = Math.min(navigationState.totalPages, navigationState.currentPage + 2);
    }
    
    const newHistory = [...navigationState.history, navigationState.currentPage];
    
    onNavigationChange({
      currentPage: newPage,
      history: newHistory.slice(-10),
      canGoBack: newPage > 1,
      canGoForward: newPage < navigationState.totalPages
    });

    setTimeout(() => setIsTransitioning(false), MUSHAF_CONFIG.ANIMATION_DURATION.PAGE_TURN);
  }, [navigationState, viewMode.type, onNavigationChange]);

  // Переключение режима просмотра
  const toggleViewMode = useCallback(() => {
    const newType = viewMode.type === 'single' ? 'spread' : 'single';
    onViewModeChange({ type: newType });
  }, [viewMode.type, onViewModeChange]);

  // Обработчик клика по странице
  const handlePageClick = useCallback((pageNumber: number) => {
    if (pageNumber !== navigationState.currentPage) {
      onNavigationChange({ currentPage: pageNumber });
    }
  }, [navigationState.currentPage, onNavigationChange]);

  // Обработчик двойного клика по странице
  const handlePageDoubleClick = useCallback((pageNumber: number) => {
    // Переключаем режим просмотра при двойном клике
    toggleViewMode();
  }, [toggleViewMode]);

  const containerClasses = cn(
    "relative w-full h-full flex items-center justify-center",
    "bg-gradient-to-br from-amber-50 via-orange-50 to-red-50",
    "overflow-hidden",
    className
  );

  const bookClasses = cn(
    "relative flex items-center gap-2 max-w-full max-h-full",
    "transition-all duration-500 ease-in-out",
    {
      "perspective-1000": viewMode.type === 'spread',
      "scale-95": isTransitioning
    }
  );

  return (
    <div className={containerClasses}>
      {/* Фоновые эффекты */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />
      
      {/* Основной контейнер книги */}
      <motion.div
        className={bookClasses}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Навигационная кнопка - назад */}
        <motion.div
          className="hidden md:flex"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant="ghost"
            size="lg"
            onClick={goToPrevious}
            disabled={!navigationState.canGoBack || isTransitioning}
            className="h-16 w-16 rounded-full bg-white/80 shadow-lg hover:bg-white/90 disabled:opacity-50"
          >
            <ChevronLeft className="w-8 h-8" />
          </Button>
        </motion.div>

        {/* Контейнер страниц */}
        <div className="relative flex items-center">
          <AnimatePresence mode="wait">
            {viewMode.type === 'single' ? (
              // Режим одной страницы
              <motion.div
                key={`single-${spreadPages[0]}`}
                initial={{ opacity: 0, rotateY: 90 }}
                animate={{ opacity: 1, rotateY: 0 }}
                exit={{ opacity: 0, rotateY: -90 }}
                transition={{ 
                  duration: MUSHAF_CONFIG.ANIMATION_DURATION.PAGE_TURN / 1000,
                  ease: "easeInOut"
                }}
                className="w-[400px] h-[600px] md:w-[500px] md:h-[700px] lg:w-[600px] lg:h-[800px]"
              >
                <QuranPage
                  pageNumber={spreadPages[0]}
                  side="single"
                  isActive={true}
                  zoomState={zoomState}
                  onZoomChange={onZoomChange}
                  onClick={() => handlePageClick(spreadPages[0])}
                  onDoubleClick={() => handlePageDoubleClick(spreadPages[0])}
                  priority={true}
                />
              </motion.div>
            ) : (
              // Режим разворота
              <motion.div
                key={`spread-${spreadPages.join('-')}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ 
                  duration: MUSHAF_CONFIG.ANIMATION_DURATION.PAGE_TURN / 1000,
                  ease: "easeOut"
                }}
                className="flex gap-1 md:gap-2"
                style={{
                  perspective: '1500px',
                  transformStyle: 'preserve-3d'
                }}
              >
                {/* Левая страница */}
                {spreadPages.length === 2 && (
                  <div className="w-[280px] h-[400px] md:w-[350px] md:h-[500px] lg:w-[420px] lg:h-[600px]">
                    <QuranPage
                      pageNumber={spreadPages[0]}
                      side="left"
                      isActive={spreadPages[0] === navigationState.currentPage}
                      zoomState={zoomState}
                      onZoomChange={onZoomChange}
                      onClick={() => handlePageClick(spreadPages[0])}
                      onDoubleClick={() => handlePageDoubleClick(spreadPages[0])}
                      priority={true}
                    />
                  </div>
                )}

                {/* Переплет (визуальный эффект) */}
                {spreadPages.length === 2 && (
                  <div className="w-1 bg-gradient-to-b from-amber-700 to-amber-900 shadow-inner relative">
                    <div className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-amber-800/50 to-transparent" />
                  </div>
                )}

                {/* Правая страница */}
                <div className="w-[280px] h-[400px] md:w-[350px] md:h-[500px] lg:w-[420px] lg:h-[600px]">
                  <QuranPage
                    pageNumber={spreadPages.length === 2 ? spreadPages[1] : spreadPages[0]}
                    side={spreadPages.length === 2 ? "right" : "single"}
                    isActive={
                      spreadPages.length === 2 
                        ? spreadPages[1] === navigationState.currentPage
                        : true
                    }
                    zoomState={zoomState}
                    onZoomChange={onZoomChange}
                    onClick={() => handlePageClick(
                      spreadPages.length === 2 ? spreadPages[1] : spreadPages[0]
                    )}
                    onDoubleClick={() => handlePageDoubleClick(
                      spreadPages.length === 2 ? spreadPages[1] : spreadPages[0]
                    )}
                    priority={true}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Навигационная кнопка - вперед */}
        <motion.div
          className="hidden md:flex"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant="ghost"
            size="lg"
            onClick={goToNext}
            disabled={!navigationState.canGoForward || isTransitioning}
            className="h-16 w-16 rounded-full bg-white/80 shadow-lg hover:bg-white/90 disabled:opacity-50"
          >
            <ChevronRight className="w-8 h-8" />
          </Button>
        </motion.div>
      </motion.div>



      {/* Индикатор зума */}
      {zoomState.level > 1 && (
        <div className="absolute top-4 right-4">
          <div className="bg-blue-500/90 text-white px-3 py-1 rounded-full text-sm font-bold">
            {Math.round(zoomState.level * 100)}%
          </div>
        </div>
      )}

      {/* Эффект перелистывания страниц */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-200 to-transparent pointer-events-none"
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}