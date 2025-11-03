"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronUp,
  Search,
  Maximize2,
  Minimize2,
  ArrowUp,
  BookOpen,
  Loader2,
  Navigation,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import QuranPage from "./QuranPage";
import { MUSHAF_CONFIG } from "@/lib/mushafTypes";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from "next-themes";
import { useQuranStore } from "@/lib/store";
import { useColorTheme } from "@/lib/useColorTheme";

interface QuranInfiniteScrollProps {
  initialPage?: number;
  className?: string;
}

// Константы для оптимизации
const PAGES_PER_BLOCK = 15; // Загружаем по 15 страниц за раз
const PRELOAD_BLOCKS = 2; // Предзагружаем 2 блока вперед
const VISIBLE_BUFFER = 3; // Буфер видимых страниц

// Быстрый скелетон
const FastSkeleton = () => (
  <div className="animate-pulse bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-lg shadow-lg w-full max-w-[500px] h-[600px] mx-auto">
    <div className="p-8 space-y-6 h-full relative">
      <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-2/3 mx-auto"></div>
      {Array.from({ length: 15 }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-3 bg-gray-300 dark:bg-gray-600 rounded",
            i % 4 === 0
              ? "w-5/6"
              : i % 4 === 1
              ? "w-full"
              : i % 4 === 2
              ? "w-4/5"
              : "w-3/4",
            "mx-auto"
          )}
        ></div>
      ))}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mx-auto"></div>
      </div>
    </div>
  </div>
);

// Улучшенная форма поиска
const FastPageJump = ({
  onJumpToPage,
  currentPage,
  totalPages,
}: {
  onJumpToPage: (page: number) => void;
  currentPage: number;
  totalPages: number;
}) => {
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isJumping, setIsJumping] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(inputValue);

    if (pageNum >= 1 && pageNum <= totalPages && !isJumping) {
      setIsJumping(true);
      setIsOpen(false);

      // Принудительно переходим к странице
      await onJumpToPage(pageNum);

      setTimeout(() => {
        setIsJumping(false);
        setInputValue("");
      }, 1500);
    }
  };

  // Быстрые переходы к важным страницам
  const quickPages = [
    { page: 1, label: "Начало" },
    { page: 22, label: "2-й Джуз" },
    { page: 62, label: "4-й Джуз" },
    { page: 102, label: "6-й Джуз" },
    { page: 142, label: "8-й Джуз" },
    { page: 182, label: "10-й Джуз" },
    { page: 302, label: "16-й Джуз" },
    { page: 502, label: "26-й Джуз" },
    { page: 582, label: "30-й Джуз" },
  ];

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isJumping}
        className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm border border-white/20"
        title="Быстрый переход"
      >
        <Search className="w-4 h-4 " />
        <Navigation className="w-4 h-4 "/>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-full mt-2 left-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl p-6 min-w-[320px] z-50"
          >
            <div className="space-y-4">
              <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                Быстрый переход 🚀
              </h3>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Страница (1-{totalPages})
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={totalPages}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Введите номер..."
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-base focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                    autoFocus
                  />
                </div>
                <Button
                  type="submit"
                  size="sm"
                  className="w-full bg-[var(--color-primary)]"
                  disabled={!inputValue}
                >
                  Перейти к странице
                </Button>
              </form>
              <div className="text-xs text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-200 dark:border-gray-600 text-center">
                Сейчас: страница{" "}
                <span className="font-bold text-primary">{currentPage}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Управление блоками страниц
class PageBlockManager {
  private loadedBlocks = new Set<number>();
  private loadingBlocks = new Set<number>();
  private pages = new Map<number, boolean>();

  getBlockNumber(pageNumber: number): number {
    return Math.ceil(pageNumber / PAGES_PER_BLOCK);
  }

