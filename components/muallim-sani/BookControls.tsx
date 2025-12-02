'use client';

import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2,
  Grid3X3,
  Home,
  RotateCcw
} from 'lucide-react';

interface BookControlsProps {
  currentPage: number;
  totalPages: number;
  soundEnabled: boolean;
  isFullscreen: boolean;
  showControls: boolean;
  onPrevPage: () => void;
  onNextPage: () => void;
  onToggleSound: () => void;
  onToggleFullscreen: () => void;
  onToggleGallery?: () => void;
  galleryAvailable?: boolean;
  isMobile: boolean;
  onHome?: () => void;
}

const BookControls: React.FC<BookControlsProps> = ({
  currentPage,
  totalPages,
  soundEnabled,
  isFullscreen,
  showControls,
  onPrevPage,
  onNextPage,
  onToggleSound,
  onToggleFullscreen,
  onToggleGallery,
  galleryAvailable = true,
  isMobile,
  onHome
}) => {
  
  const progressPercentage = totalPages > 0 ? ((currentPage + 1) / totalPages) * 100 : 0;

  return (
    <>
      {/* Мобильные контролы - всегда внизу */}
      {isMobile && (
        <div 
          className={`
            fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-t border-white/10
            transform transition-all duration-300 ease-in-out
            ${showControls ? 'translate-y-0' : 'translate-y-full'}
          `}
        >
          {/* Прогресс бар */}
          <div className="relative h-1 bg-white/20">
            <div 
              className="absolute h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          
          {/* Основные контролы */}
          <div className="flex items-center justify-between p-4">
            
            {/* Левая группа */}
            <div className="flex items-center gap-3">
              {onHome && (
                <button
                  onClick={onHome}
                  className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200"
                  aria-label="На главную"
                >
                  <Home className="w-5 h-5" />
                </button>
              )}
              
              <button
                onClick={onToggleSound}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200"
                aria-label={soundEnabled ? "Выключить звук" : "Включить звук"}
              >
                {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>
            </div>

            {/* Центральная группа - навигация */}
            <div className="flex items-center gap-4">
              <button
                onClick={onPrevPage}
                disabled={currentPage === 0}
                className={`
                  p-3 rounded-full transition-all duration-200
                  ${currentPage === 0 
                    ? 'text-white/30 cursor-not-allowed' 
                    : 'text-white/70 hover:text-white hover:bg-white/10 active:bg-white/20'
                  }
                `}
                aria-label="Предыдущая страница"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <div className="text-white text-sm font-medium min-w-[4rem] text-center">
                {currentPage + 1} / {totalPages}
              </div>

              <button
                onClick={onNextPage}
                disabled={currentPage >= totalPages - 1}
                className={`
                  p-3 rounded-full transition-all duration-200
                  ${currentPage >= totalPages - 1
                    ? 'text-white/30 cursor-not-allowed'
                    : 'text-white/70 hover:text-white hover:bg-white/10 active:bg-white/20'
                  }
                `}
                aria-label="Следующая страница"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Правая группа */}
            <div className="flex items-center gap-3">
              {onToggleGallery && galleryAvailable && (
                <button
                  onClick={onToggleGallery}
                  className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200"
                  aria-label="Галерея страниц"
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
              )}
              
              <button
                onClick={onToggleFullscreen}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200"
                aria-label={isFullscreen ? "Выйти из полноэкранного режима" : "Полноэкранный режим"}
              >
                {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Десктопные контролы */}
      {!isMobile && (
        <>
          {/* Верхняя панель */}
          <div 
            className={`
              fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-md border-b border-white/10
              transform transition-all duration-300 ease-in-out
              ${showControls ? 'translate-y-0' : '-translate-y-full'}
            `}
          >
            <div className="flex items-center justify-between p-4 max-w-7xl mx-auto">
              
              {/* Левая группа */}
              <div className="flex items-center gap-4">
                {onHome && (
                  <button
                    onClick={onHome}
                    className="flex items-center gap-2 px-4 py-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                  >
                    <Home className="w-4 h-4" />
                    <span className="text-sm font-medium">Назад</span>
                  </button>
                )}
                
                <div className="text-white/60 text-sm">
                  Muallim Sani - Книга для изучения
                </div>
              </div>

              {/* Правая группа */}
              <div className="flex items-center gap-3">
                <button
                  onClick={onToggleSound}
                  className={`
                    p-2 rounded-lg transition-all duration-200
                    ${soundEnabled 
                      ? 'text-blue-400 bg-blue-400/20 hover:bg-blue-400/30' 
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                    }
                  `}
                  aria-label={soundEnabled ? "Выключить звук" : "Включить звук"}
                >
                  {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </button>

                {onToggleGallery && galleryAvailable && (
                  <button
                    onClick={onToggleGallery}
                    className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                    aria-label="Галерея страниц"
                  >
                    <Grid3X3 className="w-5 h-5" />
                  </button>
                )}

                <button
                  onClick={onToggleFullscreen}
                  className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                  aria-label={isFullscreen ? "Выйти из полноэкранного режима" : "Полноэкранный режим"}
                >
                  {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Нижняя панель */}
          <div 
            className={`
              fixed bottom-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-md border-t border-white/10
              transform transition-all duration-300 ease-in-out
              ${showControls ? 'translate-y-0' : 'translate-y-full'}
            `}
          >
            <div className="p-4 max-w-7xl mx-auto">
              
              {/* Прогресс бар */}
              <div className="relative h-2 bg-white/20 rounded-full mb-4 overflow-hidden">
                <div 
                  className="absolute h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>

              {/* Контролы навигации */}
              <div className="flex items-center justify-between">
                
                {/* Навигация */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={onPrevPage}
                    disabled={currentPage === 0}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200
                      ${currentPage === 0 
                        ? 'text-white/30 cursor-not-allowed' 
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                      }
                    `}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="text-sm font-medium">Назад</span>
                  </button>

                  <div className="text-white text-lg font-medium px-4">
                    {currentPage + 1} / {totalPages}
                  </div>

                  <button
                    onClick={onNextPage}
                    disabled={currentPage >= totalPages - 1}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200
                      ${currentPage >= totalPages - 1
                        ? 'text-white/30 cursor-not-allowed'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                      }
                    `}
                  >
                    <span className="text-sm font-medium">Вперед</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Дополнительная информация */}
                <div className="text-white/60 text-sm">
                  Используйте клавиши ← → или кликайте по краям страницы
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Боковые стрелки навигации для десктопа */}
      {!isMobile && showControls && (
        <>
          {/* Левая стрелка */}
          {currentPage > 0 && (
            <button
              onClick={onPrevPage}
              className={`
                fixed left-4 top-1/2 transform -translate-y-1/2 z-40
                p-3 bg-black/60 text-white/70 hover:text-white hover:bg-black/80 
                rounded-full transition-all duration-200 backdrop-blur-sm
                opacity-0 hover:opacity-100 group-hover:opacity-100
              `}
              style={{ opacity: showControls ? 1 : 0 }}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Правая стрелка */}
          {currentPage < totalPages - 1 && (
            <button
              onClick={onNextPage}
              className={`
                fixed right-4 top-1/2 transform -translate-y-1/2 z-40
                p-3 bg-black/60 text-white/70 hover:text-white hover:bg-black/80 
                rounded-full transition-all duration-200 backdrop-blur-sm
                opacity-0 hover:opacity-100 group-hover:opacity-100
              `}
              style={{ opacity: showControls ? 1 : 0 }}
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </>
      )}
    </>
  );
};

export default BookControls;