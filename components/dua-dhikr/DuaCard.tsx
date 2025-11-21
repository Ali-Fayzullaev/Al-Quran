"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import DuaProgressBar from './DuaProgressBar';
import CompletionNotification from './CompletionNotification';
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
  getCompletionMessage,
  getProgressMessage
} from '@/lib/duaCounter';
import { useLocale } from "@/context/LocaleContext";

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
}

export default function DuaCard({ dua, index, onComplete, isCompleted = false }: DuaCardProps) {
  const { locale, t } = useLocale();
  const [showTransliteration, setShowTransliteration] = useState(false);
  const [showNotes, setShowNotes] = useState(true);
  const [showBenefits, setShowBenefits] = useState(false);
  const [showSource, setShowSource] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Counter state
  const duaId = createDuaId(dua.title, dua.arabic);
  const targetCount = extractCountFromNotes(dua.notes);
  const [currentCount, setCurrentCount] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
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
      
      // Show completion notification
      if (newCount >= targetCount) {
        const message = getCompletionMessage(dua.title, targetCount);
        setNotificationMessage(message);
        setShowNotification(true);
      }
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
  
  const handleCloseNotification = () => {
    setShowNotification(false);
  };
  
  // Don't render if hidden
  if (isHidden) {
    return null;
  }

  return (
    <div 
      className={`group relative overflow-hidden rounded-2xl border transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 ${
        isDuaCompleted ? 'animate-pulse' : ''
      }`}
      style={{
        backgroundColor: 'var(--color-background-secondary)',
        borderColor: isDuaCompleted ? 'var(--color-success, #10b981)' : 'var(--color-border)',
        borderWidth: isDuaCompleted ? '2px' : '1px'
      }}
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-blue-50/20 dark:to-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="relative p-6">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Index Badge */}
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
              style={{ backgroundColor: isDuaCompleted ? 'var(--color-success, #10b981)' : 'var(--color-primary)' }}
            >
              {isDuaCompleted ? '✓' : index + 1}
            </div>
            
            {/* Title */}
            <h3 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
              {dua.title}
            </h3>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Settings Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className="w-8 h-8 p-0 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/20"
            >
              <Settings className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
            </Button>
            
            {/* Copy Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={copyArabicText}
              className="w-8 h-8 p-0 rounded-full hover:bg-green-100 dark:hover:bg-green-900/20"
            >
              {isCopied ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
              )}
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        {targetCount > 1 && (
          <div className="mb-4">
            <DuaProgressBar 
              current={currentCount} 
              target={targetCount}
              className="mb-3"
            />
          </div>
        )}
        
        {/* Counter Controls */}
        <div className="flex items-center justify-center gap-4 mb-4 p-3 rounded-lg" style={{
          backgroundColor: 'var(--color-background-secondary)',
          border: '2px solid',
          borderColor: isDuaCompleted ? 'var(--color-success, #10b981)' : 'var(--color-border)'
        }}>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDecrement}
            disabled={currentCount === 0}
            className="w-10 h-10 rounded-full p-0"
          >
            <Minus className="w-4 h-4" />
          </Button>
          
          <div className="text-center min-w-[120px]">
            <div className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
              {currentCount} / {targetCount}
            </div>
            <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              {isDuaCompleted ? '✅ Завершено!' : 'Нажмите + для подсчета'}
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleIncrement}
            disabled={isDuaCompleted}
            className={`w-10 h-10 rounded-full p-0 ${!isDuaCompleted ? 'animate-pulse' : ''}`}
            style={{
              backgroundColor: !isDuaCompleted ? 'var(--color-primary)' : undefined,
              borderColor: !isDuaCompleted ? 'var(--color-primary)' : undefined,
              color: !isDuaCompleted ? 'white' : undefined
            }}
          >
            <Plus className="w-4 h-4" />
          </Button>
          
          {currentCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="w-8 h-8 rounded-full p-0"
              title="Сбросить счетчик"
            >
              <RotateCcw className="w-3 h-3" />
            </Button>
          )}
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mb-6 p-4 rounded-xl border animate-in slide-in-from-top-2 duration-300" style={{
            backgroundColor: 'var(--color-background)',
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

        {/* Arabic Text */}
        <div className="text-center mb-6">
          <p className="text-2xl md:text-3xl leading-relaxed mb-4 font-arabic" 
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
            className="gap-2"
          >
            <Copy className="w-4 h-4" />
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
              className="gap-1 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Heart className="w-3 h-3" />
              <span className="text-xs">Сохранить</span>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Completion Notification */}
      <CompletionNotification
        isVisible={showNotification}
        message={notificationMessage}
        type="dua"
        onClose={handleCloseNotification}
        duration={3000}
      />
    </div>
  );
}