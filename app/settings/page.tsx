"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  Volume2, 
  Languages, 
  Type, 
  Bookmark,
  Download,
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
import ColorPicker from "@/components/ColorPicker";
import CustomColorSettings from "@/components/CustomColorSettings";

// Популярные чтецы для быстрого доступа
const POPULAR_RECITERS = ['ar.alafasy', 'ar.abdulbasitmurattal', 'ar.abdurrahmaansudais', 'ar.mahermuaiqly'];

// Рекомендуемые переводы для быстрого доступа
const QUICK_TRANSLATIONS = {
  ru: ['ru.kuliev', 'ru.osmanov', 'ru.porokhova'],
  en: ['en.sahih', 'en.asad', 'en.pickthall'],
  ar: ['quran-uthmani', 'ar.muyassar']
};

export default function SettingsPage() {
  const { locale, t } = useLocale();
  const {
    fontSize,
    showTranslation,
    showTransliteration,
    selectedTranslations,
    audioReciter,
    audioSpeed,
    audioVolume,
    autoPlay,
    siteColorTheme,
    quranTextColorScheme,
    setFontSize,
    toggleTranslation,
    toggleTransliteration,
    setSelectedTranslations,
    setAudioReciter,
    setAudioSpeed,
    setAudioVolume,
    setAutoPlay,
    setSiteColorTheme,
    setQuranTextColorScheme
  } = useQuranStore();

  const [previewAudio, setPreviewAudio] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [reciterSearch, setReciterSearch] = useState('');
  const [translationSearch, setTranslationSearch] = useState('');
  const [showAllReciters, setShowAllReciters] = useState(false);
  const [activeTab, setActiveTab] = useState('audio');

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

  const previewReciter = async (reciterId: string) => {
    try {
      if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
      }

      setPreviewAudio(reciterId);
      setIsPlaying(true);
      
      const audioUrl = await getCachedWorkingAudioUrl(1, 1, reciterId);
      const audio = new Audio();
      audio.volume = audioVolume;
      audio.crossOrigin = 'anonymous';
      setAudioElement(audio);
      
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
      
      const errorMessage = locale === 'en' 
        ? 'Preview not available for this reciter' 
        : 'Превью недоступно для этого чтеца';
      
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
    setSiteColorTheme('green');
    setQuranTextColorScheme('classic');
  };

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
          <SettingsIcon className="w-8 h-8" style={{ color: 'var(--color-primary)' }} />
          <h1 className="text-3xl font-bold gradient-text-primary">
            {t('settings')}
          </h1>
        </div>
        <p style={{ color: 'var(--fixed-text-secondary)' }}>
          {t('settingsDescription')}
        </p>
      </div>

      {/* Quick Settings Tabs */}
      <div className="flex justify-center">
        <div className="rounded-2xl p-2 shadow-lg border" style={{
          backgroundColor: 'var(--verse-background)',
          borderColor: 'var(--color-border)'
        }}>
          <div className="flex gap-2">
            {[
              { id: 'audio', icon: Volume2, label: t('audio') },
              { id: 'translation', icon: Languages, label: t('translation') },
              { id: 'reading', icon: Type, label: locale === 'en' ? 'Reading' : 'Чтение' },
              { id: 'colors', icon: Eye, label: locale === 'en' ? 'Colors' : 'Цвета' }
            ].map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all"
                style={{
                  backgroundColor: activeTab === id ? 'var(--color-primary)' : 'transparent',
                  color: activeTab === id ? '#ffffff' : 'var(--fixed-text-secondary)',
                  boxShadow: activeTab === id ? '0 4px 10px rgba(0,0,0,0.1)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== id) {
                    e.currentTarget.style.backgroundColor = 'var(--color-border)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== id) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">


        {/* Audio Settings */}
        {activeTab === 'audio' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-2 rounded-2xl p-6 shadow-lg border" style={{
              backgroundColor: 'var(--verse-background)',
              borderColor: 'var(--color-border)'
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Headphones className="w-6 h-6" style={{ color: 'var(--color-primary)' }} />
              <h2 className="text-xl font-semibold" style={{ color: 'var(--fixed-text)' }}>
                {t('audioSettings')}
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Reciter Selection */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium" style={{ color: 'var(--fixed-text)' }}>
                    {t('selectReciterQari')}
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAllReciters(!showAllReciters)}
                    className="text-xs"
                  >
                    {showAllReciters 
                      ? (locale === 'en' ? 'Show Popular' : 'Популярные')
                      : (locale === 'en' ? 'Show All' : 'Все')
                    }
                  </Button>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--fixed-text-secondary)' }} />
                  <input
                    type="text"
                    placeholder={locale === 'en' ? 'Search reciters...' : 'Поиск чтецов...'}
                    value={reciterSearch}
                    onChange={(e) => setReciterSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg"
                    style={{
                      backgroundColor: 'var(--fixed-background)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--fixed-text)'
                    }}
                  />
                </div>

                {/* Reciters List */}
                <div className="max-h-64 overflow-y-auto space-y-2 border rounded-lg p-2" style={{ borderColor: 'var(--color-border)' }}>
                  {filteredReciters.map((reciter) => (
                    <div
                      key={reciter.id}
                      className="flex items-center justify-between p-3 rounded-lg transition-all cursor-pointer border"
                      style={{
                        backgroundColor: audioReciter === reciter.id ? 'var(--verse-background)' : 'transparent',
                        borderColor: audioReciter === reciter.id ? 'var(--color-primary)' : 'transparent'
                      }}
                      onClick={() => setAudioReciter(reciter.id)}
                      onMouseEnter={(e) => {
                        if (audioReciter !== reciter.id) {
                          e.currentTarget.style.backgroundColor = 'var(--color-border)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (audioReciter !== reciter.id) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      <div>
                        <p className="font-medium" style={{ color: 'var(--fixed-text)' }}>{reciter.name}</p>
                        <p className="text-sm" style={{ color: 'var(--fixed-text-secondary)' }}>{reciter.country}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {audioReciter === reciter.id && (
                          <Check className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (previewAudio === reciter.id && isPlaying) {
                              stopPreview();
                            } else {
                              previewReciter(reciter.id);
                            }
                          }}
                          className="p-1"
                        >
                          {previewAudio === reciter.id && isPlaying ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Audio Controls */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--fixed-text-secondary)' }}>
                    {t('volume')}: {Math.round(audioVolume * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={audioVolume}
                    onChange={(e) => setAudioVolume(Number(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${audioVolume * 100}%, var(--color-border) ${audioVolume * 100}%, var(--color-border) 100%)`
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--fixed-text-secondary)' }}>
                    {t('speed')}: {audioSpeed}x
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.25"
                    value={audioSpeed}
                    onChange={(e) => setAudioSpeed(Number(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${((audioSpeed - 0.5) / 1.5) * 100}%, var(--color-border) ${((audioSpeed - 0.5) / 1.5) * 100}%, var(--color-border) 100%)`
                    }}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: 'var(--color-secondary)' }}>
                  <div>
                    <p className="font-medium" style={{ color: 'var(--fixed-text)' }}>
                      {t('autoplayNext')}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--fixed-text-secondary)' }}>
                      {locale === 'en' ? 'Automatically play next verse' : 'Автоматически воспроизводить следующий аят'}
                    </p>
                  </div>
                  <button
                    onClick={() => setAutoPlay(!autoPlay)}
                    className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                    style={{ backgroundColor: autoPlay ? 'var(--color-primary)' : 'var(--color-border)' }}
                  >
                    <span
                      className={cn(
                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                        autoPlay ? "translate-x-6" : "translate-x-1"
                      )}
                    />
                  </button>
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
            className="lg:col-span-2 rounded-2xl p-6 shadow-lg border" style={{
              backgroundColor: 'var(--verse-background)',
              borderColor: 'var(--color-border)'
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Languages className="w-6 h-6" style={{ color: 'var(--color-primary)' }} />
              <h2 className="text-xl font-semibold" style={{ color: 'var(--fixed-text)' }}>
                {t('selectTranslations')}
              </h2>
            </div>

            {/* Quick Language Selection */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3" style={{ color: 'var(--fixed-text)' }}>
                {locale === 'en' ? 'Quick Setup' : 'Быстрая настройка'}
              </h3>
              <div className="flex gap-2 flex-wrap">
                {[
                  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
                  { code: 'en', label: 'English', flag: '🇺🇸' },
                  { code: 'ar', label: 'العربية', flag: '🇸🇦' }
                ].map(({ code, label, flag }) => (
                  <Button
                    key={code}
                    variant="outline"
                    size="sm"
                    onClick={() => setQuickTranslations(code)}
                    className="flex items-center gap-2"
                  >
                    <span>{flag}</span>
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder={locale === 'en' ? 'Search translations...' : 'Поиск переводов...'}
                value={translationSearch}
                onChange={(e) => setTranslationSearch(e.target.value)}
                
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                style={{
                    borderColor: 'var(--color-primary)'
                  }}
              />
            </div>

            {/* Translations by Language */}
            <div className="max-h-96 overflow-y-auto space-y-4">
              {Object.entries(filteredTranslationsByLanguage).map(([language, translations]) => (
                <div key={language} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <h4 className="font-semibold mb-3 text-gray-900 dark:text-gray-100 capitalize">
                    {language === 'arabic' ? 'العربية' : 
                     language === 'russian' ? 'Русский' :
                     language === 'english' ? 'English' : language}
                  </h4>
                  <div className="space-y-2">
                    {translations.map((translation) => (
                      <label
                        key={translation.id}
                        className="flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors"
                        style={{
                          backgroundColor: 'transparent'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--color-border)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedTranslations.includes(translation.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTranslations([...selectedTranslations, translation.id]);
                            } else {
                              setSelectedTranslations(selectedTranslations.filter(id => id !== translation.id));
                            }
                          }}
                          className="w-4 h-4 rounded"
                          style={{
                            accentColor: 'var(--color-primary)'
                          }}
                        />
                        <div>
                          <p className="font-medium" style={{ color: 'var(--fixed-text)' }}>{translation.name}</p>
                          <p className="text-sm" style={{ color: 'var(--fixed-text-secondary)' }}>{translation.language}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Reading Settings */}
        {activeTab === 'reading' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-2 rounded-2xl p-6 shadow-lg border" style={{
              backgroundColor: 'var(--verse-background)',
              borderColor: 'var(--color-border)'
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Type className="w-6 h-6" style={{ color: 'var(--color-primary)' }} />
              <h2 className="text-xl font-semibold" style={{ color: 'var(--fixed-text)' }}>
                {t('displaySettings')}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Font Size */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--fixed-text-secondary)' }}>
                  {t('fontSizeLabel')} {fontSize}px
                </label>
                <input
                  type="range"
                  min="12"
                  max="32"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${((fontSize - 12) / 20) * 100}%, var(--color-border) ${((fontSize - 12) / 20) * 100}%, var(--color-border) 100%)`
                  }}
                />
              </div>

              {/* Display Options */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: 'var(--color-secondary)' }}>
                  <div>
                    <p className="font-medium" style={{ color: 'var(--fixed-text)' }}>
                      {t('showTranslation')}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--fixed-text-secondary)' }}>
                      {locale === 'en' ? 'Show verse translations' : 'Показывать переводы аятов'}
                    </p>
                  </div>
                  <button
                    onClick={toggleTranslation}
                    className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                    style={{ backgroundColor: showTranslation ? 'var(--color-primary)' : 'var(--color-border)' }}
                  >
                    <span
                      className={cn(
                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                        showTranslation ? "translate-x-6" : "translate-x-1"
                      )}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: 'var(--color-secondary)' }}>
                  <div>
                    <p className="font-medium" style={{ color: 'var(--fixed-text)' }}>
                      {t('showTransliteration')}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--fixed-text-secondary)' }}>
                      {locale === 'en' ? 'Show Arabic transliteration' : 'Показывать транслитерацию'}
                    </p>
                  </div>
                  <button
                    onClick={toggleTransliteration}
                    className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                    style={{ backgroundColor: showTransliteration ? 'var(--color-primary)' : 'var(--color-border)' }}
                  >
                    <span
                      className={cn(
                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                        showTransliteration ? "translate-x-6" : "translate-x-1"
                      )}
                    />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Colors Settings */}
        {activeTab === 'colors' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-2"
          >
            <CustomColorSettings />
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
          {t('resetToDefault')}
        </Button>
        
        <Button className="flex items-center gap-2 theme-btn-primary px-6 py-3">
          <Save size={18} />
          {locale === 'en' ? 'Settings Saved' : 'Настройки сохранены'}
        </Button>
      </motion.div>

      {/* Settings Info */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-700">
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
