"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  Palette, 
  Volume2, 
  Languages, 
  Type, 
  Bookmark,
  Download,
  Moon,
  Sun,
  Monitor,
  Play,
  Pause,
  RotateCcw,
  Save,
  Settings as SettingsIcon,
  Check,
  Search,
  X,
  Star,
  Globe,
  Headphones,
  Eye,
  EyeOff
} from "lucide-react";
import { useQuranStore } from "@/lib/store";
import { useLocale } from "@/context/LocaleContext";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { RECITERS, TRANSLATIONS, getWorkingAudioUrl, getCachedWorkingAudioUrl, preloadAudio } from "@/lib/api";

// Color themes configuration
const COLOR_THEMES = [
  {
    id: 'default',
    name: { en: 'Default Blue', ru: 'Синий по умолчанию' },
    colors: {
      primary: '#3B82F6',
      secondary: '#1E40AF',
      accent: '#60A5FA',
      background: '#F8FAFC',
      card: '#FFFFFF'
    }
  },
  {
    id: 'emerald',
    name: { en: 'Emerald Green', ru: 'Изумрудно-зеленый' },
    colors: {
      primary: '#10B981',
      secondary: '#047857',
      accent: '#34D399',
      background: '#F0FDF4',
      card: '#FFFFFF'
    }
  },
  {
    id: 'purple',
    name: { en: 'Royal Purple', ru: 'Королевский фиолетовый' },
    colors: {
      primary: '#8B5CF6',
      secondary: '#6D28D9',
      accent: '#A78BFA',
      background: '#FAF5FF',
      card: '#FFFFFF'
    }
  },
  {
    id: 'rose',
    name: { en: 'Rose Gold', ru: 'Розовое золото' },
    colors: {
      primary: '#F43F5E',
      secondary: '#BE185D',
      accent: '#FB7185',
      background: '#FFF1F2',
      card: '#FFFFFF'
    }
  },
  {
    id: 'amber',
    name: { en: 'Golden Amber', ru: 'Золотистый янтарь' },
    colors: {
      primary: '#F59E0B',
      secondary: '#D97706',
      accent: '#FCD34D',
      background: '#FFFBEB',
      card: '#FFFFFF'
    }
  },
  {
    id: 'teal',
    name: { en: 'Ocean Teal', ru: 'Океанский бирюзовый' },
    colors: {
      primary: '#14B8A6',
      secondary: '#0F766E',
      accent: '#2DD4BF',
      background: '#F0FDFA',
      card: '#FFFFFF'
    }
  }
];

// Популярные чтецы для быстрого доступа
const POPULAR_RECITERS = ['ar.alafasy', 'ar.abdulbasitmurattal', 'ar.abdurrahmaansudais', 'ar.mahermuaiqly'];

// Рекомендуемые переводы для быстрого доступа
const QUICK_TRANSLATIONS = {
  ru: ['ru.kuliev', 'ru.osmanov', 'ru.porokhova'],
  en: ['en.sahih', 'en.asad', 'en.pickthall'],
  ar: ['quran-uthmani', 'ar.muyassar']
};

