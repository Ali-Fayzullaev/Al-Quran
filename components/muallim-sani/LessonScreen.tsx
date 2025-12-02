'use client';

import React, { useState, useRef } from 'react';
import { useLocale } from '@/context/LocaleContext';
import { MuallamSaniProfile, Lesson } from '@/types/muallim-sani';
import { muallamSaniStore } from '@/lib/muallamSaniStore';

interface LessonScreenProps {
  profile: MuallamSaniProfile;
  lessonId: string;
  onScreenChange: (screen: string, data?: any) => void;
  onProfileUpdate: (profile: MuallamSaniProfile) => void;
}

// Маппинг уроков к PDF файлам
const LESSON_PDF_MAPPING: Record<string, { fileName: string; title: string }> = {
  'alifba': { fileName: 'alifba_end.pdf', title: 'Алифба - Основы' },
  'letters': { fileName: 'all_letters_end.pdf', title: 'Все буквы' },
  'tanvin': { fileName: 'letters_with_tanvin_end.pdf', title: 'Буквы с танвином' },
  'tashdid': { fileName: 'letters_with_tashdid_end.pdf', title: 'Буквы с тяжёлым произношением' },
  'mad': { fileName: 'mad_tabiy_end.pdf', title: 'Мад Табии' },
  'complete': { fileName: 'all_muallim_sani_end.pdf', title: 'Полный курс' }
};

export default function LessonScreen({ profile, lessonId, onScreenChange, onProfileUpdate }: LessonScreenProps) {
  const [zoom, setZoom] = useState(1);

  // Найти уровень обучения 
  const level = muallamSaniStore.getLearningLevels()
    .find(l => l.id === lessonId);

  if (!level) {
    return (
      <div className="text-center py-8">
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Уровень не найден
        </p>
        <button
          onClick={() => onScreenChange('dashboard')}
          className="mt-4 px-4 py-2 rounded-lg"
          style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
        >
          Вернуться к дашборду
        </button>
      </div>
    );
  }

  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 0.2, 0.5));
  };

  const handleStartQuiz = () => {
    onScreenChange('quiz', { quizId: level.id });
  };
  
  const handleOpenPDF = () => {
    const pdfData = LESSON_PDF_MAPPING[level.id];
    if (pdfData) {
      onScreenChange('pdf-viewer', {
        pdfPath: `/muallim_sani/${pdfData.fileName}`,
        pdfTitle: pdfData.title,
        bookId: level.id
      });
    }
  };
  
  const hasPDF = LESSON_PDF_MAPPING[level.id];

  const handleCompleteLesson = () => {
    // Отметить урок как завершенный
    muallamSaniStore.updateProgress(level.id, 80, 30); // Заглушка
    onProfileUpdate(muallamSaniStore.getProfile()!);
    handleStartQuiz();
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Заголовок урока */}
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <button
            onClick={() => onScreenChange('dashboard')}
            className="mr-4 p-2 rounded-lg hover:opacity-70 transition-opacity"
            style={{ backgroundColor: 'var(--color-background-secondary)' }}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          
          <div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-primary)' }}>
              {level.icon} {level.nameRu}
            </h1>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {level.description}
            </p>
          </div>
        </div>

        {/* Панель действий */}
        <div 
          className="rounded-lg p-4 mb-6"
          style={{ 
            backgroundColor: 'var(--color-background-secondary)',
            borderColor: 'var(--color-border)',
            borderWidth: '1px'
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm" style={{ color: 'var(--color-text)' }}>
                Материал для изучения: {level.nameRu}
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              {hasPDF ? (
                <button
                  onClick={handleOpenPDF}
                  className="px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-all flex items-center space-x-2"
                  style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
                >
                  <span>📚</span>
                  <span>Открыть книгу</span>
                </button>
              ) : (
                <button
                  onClick={handleCompleteLesson}
                  className="px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: level.color, color: 'white' }}
                >
                  🎯 Завершить и пройти тест
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* PDF просмотрщик */}
      <div 
        className="rounded-xl overflow-hidden mb-8"
        style={{ 
          backgroundColor: 'var(--color-background-secondary)',
          borderColor: 'var(--color-border)',
          borderWidth: '1px'
        }}
      >
        <div className="p-4 border-b flex items-center justify-between" 
             style={{ borderColor: 'var(--color-border)' }}>
          <h3 className="font-bold" style={{ color: 'var(--color-primary)' }}>
            📄 Учебный материал: {level.nameRu}
          </h3>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleZoomOut}
              className="p-2 rounded hover:opacity-70"
              style={{ backgroundColor: 'var(--color-background)' }}
            >
              🔍-
            </button>
            
            <span className="text-sm px-2" style={{ color: 'var(--color-text)' }}>
              {Math.round(zoom * 100)}%
            </span>
            
            <button
              onClick={handleZoomIn}
              className="p-2 rounded hover:opacity-70"
              style={{ backgroundColor: 'var(--color-background)' }}
            >
              🔍+
            </button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="h-[600px]">
          {level.pdfPath ? (
            <iframe
              src={level.pdfPath}
              width="100%"
              height="100%"
              style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
              title={`PDF: ${level.nameRu}`}
            />
          ) : (
            <div className="flex items-center justify-center h-full" style={{ color: 'var(--color-text-secondary)' }}>
              <div className="text-center">
                <div className="text-6xl mb-4">📄</div>
                <p>PDF файл не найден</p>
                <p className="text-sm mt-2">Путь: {level.pdfPath}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Нижняя панель действий */}
      <div className="text-center">
        <button
          onClick={() => onScreenChange('dashboard')}
          className="mr-4 px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
          style={{ 
            backgroundColor: 'var(--color-background-secondary)',
            color: 'var(--color-text)',
            borderColor: 'var(--color-border)',
            borderWidth: '1px'
          }}
        >
          ← Назад к дашборду
        </button>
        
        <button
          onClick={handleCompleteLesson}
          className="px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
          style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
        >
          🎯 Завершить изучение и пройти тест
        </button>
      </div>
    </div>
  );
}