  getBlockPages(blockNumber: number): number[] {
    const startPage = (blockNumber - 1) * PAGES_PER_BLOCK + 1;
    const endPage = Math.min(
      startPage + PAGES_PER_BLOCK - 1,
      MUSHAF_CONFIG.TOTAL_PAGES
    );
    return Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage + i
    );
  }

  isBlockLoaded(blockNumber: number): boolean {
    return this.loadedBlocks.has(blockNumber);
  }

  isBlockLoading(blockNumber: number): boolean {
    return this.loadingBlocks.has(blockNumber);
  }

  isPageLoaded(pageNumber: number): boolean {
    return this.pages.has(pageNumber) && this.pages.get(pageNumber) === true;
  }

  markBlockAsLoading(blockNumber: number): void {
    this.loadingBlocks.add(blockNumber);
  }

  markBlockAsLoaded(blockNumber: number): void {
    this.loadingBlocks.delete(blockNumber);
    this.loadedBlocks.add(blockNumber);

    // Отмечаем все страницы блока как загруженные
    const pages = this.getBlockPages(blockNumber);
    pages.forEach((page) => this.pages.set(page, true));
  }

  getLoadedPages(): number[] {
    return Array.from(this.pages.keys()).filter(
      (page) => this.pages.get(page) === true
    );
  }

  reset(): void {
    this.loadedBlocks.clear();
    this.loadingBlocks.clear();
    this.pages.clear();
  }
}

// Local storage helper
const STORAGE_KEY = "quran-last-page";

const saveLastPage = (page: number) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, page.toString());
  }
};

const getLastPage = (): number => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? parseInt(saved) : 1;
  }
  return 1;
};

