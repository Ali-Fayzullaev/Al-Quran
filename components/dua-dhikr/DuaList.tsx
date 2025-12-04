// src/components/dua-dhikr/DuaList.tsx
"use client";

import { useState, useEffect } from "react";
import { useLocale } from "@/context/LocaleContext";
import DuaCard from "./DuaCard";
import CompletionNotification from './CompletionNotification';
import MiniProgressToast from './MiniProgressToast';
import { getCategoryCompletionMessage } from '@/lib/duaCounter';
import { Trophy, Target, CheckCircle, Clock } from 'lucide-react';
import {
  Languages, 
  Search, 
  Filter,
  Grid3X3,
  List,
  ChevronDown,
  Settings,
  ToggleLeft,
  ToggleRight,
  CheckCheck,
  Type,
  Minus,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DuaData {
  title: string;
  arabic: string;
  latin?: string;
  translation: string;
  notes?: string;
  fawaid?: string;
  source?: string;
}

interface DuaListProps {
  category: string;
  duaData: {
    ru: DuaData[];
    en: DuaData[];
    uz: DuaData[];
    kz: DuaData[];
    ['уз']?: DuaData[]; // Кириллический узбекский
  };
}

export default function DuaList({ category, duaData }: DuaListProps) {
  const { locale, t } = useLocale();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'default' | 'alphabetical'>('default');
  const [localDuaLanguage, setLocalDuaLanguage] = useState<'ru' | 'en' | 'uz' | 'kz'>('ru');
  const [filteredDuas, setFilteredDuas] = useState<DuaData[]>([]);
  const [showGlobalSettings, setShowGlobalSettings] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [completedDuas, setCompletedDuas] = useState<Set<string>>(new Set());
  const [showCategoryNotification, setShowCategoryNotification] = useState(false);
  const [categoryNotificationMessage, setCategoryNotificationMessage] = useState('');
  const [isClient, setIsClient] = useState(false);
  
  // Глобальные настройки отображения
  const [globalSettings, setGlobalSettings] = useState({
    transliteration: false,
    notes: true,
    benefits: false,
    source: false,
    fontSize: 'medium' as 'small' | 'medium' | 'large' | 'xlarge'
  });
  
  // Helper function to format translations with parameters
  const formatTranslation = (key: string, params: Record<string, string | number>) => {
    let translation = t(key);
    Object.keys(params).forEach(param => {
      translation = translation.replace(`{${param}}`, String(params[param]));
    });
    return translation;
  };
  
  // Функция для переключения настроек
  const toggleGlobalSetting = (setting: keyof typeof globalSettings) => {
    setGlobalSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  // Отслеживаем монтирование компонента для предотвращения ошибок гидратации
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Получаем данные для выбранного языка
  const currentDuas = duaData[localDuaLanguage] || duaData.ru;
  



  // Обновляем локальный язык при изменении глобального locale
  useEffect(() => {
    let validLanguage: 'ru' | 'en' | 'uz' | 'kz' = 'ru';
    
    if (locale === 'ru' || locale === 'en') {
      validLanguage = locale;
    } else if (locale === 'uz' || locale === 'уз') {
      // Для обеих версий узбекского используем 'uz'
      validLanguage = 'uz';
    } else if (locale === 'kz') {
      validLanguage = 'kz';
    }
    
    setLocalDuaLanguage(validLanguage);
    setForceUpdate(prev => prev + 1); // Принудительное обновление
  }, [locale]);

  // Доступные языки для переключения
  const availableLanguages = [
    { code: 'ru' as const, name: 'Русский', flag: '🇷🇺' },
    { code: 'en' as const, name: 'English', flag: '🇺🇸' },
    { code: 'uz' as const, name: "O'zbek", flag: '🇺🇿' },
    { code: 'kz' as const, name: 'Қазақша', flag: '🇰🇿' }
  ];

  const currentLanguageInfo = availableLanguages.find(lang => lang.code === localDuaLanguage) || availableLanguages[0];

  // Обработчик изменения локального языка дуа
  const handleLocalLanguageChange = (newLanguage: 'ru' | 'en' | 'uz' | 'kz') => {
    setLocalDuaLanguage(newLanguage);
    setForceUpdate(prev => prev + 1); // Принудительное обновление
  };

  useEffect(() => {
    let filtered = currentDuas;

    // Фильтрация по поисковому запросу
    if (searchTerm) {
      filtered = filtered.filter(dua => 
        dua.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dua.translation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (dua.latin && dua.latin.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Сортировка
    if (sortBy === 'alphabetical') {
      filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
    }

    setFilteredDuas(filtered);
  }, [currentDuas, searchTerm, sortBy, localDuaLanguage, forceUpdate]);

  // Подсчет общего прогресса (после инициализации currentDuas)
  const totalDuas = currentDuas.length;
  const completedCount = completedDuas.size;
  const remainingCount = totalDuas - completedCount;
  const categoryProgress = totalDuas > 0 ? Math.round((completedCount / totalDuas) * 100) : 0;

  const handleDuaComplete = (duaId: string) => {
    const newCompletedDuas = new Set(completedDuas);
    newCompletedDuas.add(duaId);
    setCompletedDuas(newCompletedDuas);
    
    // Check if all duas are completed
    if (newCompletedDuas.size === currentDuas.length) {
      // Мотивационные сообщения при завершении всех дуа
      const motivationalMessages = [
        `🎉 Машаллах! Вы завершили все ${currentDuas.length} дуа в категории "${category}"!`,
        `✨ Субханаллах! Все дуа прочитаны! Пусть Аллах примет ваши молитвы!`,
        `🌟 Альхамдулиллях! Вы успешно завершили изучение этой категории!`,
        `💫 Баракаллаху фикум! Отличная работа по изучению дуа!`,
        `🏆 Великолепно! Вы прочитали все ${currentDuas.length} дуа! Пусть они принесут вам благословение!`
      ];
      
      const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
      setCategoryNotificationMessage(randomMessage);
      setShowCategoryNotification(true);
      
      // Показываем дополнительное празднование
      setTimeout(() => {
        setCategoryNotificationMessage(`🎊 Категория "${category}" полностью завершена! Переходите к следующей категории для продолжения изучения дуа.`);
      }, 3000);
    }
  };

  const handleCloseCategoryNotification = () => {
    setShowCategoryNotification(false);
  };

  // Ожидаем завершения гидратации
  if (!isClient) {
    return (
      <div className="space-y-4 md:space-y-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div key={`${localDuaLanguage}-${forceUpdate}`} className="space-y-6">
      
      {/* Category Progress Panel - Mobile Optimized */}
      <div className="p-4 md:p-6 rounded-xl md:rounded-2xl mb-4 md:mb-6" style={{
        backgroundColor: 'var(--color-background-secondary)',
        borderStyle: 'solid',
        borderWidth: '1px',
        borderColor: categoryProgress === 100 ? 'var(--color-success, #10b981)' : 'var(--color-primary)'
      }}>
        {/* Mobile Layout - Стек */}
        <div className="block md:hidden space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {categoryProgress === 100 ? (
                <Trophy className="w-5 h-5 text-green-600" />
              ) : (
                <Target className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
              )}
              <h3 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
                {categoryProgress === 100 ? '🎉 Готово!' : `${categoryProgress}%`}
              </h3>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold" style={{ 
                color: categoryProgress === 100 ? 'var(--color-success, #10b981)' : 'var(--color-primary)' 
              }}>
                {completedCount}/{totalDuas}
              </div>
            </div>
          </div>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {categoryProgress === 100 
              ? formatTranslation('DuaDhikr.allDuasCompleted', { total: totalDuas })
              : formatTranslation('DuaDhikr.remainingDuas', { remaining: remainingCount, total: totalDuas })
            }
          </p>
        </div>
        
        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {categoryProgress === 100 ? (
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-green-100 dark:bg-green-900/30">
                <Trophy className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{
                backgroundColor: 'var(--color-primary)',
                opacity: 0.1
              }}>
                <Target className="w-6 h-6" style={{ color: 'var(--color-primary)' }} />
              </div>
            )}
            <div>
              <h3 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
                {categoryProgress === 100 ? t('DuaDhikr.categoryCompleted') : `${t('DuaDhikr.progress')}: ${categoryProgress}%`}
              </h3>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                {categoryProgress === 100 
                  ? formatTranslation('DuaDhikr.allDuasCompleted', { total: totalDuas })
                  : formatTranslation('DuaDhikr.remainingDuas', { remaining: remainingCount, total: totalDuas })
                }
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-3xl font-bold" style={{ 
              color: categoryProgress === 100 ? 'var(--color-success, #10b981)' : 'var(--color-primary)' 
            }}>
              {completedCount}/{totalDuas}
            </div>
            <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              {categoryProgress === 100 ? t('DuaDhikr.completed') : t('DuaDhikr.completed')}
            </div>
          </div>
        </div>
        
        {/* Progress Bar - Simplified for mobile */}
        <div className="relative w-full h-2 md:h-3 rounded-full overflow-hidden mb-2 md:mb-3" style={{
          backgroundColor: 'var(--color-background)'
        }}>
          <div 
            className="h-full transition-all duration-500 md:duration-1000 ease-out rounded-full"
            style={{
              width: `${categoryProgress}%`,
              backgroundColor: categoryProgress === 100 
                ? 'var(--color-success, #10b981)' 
                : 'var(--color-primary)'
            }}
          />
        </div>
        
        {/* Stats - Mobile optimized */}
        <div className="flex items-center justify-between text-xs md:text-sm">
          <div className="flex items-center gap-2 md:gap-4">
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-green-600" />
              <span style={{ color: 'var(--color-text-secondary)' }} className="hidden sm:inline">{t('DuaDhikr.completed')}:</span>
              <span style={{ color: 'var(--color-text-secondary)' }}>{completedCount}</span>
            </div>
            {remainingCount > 0 && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 md:w-4 md:h-4 text-orange-500" />
                <span style={{ color: 'var(--color-text-secondary)' }} className="hidden sm:inline">{t('DuaDhikr.remaining')}:</span>
                <span style={{ color: 'var(--color-text-secondary)' }}>{remainingCount}</span>
              </div>
            )}
          </div>
          
          <div className="text-sm md:text-lg font-bold" style={{ 
            color: categoryProgress === 100 ? 'var(--color-success, #10b981)' : 'var(--color-primary)' 
          }}>
            {categoryProgress}%
          </div>
        </div>
        
        {/* Motivational message - No animation on mobile */}
        {remainingCount > 0 && remainingCount <= 3 && (
          <div className="mt-2 md:mt-3 p-2 rounded-lg" style={{ backgroundColor: 'var(--color-background)' }}>
            <p className="text-xs md:text-sm text-center font-medium" style={{ color: 'var(--color-primary)' }}>
              {formatTranslation('DuaDhikr.almostDone', { remaining: remainingCount })}
            </p>
          </div>
        )}
      </div>

      {/* Controls Bar - Mobile Optimized */}
      <div className="flex flex-col gap-3 md:gap-4 p-3 md:p-4 rounded-lg md:rounded-xl" style={{
        backgroundColor: 'var(--color-background-secondary)',
        borderStyle: 'solid',
        borderWidth: '1px',
        borderColor: 'var(--color-border)'
      }}>
        
        {/* Mobile: Vertical layout */}
        <div className="flex flex-col gap-3 md:hidden">
        
          {/* Mobile Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" 
                    style={{ color: 'var(--color-primary)' }} />
            <Input
              placeholder={t('DuaDhikr.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-10 text-sm"
              style={{ 
                backgroundColor: 'var(--color-background)',
                borderStyle: 'solid',
                borderWidth: '1px',
                borderColor: 'var(--color-border)'
              }}
            />
          </div>
          
          {/* Mobile Controls Row */}
          <div className="flex items-center justify-between gap-2">
            {/* Language Selector */}
            <div className="flex items-center gap-2">
              <Languages className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
              <Select value={localDuaLanguage} onValueChange={(value) => handleLocalLanguageChange(value as 'ru' | 'en' | 'uz')}>
                <SelectTrigger className="w-20 h-8 text-xs" style={{ 
                  backgroundColor: 'var(--color-background)', 
                  borderStyle: 'solid',
                  borderWidth: '1px',
                  borderColor: 'var(--color-border)' 
                }}>
                  <div className="flex items-center gap-1">
                    <span>{currentLanguageInfo.flag}</span>
                    <span className="hidden sm:inline">{currentLanguageInfo.code.toUpperCase()}</span>
                  </div>
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: 'var(--color-background-secondary)' }}>
                  {availableLanguages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <div className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowGlobalSettings(!showGlobalSettings)}
                className="h-8 px-2 text-xs"
              >
                <Settings className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Desktop: Horizontal layout */}
        <div className="hidden md:flex md:flex-row gap-4">
          {/* Desktop Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" 
                    style={{ color: 'var(--color-text-secondary)' }} />
            <Input
              placeholder={t('DuaDhikr.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              style={{ 
                backgroundColor: 'var(--color-background)',
                borderStyle: 'solid',
                borderWidth: '1px',
                borderColor: 'var(--color-border)'
              }}
            />
          </div>

          {/* Desktop Controls */}
          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <div className="flex items-center gap-2">
              <Languages className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
              <Select value={localDuaLanguage} onValueChange={(value) => handleLocalLanguageChange(value as 'ru' | 'en' | 'uz')}>
                <SelectTrigger className="w-32 h-9 text-sm" style={{ 
                  backgroundColor: 'var(--color-background)', 
                  borderStyle: 'solid',
                  borderWidth: '1px',
                  borderColor: 'var(--color-border)' 
                }}>
                  <div className="flex items-center gap-2">
                    <span>{currentLanguageInfo.flag}</span>
                    <span>{currentLanguageInfo.name}</span>
                  </div>
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: 'var(--color-background-secondary)' }}>
                  {availableLanguages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <div className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort Select */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
              <Select value={sortBy} onValueChange={(value: 'default' | 'alphabetical') => setSortBy(value)}>
                <SelectTrigger className="w-32 h-9 text-sm" style={{ 
                  backgroundColor: 'var(--color-background)', 
                  borderStyle: 'solid',
                  borderWidth: '1px',
                  borderColor: 'var(--color-border)' 
                }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: 'var(--color-background-secondary)' }}>
                  <SelectItem value="default">
                    {t('DuaDhikr.sortDefault')}
                  </SelectItem>
                  <SelectItem value="alphabetical">
                    {t('DuaDhikr.sortAlphabetical')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Global Settings */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowGlobalSettings(!showGlobalSettings)}
              className="gap-2"
            >
              <Settings className="w-4 h-4" />
              {t('DuaDhikr.settings')}
            </Button>
          </div>
        </div>
      </div>

      {/* Global Settings Panel */}
      {showGlobalSettings && (
        <div className="p-4 rounded-xl border mb-6 animate-in slide-in-from-top-2 duration-300" style={{
          backgroundColor: 'var(--color-background-secondary)',
          borderColor: 'var(--color-border)'
        }}>
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
            <h3 className="font-medium" style={{ color: 'var(--color-primary)' }}>
              {t('DuaDhikr.globalSettings')}
            </h3>
          </div>
          <div className="text-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>
            {t('DuaDhikr.globalSettingsDescription')}
          </div>
          {/* Размер шрифта */}
          <div className="p-4 rounded-lg border mb-4" style={{
            backgroundColor: 'var(--color-background)',
            borderColor: 'var(--color-border)'
          }}>
            <div className="flex items-center gap-2 mb-3">
              <Type className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
              <span className="text-sm font-medium">{t('DuaDhikr.fontSize')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setGlobalSettings(prev => ({
                    ...prev,
                    fontSize: prev.fontSize === 'small' ? 'small' : 
                              prev.fontSize === 'medium' ? 'small' :
                              prev.fontSize === 'large' ? 'medium' : 'large'
                  }))}
                  className="h-8 px-2"
                  disabled={globalSettings.fontSize === 'small'}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <div className="px-3 py-1 text-sm font-medium min-w-[60px] text-center">
                  {globalSettings.fontSize === 'small' && 'А'}
                  {globalSettings.fontSize === 'medium' && 'А'}
                  {globalSettings.fontSize === 'large' && 'А'}
                  {globalSettings.fontSize === 'xlarge' && 'А'}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setGlobalSettings(prev => ({
                    ...prev,
                    fontSize: prev.fontSize === 'small' ? 'medium' : 
                              prev.fontSize === 'medium' ? 'large' :
                              prev.fontSize === 'large' ? 'xlarge' : 'xlarge'
                  }))}
                  className="h-8 px-2"
                  disabled={globalSettings.fontSize === 'xlarge'}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                {globalSettings.fontSize === 'small' && 'Маленький'}
                {globalSettings.fontSize === 'medium' && 'Средний'}
                {globalSettings.fontSize === 'large' && 'Большой'}
                {globalSettings.fontSize === 'xlarge' && 'Очень большой'}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Транслитерация */}
            <div 
              className="p-3 rounded-lg border cursor-pointer transition-colors hover:bg-opacity-80" 
              style={{
                backgroundColor: 'var(--color-background)',
                borderColor: 'var(--color-border)'
              }}
              onClick={() => toggleGlobalSetting('transliteration')}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{t('DuaDhikr.transliteration')}</span>
                {globalSettings.transliteration ? (
                  <ToggleRight className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                ) : (
                  <ToggleLeft className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
                )}
              </div>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                {globalSettings.transliteration ? t('DuaDhikr.defaultVisible') : t('DuaDhikr.defaultHidden')}
              </p>
            </div>
            
            {/* Заметки */}
            <div 
              className="p-3 rounded-lg border cursor-pointer transition-colors hover:bg-opacity-80" 
              style={{
                backgroundColor: 'var(--color-background)',
                borderColor: 'var(--color-border)'
              }}
              onClick={() => toggleGlobalSetting('notes')}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{t('DuaDhikr.notes')}</span>
                {globalSettings.notes ? (
                  <ToggleRight className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                ) : (
                  <ToggleLeft className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
                )}
              </div>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                {globalSettings.notes ? t('DuaDhikr.defaultVisible') : t('DuaDhikr.defaultHidden')}
              </p>
            </div>
            
            {/* Польза */}
            <div 
              className="p-3 rounded-lg border cursor-pointer transition-colors hover:bg-opacity-80" 
              style={{
                backgroundColor: 'var(--color-background)',
                borderColor: 'var(--color-border)'
              }}
              onClick={() => toggleGlobalSetting('benefits')}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{t('DuaDhikr.benefits')}</span>
                {globalSettings.benefits ? (
                  <ToggleRight className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                ) : (
                  <ToggleLeft className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
                )}
              </div>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                {globalSettings.benefits ? t('DuaDhikr.defaultVisible') : t('DuaDhikr.defaultHidden')}
              </p>
            </div>
            
            {/* Источник */}
            <div 
              className="p-3 rounded-lg border cursor-pointer transition-colors hover:bg-opacity-80" 
              style={{
                backgroundColor: 'var(--color-background)',
                borderColor: 'var(--color-border)'
              }}
              onClick={() => toggleGlobalSetting('source')}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{t('DuaDhikr.source')}</span>
                {globalSettings.source ? (
                  <ToggleRight className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                ) : (
                  <ToggleLeft className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
                )}
              </div>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                {globalSettings.source ? t('DuaDhikr.defaultVisible') : t('DuaDhikr.defaultHidden')}
              </p>
            </div>
          </div>
          <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--color-background)' }}>
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              💡 <strong>{t('DuaDhikr.tip')}:</strong> {t('DuaDhikr.tipText')}
            </p>
          </div>
        </div>
      )}

      {/* Dua List */}
      {filteredDuas.length > 0 ? (
        <div className={`
          ${viewMode === 'grid' 
            ? 'grid grid-cols-1 gap-6' 
            : 'space-y-4'
          }
        `}>
          {filteredDuas.map((dua, index) => (
            <DuaCard
              key={index}
              dua={dua}
              index={index}
              onComplete={handleDuaComplete}
              isCompleted={completedDuas.has(`${dua.title.replace(/\s+/g, '-').toLowerCase()}-${dua.arabic.slice(0, 10)}`)}
              category={category}
              globalSettings={globalSettings}
            />
          ))}
        </div>
      ) : (
        /* No Results */
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
               style={{ backgroundColor: 'var(--color-background-secondary)' }}>
            <Search className="w-8 h-8" style={{ color: 'var(--color-text-secondary)' }} />
          </div>
          <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--color-text)' }}>
            {t('DuaDhikr.noResults')}
          </h3>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {t('DuaDhikr.noResultsDescription')}
          </p>
          {searchTerm && (
            <Button
              variant="outline"
              onClick={() => setSearchTerm('')}
              className="mt-4"
            >
              {t('DuaDhikr.clearSearch')}
            </Button>
          )}
        </div>
      )}

      {/* Load More Button (если нужно) */}
      {filteredDuas.length > 10 && (
        <div className="text-center pt-8">
          <Button variant="outline" className="gap-2">
            {t('DuaDhikr.loadMoreDuas')}
            <ChevronDown className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Category Completion Notification */}
      <CompletionNotification
        isVisible={showCategoryNotification}
        message={categoryNotificationMessage}
        type="category"
        onClose={handleCloseCategoryNotification}
        duration={7000}
      />

      {/* Mini Progress Toast */}
      <MiniProgressToast
        remainingCount={remainingCount}
        totalCount={totalDuas}
        isVisible={remainingCount > 0 && remainingCount <= 3 && completedCount > 0}
      />
    </div>
  );
}