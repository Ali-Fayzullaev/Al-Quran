'use client';

import React, { useEffect, useState, useRef } from 'react';
import BookViewer from './BookViewer';
import BookControls from './BookControls';
import GalleryView from './GalleryView';
import { PDFLoader } from '@/lib/pdfLoader';
import { AudioManager } from '@/lib/audioManager';
import { SettingsManager } from '@/lib/settingsManager';
import { ArrowLeft, CheckCircle, Target } from 'lucide-react';

interface PDFViewerProps {
  pdfPath: string;
  title: string;
  bookId?: string;
  nextLevel?: any;
  onCompletion?: (completedLevelId: string) => void;
  onBack?: () => void;
  onComplete?: () => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ pdfPath, title, bookId, nextLevel, onCompletion, onBack, onComplete }) => {
  const [pages, setPages] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCompletedNotification, setShowCompletedNotification] = useState(false);
  const [isGalleryMode, setIsGalleryMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const audioManager = useRef<AudioManager | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Инициализация
  useEffect(() => {
    // Загружаем настройки
    const settings = SettingsManager.getSettings();
    setSoundEnabled(settings.soundEnabled);
    
    // Восстанавливаем позицию для текущей книги
    if (bookId) {
      const lastPosition = SettingsManager.getLastPosition();
      if (lastPosition.bookId === bookId && lastPosition.page > 0) {
        setCurrentPage(lastPosition.page);
      }
    }
    
    // Инициализация аудио менеджера
    audioManager.current = new AudioManager('/flip.mp3');
    audioManager.current.setEnabled(settings.soundEnabled);
    
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (audioManager.current) {
        audioManager.current.destroy();
      }
    };
  }, [bookId]);

  // Умное скрытие контролов
  useEffect(() => {
    const show = () => {
      setShowControls(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      // Увеличиваем время до скрытия на мобильных
      const hideDelay = isMobile ? 4000 : 3000;
      timeoutRef.current = setTimeout(() => setShowControls(false), hideDelay);
    };

    window.addEventListener('mousemove', show);
    window.addEventListener('touchstart', show);
    window.addEventListener('click', show);
    show();

    return () => {
      window.removeEventListener('mousemove', show);
      window.removeEventListener('touchstart', show);
      window.removeEventListener('click', show);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isMobile]);

  // Загрузка PDF
  useEffect(() => {
    const loadPDF = async () => {
      try {
        setLoading(true);
        setError(null);
        setProgress(0);

        console.log(`🔄 Загружаем PDF: ${pdfPath}`);

        // Попробуем загрузить PDF с прогрессивной загрузкой
        const pdfPages = await PDFLoader.loadPDFWithProgressiveLoading(
          pdfPath,
          (loaded, total) => {
            const ratio = Math.min(loaded / total, 1);
            const progressPercent = Math.min(5 + ratio * 90, 95);
            setProgress(progressPercent);
          },
          (firstPages) => {
            console.log(`⚡ Первые ${firstPages.length} страниц готовы!`);
            setPages(firstPages);
            setProgress(50);
            
            setTimeout(() => {
              setLoading(false);
            }, 300);
          },
          { scale: 2.0, quality: 0.92 }
        );

        if (pdfPages && pdfPages.length > 0) {
          console.log(`✅ Полная загрузка завершена: ${pdfPages.length} страниц`);
          setPages(pdfPages);
          setProgress(100);
          
          setShowCompletedNotification(true);
          setTimeout(() => {
            setShowCompletedNotification(false);
          }, 3000);
        }

      } catch (error) {
        console.error('❌ Ошибка загрузки PDF:', error);
        
        // Показываем демо-контент в случае ошибки
        console.log('📚 Показываем демо-контент');
        const demoPages = PDFLoader.createDemoPages(8);
        setPages(demoPages);
        setProgress(100);
        setLoading(false);
        
        // Устанавливаем сообщение об ошибке
        setError(error instanceof Error ? error.message : 'Неизвестная ошибка загрузки');
      }
    };

    loadPDF();
  }, [pdfPath]);

  // Функция обработки завершения урока
  const handleCompletion = () => {
    if (onCompletion && bookId) {
      onCompletion(bookId);
    } else if (onComplete) {
      onComplete();
    }
  };

  // Главная функция смены страниц с звуком
  const playPageFlipSound = () => {
    if (audioManager.current && soundEnabled) {
      audioManager.current.play();
    }
  };

  const handlePageChange = (idx: number) => {
    if (idx >= 0 && idx < pages.length && idx !== currentPage) {
      setCurrentPage(idx);
      playPageFlipSound();
      
      // Сохраняем позицию
      if (bookId) {
        SettingsManager.saveLastPosition(bookId, idx);
      }
    }
  };

  const toggleGalleryMode = () => {
    if (progress === 100) {
      setIsGalleryMode(!isGalleryMode);
    }
  };

  const goToPage = (pageIndex: number) => {
    if (pageIndex >= 0 && pageIndex < pages.length) {
      setCurrentPage(pageIndex);
      setIsGalleryMode(false);
      playPageFlipSound();
    }
  };

  const toggleSound = () => {
    const newSoundEnabled = !soundEnabled;
    setSoundEnabled(newSoundEnabled);
    if (audioManager.current) {
      audioManager.current.setEnabled(newSoundEnabled);
    }
    // Сохраняем настройку
    SettingsManager.saveSoundPreference(newSoundEnabled);
  };

  const goToPreviousPage = () => {
    const newPage = currentPage - 1;
    if (newPage >= 0) {
      handlePageChange(newPage);
    }
  };

  const goToNextPage = () => {
    const newPage = currentPage + 1;
    if (newPage < pages.length) {
      handlePageChange(newPage);
    }
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.log('Ошибка переключения полноэкранного режима:', error);
    }
  };

  // Экран загрузки
  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[linear-gradient(to_bottom_right,rgb(23,23,23),rgb(38,38,38),rgb(0,0,0))] text-white relative overflow-hidden px-4">
        {/* Анимированный фон */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 sm:w-64 sm:h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 sm:w-96 sm:h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        
        {/* Кнопка "Назад" */}
        {onBack && (
          <button
            onClick={onBack}
            className="absolute top-4 left-4 flex items-center gap-2 px-3 py-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Назад</span>
          </button>
        )}
        
        {/* Центральный контент */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center max-w-sm mx-auto">
          
          {/* Логотип */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[linear-gradient(to_right,rgb(59,130,246),rgb(147,51,234))] rounded-xl sm:rounded-2xl flex items-center justify-center shadow-2xl mb-6 sm:mb-8">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
            </svg>
          </div>
          
          {/* Заголовок */}
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-[linear-gradient(to_right,rgb(255,255,255),rgb(191,219,254))] bg-clip-text text-transparent mb-2">
            {title}
          </h1>
          <p className="text-white/60 text-sm mb-6 sm:mb-8">Загружаем страницы...</p>
          
          {/* Анимированный индикатор загрузки */}
          <div className="relative mb-6 sm:mb-8">
            <div className="w-16 h-16 sm:w-20 sm:h-20 border-3 sm:border-4 border-white/20 border-t-blue-500 rounded-full animate-spin"/>
            <div className="absolute inset-0 w-16 h-16 sm:w-20 sm:h-20 border-3 sm:border-4 border-transparent border-r-purple-500 rounded-full animate-spin animate-reverse"/>
          </div>
          
          {/* Прогресс */}
          <div className="w-full">
            <div className="text-3xl sm:text-4xl font-bold text-blue-400 mb-3 sm:mb-4">
              {Math.round(Math.min(progress, 100))}%
            </div>
            <div className="w-full max-w-xs h-2 bg-white/20 rounded-full overflow-hidden mx-auto">
              <div 
                className="h-full bg-[linear-gradient(to_right,rgb(59,130,246),rgb(168,85,247))] rounded-full transition-all duration-500 ease-out"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            
            {error && (
              <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                <p className="text-red-300 text-xs">
                  {error}
                </p>
                <p className="text-red-300/70 text-xs mt-1">
                  Показан демо-контент
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#1a1a1a]">
      {/* Текстурированный фон */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-neutral-800 via-neutral-900 to-black" />
      
      {/* Кнопка "Назад" (только если не в полноэкранном режиме) */}
      {onBack && !isFullscreen && (
        <button
          onClick={onBack}
          className="absolute top-4 left-4 z-50 flex items-center gap-2 px-3 py-2 bg-black/60 text-white/70 hover:text-white hover:bg-black/80 rounded-lg transition-all duration-200 backdrop-blur-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Назад</span>
        </button>
      )}
      
      {/* Индикатор фоновой загрузки */}
      {progress < 100 && progress >= 50 && (
        <div className="absolute top-5 right-5 bg-black/60 text-white/80 px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 backdrop-blur-sm border border-white/5 z-40 transition-all duration-500">
          <div className="w-3 h-3 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
          <span>
            Загрузка остальных страниц... {Math.round(Math.min(progress, 100))}%
          </span>
        </div>
      )}
      
      {/* Уведомление о завершении загрузки */}
      {showCompletedNotification && (
        <div className="absolute top-5 right-5 bg-green-600/90 text-white px-5 py-3 rounded-full text-sm font-medium flex items-center gap-3 backdrop-blur-md border border-green-400/20 z-50 animate-bounce">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span>Загрузка завершена!</span>
        </div>
      )}
      
      {/* Основной контейнер книги */}
      <div className="relative z-10 h-full w-full flex flex-col items-center justify-center">
        {isGalleryMode ? (
          <GalleryView 
            pages={pages} 
            onPageSelect={goToPage} 
            onClose={() => setIsGalleryMode(false)}
            currentPage={currentPage}
          />
        ) : (
          <BookViewer 
            pages={pages}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        )}
        
        {/* Кнопка завершения на последней странице */}
        {!isGalleryMode && currentPage === pages.length - 1 && pages.length > 0 && (onComplete || onCompletion) && (
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-50">
            <button
              onClick={handleCompletion}
              className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-2xl font-bold text-lg shadow-2xl transition-all duration-300 hover:scale-105 animate-bounce"
            >
              <CheckCircle className="w-6 h-6" />
              <span>
                {nextLevel ? 
                  `Завершить и перейти к: ${nextLevel.title}` : 
                  'Завершить урок'
                }
              </span>
              <Target className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>
      
      {/* Контролы */}
      {!isGalleryMode && (
        <BookControls
          currentPage={currentPage}
          totalPages={pages.length}
          soundEnabled={soundEnabled}
          isFullscreen={isFullscreen}
          showControls={showControls}
          onPrevPage={goToPreviousPage}
          onNextPage={goToNextPage}
          onToggleSound={toggleSound}
          onToggleFullscreen={toggleFullscreen}
          onToggleGallery={toggleGalleryMode}
          galleryAvailable={progress === 100}
          isMobile={isMobile}
          onHome={onBack}
        />
      )}
    </div>
  );
};

export default PDFViewer;