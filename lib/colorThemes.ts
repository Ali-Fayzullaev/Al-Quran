// Улучшенная система цветовых тем для сайта и текста Корана
export interface ColorTheme {
  id: string;
  name: string;
  lightMode: {
    primary: string;
    primaryLight: string;
    primaryDark: string;
    secondary: string;
    accent: string;
    background: string;
    backgroundSecondary: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    muted: string;
  };
  darkMode: {
    primary: string;
    primaryLight: string;
    primaryDark: string;
    secondary: string;
    accent: string;
    background: string;
    backgroundSecondary: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    muted: string;
  };
}

export interface QuranTextColorScheme {
  id: string;
  name: string;
  lightMode: {
    arabicColor: string;
    translationColor: string;
    verseNumberColor: string;
    highlightColor: string;
  };
  darkMode: {
    arabicColor: string;
    translationColor: string;
    verseNumberColor: string;
    highlightColor: string;
  };
}

// Красивые цветовые темы для сайта
export const SITE_COLOR_THEMES: ColorTheme[] = [
  {
    id: 'green',
    name: 'Зеленый (по умолчанию)',
    lightMode: {
      primary: '#10b981',
      primaryLight: '#34d399',
      primaryDark: '#047857',
      secondary: '#f0fdf4',
      accent: '#059669',
      background: '#ffffff',
      backgroundSecondary: '#f9fafb',
      surface: '#ffffff',
      text: '#111827',
      textSecondary: '#6b7280',
      border: '#e5e7eb',
      muted: '#f3f4f6',
    },
    darkMode: {
      primary: '#34d399',
      primaryLight: '#6ee7b7',
      primaryDark: '#10b981',
      secondary: '#064e3b',
      accent: '#10b981',
      background: '#0f172a',
      backgroundSecondary: '#1e293b',
      surface: '#1f2937',
      text: '#f1f5f9',
      textSecondary: '#cbd5e1',
      border: '#374151',
      muted: '#374151',
    },
  },
  {
    id: 'emerald',
    name: 'Изумрудный',
    lightMode: {
      primary: '#10b981',
      primaryLight: '#34d399',
      primaryDark: '#047857',
      secondary: '#f0fdf4',
      accent: '#059669',
      background: '#ffffff',
      backgroundSecondary: '#f8fafc',
      surface: '#ffffff',
      text: '#111827',
      textSecondary: '#6b7280',
      border: '#e5e7eb',
      muted: '#f3f4f6',
    },
    darkMode: {
      primary: '#34d399',
      primaryLight: '#6ee7b7',
      primaryDark: '#10b981',
      secondary: '#064e3b',
      accent: '#10b981',
      background: '#0f172a',
      backgroundSecondary: '#1e293b',
      surface: '#334155',
      text: '#f1f5f9',
      textSecondary: '#cbd5e1',
      border: '#475569',
      muted: '#374151',
    },
  },
  {
    id: 'blue',
    name: 'Синий',
    lightMode: {
      primary: '#3b82f6',
      primaryLight: '#60a5fa',
      primaryDark: '#1d4ed8',
      secondary: '#eff6ff',
      accent: '#2563eb',
      background: '#ffffff',
      backgroundSecondary: '#f8fafc',
      surface: '#ffffff',
      text: '#111827',
      textSecondary: '#6b7280',
      border: '#e5e7eb',
      muted: '#f3f4f6',
    },
    darkMode: {
      primary: '#60a5fa',
      primaryLight: '#93c5fd',
      primaryDark: '#3b82f6',
      secondary: '#1e3a8a',
      accent: '#3b82f6',
      background: '#0f172a',
      backgroundSecondary: '#1e293b',
      surface: '#334155',
      text: '#f1f5f9',
      textSecondary: '#cbd5e1',
      border: '#475569',
      muted: '#374151',
    },
  },
  {
    id: 'purple',
    name: 'Фиолетовый',
    lightMode: {
      primary: '#8b5cf6',
      primaryLight: '#a78bfa',
      primaryDark: '#7c3aed',
      secondary: '#f5f3ff',
      accent: '#7c3aed',
      background: '#ffffff',
      backgroundSecondary: '#f8fafc',
      surface: '#ffffff',
      text: '#111827',
      textSecondary: '#6b7280',
      border: '#e5e7eb',
      muted: '#f3f4f6',
    },
    darkMode: {
      primary: '#a78bfa',
      primaryLight: '#c4b5fd',
      primaryDark: '#8b5cf6',
      secondary: '#4c1d95',
      accent: '#8b5cf6',
      background: '#0f172a',
      backgroundSecondary: '#1e293b',
      surface: '#334155',
      text: '#f1f5f9',
      textSecondary: '#cbd5e1',
      border: '#475569',
      muted: '#374151',
    },
  },
  {
    id: 'pink',
    name: 'Розовый',
    lightMode: {
      primary: '#ec4899',
      primaryLight: '#f472b6',
      primaryDark: '#db2777',
      secondary: '#fdf2f8',
      accent: '#db2777',
      background: '#ffffff',
      backgroundSecondary: '#f8fafc',
      surface: '#ffffff',
      text: '#111827',
      textSecondary: '#6b7280',
      border: '#e5e7eb',
      muted: '#f3f4f6',
    },
    darkMode: {
      primary: '#f472b6',
      primaryLight: '#f9a8d4',
      primaryDark: '#ec4899',
      secondary: '#831843',
      accent: '#ec4899',
      background: '#0f172a',
      backgroundSecondary: '#1e293b',
      surface: '#334155',
      text: '#f1f5f9',
      textSecondary: '#cbd5e1',
      border: '#475569',
      muted: '#374151',
    },
  },
  {
    id: 'orange',
    name: 'Оранжевый',
    lightMode: {
      primary: '#f97316',
      primaryLight: '#fb923c',
      primaryDark: '#ea580c',
      secondary: '#fff7ed',
      accent: '#ea580c',
      background: '#ffffff',
      backgroundSecondary: '#f8fafc',
      surface: '#ffffff',
      text: '#111827',
      textSecondary: '#6b7280',
      border: '#e5e7eb',
      muted: '#f3f4f6',
    },
    darkMode: {
      primary: '#fb923c',
      primaryLight: '#fdba74',
      primaryDark: '#f97316',
      secondary: '#9a3412',
      accent: '#f97316',
      background: '#0f172a',
      backgroundSecondary: '#1e293b',
      surface: '#334155',
      text: '#f1f5f9',
      textSecondary: '#cbd5e1',
      border: '#475569',
      muted: '#374151',
    },
  },
  {
    id: 'teal',
    name: 'Бирюзовый',
    lightMode: {
      primary: '#14b8a6',
      primaryLight: '#2dd4bf',
      primaryDark: '#0f766e',
      secondary: '#f0fdfa',
      accent: '#0f766e',
      background: '#ffffff',
      backgroundSecondary: '#f8fafc',
      surface: '#ffffff',
      text: '#111827',
      textSecondary: '#6b7280',
      border: '#e5e7eb',
      muted: '#f3f4f6',
    },
    darkMode: {
      primary: '#2dd4bf',
      primaryLight: '#5eead4',
      primaryDark: '#14b8a6',
      secondary: '#134e4a',
      accent: '#14b8a6',
      background: '#0f172a',
      backgroundSecondary: '#1e293b',
      surface: '#334155',
      text: '#f1f5f9',
      textSecondary: '#cbd5e1',
      border: '#475569',
      muted: '#374151',
    },
  },
  {
    id: 'indigo',
    name: 'Индиго',
    lightMode: {
      primary: '#6366f1',
      primaryLight: '#818cf8',
      primaryDark: '#4f46e5',
      secondary: '#eef2ff',
      accent: '#4f46e5',
      background: '#ffffff',
      backgroundSecondary: '#f8fafc',
      surface: '#ffffff',
      text: '#111827',
      textSecondary: '#6b7280',
      border: '#e5e7eb',
      muted: '#f3f4f6',
    },
    darkMode: {
      primary: '#818cf8',
      primaryLight: '#a5b4fc',
      primaryDark: '#6366f1',
      secondary: '#3730a3',
      accent: '#6366f1',
      background: '#0f172a',
      backgroundSecondary: '#1e293b',
      surface: '#334155',
      text: '#f1f5f9',
      textSecondary: '#cbd5e1',
      border: '#475569',
      muted: '#374151',
    },
  },
  {
    id: 'red',
    name: 'Красный',
    lightMode: {
      primary: '#dc2626',
      primaryLight: '#ef4444',
      primaryDark: '#b91c1c',
      secondary: '#fef2f2',
      accent: '#b91c1c',
      background: '#ffffff',
      backgroundSecondary: '#f9fafb',
      surface: '#ffffff',
      text: '#111827',
      textSecondary: '#6b7280',
      border: '#e5e7eb',
      muted: '#f3f4f6',
    },
    darkMode: {
      primary: '#ef4444',
      primaryLight: '#f87171',
      primaryDark: '#dc2626',
      secondary: '#7f1d1d',
      accent: '#dc2626',
      background: '#0f172a',
      backgroundSecondary: '#1e293b',
      surface: '#1f2937',
      text: '#f1f5f9',
      textSecondary: '#cbd5e1',
      border: '#374151',
      muted: '#374151',
    },
  },
  {
    id: 'yellow',
    name: 'Желтый',
    lightMode: {
      primary: '#eab308',
      primaryLight: '#facc15',
      primaryDark: '#ca8a04',
      secondary: '#fefce8',
      accent: '#ca8a04',
      background: '#ffffff',
      backgroundSecondary: '#f9fafb',
      surface: '#ffffff',
      text: '#111827',
      textSecondary: '#6b7280',
      border: '#e5e7eb',
      muted: '#f3f4f6',
    },
    darkMode: {
      primary: '#facc15',
      primaryLight: '#fde047',
      primaryDark: '#eab308',
      secondary: '#713f12',
      accent: '#eab308',
      background: '#0f172a',
      backgroundSecondary: '#1e293b',
      surface: '#1f2937',
      text: '#f1f5f9',
      textSecondary: '#cbd5e1',
      border: '#374151',
      muted: '#374151',
    },
  },
  {
    id: 'gray',
    name: 'Серый',
    lightMode: {
      primary: '#6b7280',
      primaryLight: '#9ca3af',
      primaryDark: '#4b5563',
      secondary: '#f9fafb',
      accent: '#4b5563',
      background: '#ffffff',
      backgroundSecondary: '#f9fafb',
      surface: '#ffffff',
      text: '#111827',
      textSecondary: '#6b7280',
      border: '#e5e7eb',
      muted: '#f3f4f6',
    },
    darkMode: {
      primary: '#9ca3af',
      primaryLight: '#d1d5db',
      primaryDark: '#6b7280',
      secondary: '#374151',
      accent: '#6b7280',
      background: '#0f172a',
      backgroundSecondary: '#1e293b',
      surface: '#1f2937',
      text: '#f1f5f9',
      textSecondary: '#cbd5e1',
      border: '#374151',
      muted: '#374151',
    },
  },
];

