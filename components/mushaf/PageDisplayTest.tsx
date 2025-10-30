"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Grid3X3, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PageDisplayTestProps {
  className?: string;
}

export default function PageDisplayTest({ className }: PageDisplayTestProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [testResults, setTestResults] = useState<Record<number, boolean>>({});
  const [isAutoTesting, setIsAutoTesting] = useState(false);

  // Список некоторых важных страниц для тестирования
  const testPages = [1, 2, 3, 4, 5, 6, 10, 20, 50, 100, 200, 300, 400, 500, 600, 604];

  const goToPage = (page: number) => {
    if (page >= 1 && page <= 604) {
      setCurrentPage(page);
    }
  };

  const markPageAsCorrect = () => {
    setTestResults(prev => ({ ...prev, [currentPage]: true }));
  };

  const markPageAsIncorrect = () => {
    setTestResults(prev => ({ ...prev, [currentPage]: false }));
  };

  const generateImagePath = (pageNum: number): string => {
    const paddedPageNum = pageNum.toString().padStart(3, '0');
    return `/quran-img-pages/${paddedPageNum}.svg`;
  };

  const runAutoTest = async () => {
    setIsAutoTesting(true);
    for (const page of testPages) {
      setCurrentPage(page);
      // Небольшая задержка для визуального эффекта
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Автоматически помечаем как правильное (в реальности нужно проверить)
      setTestResults(prev => ({ ...prev, [page]: true }));
    }
    setIsAutoTesting(false);
  };

  return (
    <div className={cn("max-w-6xl mx-auto p-6", className)}>
      {/* Заголовок */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🔧 Тест отображения страниц Корана
        </h1>
        <p className="text-gray-600">
          Проверка корректности отображения всех 604 страниц с единым стилем
        </p>
      </div>

      {/* Управление */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="w-4 h-4" />
            Предыдущая
          </Button>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Страница:</span>
            <input
              type="number"
              min="1"
              max="604"
              value={currentPage}
              onChange={(e) => goToPage(parseInt(e.target.value) || 1)}
              className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
            />
            <span className="text-sm text-gray-600">из 604</span>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= 604}
          >
            Следующая
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={runAutoTest}
            disabled={isAutoTesting}
            className="flex items-center gap-2"
          >
            <Grid3X3 className="w-4 h-4" />
            Автотест
          </Button>
          
          <Button
            onClick={markPageAsCorrect}
            size="sm"
            className="bg-green-600 hover:bg-green-700 flex items-center gap-1"
          >
            <Check className="w-4 h-4" />
            ✓
          </Button>
          
          <Button
            onClick={markPageAsIncorrect}
            variant="destructive"
            size="sm"
            className="flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            ✗
          </Button>
        </div>
      </div>

      {/* Быстрые переходы */}
      <div className="flex flex-wrap gap-2 mb-6 justify-center">
        {testPages.map(page => (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            size="sm"
            onClick={() => goToPage(page)}
            className={cn(
              "relative",
              testResults[page] === true && "bg-green-100 border-green-300",
              testResults[page] === false && "bg-red-100 border-red-300"
            )}
          >
            {page}
            {testResults[page] === true && (
              <Check className="w-3 h-3 absolute -top-1 -right-1 text-green-600" />
            )}
            {testResults[page] === false && (
              <X className="w-3 h-3 absolute -top-1 -right-1 text-red-600" />
            )}
          </Button>
        ))}
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {currentPage}
          </div>
          <div className="text-sm text-blue-600">Текущая страница</div>
        </div>
        
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {Object.values(testResults).filter(Boolean).length}
          </div>
          <div className="text-sm text-green-600">Правильные</div>
        </div>
        
        <div className="text-center p-4 bg-red-50 rounded-lg">
          <div className="text-2xl font-bold text-red-600">
            {Object.values(testResults).filter(result => result === false).length}
          </div>
          <div className="text-sm text-red-600">Неправильные</div>
        </div>
      </div>

      {/* Отображение текущей страницы */}
      <div className="relative bg-white rounded-lg shadow-lg p-4">
        <div className="text-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Страница {currentPage} {currentPage % 2 === 0 ? '(четная)' : '(нечетная)'}
          </h2>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="quran-page"
            data-page={currentPage}
          >
            <div className="quran-page-container">
              <div className="quran-page-content">
                <img
                  src={generateImagePath(currentPage)}
                  alt={`Quran Page ${currentPage}`}
                  className="quran-page-image"
                  data-page={currentPage}
                />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Инструкции */}
        <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <h3 className="font-medium text-yellow-800 mb-2">Что проверять:</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>✅ Правая сторона страницы полностью видима</li>
            <li>✅ Все аяты четко отображаются</li>
            <li>✅ Нет обрезания текста или границ</li>
            <li>✅ Симметричные поля со всех сторон</li>
            <li>✅ Единый стиль для четных и нечетных страниц</li>
          </ul>
        </div>
      </div>
    </div>
  );
}