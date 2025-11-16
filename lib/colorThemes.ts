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
      background: '#f8fdf9',
      backgroundSecondary: '#ecfaf4',
      surface: '#ffffff',
      text: '#111827',
      textSecondary: '#5a8a72',
      border: '#c7f1db',
      muted: '#e8f7ee',
    },
    darkMode: {
      primary: '#34d399',
      primaryLight: '#6ee7b7',
      primaryDark: '#10b981',
      secondary: '#064e3b',
      accent: '#10b981',
      background: '#0b1514',
      backgroundSecondary: '#121f1e',
      surface: '#182825',
      text: '#f0fcf4',
      textSecondary: '#a0e0bf',
      border: '#24493f',
      muted: '#1c2d2a',
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
      background: '#f5f9ff',
      backgroundSecondary: '#e8f1ff',
      surface: '#ffffff',
      text: '#1e293b',
      textSecondary: '#637ab3',
      border: '#c7d9f1',
      muted: '#eef4ff',
    },
    darkMode: {
      primary: '#60a5fa',
      primaryLight: '#93c5fd',
      primaryDark: '#3b82f6',
      secondary: '#1e3a8a',
      accent: '#3b82f6',
      background: '#0c1220',
      backgroundSecondary: '#141d2e',
      surface: '#1e2a3f',
      text: '#f0f6ff',
      textSecondary: '#a7c3f0',
      border: '#2a3e6b',
      muted: '#232f45',
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
      background: '#faf5ff',
      backgroundSecondary: '#f0e6ff',
      surface: '#ffffff',
      text: '#251f30',
      textSecondary: '#7a63b0',
      border: '#d9cbf5',
      muted: '#f3e8ff',
    },
    darkMode: {
      primary: '#a78bfa',
      primaryLight: '#c4b5fd',
      primaryDark: '#8b5cf6',
      secondary: '#4c1d95',
      accent: '#8b5cf6',
      background: '#120f1d',
      backgroundSecondary: '#1b172a',
      surface: '#252136',
      text: '#f5f0ff',
      textSecondary: '#c4b5fd',
      border: '#3e3566',
      muted: '#2a253f',
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
      background: '#fff7fb',
      backgroundSecondary: '#ffe8f3',
      surface: '#ffffff',
      text: '#2b1a25',
      textSecondary: '#a35f85',
      border: '#f8cfe5',
      muted: '#ffe0f0',
    },
    darkMode: {
      primary: '#f472b6',
      primaryLight: '#f9a8d4',
      primaryDark: '#ec4899',
      secondary: '#831843',
      accent: '#ec4899',
      background: '#1a0e15',
      backgroundSecondary: '#25161f',
      surface: '#351f2c',
      text: '#ffe0ed',
      textSecondary: '#f9a8d4',
      border: '#552c3e',
      muted: '#2f1a25',
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
      background: '#fffaf7',
      backgroundSecondary: '#ffece5',
      surface: '#ffffff',
      text: '#291e16',
      textSecondary: '#b06a42',
      border: '#ffd8c5',
      muted: '#ffe5d9',
    },
    darkMode: {
      primary: '#fb923c',
      primaryLight: '#fdba74',
      primaryDark: '#f97316',
      secondary: '#9a3412',
      accent: '#f97316',
      background: '#1a110b',
      backgroundSecondary: '#251a13',
      surface: '#382419',
      text: '#ffe5d9',
      textSecondary: '#fdba74',
      border: '#613a29',
      muted: '#2f2017',
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
      background: '#f4fdf9',
      backgroundSecondary: '#e6f9f3',
      surface: '#ffffff',
      text: '#1a2a27',
      textSecondary: '#4d9a8e',
      border: '#bdeae1',
      muted: '#e0f5ef',
    },
    darkMode: {
      primary: '#2dd4bf',
      primaryLight: '#5eead4',
      primaryDark: '#14b8a6',
      secondary: '#134e4a',
      accent: '#14b8a6',
      background: '#0b1a18',
      backgroundSecondary: '#122522',
      surface: '#1b312d',
      text: '#e0f5ef',
      textSecondary: '#8ae0d2',
      border: '#2a4e48',
      muted: '#1f2e2b',
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
      background: '#f7f7ff',
      backgroundSecondary: '#eaefff',
      surface: '#ffffff',
      text: '#1f1f30',
      textSecondary: '#6a6ab8',
      border: '#d1d3f5',
      muted: '#eaefff',
    },
    darkMode: {
      primary: '#818cf8',
      primaryLight: '#a5b4fc',
      primaryDark: '#6366f1',
      secondary: '#3730a3',
      accent: '#6366f1',
      background: '#0e0e1d',
      backgroundSecondary: '#18172d',
      surface: '#25243f',
      text: '#f0f0ff',
      textSecondary: '#b5b2f0',
      border: '#3a3866',
      muted: '#2a2845',
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
      background: '#fff8f8',
      backgroundSecondary: '#ffeaea',
      surface: '#ffffff',
      text: '#2a1a1a',
      textSecondary: '#a04040',
      border: '#ffcfcf',
      muted: '#ffeded',
    },
    darkMode: {
      primary: '#ef4444',
      primaryLight: '#f87171',
      primaryDark: '#dc2626',
      secondary: '#7f1d1d',
      accent: '#dc2626',
      background: '#1a0f0f',
      backgroundSecondary: '#251616',
      surface: '#381f1f',
      text: '#ffeded',
      textSecondary: '#f87171',
      border: '#5c2a2a',
      muted: '#2f1a1a',
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
      background: '#fffdf5',
      backgroundSecondary: '#fff5dd',
      surface: '#ffffff',
      text: '#292414',
      textSecondary: '#a88232',
      border: '#ffe8a8',
      muted: '#fff9e0',
    },
    darkMode: {
      primary: '#facc15',
      primaryLight: '#fde047',
      primaryDark: '#eab308',
      secondary: '#713f12',
      accent: '#eab308',
      background: '#1a150c',
      backgroundSecondary: '#251f13',
      surface: '#38301c',
      text: '#fff9e0',
      textSecondary: '#fde047',
      border: '#614d22',
      muted: '#2f2817',
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
      background: '#fbfcfd',
      backgroundSecondary: '#f2f4f6',
      surface: '#ffffff',
      text: '#1f2329',
      textSecondary: '#707885',
      border: '#d1d5db',
      muted: '#eef1f4',
    },
    darkMode: {
      primary: '#9ca3af',
      primaryLight: '#d1d5db',
      primaryDark: '#6b7280',
      secondary: '#374151',
      accent: '#6b7280',
      background: '#0f1216',
      backgroundSecondary: '#171c23',
      surface: '#222832',
      text: '#f0f3f7',
      textSecondary: '#b8c0ce',
      border: '#3a4250',
      muted: '#272d37',
    },
  },
  {
    id: 'sepia',
    name: 'Сепия',
    lightMode: {
      primary: '#8b4513',
      primaryLight: '#a0522d',
      primaryDark: '#654321',
      secondary: '#f8f0e0',
      accent: '#8b4513',
      background: '#f8f0e0',
      backgroundSecondary: '#f4f1e8',
      surface: '#f4f1e8',
      text: '#4a4a4a',
      textSecondary: '#5c4b37',
      border: '#d4c5a1',
      muted: '#e8dfca',
    },
    darkMode: {
      primary: '#d2b48c',
      primaryLight: '#daa520',
      primaryDark: '#8b4513',
      secondary: '#3e2723',
      accent: '#daa520',
      background: '#2e1a0f',
      backgroundSecondary: '#3e2723',
      surface: '#4e342e',
      text: '#e8dfca',
      textSecondary: '#d4c5a1',
      border: '#5d4037',
      muted: '#4e342e',
    },
  },
  {
    id: 'amber',
    name: 'Янтарный',
    lightMode: {
      primary: '#d97706',
      primaryLight: '#f59e0b',
      primaryDark: '#b45309',
      secondary: '#fffbeb',
      accent: '#d97706',
      background: '#fffbeb',
      backgroundSecondary: '#fef3c7',
      surface: '#fefefe',
      text: '#1e293b',
      textSecondary: '#64748b',
      border: '#fed7aa',
      muted: '#fef3c7',
    },
    darkMode: {
      primary: '#fbbf24',
      primaryLight: '#fcd34d',
      primaryDark: '#f59e0b',
      secondary: '#451a03',
      accent: '#fbbf24',
      background: '#1c1917',
      backgroundSecondary: '#292524',
      surface: '#44403c',
      text: '#fef3c7',
      textSecondary: '#fed7aa',
      border: '#78716c',
      muted: '#57534e',
    },
  },
  {
    id: 'terracotta',
    name: 'Терракота',
    lightMode: {
      primary: '#c84b31',
      primaryLight: '#e2725b',
      primaryDark: '#a43a21',
      secondary: '#fdf2ee',
      accent: '#a43a21',
      background: '#fdf3ef',
      backgroundSecondary: '#f8e7e1',
      surface: '#fefefe',
      text: '#2b1f1c',
      textSecondary: '#9e6e60',
      border: '#f0c7be',
      muted: '#f5e0db',
    },
    darkMode: {
      primary: '#e2725b',
      primaryLight: '#f09a85',
      primaryDark: '#c84b31',
      secondary: '#4a221a',
      accent: '#e2725b',
      background: '#1a120f',
      backgroundSecondary: '#251c18',
      surface: '#382c27',
      text: '#f8e7e1',
      textSecondary: '#f09a85',
      border: '#5d453f',
      muted: '#322722',
    },
  },
  {
    id: 'olive',
    name: 'Олива',
    lightMode: {
      primary: '#8a9b68',
      primaryLight: '#a6b785',
      primaryDark: '#6d7a4f',
      secondary: '#f8faf5',
      accent: '#6d7a4f',
      background: '#f9fcf6',
      backgroundSecondary: '#f0f5eb',
      surface: '#fefefe',
      text: '#282c24',
      textSecondary: '#7a8668',
      border: '#dfe7d5',
      muted: '#eef3e9',
    },
    darkMode: {
      primary: '#a6b785',
      primaryLight: '#c2d0a3',
      primaryDark: '#8a9b68',
      secondary: '#363d2e',
      accent: '#a6b785',
      background: '#141710',
      backgroundSecondary: '#1d2118',
      surface: '#2c3125',
      text: '#f0f5eb',
      textSecondary: '#c2d0a3',
      border: '#4a503f',
      muted: '#272c20',
    },
  },
  {
    id: 'plum',
    name: 'Слива',
    lightMode: {
      primary: '#9c4a88',
      primaryLight: '#b86ca4',
      primaryDark: '#7d3a6a',
      secondary: '#fdf3f9',
      accent: '#7d3a6a',
      background: '#fdf4f9',
      backgroundSecondary: '#f6eaf3',
      surface: '#fefefe',
      text: '#2b1f28',
      textSecondary: '#8f657e',
      border: '#e8cfe2',
      muted: '#f2e3ec',
    },
    darkMode: {
      primary: '#b86ca4',
      primaryLight: '#d38dc4',
      primaryDark: '#9c4a88',
      secondary: '#422538',
      accent: '#b86ca4',
      background: '#150f13',
      backgroundSecondary: '#1f171c',
      surface: '#32262e',
      text: '#f6eaf3',
      textSecondary: '#d38dc4',
      border: '#523f4c',
      muted: '#2a2027',
    },
  },
  {
    id: 'sapphire',
    name: 'Сапфир',
    lightMode: {
      primary: '#25639e',
      primaryLight: '#3b82c6',
      primaryDark: '#1d4f7d',
      secondary: '#f0f7ff',
      accent: '#1d4f7d',
      background: '#f2f9ff',
      backgroundSecondary: '#e6f2ff',
      surface: '#fefefe',
      text: '#1a232d',
      textSecondary: '#5a7696',
      border: '#cce5ff',
      muted: '#e0f0ff',
    },
    darkMode: {
      primary: '#3b82c6',
      primaryLight: '#5fa7e4',
      primaryDark: '#25639e',
      secondary: '#1a2d45',
      accent: '#3b82c6',
      background: '#0d121a',
      backgroundSecondary: '#141b27',
      surface: '#222d3c',
      text: '#e6f2ff',
      textSecondary: '#8ab7e4',
      border: '#3a4e68',
      muted: '#1f2938',
    },
  },
  {
    id: 'copper',
    name: 'Медь',
    lightMode: {
      primary: '#b85c38',
      primaryLight: '#d07755',
      primaryDark: '#9a4d2e',
      secondary: '#fdf5f1',
      accent: '#9a4d2e',
      background: '#fdf6f2',
      backgroundSecondary: '#f5eae4',
      surface: '#fefefe',
      text: '#2a201b',
      textSecondary: '#9a6e5a',
      border: '#f0d0c4',
      muted: '#f2e5de',
    },
    darkMode: {
      primary: '#d07755',
      primaryLight: '#e8977e',
      primaryDark: '#b85c38',
      secondary: '#482c20',
      accent: '#d07755',
      background: '#140f0c',
      backgroundSecondary: '#1e1713',
      surface: '#322823',
      text: '#f5eae4',
      textSecondary: '#e8977e',
      border: '#54423a',
      muted: '#2b221d',
    },
  },
  {
    id: 'clay',
    name: 'Глина',
    lightMode: {
      primary: '#c7784d',
      primaryLight: '#d98f65',
      primaryDark: '#a86340',
      secondary: '#f8f1ed',
      accent: '#a86340',
      background: '#fdf7f3',
      backgroundSecondary: '#f3eae6',
      surface: '#fefefe',
      text: '#2e251f',
      textSecondary: '#8a7262',
      border: '#e9d8d0',
      muted: '#f5ede9',
    },
    darkMode: {
      primary: '#d98f65',
      primaryLight: '#e9a986',
      primaryDark: '#c7784d',
      secondary: '#5a3f2e',
      accent: '#c7784d',
      background: '#1a130e',
      backgroundSecondary: '#251d16',
      surface: '#32281f',
      text: '#f8efe9',
      textSecondary: '#d9a986',
      border: '#524237',
      muted: '#2c221a',
    },
  },
  {
    id: 'fog',
    name: 'Туман',
    lightMode: {
      primary: '#6b8ca4',
      primaryLight: '#8ba9c2',
      primaryDark: '#506f85',
      secondary: '#f0f5f8',
      accent: '#506f85',
      background: '#f8fbfd',
      backgroundSecondary: '#f0f6f9',
      surface: '#fefefe',
      text: '#222d35',
      textSecondary: '#6b7c8a',
      border: '#d7e5ed',
      muted: '#edf4f8',
    },
    darkMode: {
      primary: '#8ba9c2',
      primaryLight: '#a9c3d9',
      primaryDark: '#6b8ca4',
      secondary: '#324556',
      accent: '#6b8ca4',
      background: '#0f171e',
      backgroundSecondary: '#161f28',
      surface: '#212c37',
      text: '#e0ebf3',
      textSecondary: '#a9c3d9',
      border: '#3a4c5f',
      muted: '#27333f',
    },
  },
  {
    id: 'burgundy',
    name: 'Бордо',
    lightMode: {
      primary: '#a53860',
      primaryLight: '#c25b7d',
      primaryDark: '#882d4f',
      secondary: '#f9f0f3',
      accent: '#882d4f',
      background: '#fdf5f7',
      backgroundSecondary: '#f5edf0',
      surface: '#fefefe',
      text: '#2a181e',
      textSecondary: '#8a5a6b',
      border: '#e8d0d8',
      muted: '#f2e8eb',
    },
    darkMode: {
      primary: '#c25b7d',
      primaryLight: '#d9829b',
      primaryDark: '#a53860',
      secondary: '#4a2233',
      accent: '#a53860',
      background: '#150a0f',
      backgroundSecondary: '#1f1218',
      surface: '#2d1c24',
      text: '#f5e6eb',
      textSecondary: '#d9829b',
      border: '#523542',
      muted: '#28171f',
    },
  }
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

