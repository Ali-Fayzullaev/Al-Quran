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
      }),
    }
  )
);