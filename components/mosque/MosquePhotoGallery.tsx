'use client';

import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MosquePhotoGalleryProps {
  photos: string[];
  isOpen: boolean;
  onClose: () => void;
  mosqueName: string;
}

export default function MosquePhotoGallery({ 
  photos, 
  isOpen, 
  onClose, 
  mosqueName 
}: MosquePhotoGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!isOpen || !photos.length) return null;

  const nextPhoto = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div className="relative max-w-5xl max-h-full w-full h-full flex flex-col">
        {/* Заголовок */}
        <div className="flex items-center justify-between p-4 text-white">
          <h2 className="text-xl font-semibold">{mosqueName}</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Главное изображение */}
        <div className="flex-1 relative flex items-center justify-center">
          <img
            src={photos[currentIndex]}
            alt={`${mosqueName} - фото ${currentIndex + 1}`}
            className="max-w-full max-h-full object-contain rounded-lg"
            onError={(e) => {
              // Заглушка при ошибке загрузки
              (e.target as HTMLImageElement).src = 
                'https://via.placeholder.com/400x300/64748b/ffffff?text=Фото+недоступно';
            }}
          />

          {/* Навигационные кнопки */}
          {photos.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={prevPhoto}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white hover:bg-opacity-20 bg-black bg-opacity-50"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={nextPhoto}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white hover:bg-opacity-20 bg-black bg-opacity-50"
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </>
          )}
        </div>

        {/* Миниатюры */}
        {photos.length > 1 && (
          <div className="flex justify-center space-x-2 p-4 overflow-x-auto">
            {photos.map((photo, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`
                  flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all
                  ${index === currentIndex 
                    ? 'border-white shadow-lg' 
                    : 'border-transparent opacity-70 hover:opacity-100'
                  }
                `}
              >
                <img
                  src={photo}
                  alt={`Миниатюра ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 
                      'https://via.placeholder.com/64x64/64748b/ffffff?text=?';
                  }}
                />
              </button>
            ))}
          </div>
        )}

        {/* Счетчик фотографий */}
        {photos.length > 1 && (
          <div className="text-center text-white text-sm pb-4">
            {currentIndex + 1} из {photos.length}
          </div>
        )}
      </div>
    </div>
  );
}