// Цветовые схемы для текста Корана
export const QURAN_TEXT_COLOR_SCHEMES: QuranTextColorScheme[] = [
  {
    id: 'classic',
    name: 'classic',
    lightMode: {
      arabicColor: '#1f2937',
      translationColor: '#4b5563',
      verseNumberColor: '#10b981',
      highlightColor: '#fef3c7',
    },
    darkMode: {
      arabicColor: '#f9fafb',
      translationColor: '#d1d5db',
      verseNumberColor: '#34d399',
      highlightColor: '#374151',
    },
  },
  {
    id: 'elegant',
    name: 'elegant',
    lightMode: {
      arabicColor: '#7c2d12',
      translationColor: '#a3a3a3',
      verseNumberColor: '#b91c1c',
      highlightColor: '#fef7cd',
    },
    darkMode: {
      arabicColor: '#fed7aa',
      translationColor: '#d1d5db',
      verseNumberColor: '#fca5a5',
      highlightColor: '#451a03',
    },
  },
  {
    id: 'modern',
    name: 'modern',
    lightMode: {
      arabicColor: '#1e40af',
      translationColor: '#64748b',
      verseNumberColor: '#0ea5e9',
      highlightColor: '#dbeafe',
    },
    darkMode: {
      arabicColor: '#93c5fd',
      translationColor: '#cbd5e1',
      verseNumberColor: '#38bdf8',
      highlightColor: '#1e3a8a',
    },
  },
  {
    id: 'vibrant',
    name: 'vibrant',
    lightMode: {
      arabicColor: '#7c3aed',
      translationColor: '#6366f1',
      verseNumberColor: '#ec4899',
      highlightColor: '#ede9fe',
    },
    darkMode: {
      arabicColor: '#c4b5fd',
      translationColor: '#a5b4fc',
      verseNumberColor: '#f9a8d4',
      highlightColor: '#4c1d95',
    },
  },
  {
    id: 'forest',
    name: 'emerald',
    lightMode: {
      arabicColor: '#047857',
      translationColor: '#065f46',
      verseNumberColor: '#059669',
      highlightColor: '#ecfdf5',
    },
    darkMode: {
      arabicColor: '#6ee7b7',
      translationColor: '#34d399',
      verseNumberColor: '#10b981',
      highlightColor: '#064e3b',
    },
  },
  {
    id: 'sunset',
    name: 'orange',
    lightMode: {
      arabicColor: '#ea580c',
      translationColor: '#c2410c',
      verseNumberColor: '#f97316',
      highlightColor: '#fff7ed',
    },
    darkMode: {
      arabicColor: '#fdba74',
      translationColor: '#fb923c',
      verseNumberColor: '#f97316',
      highlightColor: '#9a3412',
    },
  },
  {
    id: 'ocean',
    name: 'teal',
    lightMode: {
      arabicColor: '#0f766e',
      translationColor: '#0d9488',
      verseNumberColor: '#14b8a6',
      highlightColor: '#f0fdfa',
    },
    darkMode: {
      arabicColor: '#5eead4',
      translationColor: '#2dd4bf',
      verseNumberColor: '#14b8a6',
      highlightColor: '#134e4a',
    },
  },
];