// Применить тему Mushaf на основе выбранной цветовой темы сайта
export function applyMushafTheme(siteThemeId: string, isDark: boolean = false) {
  if (typeof window === 'undefined') return;
  
  const siteTheme = getThemeByName(siteThemeId);
  if (!siteTheme) return;
  
  const colors = isDark ? siteTheme.darkMode : siteTheme.lightMode;
  const root = document.documentElement;
  
  console.log('Applying Mushaf theme:', siteThemeId, 'isDark:', isDark);
  
  // Определяем цвета для Mushaf на основе цветовой схемы сайта
  let mushafColors;
  
  if (isDark) {
    // Темная тема Mushaf с цветовыми акцентами на основе выбранной схемы (ЕЩЕ ЯРЧЕ + КНИЖНЫЕ ГРАНИЦЫ!)
    switch (siteThemeId) {
      case 'blue':
        mushafColors = {
          bg: '#2a3a5a', // ЕЩЕ ярче темно-синий
          pageBg: '#3a4a6a', // ЕЩЕ ярче синевато-серый
          text: '#ffffff', // Чисто белый текст
          accent: '#60a5fa',
          border: '#4f46e5', // Книжная граница
          shadow: '0 4px 20px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)', // Книжная тень
        };
        break;
      case 'green':
        mushafColors = {
          bg: '#2a4538', // ЕЩЕ ярче темно-зеленый
          pageBg: '#3a5548', // ЕЩЕ ярче зеленый фон
          text: '#ffffff', // Чисто белый текст
          accent: '#34d399',
          border: '#059669', // Книжная граница
          shadow: '0 4px 20px rgba(16, 185, 129, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)', // Книжная тень
        };
        break;
      case 'purple':
        mushafColors = {
          bg: '#3d2b5e', // ЕЩЕ ярче темно-фиолетовый
          pageBg: '#4d3b73', // ЕЩЕ ярче фиолетовый фон
          text: '#ffffff', // Чисто белый текст
          accent: '#a78bfa',
          border: '#7c3aed', // Книжная граница
          shadow: '0 4px 20px rgba(139, 92, 246, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)', // Книжная тень
        };
        break;
      case 'amber':
        mushafColors = {
          bg: '#4d3827', // ЕЩЕ ярче темно-янтарный
          pageBg: '#5d4837', // ЕЩЕ ярче янтарный фон
          text: '#ffffff', // Чисто белый текст
          accent: '#fbbf24',
          border: '#d97706', // Книжная граница
          shadow: '0 4px 20px rgba(245, 158, 11, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)', // Книжная тень
        };
        break;
      case 'pink':
        mushafColors = {
          bg: '#4d2739', // ЕЩЕ ярче темно-розовый
          pageBg: '#5d3749', // ЕЩЕ ярче розовый фон
          text: '#ffffff', // Чисто белый текст
          accent: '#f472b6',
          border: '#db2777', // Книжная граница
          shadow: '0 4px 20px rgba(236, 72, 153, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)', // Книжная тень
        };
        break;
      case 'sepia':
        mushafColors = {
          bg: '#4d3f2a', // ЕЩЕ ярче темно-коричневый сепия
          pageBg: '#5d4f36', // ЕЩЕ ярче сепия фон
          text: '#ffffff', // Чисто белый текст
          accent: '#d2b48c',
          border: '#a0522d', // Книжная граница
          shadow: '0 4px 20px rgba(139, 69, 19, 0.4), inset 0 1px 0 rgba(255,255,255,0.1)', // Книжная тень
        };
        break;
      case 'orange':
        mushafColors = {
          bg: '#4d2f1c', // ЕЩЕ ярче темно-оранжевый
          pageBg: '#5d3f25', // ЕЩЕ ярче оранжевый фон
          text: '#ffffff', // Чисто белый текст
          accent: '#fb923c',
          border: '#c2410c', // Книжная граница
          shadow: '0 4px 20px rgba(234, 88, 12, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)', // Книжная тень
        };
        break;
      case 'teal':
        mushafColors = {
          bg: '#235e5a', // ЕЩЕ ярче темно-бирюзовый
          pageBg: '#2f7b76', // ЕЩЕ ярче бирюзовый фон
          text: '#ffffff', // Чисто белый текст
          accent: '#2dd4bf',
          border: '#0f766e', // Книжная граница
          shadow: '0 4px 20px rgba(20, 184, 166, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)', // Книжная тень
        };
        break;
      case 'indigo':
        mushafColors = {
          bg: '#413e91', // ЕЩЕ ярче темно-индиго
          pageBg: '#514ccb', // ЕЩЕ ярче индиго фон
          text: '#ffffff', // Чисто белый текст
          accent: '#818cf8',
          border: '#4338ca', // Книжная граница
          shadow: '0 4px 20px rgba(99, 102, 241, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)', // Книжная тень
        };
        break;
      case 'red':
        mushafColors = {
          bg: '#8f2d2d', // ЕЩЕ ярче темно-красный
          pageBg: '#a93d3d', // ЕЩЕ ярче красный фон
          text: '#ffffff', // Чисто белый текст
          accent: '#ef4444',
          border: '#b91c1c', // Книжная граница
          shadow: '0 4px 20px rgba(220, 38, 38, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)', // Книжная тень
        };
        break;
      case 'yellow':
        mushafColors = {
          bg: '#4d3827', // ЕЩЕ ярче темно-желтый
          pageBg: '#5d4f22', // ЕЩЕ ярче желтый фон
          text: '#ffffff', // Чисто белый текст
          accent: '#facc15',
          border: '#ca8a04', // Книжная граница
          shadow: '0 4px 20px rgba(234, 179, 8, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)', // Книжная тень
        };
        break;
      case 'gray':
        mushafColors = {
          bg: '#2f3f47', // ЕЩЕ ярче темно-серый
          pageBg: '#475161', // ЕЩЕ ярче серый фон
          text: '#ffffff', // Чисто белый текст
          accent: '#9ca3af',
          border: '#4b5563', // Книжная граница
          shadow: '0 4px 20px rgba(107, 114, 128, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)', // Книжная тень
        };
        break;
      default: // 'emerald' и другие зеленые
        mushafColors = {
          bg: '#165e4b', // ЕЩА ярче изумрудно-темный
          pageBg: '#1f6f56', // ЕЩЁ ярче
          text: '#ffffff', // Чисто белый текст
          accent: '#34d399',
          border: '#047857', // Книжная граница
          shadow: '0 4px 20px rgba(16, 185, 129, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)', // Книжная тень
        };
    }
  } else {
    // Светлая тема Mushaf с мягкими оттенками для чтения + КНИЖНЫЕ ГРАНИЦЫ!
    switch (siteThemeId) {
      case 'sepia':
        mushafColors = {
          bg: '#f8f0e0',
          pageBg: '#f4f1e8',
          text: '#4a4a4a', 
          accent: '#8b4513',
          border: '#8b4513', // Темная книжная граница
          shadow: '0 4px 20px rgba(139, 69, 19, 0.2), inset 0 1px 0 rgba(255,255,255,0.8)', // Книжная тень
        };
        break;
      case 'blue':
        mushafColors = {
          bg: '#f0f9ff', // Светло-голубой фон
          pageBg: '#fefefe',
          text: '#1e3a8a', // Темно-синий текст
          accent: colors.primary,
          border: '#1e40af', // Темная книжная граница
          shadow: '0 4px 20px rgba(59, 130, 246, 0.15), inset 0 1px 0 rgba(255,255,255,0.8)', // Книжная тень
        };
        break;
      case 'purple':
        mushafColors = {
          bg: '#faf5ff', // Светло-фиолетовый фон
          pageBg: '#fefefe',
          text: '#581c87', // Темно-фиолетовый текст
          accent: colors.primary,
          border: '#6b21a8', // Темная книжная граница
          shadow: '0 4px 20px rgba(147, 51, 234, 0.15), inset 0 1px 0 rgba(255,255,255,0.8)', // Книжная тень
        };
        break;
      case 'amber':
        mushafColors = {
          bg: '#fffbeb', // Светло-янтарный фон
          pageBg: '#fefefe',
          text: '#92400e', // Темно-янтарный текст
          accent: colors.primary,
          border: '#b45309', // Темная книжная граница
          shadow: '0 4px 20px rgba(245, 158, 11, 0.15), inset 0 1px 0 rgba(255,255,255,0.8)', // Книжная тень
        };
        break;
      case 'orange':
        mushafColors = {
          bg: '#fff7ed', // Светло-оранжевый фон
          pageBg: '#fefefe',
          text: '#9a3412', // Темно-оранжевый текст
          accent: colors.primary,
          border: '#c2410c', // Темная книжная граница
          shadow: '0 4px 20px rgba(234, 88, 12, 0.15), inset 0 1px 0 rgba(255,255,255,0.8)', // Книжная тень
        };
        break;
      case 'teal':
        mushafColors = {
          bg: '#f0fdfa', // Светло-бирюзовый фон
          pageBg: '#fefefe',
          text: '#134e4a', // Темно-бирюзовый текст
          accent: colors.primary,
          border: '#0f766e', // Темная книжная граница
          shadow: '0 4px 20px rgba(20, 184, 166, 0.15), inset 0 1px 0 rgba(255,255,255,0.8)', // Книжная тень
        };
        break;
      case 'indigo':
        mushafColors = {
          bg: '#eef2ff', // Светло-индиго фон
          pageBg: '#fefefe',
          text: '#3730a3', // Темно-индиго текст
          accent: colors.primary,
          border: '#4338ca', // Темная книжная граница
          shadow: '0 4px 20px rgba(99, 102, 241, 0.15), inset 0 1px 0 rgba(255,255,255,0.8)', // Книжная тень
        };
        break;
      case 'red':
        mushafColors = {
          bg: '#fef2f2', // Светло-красный фон
          pageBg: '#fefefe',
          text: '#7f1d1d', // Темно-красный текст
          accent: colors.primary,
          border: '#b91c1c', // Темная книжная граница
          shadow: '0 4px 20px rgba(220, 38, 38, 0.15), inset 0 1px 0 rgba(255,255,255,0.8)', // Книжная тень
        };
        break;
      case 'yellow':
        mushafColors = {
          bg: '#fefce8', // Светло-желтый фон
          pageBg: '#fefefe',
          text: '#713f12', // Темно-желтый текст
          accent: colors.primary,
          border: '#a16207', // Темная книжная граница
          shadow: '0 4px 20px rgba(234, 179, 8, 0.15), inset 0 1px 0 rgba(255,255,255,0.8)', // Книжная тень
        };
        break;
      case 'gray':
        mushafColors = {
          bg: '#f9fafb', // Светло-серый фон
          pageBg: '#fefefe',
          text: '#374151', // Темно-серый текст
          accent: colors.primary,
          border: '#4b5563', // Темная книжная граница
          shadow: '0 4px 20px rgba(107, 114, 128, 0.15), inset 0 1px 0 rgba(255,255,255,0.8)', // Книжная тень
        };
        break;
      case 'pink':
        mushafColors = {
          bg: '#fdf2f8', // Светло-розовый фон
          pageBg: '#fefefe',
          text: '#831843', // Темно-розовый текст
          accent: colors.primary,
          border: '#be185d', // Темная книжная граница
          shadow: '0 4px 20px rgba(236, 72, 153, 0.15), inset 0 1px 0 rgba(255,255,255,0.8)', // Книжная тень
        };
        break;
      default: // green и другие
        mushafColors = {
          bg: '#f0fdf4',
          pageBg: '#fefefe',
          text: '#1a202c',
          accent: colors.primary,
          border: '#047857', // Темная книжная граница
          shadow: '0 4px 20px rgba(16, 185, 129, 0.15), inset 0 1px 0 rgba(255,255,255,0.8)', // Книжная тень
        };
    }
  }
  
  // Применяем переменные для Mushaf
  root.style.setProperty('--mushaf-bg', mushafColors.bg);
  root.style.setProperty('--mushaf-page-bg', mushafColors.pageBg);
  root.style.setProperty('--mushaf-text', mushafColors.text);
  root.style.setProperty('--mushaf-accent', mushafColors.accent);
  root.style.setProperty('--mushaf-border', mushafColors.border);
  root.style.setProperty('--mushaf-shadow', mushafColors.shadow);
  
  // Обновляем CSS класс для темы
  document.body.classList.remove('theme-light', 'theme-sepia', 'theme-dark', 'theme-green', 'theme-blue', 'theme-purple', 'theme-amber');
  
  if (isDark) {
    document.body.classList.add('theme-dark');
  } else {
    switch (siteThemeId) {
      case 'sepia':
        document.body.classList.add('theme-sepia');
        break;
      default:
        document.body.classList.add('theme-light');
    }
  }
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
  console.log('Mushaf colors:', {
    '--mushaf-bg': computedStyle.getPropertyValue('--mushaf-bg'),
    '--mushaf-page-bg': computedStyle.getPropertyValue('--mushaf-page-bg'),
    '--mushaf-text': computedStyle.getPropertyValue('--mushaf-text'),
    '--mushaf-accent': computedStyle.getPropertyValue('--mushaf-accent'),
  });
  console.log('========================');
}