export default function SettingsPage() {
  const { locale } = useLocale();
  const {
    fontSize,
    showTranslation,
    showTransliteration,
    selectedTranslations,
    audioReciter,
    audioSpeed,
    audioVolume,
    autoPlay,
    colorTheme,
    darkMode,
    setFontSize,
    toggleTranslation,
    toggleTransliteration,
    setSelectedTranslations,
    setAudioReciter,
    setAudioSpeed,
    setAudioVolume,
    setAutoPlay,
    setColorTheme,
    setDarkMode
  } = useQuranStore();

  const [previewAudio, setPreviewAudio] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [reciterSearch, setReciterSearch] = useState('');
  const [translationSearch, setTranslationSearch] = useState('');
  const [showAllReciters, setShowAllReciters] = useState(false);
  const [activeTab, setActiveTab] = useState('theme');

  // Фильтрация чтецов по поиску
  const filteredReciters = useMemo(() => {
    if (!reciterSearch) return showAllReciters ? RECITERS : RECITERS.filter(r => POPULAR_RECITERS.includes(r.id));
    return RECITERS.filter(reciter => 
      reciter.name.toLowerCase().includes(reciterSearch.toLowerCase()) ||
      reciter.country.toLowerCase().includes(reciterSearch.toLowerCase())
    );
  }, [reciterSearch, showAllReciters]);

  // Группировка переводов по языкам с поиском
  const filteredTranslationsByLanguage = useMemo(() => {
    let translations = TRANSLATIONS;
    if (translationSearch) {
      translations = translations.filter(t => 
        t.name.toLowerCase().includes(translationSearch.toLowerCase()) ||
        t.language.toLowerCase().includes(translationSearch.toLowerCase())
      );
    }
    
    return translations.reduce((acc, translation) => {
      if (!acc[translation.language]) {
        acc[translation.language] = [];
      }
      acc[translation.language].push(translation);
      return acc;
    }, {} as Record<string, typeof TRANSLATIONS>);
  }, [translationSearch]);

  // Применяем цветовую тему при загрузке и изменении
  useEffect(() => {
    applyColorTheme(colorTheme);
  }, [colorTheme]);

  const applyColorTheme = (themeId: string) => {
    const theme = COLOR_THEMES.find(t => t.id === themeId);
    if (theme) {
      setColorTheme(themeId);
      const root = document.documentElement;
      root.style.setProperty('--primary-color', theme.colors.primary);
      root.style.setProperty('--secondary-color', theme.colors.secondary);
      root.style.setProperty('--accent-color', theme.colors.accent);
      root.style.setProperty('--background-color', theme.colors.background);
      root.style.setProperty('--card-color', theme.colors.card);
    }
  };

  const previewReciter = async (reciterId: string) => {
    try {
      if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
      }

      setPreviewAudio(reciterId);
      setIsPlaying(true);
      
      // Используем улучшенную функцию для получения аудио URL
      const audioUrl = await getCachedWorkingAudioUrl(1, 1, reciterId);
      const audio = new Audio();
      audio.volume = audioVolume;
      audio.crossOrigin = 'anonymous'; // Для обхода CORS
      setAudioElement(audio);
      
      // Предзагружаем аудио
      const isPreloaded = await preloadAudio(audioUrl);
      if (!isPreloaded) {
        throw new Error('Failed to preload audio');
      }
      
      audio.src = audioUrl;
      
      audio.oncanplaythrough = () => {
        audio.play().catch((error) => {
          console.error('Preview playback failed:', error);
          setIsPlaying(false);
          setPreviewAudio(null);
        });
      };
      
      audio.onended = () => {
        setIsPlaying(false);
        setPreviewAudio(null);
      };
      
      audio.onerror = (error) => {
        console.error('Preview audio error:', error);
        setIsPlaying(false);
        setPreviewAudio(null);
      };
      
      // Автоматическая остановка через 8 секунд
      setTimeout(() => {
        if (audio && !audio.paused) {
          audio.pause();
          setIsPlaying(false);
          setPreviewAudio(null);
        }
      }, 8000);
      
    } catch (error) {
      console.error('Preview failed:', error);
      setIsPlaying(false);
      setPreviewAudio(null);
      
      // Показываем уведомление об ошибке
      const errorMessage = locale === 'en' 
        ? 'Preview not available for this reciter' 
        : 'Превью недоступно для этого чтеца';
      
      // Временно показываем ошибку (можно добавить toast notification)
      setTimeout(() => {
        alert(errorMessage);
      }, 100);
    }
  };

  const stopPreview = () => {
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
    }
    setIsPlaying(false);
    setPreviewAudio(null);
  };

  const resetSettings = () => {
    setFontSize(18);
    setAudioSpeed(1);
    setAudioVolume(1);
    setAutoPlay(false);
    setSelectedTranslations(['en.sahih', 'ru.kuliev']);
    setAudioReciter('ar.alafasy');
    applyColorTheme('default');
    setDarkMode('system');
  };

  // Быстрая установка переводов по языку
  const setQuickTranslations = (language: string) => {
    const quickTranslations = QUICK_TRANSLATIONS[language as keyof typeof QUICK_TRANSLATIONS];
    if (quickTranslations) {
      setSelectedTranslations([
        ...selectedTranslations.filter(t => !TRANSLATIONS.find(tr => tr.id === t)?.language.toLowerCase().startsWith(language)),
        ...quickTranslations.slice(0, 2)
      ]);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <SettingsIcon className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold">
            {locale === 'en' ? 'Settings' : 'Настройки'}
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          {locale === 'en' 
            ? 'Customize your Quran reading experience'
            : 'Настройте ваш опыт чтения Корана'
          }
        </p>
      </div>

      {/* Quick Settings Tabs */}
      <div className="flex justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-2 shadow-lg">
          <div className="flex gap-2">
            {[
              { id: 'theme', icon: Palette, label: locale === 'en' ? 'Theme' : 'Тема' },
              { id: 'audio', icon: Volume2, label: locale === 'en' ? 'Audio' : 'Аудио' },
              { id: 'translation', icon: Languages, label: locale === 'en' ? 'Translation' : 'Перевод' },
              { id: 'reading', icon: Type, label: locale === 'en' ? 'Reading' : 'Чтение' }
            ].map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all",
                  activeTab === id
                    ? "bg-blue-500 text-white shadow-lg"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
                )}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Color Themes */}
        {activeTab === 'theme' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-6">
              <Palette className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-semibold">
                {locale === 'en' ? 'Appearance' : 'Внешний вид'}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Color Themes */}
              <div>
                <h3 className="text-lg font-medium mb-4">
                  {locale === 'en' ? 'Color Theme' : 'Цветовая тема'}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {COLOR_THEMES.map((theme) => (
                    <div
                      key={theme.id}
                      onClick={() => applyColorTheme(theme.id)}
                      className={cn(
                        "p-4 rounded-xl border-2 cursor-pointer transition-all hover:scale-105",
                        colorTheme === theme.id 
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg" 
                          : "border-gray-200 dark:border-gray-600 hover:border-gray-300"
                      )}
                    >
                      <div className="flex gap-2 mb-3">
                        <div 
                          className="w-5 h-5 rounded-full shadow-sm" 
                          style={{ backgroundColor: theme.colors.primary }}
                        />
                        <div 
                          className="w-5 h-5 rounded-full shadow-sm" 
                          style={{ backgroundColor: theme.colors.secondary }}
                        />
                        <div 
                          className="w-5 h-5 rounded-full shadow-sm" 
                          style={{ backgroundColor: theme.colors.accent }}
                        />
                      </div>
                      <p className="text-sm font-medium mb-2">
                        {theme.name[locale as 'en' | 'ru']}
                      </p>
                      {colorTheme === theme.id && (
                        <div className="flex items-center gap-1 text-blue-500">
                          <Check className="w-4 h-4" />
                          <span className="text-xs">
                            {locale === 'en' ? 'Active' : 'Активна'}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Dark Mode */}
              <div>
                <h3 className="text-lg font-medium mb-4">
                  {locale === 'en' ? 'Display Mode' : 'Режим отображения'}
                </h3>
                <div className="space-y-3">
                  {[
                    { id: 'light', icon: Sun, label: locale === 'en' ? 'Light Mode' : 'Светлый режим' },
                    { id: 'dark', icon: Moon, label: locale === 'en' ? 'Dark Mode' : 'Темный режим' },
                    { id: 'system', icon: Monitor, label: locale === 'en' ? 'System Default' : 'Системный' }
                  ].map(({ id, icon: Icon, label }) => (
                    <button
                      key={id}
                      onClick={() => setDarkMode(id as any)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all",
                        darkMode === id
                          ? "bg-blue-500 text-white shadow-lg"
                          : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                      )}
                    >
                      <Icon size={18} />
                      <span className="font-medium">{label}</span>
                      {darkMode === id && <Check size={16} className="ml-auto" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Audio Settings */}
        {activeTab === 'audio' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-6">
              <Headphones className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-semibold">
                {locale === 'en' ? 'Audio Settings' : 'Настройки аудио'}
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Reciter Selection */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">
                    {locale === 'en' ? 'Select Reciter (Qari)' : 'Выберите чтеца (Кари)'}
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder={locale === 'en' ? 'Search reciters...' : 'Поиск чтецов...'}
                        value={reciterSearch}
                        onChange={(e) => setReciterSearch(e.target.value)}
                        className="pl-10 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {reciterSearch && (
                        <button
                          onClick={() => setReciterSearch('')}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                    <button
                      onClick={() => setShowAllReciters(!showAllReciters)}
                      className="text-sm text-blue-600 hover:text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-50"
                    >
                      {showAllReciters 
                        ? (locale === 'en' ? 'Popular' : 'Популярные')
                        : (locale === 'en' ? 'Show All' : 'Показать все')
                      }
                    </button>
                  </div>
                </div>

                {/* Popular Reciters Quick Access */}
                {!reciterSearch && !showAllReciters && (
                  <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-medium">
                        {locale === 'en' ? 'Popular Reciters' : 'Популярные чтецы'}
                      </span>
                    </div>
                  </div>
                )}

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {filteredReciters.map((reciter) => (
                    <div
                      key={reciter.id}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md",
                        audioReciter === reciter.id
                          ? "border-green-500 bg-green-50 dark:bg-green-900/20 shadow-lg"
                          : "border-gray-200 dark:border-gray-600 hover:border-gray-300"
                      )}
                      onClick={() => setAudioReciter(reciter.id)}
                    >
                      <div className="flex items-center gap-3">
                        {POPULAR_RECITERS.includes(reciter.id) && (
                          <Star className="w-4 h-4 text-yellow-500" />
                        )}
                        <div>
                          <p className="font-medium text-sm">{reciter.name}</p>
                          <p className="text-xs text-gray-500">
                            {reciter.country}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {audioReciter === reciter.id && (
                          <Check className="w-4 h-4 text-green-500" />
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isPlaying && previewAudio === reciter.id) {
                              stopPreview();
                            } else {
                              previewReciter(reciter.id);
                            }
                          }}
                          disabled={isPlaying && previewAudio !== reciter.id}
                          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                        >
                          {isPlaying && previewAudio === reciter.id ? (
                            <Pause size={16} />
                          ) : (
                            <Play size={16} />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Audio Controls */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-3">
                    {locale === 'en' ? 'Playback Speed' : 'Скорость воспроизведения'}
                  </label>
                  <div className="text-center mb-2">
                    <span className="text-2xl font-bold text-blue-600">{audioSpeed}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={audioSpeed}
                    onChange={(e) => setAudioSpeed(parseFloat(e.target.value))}
                    className="w-full h-3 bg-gradient-to-r from-blue-200 to-blue-500 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0.5x</span>
                    <span>2x</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3">
                    {locale === 'en' ? 'Volume' : 'Громкость'}
                  </label>
                  <div className="text-center mb-2">
                    <span className="text-2xl font-bold text-green-600">{Math.round(audioVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={audioVolume}
                    onChange={(e) => setAudioVolume(parseFloat(e.target.value))}
                    className="w-full h-3 bg-gradient-to-r from-green-200 to-green-500 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="text-sm font-medium">
                        {locale === 'en' ? 'Auto-play next verse' : 'Автовоспроизведение'}
                      </span>
                      <p className="text-xs text-gray-500">
                        {locale === 'en' ? 'Automatically play next ayah' : 'Автоматически воспроизводить следующий аят'}
                      </p>
                    </div>
                    <button
                      onClick={() => setAutoPlay(!autoPlay)}
                      className={cn(
                        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
                        autoPlay ? "bg-green-600" : "bg-gray-300 dark:bg-gray-600"
                      )}
                    >
                      <span
                        className={cn(
                          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                          autoPlay ? "translate-x-6" : "translate-x-1"
                        )}
                      />
                    </button>
                  </label>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Translation Settings */}
        {activeTab === 'translation' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-6">
              <Globe className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold">
                {locale === 'en' ? 'Translations & Language' : 'Переводы и язык'}
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Language Setup */}
              <div>
                <h3 className="text-lg font-medium mb-4">
                  {locale === 'en' ? 'Quick Setup' : 'Быстрая настройка'}
                </h3>
                <div className="space-y-3">
                  {Object.entries(QUICK_TRANSLATIONS).map(([lang, translations]) => (
                    <button
                      key={lang}
                      onClick={() => setQuickTranslations(lang)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="text-2xl">
                        {lang === 'ru' ? '🇷🇺' : lang === 'en' ? '🇺🇸' : '🇸🇦'}
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-sm">
                          {lang === 'ru' ? 'Русский' : lang === 'en' ? 'English' : 'العربية'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {translations.length} {locale === 'en' ? 'translations' : 'переводов'}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Display Options */}
                <div className="mt-6 space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {locale === 'en' ? 'Show translations' : 'Показывать переводы'}
                        </span>
                      </div>
                      <button
                        onClick={toggleTranslation}
                        className={cn(
                          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
                          showTranslation ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
                        )}
                      >
                        <span
                          className={cn(
                            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                            showTranslation ? "translate-x-6" : "translate-x-1"
                          )}
                        />
                      </button>
                    </label>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Type className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {locale === 'en' ? 'Show transliteration' : 'Показывать транслитерацию'}
                        </span>
                      </div>
                      <button
                        onClick={toggleTransliteration}
                        className={cn(
                          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
                          showTransliteration ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
                        )}
                      >
                        <span
                          className={cn(
                            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                            showTransliteration ? "translate-x-6" : "translate-x-1"
                          )}
                        />
                      </button>
                    </label>
                  </div>
                </div>
              </div>

              {/* Translation Selection */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">
                    {locale === 'en' ? 'Available Translations' : 'Доступные переводы'}
                  </h3>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder={locale === 'en' ? 'Search translations...' : 'Поиск переводов...'}
                      value={translationSearch}
                      onChange={(e) => setTranslationSearch(e.target.value)}
                      className="pl-10 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-4">
                  {Object.entries(filteredTranslationsByLanguage).map(([language, translations]) => (
                    <div key={language} className="space-y-2">
                      <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                          <Languages className="w-4 h-4" />
                          {language}
                        </h4>
                        <span className="text-xs text-gray-500">
                          {translations.length} {locale === 'en' ? 'available' : 'доступно'}
                        </span>
                      </div>
                      <div className="ml-4 space-y-1">
                        {translations.map((translation) => (
                          <div
                            key={translation.id}
                            className={cn(
                              "flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-all",
                              selectedTranslations.includes(translation.id)
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                : "border-gray-200 dark:border-gray-600 hover:border-gray-300"
                            )}
                            onClick={() => {
                              const isSelected = selectedTranslations.includes(translation.id);
                              if (isSelected) {
                                setSelectedTranslations(selectedTranslations.filter(t => t !== translation.id));
                              } else {
                                setSelectedTranslations([...selectedTranslations, translation.id]);
                              }
                            }}
                          >
                            <div>
                              <p className="font-medium text-sm">{translation.name}</p>
                              <p className="text-xs text-gray-500 flex items-center gap-2">
                                {translation.type} 
                                {translation.quality && (
                                  <>
                                    • <span className={cn(
                                      "px-2 py-0.5 rounded-full text-xs",
                                      translation.quality === 'high' ? 'bg-green-100 text-green-700' :
                                      translation.quality === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                      'bg-gray-100 text-gray-700'
                                    )}>
                                      {translation.quality}
                                    </span>
                                  </>
                                )}
                              </p>
                            </div>
                            <div
                              className={cn(
                                "w-5 h-5 rounded border-2 flex items-center justify-center",
                                selectedTranslations.includes(translation.id)
                                  ? "bg-blue-500 border-blue-500"
                                  : "border-gray-300"
                              )}
                            >
                              {selectedTranslations.includes(translation.id) && (
                                <Check className="w-3 h-3 text-white" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Reading Settings */}
        {activeTab === 'reading' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-6">
              <Type className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-semibold">
                {locale === 'en' ? 'Reading Experience' : 'Настройки чтения'}
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Font Settings */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-4">
                    {locale === 'en' ? 'Arabic Text Size' : 'Размер арабского текста'}
                  </label>
                  <div className="text-center mb-3">
                    <span className="text-3xl font-bold text-purple-600">{fontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="14"
                    max="36"
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                    className="w-full h-3 bg-gradient-to-r from-purple-200 to-purple-500 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{locale === 'en' ? 'Small' : 'Малый'}</span>
                    <span>{locale === 'en' ? 'Large' : 'Большой'}</span>
                  </div>
                </div>

                {/* Font Preview */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border">
                  <p className="text-center text-gray-600 dark:text-gray-300 text-sm mb-3">
                    {locale === 'en' ? 'Preview:' : 'Предпросмотр:'}
                  </p>
                  <div className="text-center space-y-3">
                    <p 
                      className="font-arabic leading-relaxed text-gray-800 dark:text-gray-200"
                      style={{ fontSize: `${fontSize}px` }}
                      dir="rtl"
                    >
                      بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                    </p>
                    {showTransliteration && (
                      <p className="text-gray-600 dark:text-gray-400 italic text-sm">
                        Bismillahi r-rahmani r-raheem
                      </p>
                    )}
                    {showTranslation && (
                      <p className="text-gray-700 dark:text-gray-300 text-sm">
                        {locale === 'en' 
                          ? 'In the name of Allah, the Entirely Merciful, the Especially Merciful.'
                          : 'Во имя Аллаха, Милостивого, Милосердного!'
                        }
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Features */}
              <div className="space-y-6">
                <h3 className="font-medium text-lg">
                  {locale === 'en' ? 'Additional Features' : 'Дополнительные функции'}
                </h3>
                
                <div className="space-y-4">
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Download className="w-5 h-5 text-yellow-600" />
                      <span className="font-medium text-yellow-800 dark:text-yellow-200">
                        {locale === 'en' ? 'Offline Reading' : 'Офлайн чтение'}
                      </span>
                    </div>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
                      {locale === 'en' 
                        ? 'Download Quran for offline access'
                        : 'Скачайте Коран для офлайн доступа'
                      }
                    </p>
                    <button className="text-sm bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors">
                      {locale === 'en' ? 'Coming Soon' : 'Скоро'}
                    </button>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Bookmark className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-800 dark:text-green-200">
                        {locale === 'en' ? 'Smart Bookmarks' : 'Умные закладки'}
                      </span>
                    </div>
                    <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                      {locale === 'en' 
                        ? 'Sync bookmarks across devices'
                        : 'Синхронизация закладок между устройствами'
                      }
                    </p>
                    <button className="text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                      {locale === 'en' ? 'Coming Soon' : 'Скоро'}
                    </button>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Eye className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-blue-800 dark:text-blue-200">
                        {locale === 'en' ? 'Reading Progress' : 'Прогресс чтения'}
                      </span>
                    </div>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                      {locale === 'en' 
                        ? 'Track your reading journey'
                        : 'Отслеживайте ваш прогресс чтения'
                      }
                    </p>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '23%' }}></div>
                    </div>
                    <p className="text-xs text-blue-600 mt-2">23% completed</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex justify-center gap-4"
      >
        <Button
          onClick={resetSettings}
          variant="outline"
          className="flex items-center gap-2 px-6 py-3"
        >
          <RotateCcw size={18} />
          {locale === 'en' ? 'Reset to Defaults' : 'Сбросить к стандартным'}
        </Button>
        
        <Button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-6 py-3">
          <Save size={18} />
          {locale === 'en' ? 'Settings Saved' : 'Настройки сохранены'}
        </Button>
      </motion.div>

      {/* Settings Info */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 border">
        <div className="flex items-center justify-center gap-2 mb-2">
          <SettingsIcon className="w-4 h-4" />
          <span className="font-medium">
            {locale === 'en' ? 'Auto-Save Enabled' : 'Автосохранение включено'}
          </span>
        </div>
        <p>
          {locale === 'en' 
            ? 'All settings are automatically saved to your device and will persist across sessions.'
            : 'Все настройки автоматически сохраняются на вашем устройстве и сохранятся между сессиями.'
          }
        </p>
      </div>
    </div>
  );
}