export function getThemeByName(themeName: string): ColorTheme | undefined {
  return SITE_COLOR_THEMES.find(theme => theme.id === themeName);
}

export function getQuranColorSchemeByName(schemeName: string): QuranTextColorScheme | undefined {
  return QURAN_TEXT_COLOR_SCHEMES.find(scheme => scheme.id === schemeName);
}

// Применить цветовую тему к CSS переменным
export function applySiteColorTheme(theme: ColorTheme, isDark: boolean = false) {
  if (typeof window === 'undefined') return;
  
  const colors = isDark ? theme.darkMode : theme.lightMode;
  const root = document.documentElement;
  
  console.log('Applying site colors:', colors, 'isDark:', isDark);
  
  // Основные переменные цветов
  root.style.setProperty('--color-primary', colors.primary);
  root.style.setProperty('--color-primary-light', colors.primaryLight);
  root.style.setProperty('--color-primary-dark', colors.primaryDark);
  root.style.setProperty('--color-secondary', colors.secondary);
  root.style.setProperty('--color-accent', colors.accent);
  root.style.setProperty('--color-background', colors.background);
  root.style.setProperty('--color-background-secondary', colors.backgroundSecondary);
  root.style.setProperty('--color-surface', colors.surface);
  root.style.setProperty('--color-text', colors.text);
  root.style.setProperty('--color-text-secondary', colors.textSecondary);
  root.style.setProperty('--color-border', colors.border);
  root.style.setProperty('--color-muted', colors.muted);
  
  // Tailwind совместимые переменные
  root.style.setProperty('--tw-color-primary', colors.primary);
  root.style.setProperty('--tw-color-secondary', colors.secondary);
  root.style.setProperty('--tw-color-accent', colors.accent);
  
  // Применяем к body для мгновенного эффекта
  document.body.style.backgroundColor = colors.background;
  document.body.style.color = colors.text;
}

