"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { ZoomIn, ZoomOut, RotateCcw, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  PageInfo, 
  ZoomState, 
  GestureState, 
  TouchGesture,
  MUSHAF_CONFIG 
} from '@/lib/mushafTypes';

interface QuranPageProps {
  pageNumber: number;
  side?: 'left' | 'right' | 'single';
  isActive: boolean;
  zoomState: ZoomState;
  onZoomChange: (zoomState: Partial<ZoomState>) => void;
  onClick?: () => void;
  onDoubleClick?: () => void;
  onImageLoad?: () => void;
  onImageError?: () => void;
  className?: string;
  priority?: boolean;
}

interface PageImageState {
  isLoaded: boolean;
  isError: boolean;
  isLoading: boolean;
  src: string;
}

export default function QuranPage({
  pageNumber,
  side = 'single',
  isActive,
  zoomState,
  onZoomChange,
  onClick,
  onDoubleClick,
  onImageLoad,
  onImageError,
  className,
  priority = false
}: QuranPageProps) {
  const [imageState, setImageState] = useState<PageImageState>({
    isLoaded: false,
    isError: false,
    isLoading: true,
    src: ''
  });
  
  const [gestureState, setGestureState] = useState<GestureState>({
    isGestureActive: false,
    gestureType: null
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const touchStartRef = useRef<TouchGesture | null>(null);
  const lastTapRef = useRef<number>(0);
  const transformRef = useRef({
    x: zoomState.position.x,
    y: zoomState.position.y,
    scale: zoomState.level
  });

  // Генерируем путь к изображению
  const generateImagePath = useCallback((pageNum: number): string => {
    const paddedPageNum = pageNum.toString().padStart(MUSHAF_CONFIG.PAGE_NUMBER_PADDING, '0');
    return MUSHAF_CONFIG.IMAGE_PATH_TEMPLATE.replace('{pageNumber}', paddedPageNum);
  }, []);

  // Обновляем путь к изображению при изменении номера страницы
  useEffect(() => {
    const newSrc = generateImagePath(pageNumber);
    setImageState(prev => ({
      ...prev,
      src: newSrc,
      isLoading: true,
      isError: false,
      isLoaded: false
    }));
  }, [pageNumber, generateImagePath]);

  // Синхронизируем локальный transform с внешним zoomState
  useEffect(() => {
    transformRef.current = {
      x: zoomState.position.x,
      y: zoomState.position.y,
      scale: zoomState.level
    };
  }, [zoomState]);

  // Обработчики изображений
  const handleImageLoad = useCallback(() => {
    setImageState(prev => ({
      ...prev,
      isLoaded: true,
      isLoading: false,
      isError: false
    }));
    onImageLoad?.();
  }, [onImageLoad]);

  const handleImageError = useCallback(() => {
    setImageState(prev => ({
      ...prev,
      isError: true,
      isLoading: false,
      isLoaded: false
    }));
    onImageError?.();
  }, [onImageError]);

  // Управление зумом
  const handleZoomIn = useCallback(() => {
    const currentIndex = MUSHAF_CONFIG.ZOOM_LEVELS.findIndex(level => level === zoomState.level);
    const nextIndex = Math.min(currentIndex + 1, MUSHAF_CONFIG.ZOOM_LEVELS.length - 1);
    const newZoom = MUSHAF_CONFIG.ZOOM_LEVELS[nextIndex];
    
    onZoomChange({ level: newZoom });
  }, [zoomState.level, onZoomChange]);

  const handleZoomOut = useCallback(() => {
    const currentIndex = MUSHAF_CONFIG.ZOOM_LEVELS.findIndex(level => level === zoomState.level);
    const prevIndex = Math.max(currentIndex - 1, 0);
    const newZoom = MUSHAF_CONFIG.ZOOM_LEVELS[prevIndex];
    
    onZoomChange({ level: newZoom });
  }, [zoomState.level, onZoomChange]);

  const resetZoom = useCallback(() => {
    onZoomChange({ 
      level: MUSHAF_CONFIG.DEFAULT_ZOOM,
      position: { x: 0, y: 0 }
    });
  }, [onZoomChange]);

  // Обработка касаний
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    const now = Date.now();
    
    touchStartRef.current = {
      type: 'tap',
      position: { x: touch.clientX, y: touch.clientY },
      timestamp: now
    };

    if (e.touches.length === 2) {
      // Начало жеста пинча
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch.clientX - touch2.clientX,
        touch.clientY - touch2.clientY
      );
      
      setGestureState({
        isGestureActive: true,
        gestureType: 'pinch',
        initialDistance: distance,
        initialZoom: zoomState.level
      });
    }
  }, [zoomState.level]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current || !gestureState.isGestureActive) return;

    if (e.touches.length === 2 && gestureState.gestureType === 'pinch') {
      // Обработка пинча для зума
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const currentDistance = Math.hypot(
        touch1.clientX - touch2.clientX,
        touch1.clientY - touch2.clientY
      );

      if (gestureState.initialDistance && gestureState.initialZoom) {
        const scale = currentDistance / gestureState.initialDistance;
        const newZoom = Math.max(
          MUSHAF_CONFIG.MIN_ZOOM,
          Math.min(MUSHAF_CONFIG.MAX_ZOOM, gestureState.initialZoom * scale)
        );
        
        onZoomChange({ level: newZoom });
      }
    }
  }, [gestureState, onZoomChange]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;

    const now = Date.now();
    const duration = now - touchStartRef.current.timestamp;

    // Проверка на двойной тап
    if (duration < MUSHAF_CONFIG.TOUCH_THRESHOLDS.TAP_MAX_DURATION) {
      const timeSinceLastTap = now - lastTapRef.current;
      
      if (timeSinceLastTap < 300) {
        // Двойной тап - зум
        if (zoomState.level > MUSHAF_CONFIG.DEFAULT_ZOOM) {
          resetZoom();
        } else {
          handleZoomIn();
        }
        onDoubleClick?.();
      } else {
        // Одинарный тап
        onClick?.();
      }
      
      lastTapRef.current = now;
    }

    // Сброс состояния жестов
    setGestureState({
      isGestureActive: false,
      gestureType: null
    });
    touchStartRef.current = null;
  }, [zoomState.level, onClick, onDoubleClick, resetZoom, handleZoomIn]);

  // Обработка панорамирования (drag)
  const handlePan = useCallback((event: any, info: PanInfo) => {
    if (zoomState.level > 1) {
      const newX = transformRef.current.x + info.delta.x;
      const newY = transformRef.current.y + info.delta.y;
      
      transformRef.current.x = newX;
      transformRef.current.y = newY;
      
      onZoomChange({
        position: { x: newX, y: newY }
      });
    }
  }, [zoomState.level, onZoomChange]);

  // Определяем стиль страницы в зависимости от позиции
  const getPageTransform = useCallback(() => {
    let rotateY = 0;
    
    if (side === 'left') {
      rotateY = 2;
    } else if (side === 'right') {
      rotateY = -2;
    }
    
    return {
      transform: `perspective(1200px) rotateY(${rotateY}deg)`,
      transformOrigin: side === 'left' ? 'right center' : 'left center'
    };
  }, [side]);

  const pageClasses = cn(
    // Базовые стили для всех страниц
    "quran-page",
    "relative overflow-hidden rounded-lg shadow-xl transition-all duration-300",
    "hover:shadow-2xl hover:-translate-y-1",
    // Унифицированные CSS классы для всех страниц
    pageNumber % 2 === 0 ? "even-page" : "odd-page",
    {
      "cursor-zoom-in": zoomState.level === MUSHAF_CONFIG.DEFAULT_ZOOM,
      "cursor-zoom-out": zoomState.level > MUSHAF_CONFIG.DEFAULT_ZOOM,
      "opacity-90": !isActive,
      "ring-2 ring-blue-500 ring-offset-2": isActive && zoomState.level > 1,
      "zoomed": zoomState.level > 1
    },
    className
  );

  return (
    <motion.div
      ref={containerRef}
      className={pageClasses}
      style={getPageTransform()}
      data-page={pageNumber}
      data-side={side}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ 
        duration: MUSHAF_CONFIG.ANIMATION_DURATION.PAGE_TURN / 1000,
        ease: "easeOut"
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Контейнер изображения */}
      <motion.div
        className="quran-page-container relative w-full h-full bg-gradient-to-br from-amber-50 to-orange-100"
        drag={zoomState.level > 1}
        dragMomentum={false}
        onPan={handlePan}
        animate={{
          scale: zoomState.level,
          x: zoomState.position.x,
          y: zoomState.position.y
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
          duration: MUSHAF_CONFIG.ANIMATION_DURATION.ZOOM / 1000
        }}
      >
        {/* Изображение страницы с унифицированными стилями */}
        {imageState.src && (
          <div className="quran-page-content">
            <img
              ref={imageRef}
              src={imageState.src}
              alt={`Quran Page ${pageNumber}`}
              className="quran-page-image w-full h-auto object-contain select-none"
              draggable={false}
              loading={priority ? "eager" : "lazy"}
              onLoad={handleImageLoad}
              onError={handleImageError}
              data-page={pageNumber}
              style={{
                opacity: imageState.isLoaded ? 1 : 0,
                transition: 'opacity 0.3s ease-in-out',
                // Гарантируем единообразное отображение всех страниц
                width: '100%',
                height: 'auto',
                maxWidth: '100%',
                display: 'block',
                margin: '0 auto'
              }}
            />
          </div>
        )}
        
        {/* Состояние загрузки */}
        <AnimatePresence>
          {imageState.isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100"
            >
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-amber-600 mx-auto mb-4" />
                <p className="text-sm text-amber-700 font-medium">
                  صفحة {pageNumber} تحميل...
                </p>
                <div className="w-32 h-1 bg-amber-200 rounded-full overflow-hidden mt-2">
                  <motion.div
                    className="h-full bg-amber-600 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Состояние ошибки */}
        <AnimatePresence>
          {imageState.isError && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 flex items-center justify-center bg-red-50 border border-red-200"
            >
              <div className="text-center p-6">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-red-800 mb-2">
                  خطأ في تحميل الصفحة
                </h3>
                <p className="text-sm text-red-600 mb-4">
                  فشل تحميل الصفحة {pageNumber}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setImageState(prev => ({ ...prev, isLoading: true, isError: false }));
                  }}
                  className="border-red-300 text-red-700 hover:bg-red-100"
                >
                  إعادة المحاولة
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Overlay для контролов зума (показывается при зуме) */}
        <AnimatePresence>
          {isActive && zoomState.level > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2"
            >
              <Button
                variant="secondary"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoomState.level <= MUSHAF_CONFIG.MIN_ZOOM}
                className="bg-white/90 hover:bg-white shadow-lg"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              
              <div className="bg-white/90 px-3 py-2 rounded-lg shadow-lg text-xs font-medium">
                {Math.round(zoomState.level * 100)}%
              </div>
              
              <Button
                variant="secondary"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoomState.level >= MUSHAF_CONFIG.MAX_ZOOM}
                className="bg-white/90 hover:bg-white shadow-lg"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              
              <Button
                variant="secondary"
                size="sm"
                onClick={resetZoom}
                className="bg-white/90 hover:bg-white shadow-lg"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Номер страницы - перемещен вниз */}
        <div className=" bottom-2  flex justify-center text-white px-2 py-1 ">
          <span className='text-yellow-700 rounded text-xs font-bold'>{pageNumber}</span>
        </div>

        {/* Индикатор активности */}
        {isActive && (
          <div className="absolute top-2 left-2 w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
        )}
      </motion.div>

      {/* Эффекты и тени */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: side === 'left' 
            ? 'linear-gradient(to left, rgba(0,0,0,0.1) 0%, transparent 10%)'
            : side === 'right'
            ? 'linear-gradient(to right, rgba(0,0,0,0.1) 0%, transparent 10%)'
            : undefined,
          borderRadius: 'inherit'
        }}
      />
    </motion.div>
  );
}