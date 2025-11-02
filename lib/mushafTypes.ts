// lib/mushafTypes.ts - Типы для системы SVG страниц Корана

export interface PageInfo {
  pageNumber: number;
  imagePath: string;
  isLoaded: boolean;
  surahRanges?: SurahRange[];
  juzNumber?: number;
}

export interface SurahRange {
  surahNumber: number;
  surahName: string;
  surahNameArabic: string;
  startVerse?: number;
  endVerse?: number;
}

export interface ViewMode {
  type: 'single' | 'spread';
  zoom: number;
  position: { x: number; y: number };
}

export interface GestureState {
  isGestureActive: boolean;
  gestureType: 'swipe' | 'pinch' | 'pan' | null;
  initialDistance?: number;
  initialZoom?: number;
  startPosition?: { x: number; y: number };
}

export interface NavigationState {
  currentPage: number;
  totalPages: number;
  currentSpreadPages: [number, number] | [number];
  history: number[];
  canGoBack: boolean;
  canGoForward: boolean;
}

export interface ZoomState {
  level: number;
  minZoom: number;
  maxZoom: number;
  zoomLevels: number[];
  position: { x: number; y: number };
  isZooming: boolean;
}

export interface MushafTheme {
  id: string;
  name: string;
  nameArabic: string;
  icon: string;
  colors: {
    background: string;
    pageBackground: string;
    pageShadow: string;
    text: string;
    accent: string;
    border: string;
  };
  effects: {
    pageRadius: string;
    shadowBlur: string;
    perspective: string;
    pageGradient?: string;
  };
}

export interface ReadingProgress {
  currentPage: number;
  totalPages: number;
  percentage: number;
  lastReadTime: Date;
  readingDuration: number; // в минутах
  pagesRead: number[];
  bookmarks: number[];
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  title: string;
  titleArabic: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
}

export interface QuickJumpLandmark {
  page: number;
  type: 'surah' | 'juz' | 'bookmark' | 'special';
  label: string;
  labelArabic: string;
  surahNumber?: number;
  juzNumber?: number;
  isBookmark?: boolean;
}

export interface PageLoadingState {
  isLoading: boolean;
  loadedPages: Set<number>;
  preloadedPages: Set<number>;
  failedPages: Set<number>;
  currentLoadingPage?: number;
}

export interface TouchGesture {
  type: 'swipe' | 'pinch' | 'tap' | 'doubleTap' | 'longPress';
  direction?: 'left' | 'right' | 'up' | 'down';
  distance?: number;
  scale?: number;
  position: { x: number; y: number };
  timestamp: number;
}

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: 'nextPage' | 'prevPage' | 'firstPage' | 'lastPage' | 'zoomIn' | 'zoomOut' | 'resetZoom' | 'toggleView' | 'toggleFullscreen' | 'bookmark' | 'search' | 'exitMode';
  description: string;
}

export type PageSizeType = 'minimal' | 'small' | 'medium' | 'large' | 'maximum';

export interface PageSizeConfig {
  scale: number;
  name: string;
  nameArabic: string;
  icon: string;
}

export interface PageSizeSettings {
  currentSize: PageSizeType;
  showSizeControls: boolean;
  autoFitToScreen: boolean;
}

export interface MushafSettings {
  viewMode: 'single' | 'spread';
  theme: string;
  autoZoom: boolean;
  preloadPages: number;
  animationSpeed: 'fast' | 'normal' | 'slow';
  touchSensitivity: number;
  showPageNumbers: boolean;
  showProgress: boolean;
  enableSounds: boolean;
  keyboardShortcuts: KeyboardShortcut[];
  pageSize: PageSizeSettings;
}

export interface PageAnimation {
  type: 'fade' | 'slide' | 'flip' | 'scale';
  duration: number;
  easing: string;
  direction?: 'left' | 'right';
}

export interface SearchResult {
  pageNumber: number;
  surahNumber: number;
  verseNumber: number;
  arabicText: string;
  translationText?: string;
  highlightPosition?: { x: number; y: number; width: number; height: number };
}

// Константы для конфигурации
export const MUSHAF_CONFIG = {
  TOTAL_PAGES: 604,
  IMAGE_PATH_TEMPLATE: '/quran-png-master/{pageNumber}.png',
  PAGE_NUMBER_PADDING: 3, // для формата 001, 002, 003...
  PRELOAD_ADJACENT_PAGES: 2,
  MAX_CACHED_PAGES: 10,
  
  ZOOM_LEVELS: [1, 1.25, 1.5, 2, 2.5, 3, 4, 5],
  DEFAULT_ZOOM: 1,
  MIN_ZOOM: 1,
  MAX_ZOOM: 5,
  
  // Размеры страниц
  PAGE_SIZES: {
    small: { scale: 0.7, name: 'Маленький', nameArabic: 'صغير', icon: '📱' },
    medium: { scale: 0.9, name: 'Средний', nameArabic: 'متوسط', icon: '💻' },
    large: { scale: 1.1, name: 'Большой', nameArabic: 'كبير', icon: '🖥️' },
  },
  DEFAULT_PAGE_SIZE: 'medium' as const,
  
  ANIMATION_DURATION: {
    PAGE_TURN: 400,
    ZOOM: 300,
    FADE: 600,
    SLIDE: 500
  },
  
  BREAKPOINTS: {
    MOBILE: 768,
    TABLET: 1024,
    DESKTOP: 1200
  },
  
  TOUCH_THRESHOLDS: {
    SWIPE_MIN_DISTANCE: 50,
    TAP_MAX_DURATION: 300,
    LONG_PRESS_DURATION: 500,
    PINCH_MIN_SCALE: 0.1
  }
} as const;

