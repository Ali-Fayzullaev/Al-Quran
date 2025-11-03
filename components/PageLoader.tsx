"use client";

import { useEffect, useState } from "react";

export function PageLoader() {
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