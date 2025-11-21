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
  ToggleRight
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
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";

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
  };
}

export default function DuaList({ category, duaData }: DuaListProps) {
  const { locale, t } = useLocale();
  const selectedLanguage = 'ru'; // Только русский язык
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'default' | 'alphabetical'>('default');
  const [filteredDuas, setFilteredDuas] = useState<DuaData[]>([]);
  const [showGlobalSettings, setShowGlobalSettings] = useState(false);
  const [completedDuas, setCompletedDuas] = useState<Set<string>>(new Set());
  const [showCategoryNotification, setShowCategoryNotification] = useState(false);
  const [categoryNotificationMessage, setCategoryNotificationMessage] = useState('');

  // Получаем данные для выбранного языка
  const currentDuas = duaData[selectedLanguage as keyof typeof duaData] || duaData.ru;

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
  }, [currentDuas, searchTerm, sortBy]);

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
      const message = getCategoryCompletionMessage(category, currentDuas.length);
      setCategoryNotificationMessage(message);
      setShowCategoryNotification(true);
    }
  };

  const handleCloseCategoryNotification = () => {
    setShowCategoryNotification(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Category Progress Panel */}
      <div className="p-6 rounded-2xl border-2 mb-6" style={{
        backgroundColor: 'var(--color-background-secondary)',
        borderColor: categoryProgress === 100 ? 'var(--color-success, #10b981)' : 'var(--color-primary)',
        borderStyle: categoryProgress === 100 ? 'solid' : 'dashed'
      }}>
        <div className="flex items-center justify-between mb-4">
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
                {categoryProgress === 100 ? '🎉 Категория завершена!' : `Прогресс: ${categoryProgress}%`}
              </h3>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                {categoryProgress === 100 
                  ? `Все ${totalDuas} дуа прочитаны! Машаллах!`
                  : `Осталось ${remainingCount} из ${totalDuas} дуа`
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
              {categoryProgress === 100 ? 'Завершено' : 'Выполнено'}
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="relative w-full h-3 rounded-full overflow-hidden mb-3" style={{
          backgroundColor: 'var(--color-background)'
        }}>
          <div 
            className={`h-full transition-all duration-1000 ease-out rounded-full ${
              categoryProgress === 100 ? 'animate-pulse' : ''
            }`}
            style={{
              width: `${categoryProgress}%`,
              backgroundColor: categoryProgress === 100 
                ? 'var(--color-success, #10b981)' 
                : 'var(--color-primary)',
              transform: 'translateZ(0)'
            }}
          />
          
          {/* Shimmer effect */}
          {categoryProgress > 0 && categoryProgress < 100 && (
            <div 
              className="absolute top-0 h-full w-12 -skew-x-12 animate-shimmer"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                left: `${categoryProgress - 15}%`
              }}
            />
          )}
        </div>
        
        {/* Stats */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span style={{ color: 'var(--color-text-secondary)' }}>Завершено: {completedCount}</span>
            </div>
            {remainingCount > 0 && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-orange-500" />
                <span style={{ color: 'var(--color-text-secondary)' }}>Осталось: {remainingCount}</span>
              </div>
            )}
          </div>
          
          <div className="text-lg font-bold" style={{ 
            color: categoryProgress === 100 ? 'var(--color-success, #10b981)' : 'var(--color-primary)' 
          }}>
            {categoryProgress}%
          </div>
        </div>
        
        {/* Motivational message */}
        {remainingCount > 0 && remainingCount <= 3 && (
          <div className="mt-3 p-2 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--color-background)' }}>
            <p className="text-sm text-center font-medium" style={{ color: 'var(--color-primary)' }}>
              🔥 Почти готово! Осталось всего {remainingCount} дуа!
            </p>
          </div>
        )}
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row gap-4 p-4 rounded-xl border" style={{
        backgroundColor: 'var(--color-background-secondary)',
        borderColor: 'var(--color-border)'
      }}>
        
        {/* Left - Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" 
                  style={{ color: 'var(--color-text-secondary)' }} />
          <Input
            placeholder="Поиск дуа..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border"
            style={{ 
              backgroundColor: 'var(--color-background)',
              borderColor: 'var(--color-border)'
            }}
          />
        </div>

        {/* Center - Controls */}
        <div className="flex items-center gap-2">
          
          {/* Русский язык по умолчанию */}
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            <Languages className="w-4 h-4" />
            <span>Русский</span>
          </div>

          {/* Sort Select */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
            <Select value={sortBy} onValueChange={(value: 'default' | 'alphabetical') => setSortBy(value)}>
              <SelectTrigger className="w-32 h-9 text-sm border" style={{ 
                backgroundColor: 'var(--color-background)', 
                borderColor: 'var(--color-border)' 
              }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent style={{ backgroundColor: 'var(--color-background-secondary)' }}>
                <SelectItem value="default">
                  {locale === 'en' ? 'Default' : 'По умолчанию'}
                </SelectItem>
                <SelectItem value="alphabetical">
                  {locale === 'en' ? 'A-Z' : 'А-Я'}
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
            Настройки
          </Button>

          {/* View Mode Toggle */}
          <div className="flex border rounded-lg overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-none px-3"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-none px-3"
            >
              <List className="w-4 h-4" />
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
              Глобальные настройки отображения
            </h3>
          </div>
          <div className="text-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>
            Настройте какие поля будут показаны по умолчанию во всех карточках дуа.
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg border" style={{
              backgroundColor: 'var(--color-background)',
              borderColor: 'var(--color-border)'
            }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Транслитерация</span>
                <ToggleLeft className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
              </div>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                По умолчанию скрыто
              </p>
            </div>
            
            <div className="p-3 rounded-lg border" style={{
              backgroundColor: 'var(--color-background)',
              borderColor: 'var(--color-border)'
            }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Заметки</span>
                <ToggleRight className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
              </div>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                По умолчанию видимо
              </p>
            </div>
            
            <div className="p-3 rounded-lg border" style={{
              backgroundColor: 'var(--color-background)',
              borderColor: 'var(--color-border)'
            }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Польза</span>
                <ToggleLeft className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
              </div>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                По умолчанию скрыто
              </p>
            </div>
            
            <div className="p-3 rounded-lg border" style={{
              backgroundColor: 'var(--color-background)',
              borderColor: 'var(--color-border)'
            }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Источник</span>
                <ToggleLeft className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
              </div>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                По умолчанию скрыто
              </p>
            </div>
          </div>
          <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--color-background)' }}>
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              💡 <strong>Совет:</strong> Каждая карточка дуа имеет свои настройки. Нажмите на шестерёнку в карточке чтобы настроить отображение.
            </p>
          </div>
        </div>
      )}

      {/* Enhanced Stats */}
      <div className="flex items-center justify-between text-sm" style={{ color: 'var(--color-text-secondary)' }}>
        <div className="flex items-center gap-4">
          <span>📖 Показано {filteredDuas.length} из {currentDuas.length} дуа</span>
          {completedCount > 0 && (
            <span className="px-2 py-1 rounded-full text-xs font-medium animate-pulse" style={{
              backgroundColor: 'var(--color-success, #10b981)',
              color: 'white'
            }}>
              ✅ {completedCount} завершено
            </span>
          )}
          {remainingCount > 0 && remainingCount <= 3 && (
            <span className="px-2 py-1 rounded-full text-xs font-medium animate-bounce" style={{
              backgroundColor: 'var(--color-warning, #f59e0b)',
              color: 'white'
            }}>
              🔥 Осталось {remainingCount}!
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            categoryProgress === 100 ? 'bg-green-500 animate-pulse' : 
            remainingCount <= 3 ? 'bg-orange-500 animate-pulse' : 'bg-blue-500'
          }`}></div>
          <span>
            {categoryProgress === 100 ? '🏆 Завершено' : 
             remainingCount <= 3 ? '🔥 Почти готово' : 
             completedCount > 0 ? '⚡ В процессе' : '📚 Готов к началу'}
          </span>
        </div>
      </div>

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
            Дуа не найдены
          </h3>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Попробуйте изменить поисковые запросы или фильтры
          </p>
          {searchTerm && (
            <Button
              variant="outline"
              onClick={() => setSearchTerm('')}
              className="mt-4"
            >
              Очистить поиск
            </Button>
          )}
        </div>
      )}

      {/* Load More Button (если нужно) */}
      {filteredDuas.length > 10 && (
        <div className="text-center pt-8">
          <Button variant="outline" className="gap-2">
            Загрузить больше дуа
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