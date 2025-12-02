'use client';

import React from 'react';
import { X, ZoomIn } from 'lucide-react';

interface GalleryViewProps {
  pages: string[];
  onPageSelect: (pageIndex: number) => void;
  onClose: () => void;
  currentPage: number;
}

const GalleryView: React.FC<GalleryViewProps> = ({ pages, onPageSelect, onClose, currentPage }) => {
  
  // Обработка нажатия ESC для выхода
  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/95 z-50 overflow-auto">
      {/* Заголовок и кнопка закрытия */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-md border-b border-white/10 p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Галерея страниц</h2>
            <p className="text-white/60 text-sm">Нажмите на любую страницу для перехода</p>
          </div>
          <button
            onClick={onClose}
            className="p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200"
            aria-label="Закрыть галерею"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Сетка страниц */}
      <div className="p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 max-w-7xl mx-auto">
          {pages.map((page, index) => (
            <div
              key={index}
              onClick={() => onPageSelect(index)}
              className={`
                relative group cursor-pointer transform transition-all duration-300 hover:scale-105
                ${currentPage === index ? 'ring-4 ring-blue-500 ring-opacity-70' : ''}
              `}
            >
              {/* Миниатюра страницы */}
              <div className="relative aspect-3/4 overflow-hidden bg-white shadow-lg rounded-lg">
                <img
                  src={page}
                  alt={`Страница ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                
                {/* Оверлей при наведении */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center">
                  <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </div>
                
                {/* Индикатор текущей страницы */}
                {currentPage === index && (
                  <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                    Текущая
                  </div>
                )}
              </div>
              
              {/* Номер страницы */}
              <div className="mt-2 text-center">
                <span className="text-white/80 text-sm font-medium">Стр. {index + 1}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Подсказка внизу */}
      <div className="sticky bottom-0 bg-black/80 backdrop-blur-md border-t border-white/10 p-4">
        <div className="text-center">
          <p className="text-white/60 text-sm">
            Отображается {pages.length} страниц • Нажмите ESC для выхода
          </p>
        </div>
      </div>
    </div>
  );
};

export default GalleryView;