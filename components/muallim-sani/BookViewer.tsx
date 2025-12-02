'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BookViewerProps {
  pages: string[];
  currentPage: number;
  onPageChange: (pageIndex: number) => void;
}

const BookViewer: React.FC<BookViewerProps> = ({ pages, currentPage, onPageChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Определяем мобильное устройство
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Обработка swipe жестов
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(0); // Сбрасываем конечную позицию
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && currentPage < pages.length - 1) {
      handlePageChange(currentPage + 1);
    }
    if (isRightSwipe && currentPage > 0) {
      handlePageChange(currentPage - 1);
    }
  };

  const handlePageChange = useCallback((newPage: number) => {
    if (isTransitioning || newPage === currentPage) return;
    
    setIsTransitioning(true);
    onPageChange(newPage);
    
    // Завершаем анимацию через 300мс
    setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
  }, [currentPage, onPageChange, isTransitioning]);

  // Обработка кликов по зонам экрана
  const handleClick = (e: React.MouseEvent) => {
    if (isMobile) return; // На мобильных используем только swipe
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clickX = e.clientX - rect.left;
    const clickZone = clickX / rect.width;

    // Левая треть экрана - предыдущая страница
    if (clickZone < 0.33 && currentPage > 0) {
      handlePageChange(currentPage - 1);
    }
    // Правая треть экрана - следующая страница  
    else if (clickZone > 0.66 && currentPage < pages.length - 1) {
      handlePageChange(currentPage + 1);
    }
  };

  // Обработка клавиш
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && currentPage > 0) {
        handlePageChange(currentPage - 1);
      } else if (e.key === 'ArrowRight' && currentPage < pages.length - 1) {
        handlePageChange(currentPage + 1);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentPage, pages.length, handlePageChange]);

  if (!pages.length) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-white/60 text-lg">Загрузка страниц...</div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center cursor-pointer select-none"
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Фоновое изображение с размытием для создания эффекта глубины */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-10 blur-sm scale-110"
        style={{
          backgroundImage: pages[currentPage] ? `url(${pages[currentPage]})` : undefined
        }}
      />

      {/* Основной контейнер книги */}
      <div className="relative z-10 w-full h-full max-w-4xl max-h-[90vh] flex items-center justify-center">
        
        {/* Книга с shadow эффектом */}
        <div className="relative book-container transform-gpu">
          
          {/* Тень книги */}
          <div className="absolute -bottom-8 left-4 right-4 h-8 bg-black/30 rounded-full blur-lg transform scale-95 z-0" />
          
          {/* Страница */}
          <div 
            className={`
              relative bg-white rounded-lg shadow-2xl overflow-hidden
              transition-all duration-300 ease-in-out transform-gpu
              ${isTransitioning ? 'scale-95 opacity-80' : 'scale-100 opacity-100'}
              ${isMobile ? 'w-[95vw] h-[70vh]' : 'w-[600px] h-[800px]'}
            `}
            style={{
              boxShadow: `
                0 25px 50px -12px rgba(0, 0, 0, 0.5),
                0 0 0 1px rgba(255, 255, 255, 0.1),
                inset 0 1px 0 rgba(255, 255, 255, 0.2)
              `
            }}
          >
            
            {/* Переплет (левый край) */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-200 to-transparent opacity-50 z-10" />
            
            {/* Содержимое страницы */}
            <img
              src={pages[currentPage]}
              alt={`Страница ${currentPage + 1}`}
              className="w-full h-full object-contain bg-white"
              draggable={false}
              style={{ imageRendering: 'auto' }}
              onLoad={() => setIsTransitioning(false)}
            />
            
            {/* Блики и отражения */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
            
            {/* Индикатор страницы */}
            <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
              {currentPage + 1} / {pages.length}
            </div>
          </div>

          {/* Навигационные зоны (только для десктопа) */}
          {!isMobile && (
            <>
              {/* Левая зона - предыдущая страница */}
              {currentPage > 0 && (
                <div 
                  className="absolute left-0 top-0 bottom-0 w-1/3 flex items-center justify-start pl-4 opacity-0 hover:opacity-100 transition-opacity duration-200 cursor-pointer z-20"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePageChange(currentPage - 1);
                  }}
                >
                  <div className="bg-black/60 text-white p-2 rounded-full backdrop-blur-sm">
                    <ChevronLeft className="w-6 h-6" />
                  </div>
                </div>
              )}

              {/* Правая зона - следующая страница */}
              {currentPage < pages.length - 1 && (
                <div 
                  className="absolute right-0 top-0 bottom-0 w-1/3 flex items-center justify-end pr-4 opacity-0 hover:opacity-100 transition-opacity duration-200 cursor-pointer z-20"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePageChange(currentPage + 1);
                  }}
                >
                  <div className="bg-black/60 text-white p-2 rounded-full backdrop-blur-sm">
                    <ChevronRight className="w-6 h-6" />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Подсказка для мобильных */}
      {isMobile && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white/80 px-4 py-2 rounded-full text-sm backdrop-blur-sm">
          Проводите пальцем для перелистывания
        </div>
      )}
    </div>
  );
};

export default BookViewer;