// Применить цветовую схему текста Корана
export function applyQuranTextColors(scheme: QuranTextColorScheme, isDark: boolean = false) {
  if (typeof window === 'undefined') return;
  
  const colors = isDark ? scheme.darkMode : scheme.lightMode;
  const root = document.documentElement;
  
  console.log('Applying Quran colors:', colors, 'isDark:', isDark);
  
  root.style.setProperty('--quran-arabic-color', colors.arabicColor);
  root.style.setProperty('--quran-translation-color', colors.translationColor);
  root.style.setProperty('--quran-verse-number-color', colors.verseNumberColor);
  root.style.setProperty('--quran-highlight-color', colors.highlightColor);
}

// Диагностическая функция для проверки CSS переменных
export function debugCSSVariables() {
  if (typeof window === 'undefined') return;
  
  const root = document.documentElement;
  const computedStyle = getComputedStyle(root);
  
  console.log('=== CSS Variables Debug ===');
  console.log('Site colors:', {
    '--color-primary': computedStyle.getPropertyValue('--color-primary'),
    '--color-secondary': computedStyle.getPropertyValue('--color-secondary'),
    '--color-accent': computedStyle.getPropertyValue('--color-accent'),
    '--color-background': computedStyle.getPropertyValue('--color-background'),
  });
  console.log('Quran colors:', {
    '--quran-arabic-color': computedStyle.getPropertyValue('--quran-arabic-color'),
    '--quran-translation-color': computedStyle.getPropertyValue('--quran-translation-color'),
    '--quran-verse-number-color': computedStyle.getPropertyValue('--quran-verse-number-color'),
  });
  console.log('========================');
}