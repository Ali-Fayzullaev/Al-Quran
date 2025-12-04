// components/faq/FAQCard.tsx
"use client";

import React, { useState } from "react";
import { useLocale } from "@/context/LocaleContext";
import type { FAQItem } from "@/types/faq";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Share,
  Bookmark,
  Tag,
  BookOpen,
} from "lucide-react";

interface FAQCardProps {
  faqItem: FAQItem;
  onTagClick?: (tag: string) => void;
  onToggleBookmark?: (id: number) => void;
  isBookmarked?: boolean;
}

export default function FAQCard({
  faqItem,
  onTagClick,
  onToggleBookmark,
  isBookmarked = false,
}: FAQCardProps) {
  const { t } = useLocale();
  const [isExpanded, setIsExpanded] = useState(false);
  const [copySuccess, setCopySuccess] = useState<"question" | "answer" | null>(
    null
  );

  const handleCopy = async (text: string, type: "question" | "answer") => {
    try {
      // Проверяем доступность Clipboard API
      if (!navigator.clipboard) {
        throw new Error("Clipboard API not available");
      }

      await navigator.clipboard.writeText(text);
      setCopySuccess(type);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);

      // Fallback метод для старых браузеров
      try {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        if (document.execCommand("copy")) {
          setCopySuccess(type);
          setTimeout(() => setCopySuccess(null), 2000);
        }

        document.body.removeChild(textArea);
      } catch (fallbackErr) {
        console.error("Fallback copy also failed:", fallbackErr);
      }
    }
  };

  const handleShare = async () => {
    try {
      const shareText = `${faqItem.question}\n\n${faqItem.short_answer}\n\n${window.location.href}#faq-${locale}-${faqItem.id}`;

      if (navigator.share) {
        await navigator.share({
          title: faqItem.question,
          text: shareText,
        });
      } else {
        // Fallback to copying text
        await handleCopy(shareText, "question");
      }
    } catch (err) {
      console.error("Failed to share:", err);
      // Fallback - try copying just the question
      await handleCopy(faqItem.question, "question");
    }
  };

  const { locale } = useLocale();

  return (
    <div
      id={`faq-${locale}-${faqItem.id}`}
      className="rounded border shadow-sm hover:shadow-md transition-shadow"
      style={{
        backgroundColor: "var(--color-background-secondary)",
        borderColor: "var(--color-border)",
      }}
    >
      {/* Question Header */}
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-start gap-3 mb-3">
              <div
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                {faqItem.id}
              </div>
              <h3
                className="text-base sm:text-lg font-semibold leading-relaxed"
                style={{ color: "var(--color-text)" }}
              >
                {faqItem.question}
              </h3>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 flex-shrink-0 justify-end sm:justify-start">
            <button
              onClick={() => handleCopy(faqItem.question, "question")}
              className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              style={{
                backgroundColor:
                  copySuccess === "question" ? "#dcfce7" : "transparent",
                borderColor:
                  copySuccess === "question" ? "#16a34a" : "transparent",
                border: copySuccess === "question" ? "1px solid" : "none",
              }}
              title={
                copySuccess === "question"
                  ? "Вопрос скопирован!"
                  : t("faqSection.copyQuestion")
              }
            >
              <Copy
                size={16}
                style={{
                  color:
                    copySuccess === "question"
                      ? "#16a34a"
                      : "var(--color-primary)",
                }}
              />
            </button>

            <button
              onClick={handleShare}
              className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={t("faqSection.shareQuestion")}
            >
              <Share size={16} style={{ color: "var(--color-primary)" }} />
            </button>

            <button
              onClick={() => onToggleBookmark?.(faqItem.id)}
              className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={
                isBookmarked
                  ? t("bookmarksSection.removeBookmark")
                  : t("faqSection.bookmarkQuestion")
              }
            >
              <Bookmark
                size={16}
                style={{
                  color: "var(--color-primary)",
                  fill: isBookmarked ? "var(--color-primary)" : "none",
                }}
              />
            </button>
          </div>
        </div>

        {/* Tags */}
        {faqItem.tags && faqItem.tags.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <Tag size={14} className="text-gray-500" />
            <div className="flex flex-wrap gap-1">
              {faqItem.tags.map((tag, index) => (
                <button
                  key={index}
                  onClick={() => onTagClick?.(tag)}
                  className="px-3 py-1 text-xs rounded border transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                  style={{
                    backgroundColor: "var(--color-background)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-text-secondary)",
                  }}
                  title={`Поиск по тегу: ${tag}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Short Answer */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen size={16} style={{ color: "var(--color-primary)" }} />
            <span className="text-sm font-medium text-gray-600">
              {t("faqSection.shortAnswer")}:
            </span>
          </div>
          <p className="leading-relaxed text-sm sm:text-base">
            {faqItem.short_answer}
          </p>
        </div>

        {/* Toggle Full Answer Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full sm:w-auto flex items-center justify-center sm:justify-start gap-2 px-4 py-2 rounded border transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium"
          style={{
            backgroundColor: "var(--color-background)",
            borderColor: "var(--color-border)",
            color: "var(--color-primary)",
          }}
        >
          {isExpanded ? (
            <>
              <ChevronUp size={16} />
              <span className="hidden sm:inline">
                {t("faqSection.hideFullAnswer")}
              </span>
              <span className="sm:hidden">Скрыть</span>
            </>
          ) : (
            <>
              <ChevronDown size={16} />
              <span className="hidden sm:inline">
                {t("faqSection.showFullAnswer")}
              </span>
              <span className="sm:hidden">Подробнее</span>
            </>
          )}
        </button>
      </div>

      {/* Expanded Full Answer */}
      {isExpanded && (
        <div
          className="px-4 sm:px-6 pb-4 sm:pb-6 border-t"
          style={{ borderTopColor: "var(--color-border)" }}
        >
          <div className="pt-4">
            <div className="flex flex-col gap-3 mb-4">
              <div className="flex items-center gap-2">
                <BookOpen size={16} style={{ color: "var(--color-primary)" }} />
                <span className="text-sm font-medium text-gray-600">
                  {t("faqSection.fullAnswer")}:
                </span>
              </div>

              <button
                onClick={() => handleCopy(faqItem.answer, "answer")}
                className="flex items-center justify-center gap-2 px-3 py-2 text-sm rounded border transition-all hover:shadow-sm w-full sm:w-auto sm:self-start hover:bg-gray-50 dark:hover:bg-gray-800"
                style={{
                  backgroundColor:
                    copySuccess === "answer"
                      ? "#dcfce7"
                      : "var(--color-background)",
                  borderColor:
                    copySuccess === "answer"
                      ? "#16a34a"
                      : "var(--color-border)",
                  color:
                    copySuccess === "answer"
                      ? "#16a34a"
                      : "var(--color-primary)",
                }}
              >
                <Copy size={14} />
                <span>
                  {copySuccess === "answer"
                    ? "✓"
                    : t("faqSection.copyAnswer")}
                </span>
              </button>
            </div>

            <div className="prose max-w-none">
              <p className="leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
                {faqItem.answer}
              </p>
            </div>

            {/* Source */}
            {faqItem.source && (
              <div
                className="mt-4 pt-3 border-t"
                style={{ borderTopColor: "var(--color-border)" }}
              >
                <div className="flex flex-col gap-1 text-sm text-gray-600">
                  <span className="font-medium">{t("faqSection.source")}:</span>
                  <span className="italic text-xs sm:text-sm">
                    {faqItem.source}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
