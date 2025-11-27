// src/components/dua-dhikr/DuaCard.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import DuaProgressBar from "./DuaProgressBar";
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
  Check,
} from "lucide-react";
import {
  extractCountFromNotes,
  createDuaId,
  getProgressMessage,
} from "@/lib/duaCounter";
import { isDuaSaved, toggleDuaSaved, type SavedDua } from "@/lib/duaBookmarks";
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

interface GlobalSettings {
  transliteration: boolean;
  notes: boolean;
  benefits: boolean;
  source: boolean;
  fontSize: "small" | "medium" | "large" | "xlarge";
}

interface DuaCardProps {
  dua: DuaData;
  index: number;
  onComplete?: (duaId: string) => void;
  isCompleted?: boolean;
  category?: string;
  globalSettings?: GlobalSettings;
}

export default function DuaCard({
  dua,
  index,
  onComplete,
  isCompleted = false,
  category = "unknown",
  globalSettings,
}: DuaCardProps) {
  const { locale, t } = useLocale();

  // Инициализируем состояния на основе глобальных настроек
  const [showTransliteration, setShowTransliteration] = useState(
    globalSettings?.transliteration ?? false
  );
  const [showNotes, setShowNotes] = useState(globalSettings?.notes ?? true);
  const [showBenefits, setShowBenefits] = useState(
    globalSettings?.benefits ?? false
  );
  const [showSource, setShowSource] = useState(globalSettings?.source ?? false);
  const [showSettings, setShowSettings] = useState(false);

  // Определяем размеры шрифта на основе глобальных настроек
  const getFontSizes = () => {
    const fontSize = globalSettings?.fontSize ?? "medium";
    switch (fontSize) {
      case "small":
        return {
          title: "text-lg md:text-xl",
          arabic: "text-xl md:text-2xl",
          latin: "text-sm md:text-base",
          translation: "text-sm md:text-base",
          meta: "text-xs md:text-sm",
        };
      case "large":
        return {
          title: "text-2xl md:text-3xl",
          arabic: "text-3xl md:text-4xl",
          latin: "text-lg md:text-xl",
          translation: "text-lg md:text-xl",
          meta: "text-base md:text-lg",
        };
      case "xlarge":
        return {
          title: "text-3xl md:text-4xl",
          arabic: "text-4xl md:text-5xl",
          latin: "text-xl md:text-2xl",
          translation: "text-xl md:text-2xl",
          meta: "text-lg md:text-xl",
        };
      default: // medium
        return {
          title: "text-xl md:text-2xl",
          arabic: "text-2xl md:text-3xl",
          latin: "text-base md:text-lg",
          translation: "text-base md:text-lg",
          meta: "text-sm md:text-base",
        };
    }
  };

  const fontSizes = getFontSizes();

  // Обновляем локальные настройки при изменении глобальных
  useEffect(() => {
    if (globalSettings) {
      setShowTransliteration(globalSettings.transliteration);
      setShowNotes(globalSettings.notes);
      setShowBenefits(globalSettings.benefits);
      setShowSource(globalSettings.source);
    }
  }, [globalSettings]);

  // Состояние для сохранения дуа
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Counter state
  const duaId = createDuaId(dua.title, dua.arabic);
  const targetCount = extractCountFromNotes(dua.notes);
  const [currentCount, setCurrentCount] = useState(0);
  const [isHidden, setIsHidden] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const progress = Math.min(
    Math.round((currentCount / targetCount) * 100),
    100
  );
  const isDuaCompleted = currentCount >= targetCount;

  // Effect for auto-hiding completed duas
  useEffect(() => {
    if (isDuaCompleted && !isCompleted) {
      const timer = setTimeout(() => {
        setIsHidden(true);
        onComplete?.(duaId);
      }, 2000); // Показываем завершение 2 секунды перед скрытием

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
      const progressMsg = getProgressMessage(
        Math.round((newCount / targetCount) * 100)
      );
      if (progressMsg) {
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

  const handleSaveDua = async () => {
    if (isSaving) return;

    setIsSaving(true);

    try {
      const savedDua: Omit<SavedDua, "createdAt"> = {
        id: duaId,
        title: dua.title,
        arabic: dua.arabic,
        translation: dua.translation,
        latin: dua.latin,
        notes: dua.notes,
        benefits: dua.benefits || dua.fawaid,
        source: dua.source,
        category: category,
      };

      const newSavedState = toggleDuaSaved(savedDua);
      setIsSaved(newSavedState);

      // Небольшая задержка для анимации
      setTimeout(() => setIsSaving(false), 300);
    } catch (error) {
      console.error("Ошибка при сохранении дуа:", error);
      setIsSaving(false);
    }
  };

  // Don't render if hidden
  if (isHidden) {
    return null;
  }

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden transition-all duration-300",
        "rounded-2xl shadow-sm border",
        isDuaCompleted && !isHidden ? "border-green-400" : "hover:shadow-md",
        isHidden
          ? "opacity-0 scale-95 pointer-events-none"
          : "opacity-100 scale-100"
      )}
      style={{
        backgroundColor: isDuaCompleted
          ? "rgba(16, 185, 129, 0.1)"
          : "var(--color-background-secondary)",
        borderColor: isDuaCompleted
          ? "var(--color-success, #10b981)"
          : "var(--color-border)",
        borderWidth: "1px",
      }}
    >
      {/* Completion Badge with Animation */}
{isDuaCompleted && (
  <div className="absolute top-4 right-4 z-10">
    <div className="bg-green-500 text-white px-3 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg celebration-badge">
      <Check className="w-4 h-4" />
      🎉 Завершено!
    </div>
  </div>
)}

      {/* Celebration Overlay */}
      {isDuaCompleted && !isHidden && (
        <div className="absolute inset-0 pointer-events-none z-50">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="text-6xl slow-ping">🎉</div>
          </div>
          <div className="absolute top-1/4 right-1/4 transform -translate-x-1/2 -translate-y-1/2">
            <div className="text-4xl gentle-bounce-1">✨</div>
          </div>
          <div className="absolute bottom-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2">
            <div className="text-4xl gentle-bounce-2">🌟</div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="p-5 md:p-8 space-y-6">
        {/* Header with Number and Title */}
        <div className="flex items-start gap-4">
          <div
            className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-lg md:text-xl font-bold text-white flex-shrink-0 shadow-sm"
            style={{
              backgroundColor: isDuaCompleted
                ? "#10b981"
                : "var(--color-primary)",
            }}
          >
            {isDuaCompleted ? "✓" : index + 1}
          </div>

          <div className="flex-1 min-w-0 pt-1">
            <h2
              className={cn(fontSizes.title, "font-bold leading-tight mb-2")}
              style={{ color: "var(--color-text)" }}
            >
              {dua.title}
            </h2>
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

        {/* Counter Controls - Always Visible for Reading Count */}
        <div
          className="rounded-2xl p-4 md:p-5 border mb-6"
          style={{
            backgroundColor: "var(--color-background)",
            borderColor: "var(--color-border)",
          }}
        >
          <div className="flex items-center justify-between">
            {/* Decrement Button */}
            <Button
              variant="outline"
              size="lg"
              onClick={handleDecrement}
              disabled={currentCount === 0}
              className="w-14 h-14 md:w-16 md:h-16 rounded-full p-0 border-2 hover:scale-110 transition-all duration-200 disabled:opacity-30"
              style={{
                borderColor: "var(--color-border)",
                color:
                  currentCount === 0
                    ? "var(--color-text-secondary)"
                    : "var(--color-primary)",
              }}
            >
              <Minus className="w-6 h-6 md:w-7 md:h-7" />
            </Button>

            {/* Counter Display */}
            <div className="flex-1 text-center px-4">
              <div
                className="text-4xl md:text-5xl font-bold mb-1"
                style={{ color: "var(--color-primary)" }}
              >
                {currentCount}
              </div>
              <div className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-1">
                {targetCount > 1 ? `из ${targetCount}` : "прочтений"}
              </div>
              {targetCount > 1 && (
                <div className="text-xs text-gray-500">
                  {isDuaCompleted
                    ? "🎉 Завершено!"
                    : `${Math.round((currentCount / targetCount) * 100)}%`}
                </div>
              )}
            </div>

            {/* Increment Button */}
            <Button
              size="lg"
              onClick={handleIncrement}
              disabled={targetCount > 1 && isDuaCompleted}
              className="w-14 h-14 md:w-16 md:h-16 rounded-full p-0 hover:scale-110 transition-all duration-200 text-white disabled:opacity-30 shadow-lg border-2"
              style={{
                backgroundColor:
                  targetCount > 1 && isDuaCompleted
                    ? "var(--color-text-secondary)"
                    : "var(--color-primary)",
                borderColor:
                  targetCount > 1 && isDuaCompleted
                    ? "var(--color-text-secondary)"
                    : "var(--color-primary)",
              }}
            >
              <Plus className="w-6 h-6 md:w-7 md:h-7" />
            </Button>
          </div>

          {/* Reset Button and Progress Info */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-xs text-gray-500 flex items-center gap-2">
              {isDuaCompleted ? (
                <>
                  🎉 <span>Дуа завершена! Машаллах!</span>
                </>
              ) : (
                <>
                  📖 <span>Нажимайте + после каждого прочтения</span>
                </>
              )}
            </div>{" "}
            {currentCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900/20 rounded-full px-3 py-1 text-xs"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Сбросить
              </Button>
            )}
          </div>
        </div>

        {/* Arabic Text - Enhanced for Mobile Reading */}
        <div
          className="rounded-2xl p-6 md:p-8 border text-center"
          style={{
            backgroundColor: "var(--color-background)",
            borderColor: "var(--color-border)",
          }}
        >
          <p
            className={cn(
              fontSizes.arabic,
              "leading-loose md:leading-relaxed font-medium"
            )}
            style={{
              color: "var(--color-primary)",
              direction: "rtl",
              fontFamily: "Arabic, Amiri, serif",
              lineHeight: "2.2",
              textShadow: "0 1px 2px rgba(0,0,0,0.05)",
            }}
          >
            {dua.arabic}
          </p>
        </div>

        {/* Transliteration (conditional) */}
        {showTransliteration && dua.latin && (
          <div
            className="rounded-2xl p-5 md:p-6 border animate-in slide-in-from-bottom-2 duration-300"
            style={{
              backgroundColor: "var(--color-background)",
              borderColor: "var(--color-border)",
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <h3 className="text-lg font-semibold text-amber-700 dark:text-amber-300">
                Транслитерация
              </h3>
            </div>
            <p
              className={cn(fontSizes.latin, "italic leading-relaxed")}
              style={{ color: "var(--color-text-secondary)" }}
            >
              {dua.latin}
            </p>
          </div>
        )}

        {/* Translation - Enhanced */}
        <div
          className="rounded-2xl p-5 md:p-6 border shadow-sm"
          style={{
            backgroundColor: "var(--color-background)",
            borderColor: "var(--color-border)",
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
              style={{
                backgroundColor: "var(--color-primary)",
              }}
            >
              РУ
            </div>
            <h3
              className="text-lg font-semibold"
              style={{ color: "var(--color-primary)" }}
            >
              Перевод
            </h3>
          </div>
          <p
            className={cn(fontSizes.translation, "leading-relaxed")}
            style={{ color: "var(--color-text)" }}
          >
            {dua.translation}
          </p>
        </div>

        {/* Notes (conditional) */}
        {showNotes && dua.notes && (
          <div
            className="rounded-2xl p-5 md:p-6 border animate-in slide-in-from-bottom-2 duration-300"
            style={{
              backgroundColor: "var(--color-background)",
              borderColor: "var(--color-border)",
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Quote className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              <h3 className="text-lg font-semibold text-orange-700 dark:text-orange-300">
                Заметки
              </h3>
            </div>
            <div
              className={cn(fontSizes.meta, "leading-relaxed")}
              style={{ color: "var(--color-text-secondary)" }}
            >
              {dua.notes}
            </div>
          </div>
        )}

        {/* Benefits (conditional) */}
        {showBenefits && (dua.benefits || dua.fawaid) && (
          <div
            className="rounded-2xl p-5 md:p-6 border animate-in slide-in-from-bottom-2 duration-300"
            style={{
              backgroundColor: "var(--color-background)",
              borderColor: "var(--color-border)",
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Lightbulb className="w-5 h-5 text-green-600 dark:text-green-400" />
              <h3 className="text-lg font-semibold text-green-700 dark:text-green-300">
                Польза
              </h3>
            </div>
            <div
              className={cn(fontSizes.meta, "leading-relaxed")}
              style={{ color: "var(--color-text-secondary)" }}
            >
              {dua.benefits || dua.fawaid}
            </div>
          </div>
        )}

        {/* Source (conditional) */}
        {showSource && dua.source && (
          <div
            className="rounded-2xl p-5 md:p-6 border animate-in slide-in-from-bottom-2 duration-300"
            style={{
              backgroundColor: "var(--color-background)",
              borderColor: "var(--color-border)",
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-300">
                Источник
              </h3>
            </div>
            <div
              className={cn(fontSizes.meta, "leading-relaxed")}
              style={{ color: "var(--color-text-secondary)" }}
            >
              {dua.source}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      <div
        className="px-5 py-4 md:px-8 md:py-6 border-t"
        style={{
          backgroundColor: "var(--color-background-secondary)",
          borderColor: "var(--color-border)",
        }}
      >
        <div className="flex items-center justify-between gap-4">
          {/* Language Indicator */}
          <div className="flex items-center gap-2 text-gray-500">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-xs font-medium">Русский</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Copy Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={copyArabicText}
              className="rounded-full px-4 py-2 h-9 border-gray-300 hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all"
            >
              {isCopied ? (
                <>
                  <Check className="w-4 h-4 mr-2 text-green-600" />
                  <span className="text-green-600">Скопировано</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Копировать
                </>
              )}
            </Button>

            {/* Settings Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className="rounded-full w-9 h-9 p-0 border-gray-300 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
            >
              <Settings className="w-4 h-4" />
            </Button>

            {/* Save Button */}
            <Button
              variant={isSaved ? "default" : "outline"}
              size="sm"
              onClick={handleSaveDua}
              disabled={isSaving}
              className={cn(
                "rounded-full px-4 py-2 h-9 transition-all",
                isSaved
                  ? "bg-red-500 hover:bg-red-600 text-white border-red-500"
                  : "border-gray-300 hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              )}
            >
              <Heart
                className={cn(
                  "w-4 h-4",
                  isSaved ? "fill-current" : "",
                  isSaving && "animate-pulse"
                )}
              />
            </Button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 animate-in slide-in-from-top-2 duration-300">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3 text-center">
              Настройки отображения
            </h4>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Button
                variant={showTransliteration ? "default" : "outline"}
                size="sm"
                onClick={() => setShowTransliteration(!showTransliteration)}
                className="justify-center gap-2 h-10"
              >
                {showTransliteration ? (
                  <Eye className="w-4 h-4 text-white" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
                <span className="text-xs">Транслит</span>
              </Button>

              <Button
                variant={showNotes ? "default" : "outline"}
                size="sm"
                onClick={() => setShowNotes(!showNotes)}
                className="justify-center gap-2 h-10"
              >
                {showNotes ? (
                  <Eye className="w-4 h-4 text-white" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
                <span className="text-xs">Заметки</span>
              </Button>

              <Button
                variant={showBenefits ? "default" : "outline"}
                size="sm"
                onClick={() => setShowBenefits(!showBenefits)}
                className="justify-center gap-2 h-10"
              >
                {showBenefits ? (
                  <Eye className="w-4 h-4 text-white" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
                <span className="text-xs">Польза</span>
              </Button>

              <Button
                variant={showSource ? "default" : "outline"}
                size="sm"
                onClick={() => setShowSource(!showSource)}
                className="justify-center gap-2 h-10"
              >
                {showSource ? (
                  <Eye className="w-4 h-4 text-white" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
                <span className="text-xs">Источник</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
