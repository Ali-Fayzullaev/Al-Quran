"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import DuaProgressBar from './DuaProgressBar';
import {
  Copy,
  Eye,
  EyeOff,
  Settings,
  Lightbulb,
  FileText,
  BookOpen,
  Quote,
  Plus,
  Minus,
  RotateCcw,
  Heart,
  Check
} from "lucide-react";
import {
  extractCountFromNotes,
  createDuaId,
  getProgressMessage
} from '@/lib/duaCounter';
import {
  isDuaSaved,
  toggleDuaSaved,
  type SavedDua
} from '@/lib/duaBookmarks';
import { useLocale } from "@/context/LocaleContext";
import { cn } from "@/lib/utils";

interface DuaData {
  title: string;
  arabic: string;
  latin?: string;
  translation: string;
  notes?: string;
  fawaid?: string;
  benefits?: string;
  source?: string;
}

interface DuaCardProps {
  dua: DuaData;
  index: number;
  onComplete?: (duaId: string) => void;
  isCompleted?: boolean;
  category?: string;
}

export default function DuaCard({ dua, index, onComplete, isCompleted = false, category = 'unknown' }: DuaCardProps) {
  const { locale, t } = useLocale();
  const [showTransliteration, setShowTransliteration] = useState(false);
  const [showNotes, setShowNotes] = useState(true);
  const [showBenefits, setShowBenefits] = useState(false);
  const [showSource, setShowSource] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Состояние для сохранения дуа
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Counter state
  const duaId = createDuaId(dua.title, dua.arabic);
  const targetCount = extractCountFromNotes(dua.notes);
  const [currentCount, setCurrentCount] = useState(0);
  const [isHidden, setIsHidden] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
  const progress = Math.min(Math.round((currentCount / targetCount) * 100), 100);
  const isDuaCompleted = currentCount >= targetCount;

  // Effect for auto-hiding completed duas
  useEffect(() => {
    if (isDuaCompleted && !isCompleted) {
      const timer = setTimeout(() => {
        setIsHidden(true);
        onComplete?.(duaId);
      }, 2000); // Hide after 2 seconds
      
      return () => clearTimeout(timer);
    }
  }, [isDuaCompleted, isCompleted, duaId, onComplete]);

  // Check if dua is saved on mount
  useEffect(() => {
    setIsSaved(isDuaSaved(duaId));
  }, [duaId]);

  const copyArabicText = () => {
    navigator.clipboard.writeText(dua.arabic);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };
  
  const handleIncrement = () => {
    if (currentCount < targetCount) {
      const newCount = currentCount + 1;
      setCurrentCount(newCount);
      
      // Show progress messages
      const progressMsg = getProgressMessage(Math.round((newCount / targetCount) * 100));
      if (progressMsg) {
        // Could show a small toast here
      }
      
      // Just mark as completed, no individual notification
      // Only category completion will show notification
    }
  };
  
  const handleDecrement = () => {
    if (currentCount > 0) {
      setCurrentCount(currentCount - 1);
    }
  };
  
  const handleReset = () => {
    setCurrentCount(0);
    setIsHidden(false);
  };

  const handleSaveDua = async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    
    try {
      const savedDua: Omit<SavedDua, 'createdAt'> = {
        id: duaId,
        title: dua.title,
        arabic: dua.arabic,
        translation: dua.translation,
        latin: dua.latin,
        notes: dua.notes,
        benefits: dua.benefits || dua.fawaid,
        source: dua.source,
        category: category
      };
      
      const newSavedState = toggleDuaSaved(savedDua);
      setIsSaved(newSavedState);
      
      // Небольшая задержка для анимации
      setTimeout(() => setIsSaving(false), 300);
    } catch (error) {
      console.error('Ошибка при сохранении дуа:', error);
      setIsSaving(false);
    }
  };
  

  
  // Don't render if hidden
  if (isHidden) {
    return null;
  }

  return (
    <div 
      className={`group relative overflow-hidden rounded-xl md:rounded-2xl transition-all duration-300 md:duration-500 md:hover:shadow-2xl md:hover:-translate-y-1`}
      style={{
        backgroundColor: 'var(--color-background)',
        borderStyle: 'solid',
        borderColor: isDuaCompleted ? 'var(--color-success, #10b981)' : 'var(--color-border)',
        borderWidth: isDuaCompleted ? '2px' : '1px'
      }}
    >
      {/* Gradient overlay on hover - Only on desktop */}
      <div className="hidden md:block absolute inset-0 bg-gradient-to-br from-transparent to-blue-50/20 dark:to-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="relative p-4 md:p-6">
        
        {/* Header - Mobile Optimized */}
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
            {/* Index Badge */}
            <div 
              className="w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-bold text-white flex-shrink-0"
              style={{ backgroundColor: isDuaCompleted ? 'var(--color-success, #10b981)' : 'var(--color-primary)' }}
            >
              {isDuaCompleted ? '✓' : index + 1}
            </div>
            
            {/* Title */}
            <h3 className="text-base md:text-lg font-bold truncate" style={{ color: 'var(--color-text)' }}>
              {dua.title}
            </h3>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
            {/* Settings Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className="w-7 h-7 md:w-8 md:h-8 p-0 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/20"
            >
              <Settings className="w-3 h-3 md:w-4 md:h-4" style={{ color: 'var(--color-primary)' }} />
            </Button>
            
            {/* Copy Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={copyArabicText}
              className="w-7 h-7 md:w-8 md:h-8 p-0 rounded-full hover:bg-green-100 dark:hover:bg-green-900/20"
            >
              {isCopied ? (
                <Check className="w-3 h-3 md:w-4 md:h-4 text-green-600" />
              ) : (
                <Copy className="w-3 h-3 md:w-4 md:h-4" style={{ color: 'var(--color-primary)' }} />
              )}
            </Button>
          </div>
        </div>

        {/* Progress Bar - Only for multi-count duas */}
        {targetCount > 1 && (
          <div className="mb-3 md:mb-4">
            <DuaProgressBar 
              current={currentCount} 
              target={targetCount}
              className="mb-2 md:mb-3"
            />
          </div>
        )}
        
        {/* Counter Controls - Mobile Optimized */}
        <div className="flex items-center justify-center gap-2 md:gap-4 mb-4 p-2 md:p-3 rounded-lg" style={{
          backgroundColor: 'var(--color-background-secondary)',
          borderStyle: 'solid',
          borderWidth: '1px',
          borderColor: isDuaCompleted ? 'var(--color-success, #10b981)' : 'var(--color-border)'
        }}>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDecrement}
            disabled={currentCount === 0}
            className="w-8 h-8 md:w-10 md:h-10 rounded-full p-0"
          >
            <Minus className="w-3 h-3 md:w-4 md:h-4" />
          </Button>
          
          <div className="text-center min-w-[80px] md:min-w-[120px]">
            <div className="text-lg md:text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
              {currentCount}/{targetCount}
            </div>
            <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              {isDuaCompleted ? '✅ Готово!' : 'Нажмите +'}
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleIncrement}
            disabled={isDuaCompleted}
            className="w-8 h-8 md:w-10 md:h-10 rounded-full p-0"
            style={{
              backgroundColor: !isDuaCompleted ? 'var(--color-primary)' : undefined,
              borderColor: !isDuaCompleted ? 'var(--color-primary)' : undefined,
              color: !isDuaCompleted ? 'white' : undefined
            }}
          >
            <Plus className="w-3 h-3 md:w-4 md:h-4" />
          </Button>
          
          {currentCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="w-6 h-6 md:w-8 md:h-8 rounded-full p-0"
              title="Сбросить"
            >
              <RotateCcw className="w-2 h-2 md:w-3 md:h-3" />
            </Button>
          )}
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mb-6 p-4 rounded-xl animate-in slide-in-from-top-2 duration-300" style={{
            backgroundColor: 'var(--color-background)',
            borderStyle: 'solid',
            borderWidth: '1px',
            borderColor: 'var(--color-border)'
          }}>
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
              <h4 className="font-medium" style={{ color: 'var(--color-primary)' }}>
                Настройки отображения
              </h4>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTransliteration(!showTransliteration)}
                className="justify-start gap-2"
              >
                {showTransliteration ? (
                  <Eye className="w-4 h-4 text-green-600" />
                ) : (
                  <EyeOff className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
                )}
                Транслитерация
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowNotes(!showNotes)}
                className="justify-start gap-2"
              >
                {showNotes ? (
                  <Eye className="w-4 h-4 text-green-600" />
                ) : (
                  <EyeOff className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
                )}
                Заметки
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBenefits(!showBenefits)}
                className="justify-start gap-2"
              >
                {showBenefits ? (
                  <Eye className="w-4 h-4 text-green-600" />
                ) : (
                  <EyeOff className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
                )}
                Польза
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSource(!showSource)}
                className="justify-start gap-2"
              >
                {showSource ? (
                  <Eye className="w-4 h-4 text-green-600" />
                ) : (
                  <EyeOff className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
                )}
                Источник
              </Button>
            </div>
          </div>
        )}

        {/* Arabic Text - Mobile Optimized */}
        <div className="text-center mb-4 md:mb-6">
          <p className="text-xl md:text-3xl leading-relaxed mb-3 md:mb-4" 
             style={{ 
               color: 'var(--color-primary)',
               direction: 'rtl',
               fontFamily: 'Arabic, serif'
             }}>
            {dua.arabic}
          </p>
          
          <Button
            variant="outline"
            size="sm"
            onClick={copyArabicText}
            className="gap-1 md:gap-2 h-8 md:h-9 text-xs md:text-sm"
          >
            <Copy className="w-3 h-3 md:w-4 md:h-4" />
            Копировать
          </Button>
        </div>

        {/* Transliteration (conditional) */}
        {showTransliteration && dua.latin && (
          <div className="mb-4 p-3 rounded-lg animate-in slide-in-from-bottom-2 duration-300" style={{ backgroundColor: 'var(--color-background)' }}>
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Транслитерация
              </span>
            </div>
            <p className="text-sm italic" style={{ color: 'var(--color-text-secondary)' }}>
              {dua.latin}
            </p>
          </div>
        )}

        {/* Translation */}
        <div className="mb-4 p-4 rounded-lg" style={{ backgroundColor: 'var(--color-background)' }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: 'var(--color-primary)' }}>
              РУ
            </div>
            <span className="text-sm font-medium" style={{ color: 'var(--color-primary)' }}>
              Перевод
            </span>
          </div>
          <p className="text-base leading-relaxed" style={{ color: 'var(--color-text)' }}>
            {dua.translation}
          </p>
        </div>

        {/* Notes (conditional) */}
        {showNotes && dua.notes && (
          <div className="mb-4 p-4 rounded-lg animate-in slide-in-from-bottom-2 duration-300" style={{ backgroundColor: 'var(--color-background)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Quote className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                Заметки
              </span>
            </div>
            <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {dua.notes}
            </div>
          </div>
        )}

        {/* Benefits (conditional) */}
        {showBenefits && (dua.benefits || dua.fawaid) && (
          <div className="mb-4 p-4 rounded-lg animate-in slide-in-from-bottom-2 duration-300" style={{ backgroundColor: 'var(--color-background)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-700 dark:text-green-300">
                Польза
              </span>
            </div>
            <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {dua.benefits || dua.fawaid}
            </div>
          </div>
        )}

        {/* Source (conditional) */}
        {showSource && dua.source && (
          <div className="mb-4 p-4 rounded-lg animate-in slide-in-from-bottom-2 duration-300" style={{ backgroundColor: 'var(--color-background)' }}>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                Источник
              </span>
            </div>
            <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {dua.source}
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }}></div>
            <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              РУС
            </span>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSaveDua}
              disabled={isSaving}
              className={cn(
                "gap-1 transition-all duration-200",
                isSaved 
                  ? "text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" 
                  : "hover:bg-gray-50 dark:hover:bg-gray-800/20"
              )}
            >
              <Heart className={cn(
                "w-3 h-3 transition-all duration-200",
                isSaved ? "fill-current" : "",
                isSaving && "animate-pulse"
              )} />
              <span className="text-xs">
                {isSaving ? "..." : isSaved ? "Сохранено" : "Сохранить"}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}