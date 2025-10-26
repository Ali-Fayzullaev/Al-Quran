import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { RECITERS, TRANSLATIONS } from './api';

export interface Verse {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda?: {
    id: number;
    recommended: boolean;
    obligatory: boolean;
  };
}

export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan';
  verses?: Verse[];
}

export interface QuranState {
  // Reading state
  currentSurah: number | null;
  currentVerse: number | null;
  currentEdition: string;
  
  // User preferences
  fontSize: number;
  showTranslation: boolean;
  showTransliteration: boolean;
  selectedTranslations: string[];
  audioReciter: string;
  availableReciters: typeof RECITERS;
  availableTranslations: typeof TRANSLATIONS;
  
  // Audio settings
  audioSpeed: number;
  audioVolume: number;
  autoPlay: boolean;
  
  // Bookmarks and notes
  bookmarks: Array<{
    surahNumber: number;
    verseNumber: number;
    note?: string;
    createdAt: Date;
  }>;
  
  // Reading progress
  readingSessions: Array<{
    surahNumber: number;
    verseNumber: number;
    timestamp: Date;
    duration: number; // in seconds
  }>;
  
  // Search history
  searchHistory: string[];
  
  // Theme and display settings
  colorTheme: string;
  darkMode: 'light' | 'dark' | 'system';
  nightMode: boolean;
  
  // Reading preferences
  arabicFontFamily: string;
  translationFontFamily: string;
  lineHeight: number;
  wordSpacing: number;
  
  // Accessibility
  highContrast: boolean;
  reducedMotion: boolean;
  
  // Notification settings
  prayerReminders: boolean;
  dailyReadingReminder: boolean;
  reminderTime: string;
  
  // Privacy settings
  analyticsEnabled: boolean;
  crashReportingEnabled: boolean;
  
  // Actions
  setCurrentPosition: (surah: number, verse: number) => void;
  setEdition: (edition: string) => void;
  setFontSize: (size: number) => void;
  toggleTranslation: () => void;
  toggleTransliteration: () => void;
  setSelectedTranslations: (translations: string[]) => void;
  setAudioReciter: (reciter: string) => void;
  setAudioSpeed: (speed: number) => void;
  setAudioVolume: (volume: number) => void;
  setAutoPlay: (autoPlay: boolean) => void;
  addBookmark: (surah: number, verse: number, note?: string) => void;
  removeBookmark: (surah: number, verse: number) => void;
  addReadingSession: (surah: number, verse: number, duration: number) => void;
  addToSearchHistory: (query: string) => void;
  clearSearchHistory: () => void;
  setColorTheme: (theme: string) => void;
  setDarkMode: (mode: 'light' | 'dark' | 'system') => void;
  toggleNightMode: () => void;
  setArabicFontFamily: (font: string) => void;
  setTranslationFontFamily: (font: string) => void;
  setLineHeight: (height: number) => void;
  setWordSpacing: (spacing: number) => void;
  setHighContrast: (enabled: boolean) => void;
  setReducedMotion: (enabled: boolean) => void;
  setPrayerReminders: (enabled: boolean) => void;
  setDailyReadingReminder: (enabled: boolean) => void;
  setReminderTime: (time: string) => void;
  setAnalyticsEnabled: (enabled: boolean) => void;
  setCrashReportingEnabled: (enabled: boolean) => void;
}