export const DEFAULT_THEMES: MushafTheme[] = [
  {
    id: 'light',
    name: 'نوراني',
    nameArabic: 'النورانية',
    icon: '☀️',
    colors: {
      background: '#fefefe',
      pageBackground: '#f8f5f0',
      pageShadow: 'rgba(0,0,0,0.1)',
      text: '#2d3748',
      accent: '#2b6cb0',
      border: '#e2e8f0'
    },
    effects: {
      pageRadius: '8px',
      shadowBlur: '20px',
      perspective: '1200px',
      pageGradient: 'linear-gradient(135deg, #f8f5f0 0%, #e8dfca 100%)'
    }
  },
  {
    id: 'sepia',
    name: 'قديم',
    nameArabic: 'القديمة',
    icon: '📜',
    colors: {
      background: '#f8f0e0',
      pageBackground: '#e8dfca',
      pageShadow: 'rgba(139, 69, 19, 0.2)',
      text: '#5c4b37',
      accent: '#8b4513',
      border: '#d4af8c'
    },
    effects: {
      pageRadius: '6px',
      shadowBlur: '25px',
      perspective: '1000px',
      pageGradient: 'linear-gradient(135deg, #e8dfca 0%, #d4c4a0 100%)'
    }
  },
  {
    id: 'dark',
    name: 'ليلي',
    nameArabic: 'الليلية',
    icon: '🌙',
    colors: {
      background: '#1a202c',
      pageBackground: '#2d3748',
      pageShadow: 'rgba(0,0,0,0.4)',
      text: '#e2e8f0',
      accent: '#63b3ed',
      border: '#4a5568'
    },
    effects: {
      pageRadius: '10px',
      shadowBlur: '30px',
      perspective: '1500px',
      pageGradient: 'linear-gradient(135deg, #2d3748 0%, #1a202c 100%)'
    }
  }
];

export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-page',
    title: 'بداية الرحلة',
    titleArabic: 'بداية الرحلة المباركة',
    description: 'فتحت المصحف لأول مرة',
    icon: '📖',
    unlocked: false
  },
  {
    id: 'page-10',
    title: 'قارئ مبتدئ',
    titleArabic: 'القارئ المبتدئ',
    description: 'قرأت 10 страниц',
    icon: '🌱',
    unlocked: false
  },
  {
    id: 'page-50',
    title: 'قارئ نشط',
    titleArabic: 'القارئ النشط',
    description: 'قرأت 50 صفحة',
    icon: '🌿',
    unlocked: false
  },
  {
    id: 'juz-completed',
    title: 'حافظ الجزء',
    titleArabic: 'حافظ الجزء الكريم',
    description: 'أكملت قراءة جزء كامل',
    icon: '🎯',
    unlocked: false
  },
  {
    id: 'fast-reader',
    title: 'قارئ سريع',
    titleArabic: 'القارئ السريع',
    description: 'قرأت 30 صفحة в جلسة واحدة',
    icon: '⚡',
    unlocked: false
  },
  {
    id: 'daily-reader',
    title: 'قارئ يومي',
    titleArabic: 'القارئ اليومي',
    description: 'قرأت يومياً لمدة 7 أيام متتالية',
    icon: '📅',
    unlocked: false
  },
  {
    id: 'bookmark-master',
    title: 'حافظ العلامات',
    titleArabic: 'حافظ العلامات المرجعية',
    description: 'أضفت 10 علامات مرجعية',
    icon: '🔖',
    unlocked: false
  },
  {
    id: 'quran-completed',
    title: 'ختم القرآن',
    titleArabic: 'ختم القرآن الكريم',
    description: 'أكملت قراءة المصحف كاملاً',
    icon: '🏆',
    unlocked: false
  }
];

export const JUZ_PAGE_MAPPING: { [key: number]: { startPage: number; endPage: number } } = {
  1: { startPage: 1, endPage: 21 },
  2: { startPage: 22, endPage: 41 },
  3: { startPage: 42, endPage: 61 },
  4: { startPage: 62, endPage: 81 },
  5: { startPage: 82, endPage: 101 },
  6: { startPage: 102, endPage: 121 },
  7: { startPage: 122, endPage: 141 },
  8: { startPage: 142, endPage: 161 },
  9: { startPage: 162, endPage: 181 },
  10: { startPage: 182, endPage: 201 },
  11: { startPage: 202, endPage: 221 },
  12: { startPage: 222, endPage: 241 },
  13: { startPage: 242, endPage: 261 },
  14: { startPage: 262, endPage: 281 },
  15: { startPage: 282, endPage: 301 },
  16: { startPage: 302, endPage: 321 },
  17: { startPage: 322, endPage: 341 },
  18: { startPage: 342, endPage: 361 },
  19: { startPage: 362, endPage: 381 },
  20: { startPage: 382, endPage: 401 },
  21: { startPage: 402, endPage: 421 },
  22: { startPage: 422, endPage: 441 },
  23: { startPage: 442, endPage: 461 },
  24: { startPage: 462, endPage: 481 },
  25: { startPage: 482, endPage: 501 },
  26: { startPage: 502, endPage: 521 },
  27: { startPage: 522, endPage: 541 },
  28: { startPage: 542, endPage: 561 },
  29: { startPage: 562, endPage: 581 },
  30: { startPage: 582, endPage: 604 }
};