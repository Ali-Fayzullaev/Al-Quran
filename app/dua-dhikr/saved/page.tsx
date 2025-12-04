"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale } from "@/context/LocaleContext";
import { 
  Heart, 
  BookOpen, 
  Book, 
  Sun, 
  Moon, 
  Building2, 
  Star,
  Trash2, 
  Copy, 
  Calendar,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Download,
  Upload
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { 
  getSavedDuas, 
  removeSavedDua, 
  searchSavedDuas,
  exportSavedDuas,
  importSavedDuas,
  type SavedDua
} from "@/lib/duaBookmarks";

// Категории дуа с иконками и цветами
const duaCategories = [
  {
    id: "morning-dhikr",
    icon: Sun,
    gradient: "from-yellow-400 to-orange-500",
    bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
    borderColor: "border-yellow-200 dark:border-yellow-800",
    textColor: "text-yellow-800 dark:text-yellow-200"
  },
  {
    id: "evening-dhikr", 
    icon: Moon,
    gradient: "from-purple-400 to-indigo-600",
    bgColor: "bg-purple-50 dark:bg-purple-900/20",
    borderColor: "border-purple-200 dark:border-purple-800",
    textColor: "text-purple-800 dark:text-purple-200"
  },
  {
    id: "dhikr-after-salah",
    icon: Building2,
    gradient: "from-green-400 to-emerald-600",
    bgColor: "bg-green-50 dark:bg-green-900/20", 
    borderColor: "border-green-200 dark:border-green-800",
    textColor: "text-green-800 dark:text-green-200"
  },
  {
    id: "daily-dua",
    icon: Heart,
    gradient: "from-pink-400 to-rose-600", 
    bgColor: "bg-pink-50 dark:bg-pink-900/20",
    borderColor: "border-pink-200 dark:border-pink-800",
    textColor: "text-pink-800 dark:text-pink-200"
  },
  {
    id: "selected-dua",
    icon: Star,
    gradient: "from-blue-400 to-cyan-600",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    borderColor: "border-blue-200 dark:border-blue-800", 
    textColor: "text-blue-800 dark:text-blue-200"
  }
];

// Функция для получения стилей категории
const getCategoryStyle = (categoryId: string) => {
  return duaCategories.find(cat => cat.id === categoryId) || duaCategories[0];
};

export default function SavedDuasPage() {
  const { locale, t } = useLocale();
  const [savedDuas, setSavedDuas] = useState<SavedDua[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'category'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Загрузка сохраненных дуа
  useEffect(() => {
    setSavedDuas(getSavedDuas());
  }, []);

  // Обновление списка после изменений
  const refreshSavedDuas = () => {
    setSavedDuas(getSavedDuas());
  };

  // Удаление дуа
  const handleRemoveDua = (duaId: string) => {
    removeSavedDua(duaId);
    refreshSavedDuas();
  };

  // Копирование дуа
  const handleCopyDua = async (dua: SavedDua) => {
    const text = `${dua.title}\n\n${dua.arabic}\n\n${dua.translation}${
      dua.latin ? `\n\nТранслитерация: ${dua.latin}` : ''
    }${dua.notes ? `\n\nЗаметки: ${dua.notes}` : ''}`;
    
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Ошибка при копировании дуа:', error);
    }
  };


  // Получение уникальных категорий
  const categories = ['all', ...Array.from(new Set(savedDuas.map(dua => dua.category)))];

  // Фильтрация и сортировка дуа
  const filteredDuas = savedDuas
    .filter(dua => {
      if (selectedCategory !== 'all' && dua.category !== selectedCategory) return false;
      if (!searchQuery) return true;
      
      return searchSavedDuas(searchQuery).some(searched => searched.id === dua.id);
    })
    .sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'date') {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === 'title') {
        comparison = a.title.localeCompare(b.title);
      } else if (sortBy === 'category') {
        comparison = a.category.localeCompare(b.category);
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  if (savedDuas.length === 0) {
    return (
      <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: 'var(--color-background)' }}>
        {/* Декоративные элементы */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 -right-1/2 w-96 h-96 rounded-full blur-3xl opacity-20" 
               style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}></div>
          <div className="absolute -bottom-1/2 -left-1/2 w-96 h-96 rounded-full blur-3xl opacity-15"
               style={{ background: 'linear-gradient(45deg, var(--color-accent), var(--color-primary))' }}></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8 relative z-10">
          <div className="text-center py-16">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}
            >
              <Heart className="w-10 h-10 text-white" />
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-4xl font-bold mb-4 gradient-text-primary"
            >
              Сохраненные дуа
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8 max-w-md mx-auto" 
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Здесь будут отображаться ваши любимые дуа для быстрого доступа
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-3 justify-center"
            >
              <Link href="/dua-dhikr">
                <Button className="gap-2" style={{ backgroundColor: 'var(--color-primary)' }}>
                  <BookOpen className="w-4 h-4" />
                  Перейти к дуа
                </Button>
              </Link>
              
              <Link href="/">
                <Button variant="outline" className="gap-2">
                  <Book className="w-4 h-4" />
                  На главную
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Декоративные элементы */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-96 h-96 rounded-full blur-3xl opacity-20" 
             style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-96 h-96 rounded-full blur-3xl opacity-15"
             style={{ background: 'linear-gradient(45deg, var(--color-accent), var(--color-primary))' }}></div>
      </div>

      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur-xl border-b shadow-lg" style={{ 
        backgroundColor: 'var(--color-background-secondary)',
        borderColor: 'var(--color-border)',
        opacity: 0.95
      }}>
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <h1 className="font-bold text-2xl" style={{ color: 'var(--color-primary)' }}>
                {t("saved")}
              </h1>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                {savedDuas.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 relative z-10">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" 
                      style={{ color: 'var(--color-text-secondary)' }} />
              <Input
                placeholder="Поиск в сохраненных дуа..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base rounded-xl"
                style={{ 
                  backgroundColor: 'var(--color-background-secondary)',
                  borderStyle: 'solid',
                  borderWidth: '1px',
                  borderColor: 'var(--color-border)'
                }}
              />
            </div>
            
            <div className="flex flex-wrap gap-2 justify-center">
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 rounded-xl text-sm font-medium"
                style={{ 
                  backgroundColor: 'var(--color-background-secondary)',
                  borderStyle: 'solid',
                  borderWidth: '1px',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)'
                }}
              >
                <option value="all">Все категории</option>
                {categories.slice(1).map(category => (
                  <option key={category} value={category}>
                    {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortBy(sortBy === 'date' ? 'title' : sortBy === 'title' ? 'category' : 'date')}
                className="gap-2"
              >
                <Filter className="w-4 h-4" />
                {sortBy === 'date' ? 'По дате' : sortBy === 'title' ? 'По названию' : 'По категории'}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="gap-2"
              >
                {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Saved Duas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredDuas.map((dua, index) => (
              <SavedDuaCard
                key={dua.id}
                dua={dua}
                index={index}
                onRemove={() => handleRemoveDua(dua.id)}
                onCopy={() => handleCopyDua(dua)}
                formatDate={formatDate}
              />
            ))}
          </AnimatePresence>
        </div>

        {filteredDuas.length === 0 && searchQuery && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--color-text-secondary)' }} />
            <p style={{ color: 'var(--color-text-secondary)' }}>
              Не найдено дуа по запросу "{searchQuery}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Компонент карточки сохраненного дуа
function SavedDuaCard({ 
  dua, 
  index, 
  onRemove, 
  onCopy, 
  formatDate 
}: {
  dua: SavedDua;
  index: number;
  onRemove: () => void;
  onCopy: () => void;
  formatDate: (date: string) => string;
}) {
  const [isCopied, setIsCopied] = useState(false);
  const categoryStyle = getCategoryStyle(dua.category);
  const IconComponent = categoryStyle.icon;

  const handleCopy = async () => {
    await onCopy();
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.1 }}
      className="group rounded-2xl p-6 shadow-sm transition-all duration-500 hover:shadow-2xl hover:-translate-y-2"
      style={{
        backgroundColor: 'var(--color-background-secondary)',
        borderStyle: 'solid',
        borderWidth: '1px',
        borderColor: 'var(--color-border)'
      }}
    >
      {/* Header with Category Icon */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          {/* Category Icon with Gradient */}
          <div 
            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${categoryStyle.gradient} 
                        flex items-center justify-center shadow-lg 
                        group-hover:rotate-12 group-hover:scale-110 transition-transform duration-300`}
          >
            <IconComponent className="w-6 h-6 text-white" />
          </div>
          
          <div className="flex-1 min-w-0">
            <span 
              className={`text-xs px-3 py-1 rounded-full font-medium ${categoryStyle.textColor} ${categoryStyle.bgColor}`}
            >
              {dua.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
            <h3 className="font-bold text-lg mt-2 leading-tight" style={{ color: 'var(--color-text)' }}>
              {dua.title}
            </h3>
          </div>
        </div>
        
        <div className="flex gap-1 ml-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            title="Копировать"
            className="p-2 hover:bg-blue-50 hover:text-blue-600 transition-colors"
          >
            <Copy className={cn("w-4 h-4", isCopied && "text-green-600")} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            title="Удалить"
            className="p-2 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Arabic Text */}
      <div className="mb-4 p-4 rounded-xl text-right relative overflow-hidden" 
           style={{ backgroundColor: 'var(--color-background)' }}>
        {/* Subtle gradient overlay */}
        <div 
          className={`absolute inset-0 bg-gradient-to-r ${categoryStyle.gradient} opacity-5`}
        ></div>
        <p className="font-arabic text-xl leading-loose relative z-10 text-[var(--color-primary)] ">
          {dua.arabic}
        </p>
      </div>

      {/* Translation */}
      <div className="mb-4">
        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text)' }}>
          {dua.translation}
        </p>
      </div>


      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-2">
          <Calendar className="w-3 h-3" style={{ color: 'var(--color-text-secondary)' }} />
          <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            {formatDate(dua.createdAt)}
          </span>
        </div>
        
        <Link href={`/dua-dhikr/${dua.category}`}>
          <Button 
            size="sm" 
            className={`text-xs gap-2 bg-gradient-to-r ${categoryStyle.gradient} 
                       hover:shadow-lg transition-all duration-300 transform hover:scale-105`}
          >
            <IconComponent className="w-3 h-3" />
          </Button>
        </Link>
      </div>

      {/* Progress Bar Animation */}
      <div className="mt-4 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div 
          className={`h-full bg-gradient-to-r ${categoryStyle.gradient} 
                      w-0 group-hover:w-full transition-all duration-1000 ease-out`}
        ></div>
      </div>
    </motion.div>
  );
}