export const useQuranStore = create<QuranState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentSurah: null,
      currentVerse: null,
      currentEdition: 'quran-uthmani',
      fontSize: 18,
      showTranslation: true,
      showTransliteration: false,
      selectedTranslations: ['en.sahih', 'ru.kuliev'],
      audioReciter: 'ar.alafasy',
      availableReciters: RECITERS,
      availableTranslations: TRANSLATIONS,
      audioSpeed: 1,
      audioVolume: 1,
      autoPlay: false,
      bookmarks: [],
      readingSessions: [],
      searchHistory: [],
      
      // Theme and display settings
      colorTheme: 'default',
      darkMode: 'system',
      nightMode: false,
      
      // Reading preferences
      arabicFontFamily: 'amiri',
      translationFontFamily: 'inter',
      lineHeight: 1.8,
      wordSpacing: 1,
      
      // Accessibility
      highContrast: false,
      reducedMotion: false,
      
      // Notification settings
      prayerReminders: false,
      dailyReadingReminder: false,
      reminderTime: '20:00',
      
      // Privacy settings
      analyticsEnabled: true,
      crashReportingEnabled: true,
      
      // Actions
      setCurrentPosition: (surah: number, verse: number) => {
        set({ currentSurah: surah, currentVerse: verse });
      },
      
      setEdition: (edition: string) => {
        set({ currentEdition: edition });
      },
      
      setFontSize: (size: number) => {
        set({ fontSize: Math.max(12, Math.min(32, size)) });
      },
      
      toggleTranslation: () => {
        set((state) => ({ showTranslation: !state.showTranslation }));
      },
      
      toggleTransliteration: () => {
        set((state) => ({ showTransliteration: !state.showTransliteration }));
      },
      
      setSelectedTranslations: (translations: string[]) => {
        set({ selectedTranslations: translations });
      },
      
      setAudioReciter: (reciter: string) => {
        set({ audioReciter: reciter });
      },
      
      setAudioSpeed: (speed: number) => {
        set({ audioSpeed: Math.max(0.5, Math.min(2, speed)) });
      },
      
      setAudioVolume: (volume: number) => {
        set({ audioVolume: Math.max(0, Math.min(1, volume)) });
      },
      
      setAutoPlay: (autoPlay: boolean) => {
        set({ autoPlay });
      },
      
      addBookmark: (surah: number, verse: number, note?: string) => {
        set((state) => ({
          bookmarks: [
            ...state.bookmarks.filter(b => !(b.surahNumber === surah && b.verseNumber === verse)),
            { surahNumber: surah, verseNumber: verse, note, createdAt: new Date() }
          ]
        }));
      },
      
      removeBookmark: (surah: number, verse: number) => {
        set((state) => ({
          bookmarks: state.bookmarks.filter(b => !(b.surahNumber === surah && b.verseNumber === verse))
        }));
      },
      
      addReadingSession: (surah: number, verse: number, duration: number) => {
        set((state) => ({
          readingSessions: [
            ...state.readingSessions,
            { surahNumber: surah, verseNumber: verse, timestamp: new Date(), duration }
          ]
        }));
      },
      
      addToSearchHistory: (query: string) => {
        set((state) => ({
          searchHistory: [
            query,
            ...state.searchHistory.filter(q => q !== query).slice(0, 9)
          ]
        }));
      },
      
      clearSearchHistory: () => {
        set({ searchHistory: [] });
      },
      
      setColorTheme: (theme: string) => {
        set({ colorTheme: theme });
      },
      
      setDarkMode: (mode: 'light' | 'dark' | 'system') => {
        set({ darkMode: mode });
      },
      
      toggleNightMode: () => {
        set((state) => ({ nightMode: !state.nightMode }));
      },
      
      setArabicFontFamily: (font: string) => {
        set({ arabicFontFamily: font });
      },
      
      setTranslationFontFamily: (font: string) => {
        set({ translationFontFamily: font });
      },
      
      setLineHeight: (height: number) => {
        set({ lineHeight: Math.max(1.2, Math.min(3, height)) });
      },
      
      setWordSpacing: (spacing: number) => {
        set({ wordSpacing: Math.max(0.5, Math.min(2, spacing)) });
      },
      
      setHighContrast: (enabled: boolean) => {
        set({ highContrast: enabled });
      },
      
      setReducedMotion: (enabled: boolean) => {
        set({ reducedMotion: enabled });
      },
      
      setPrayerReminders: (enabled: boolean) => {
        set({ prayerReminders: enabled });
      },
      
      setDailyReadingReminder: (enabled: boolean) => {
        set({ dailyReadingReminder: enabled });
      },
      
      setReminderTime: (time: string) => {
        set({ reminderTime: time });
      },
      
      setAnalyticsEnabled: (enabled: boolean) => {
        set({ analyticsEnabled: enabled });
      },
      
      setCrashReportingEnabled: (enabled: boolean) => {
        set({ crashReportingEnabled: enabled });
      },
    }),
    {
      name: 'quran-storage',
      partialize: (state) => ({
        fontSize: state.fontSize,
        showTranslation: state.showTranslation,
        showTransliteration: state.showTransliteration,
        selectedTranslations: state.selectedTranslations,
        audioReciter: state.audioReciter,
        audioSpeed: state.audioSpeed,
        audioVolume: state.audioVolume,
        autoPlay: state.autoPlay,
        bookmarks: state.bookmarks,
        readingSessions: state.readingSessions,
        searchHistory: state.searchHistory,
        colorTheme: state.colorTheme,
        darkMode: state.darkMode,
        nightMode: state.nightMode,
        arabicFontFamily: state.arabicFontFamily,
        translationFontFamily: state.translationFontFamily,
        lineHeight: state.lineHeight,
        wordSpacing: state.wordSpacing,
        highContrast: state.highContrast,
        reducedMotion: state.reducedMotion,
        prayerReminders: state.prayerReminders,
        dailyReadingReminder: state.dailyReadingReminder,
        reminderTime: state.reminderTime,
        analyticsEnabled: state.analyticsEnabled,
        crashReportingEnabled: state.crashReportingEnabled,
      }),
    }
  )
);