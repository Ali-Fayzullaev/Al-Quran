"use client";

import { useEffect, useState } from "react";
import { Loader2, BookOpen, Grid3X3, Volume2 } from "lucide-react";

interface PageLoaderProps {
  type?: 'mushaf' | 'surahs' | 'juz' | 'default';
  message?: string;
}

export function PageLoader({ type = 'default', message }: PageLoaderProps) {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleRouteChange = () => {
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 300);
    };

    window.addEventListener('beforeunload', handleRouteChange);
    
    return () => {
      window.removeEventListener('beforeunload', handleRouteChange);
    };
  }, []);

  // Если есть message, показываем полноэкранный лоадер
  if (message) {
    const getIcon = () => {
      switch (type) {
        case 'mushaf':
          return <BookOpen className="w-8 h-8" />;
        case 'surahs':
          return <Volume2 className="w-8 h-8" />;
        case 'juz':
          return <Grid3X3 className="w-8 h-8" />;
        default:
          return <Loader2 className="w-8 h-8 animate-spin" />;
      }
    };

    const getColor = () => {
      switch (type) {
        case 'mushaf':
          return '#10b981';
        case 'surahs':
          return '#3b82f6';
        case 'juz':
          return '#8b5cf6';
        default:
          return 'var(--color-primary)';
      }
    };

    return (
      <div className="min-h-screen flex items-center justify-center" 
           style={{ backgroundColor: 'var(--fixed-background)' }}>
        <div className="text-center max-w-md mx-auto p-8">
          {/* Анимированная иконка */}
          <div className="relative mb-8">
            <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center"
                 style={{ 
                   backgroundColor: getColor(),
                   boxShadow: `0 10px 40px ${getColor()}30`
                 }}>
              <div className="text-white">{getIcon()}</div>
            </div>
            {type !== 'default' && (
              <div className="absolute inset-0 w-16 h-16 mx-auto rounded-full border-4 border-transparent"
                   style={{ 
                     borderTopColor: getColor(),
                     animation: 'spin 2s linear infinite'
                   }} />
            )}
          </div>

          {/* Сообщение */}
          <p className="text-lg font-medium" style={{ color: 'var(--fixed-text)' }}>
            {message}
          </p>

          {/* Прогресс индикатор */}
          <div className="w-full h-1 rounded-full overflow-hidden mt-6"
               style={{ backgroundColor: 'var(--color-border)' }}>
            <div className="h-full rounded-full animate-pulse"
                 style={{ 
                   background: `linear-gradient(90deg, ${getColor()}, transparent, ${getColor()})`,
                   animation: 'shimmer 2s infinite'
                 }} />
          </div>
        </div>

        <style jsx>{`
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-1 z-50 bg-emerald-200 dark:bg-emerald-800">
      <div 
        className="h-full bg-emerald-600 dark:bg-emerald-400"
        style={{
          width: "100%",
          animation: "loading-progress 0.5s ease-out"
        }}
      />
      <style jsx>{`
        @keyframes loading-progress {
          0% { transform: scaleX(0); transform-origin: left; }
          100% { transform: scaleX(1); transform-origin: left; }
        }
      `}</style>
    </div>
  );
}

// Быстрый загрузчик настроек без лишних параметров
export function SettingsLoader({ message = "Загрузка..." }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">
          {message}
        </p>
      </div>
    </div>
  );
}

// Быстрый загрузчик поиска
export function SearchLoader({ message = "Поиск..." }: { message?: string }) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-gray-500 dark:text-gray-400">
          {message}
        </p>
      </div>
    </div>
  );
}