export default function QuranInfiniteScroll({
  initialPage,
  className,
}: QuranInfiniteScrollProps) {
  const { locale, t } = useLocale();
  const { theme } = useTheme();
  const { siteColorTheme } = useQuranStore();
  const { applyCurrentColors } = useColorTheme();

  const startPage = initialPage || getLastPage();

  // State
  const [currentPage, setCurrentPage] = useState(startPage);
  const [isMobile, setIsMobile] = useState(false);
  const [isImmersiveMode, setIsImmersiveMode] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [isJumping, setIsJumping] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const blockManager = useRef(new PageBlockManager());

  // State для блоков
  const [loadedPages, setLoadedPages] = useState<Set<number>>(new Set());
  const [loadingBlocks, setLoadingBlocks] = useState<Set<number>>(new Set());

  // Определяем текущую тему
  const getCurrentTheme = () => {
    if (theme === "system") {
      return typeof window !== "undefined" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return theme || "light";
  };

  // Стили контейнера
  const getContainerStyles = () => {
    const currentTheme = getCurrentTheme();
    const isDark = currentTheme === "dark";

    if (isDark) {
      let darkColors;
      switch (siteColorTheme) {
        case "blue":
          darkColors = { bg: "#0f1629", text: "#e2e8f0", accent: "#60a5fa" };
          break;
        case "green":
          darkColors = { bg: "#0a1f14", text: "#e2f5e2", accent: "#34d399" };
          break;
        case "purple":
          darkColors = { bg: "#1a0d2e", text: "#f0e6ff", accent: "#a78bfa" };
          break;
        case "amber":
          darkColors = { bg: "#1f1611", text: "#fef3c7", accent: "#fbbf24" };
          break;
        case "pink":
          darkColors = { bg: "#1f0b19", text: "#fce7f3", accent: "#f472b6" };
          break;
        case "sepia":
          darkColors = { bg: "#1c140a", text: "#f5e6d3", accent: "#d2b48c" };
          break;
        default:
          darkColors = { bg: "#064e3b", text: "#d1fae5", accent: "#34d399" };
      }
      return {
        backgroundColor: darkColors.bg,
        color: darkColors.text,
        "--mushaf-bg": darkColors.bg,
        "--mushaf-text": darkColors.text,
        "--mushaf-accent": darkColors.accent,
      } as React.CSSProperties;
    } else {
      let lightColors;
      switch (siteColorTheme) {
        case "sepia":
          lightColors = { bg: "#f8f0e0", text: "#4a4a4a", accent: "#8b4513" };
          break;
        case "blue":
          lightColors = { bg: "#f0f9ff", text: "#1e3a8a", accent: "#3b82f6" };
          break;
        case "purple":
          lightColors = { bg: "#faf5ff", text: "#581c87", accent: "#8b5cf6" };
          break;
        default:
          lightColors = { bg: "#f0fdf4", text: "#1a202c", accent: "#10b981" };
      }
      return {
        backgroundColor: lightColors.bg,
        color: lightColors.text,
        "--mushaf-bg": lightColors.bg,
        "--mushaf-text": lightColors.text,
        "--mushaf-accent": lightColors.accent,
      } as React.CSSProperties;
    }
  };

  // Быстрая загрузка блока
  const loadBlock = useCallback(async (blockNumber: number) => {
    if (
      blockManager.current.isBlockLoaded(blockNumber) ||
      blockManager.current.isBlockLoading(blockNumber)
    ) {
      return;
    }

    blockManager.current.markBlockAsLoading(blockNumber);
    setLoadingBlocks((prev) => new Set([...prev, blockNumber]));

    // Симуляция быстрой загрузки
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        blockManager.current.markBlockAsLoaded(blockNumber);
        const newLoadedPages = blockManager.current.getLoadedPages();

        setLoadedPages(new Set(newLoadedPages));
        setLoadingBlocks((prev) => {
          const newSet = new Set(prev);
          newSet.delete(blockNumber);
          return newSet;
        });

        resolve();
      }, 400 + Math.random() * 200); // 400-600ms быстрая загрузка
    });
  }, []);

  // Предзагрузка соседних блоков
  const preloadNearbyBlocks = useCallback(
    (currentPageNum: number) => {
      const currentBlock = blockManager.current.getBlockNumber(currentPageNum);

      // Загружаем текущий и несколько следующих блоков
      for (let i = 0; i <= PRELOAD_BLOCKS; i++) {
        const blockToLoad = currentBlock + i;
        const maxBlock = Math.ceil(MUSHAF_CONFIG.TOTAL_PAGES / PAGES_PER_BLOCK);

        if (blockToLoad <= maxBlock) {
          loadBlock(blockToLoad);
        }
      }
    },
    [loadBlock]
  );

  // Улучшенный переход к странице
  const jumpToPage = useCallback(
    async (pageNumber: number) => {
      if (pageNumber < 1 || pageNumber > MUSHAF_CONFIG.TOTAL_PAGES || isJumping)
        return;

      setIsJumping(true);

      try {
        // Загружаем блок с нужной страницей
        const targetBlock = blockManager.current.getBlockNumber(pageNumber);
        await loadBlock(targetBlock);

        // Предзагружаем соседние блоки
        preloadNearbyBlocks(pageNumber);

        // Ждем короткую паузу для загрузки
        await new Promise((resolve) => setTimeout(resolve, 200));

        // Прокручиваем к странице
        setTimeout(() => {
          const pageElement = pageRefs.current.get(pageNumber);
          if (pageElement) {
            const offset = window.innerHeight * 0.15;
            const elementTop = pageElement.offsetTop - offset;

            window.scrollTo({
              top: elementTop,
              behavior: "smooth",
            });

            setCurrentPage(pageNumber);
          }
          setIsJumping(false);
        }, 100);
      } catch (error) {
        console.error("Error jumping to page:", error);
        setIsJumping(false);
      }
    },
    [isJumping, loadBlock, preloadNearbyBlocks]
  );

  // Intersection Observer
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const pageNumber = parseInt(
              entry.target.getAttribute("data-page") || "1"
            );
            setCurrentPage(pageNumber);
            preloadNearbyBlocks(pageNumber);
          }
        });
      },
      {
        threshold: 0.3,
        rootMargin: "100px 0px 500px 0px",
      }
    );

    return () => observerRef.current?.disconnect();
  }, [preloadNearbyBlocks]);

  // Обработка скролла
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setShowScrollToTop(scrollY > 800);

      // Автозагрузка при приближении к концу
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      if (scrollY + windowHeight > documentHeight - 1500) {
        const currentBlock = blockManager.current.getBlockNumber(currentPage);
        const nextBlocks = [currentBlock + 1, currentBlock + 2];

        nextBlocks.forEach((block) => {
          const maxBlock = Math.ceil(
            MUSHAF_CONFIG.TOTAL_PAGES / PAGES_PER_BLOCK
          );
          if (block <= maxBlock) {
            loadBlock(block);
          }
        });
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [currentPage, loadBlock]);

  // Определение мобильного устройства
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= MUSHAF_CONFIG.BREAKPOINTS.MOBILE);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Инициальная загрузка
  useEffect(() => {
    const initialBlock = blockManager.current.getBlockNumber(startPage);
    loadBlock(initialBlock).then(() => {
      preloadNearbyBlocks(startPage);
    });
  }, [startPage, loadBlock, preloadNearbyBlocks]);

  // Применение тем
  useEffect(() => {
    applyCurrentColors();
  }, [theme, siteColorTheme, applyCurrentColors]);

  // Сохранение позиции
  useEffect(() => {
    saveLastPage(currentPage);
  }, [currentPage]);

  // Динамические отступы (упрощенные)
  const getPageSpacing = () => {
    return "space-y-8"; // Фиксированные отступы
  };

  // Генерация страниц для отображения
  const generatePagesToShow = () => {
    const allPages: { page: number; isLoading: boolean }[] = [];

    // Добавляем загруженные страницы
    Array.from(loadedPages)
      .sort((a, b) => a - b)
      .forEach((page) => {
        allPages.push({ page, isLoading: false });
      });

    // Добавляем загружающиеся блоки
    Array.from(loadingBlocks).forEach((blockNum) => {
      const blockPages = blockManager.current.getBlockPages(blockNum);
      blockPages.forEach((page) => {
        if (!loadedPages.has(page)) {
          allPages.push({ page, isLoading: true });
        }
      });
    });

    return allPages.sort((a, b) => a.page - b.page);
  };

  const pagesToShow = generatePagesToShow();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div
      ref={containerRef}
      className={cn("mushaf-container min-h-screen w-full", className)}
      style={getContainerStyles()}
      data-theme={getCurrentTheme()}
      data-color-theme={siteColorTheme}
    >
      {/* Верхняя панель управления */}
      <AnimatePresence>
        {!isImmersiveMode && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="sticky top-0 z-30 bg-black/5 backdrop-blur-md border-b border-white/10"
          >
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-2">
                <FastPageJump
                  onJumpToPage={jumpToPage}
                  currentPage={currentPage}
                  totalPages={MUSHAF_CONFIG.TOTAL_PAGES}
                />
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsImmersiveMode(true)}
                  className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm border border-white/20"
                  title="Режим чтения"
                >
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Кнопка выхода из иммерсивного режима - теперь всегда видна */}
      <AnimatePresence>
        {isImmersiveMode && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsImmersiveMode(false)}
            className="fixed top-4 right-4 z-[9999] p-3 bg-black/70 hover:bg-black/90 text-white rounded-full shadow-2xl border-2 border-white/20 backdrop-blur-sm"
            style={{
              position: "fixed",
              top: "16px",
              right: "16px",
              zIndex: 9999,
            }}
          >
            <Minimize2 className="w-6 h-6" />
            <span className="sr-only">Выйти из полноэкранного режима</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Основной контент - фиксированный размер */}
      <div className={cn("py-6", getPageSpacing())}>
        {pagesToShow.map(({ page: pageNumber, isLoading }, index) => {
          const scale = MUSHAF_CONFIG.DEFAULT_PAGE_SCALE; // Используем фиксированный размер

          return (
            <motion.div
              key={pageNumber}
              data-page={pageNumber}
              ref={(el) => {
                if (el) {
                  pageRefs.current.set(pageNumber, el);
                  if (observerRef.current) {
                    observerRef.current.observe(el);
                  }
                }
              }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.02 }}
              className="flex justify-center px-4"
              style={{
                transform: `scale(${scale})`,
                transformOrigin: "center center",
                transition: "transform 0.3s ease-out",
              }}
            >
              {isLoading ? (
                <FastSkeleton />
              ) : (
                <QuranPage
                  pageNumber={pageNumber}
                  side="single"
                  isActive={pageNumber === currentPage}
                  zoomState={{
                    level: 1,
                    minZoom: 1,
                    maxZoom: 3,
                    zoomLevels: [1, 1.5, 2, 3],
                    position: { x: 0, y: 0 },
                    isZooming: false,
                  }}
                  onZoomChange={() => {}}
                  priority={pageNumber <= startPage + 5}
                />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Индикатор загрузки */}
      <AnimatePresence>
        {(isJumping || loadingBlocks.size > 0) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-black/80 text-white rounded-xl p-4 backdrop-blur-sm"
          >
            <div className="flex items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="font-medium">
                {isJumping
                  ? `Переход к странице ${currentPage}...`
                  : "Загрузка страниц..."}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Кнопка "Наверх" */}
      <AnimatePresence>
        {showScrollToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-40 p-3 bg-primary text-primary-foreground rounded-full shadow-xl hover:bg-primary/90 transition-colors hover:scale-110"
            title="Наверх"
          >
            <ArrowUp className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Продвинутый индикатор страницы */}
      <motion.div
        className="fixed bottom-4 left-4 z-40 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-bold backdrop-blur-sm border border-white/20 shadow-xl"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 0.3, times: [0, 0.5, 1] }}
        key={currentPage}
      >
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          <span>
            {currentPage} / {MUSHAF_CONFIG.TOTAL_PAGES}
          </span>
          <div className="w-16 h-1 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{
                width: `${(currentPage / MUSHAF_CONFIG.TOTAL_PAGES) * 100}%`,
              }}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
