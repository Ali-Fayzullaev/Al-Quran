// src/app/dua-dhikr/[id]/page.tsx
"use client";

import { use, useState, useEffect } from "react";
import { notFound } from "next/navigation";
import { useLocale } from "@/context/LocaleContext";
import Link from "next/link";
import { 
  ArrowLeft, 
  Home, 
  Book,
  Sun,
  Moon,
  Building2,
  Heart,
  Star,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import DuaList from "@/components/dua-dhikr/DuaList";

// Маппинг категорий к иконкам
const categoryIcons = {
  "morning-dhikr": Sun,
  "evening-dhikr": Moon,
  "dhikr-after-salah": Building2,
  "daily-dua": Heart,
  "selected-dua": Star
} as const;

// Цветные схемы для категорий
const categoryColors = {
  "morning-dhikr": {
    gradient: "from-yellow-400 to-orange-500",
    bg: "bg-yellow-50 dark:bg-yellow-900/20",
    border: "border-yellow-200 dark:border-yellow-800"
  },
  "evening-dhikr": {
    gradient: "from-purple-400 to-indigo-600", 
    bg: "bg-purple-50 dark:bg-purple-900/20",
    border: "border-purple-200 dark:border-purple-800"
  },
  "dhikr-after-salah": {
    gradient: "from-green-400 to-emerald-600",
    bg: "bg-green-50 dark:bg-green-900/20",
    border: "border-green-200 dark:border-green-800"
  },
  "daily-dua": {
    gradient: "from-pink-400 to-rose-600",
    bg: "bg-pink-50 dark:bg-pink-900/20",
    border: "border-pink-200 dark:border-pink-800"
  },
  "selected-dua": {
    gradient: "from-blue-400 to-cyan-600",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    border: "border-blue-200 dark:border-blue-800"
  }
} as const;

interface CategoryPageProps {
  params: Promise<{ id: string }>;
}

interface DuaData {
  title: string;
  arabic: string;
  latin?: string;
  translation: string;
  notes?: string;
  fawaid?: string;
  source?: string;
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const resolvedParams = use(params);
  const { locale, t } = useLocale();
  const [duaData, setDuaData] = useState<{
    ru: DuaData[];
    en: DuaData[];
    uz: DuaData[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLocaleReady, setIsLocaleReady] = useState(false);

  const categoryId = resolvedParams.id;

  // Отслеживаем готовность локали для предотвращения ошибки гидратации
  useEffect(() => {
    if (locale) {
      setIsLocaleReady(true);
    }
  }, [locale]);

  // Проверяем валидность категории
  const validCategories = ["morning-dhikr", "evening-dhikr", "dhikr-after-salah", "daily-dua", "selected-dua"];
  if (!validCategories.includes(categoryId)) {
    notFound();
  }

  const IconComponent = categoryIcons[categoryId as keyof typeof categoryIcons];
  const colors = categoryColors[categoryId as keyof typeof categoryColors];

  // Загружаем данные дуа
  useEffect(() => {
    const loadDuaData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Загружаем все языки параллельно
        const [ruData, enData, uzData] = await Promise.all([
          import(`@/data/dua-dhikr/${categoryId}/ru.json`).then(module => module.default),
          import(`@/data/dua-dhikr/${categoryId}/en.json`).then(module => module.default),
          import(`@/data/dua-dhikr/${categoryId}/uz.json`).then(module => module.default)
        ]);

        setDuaData({
          ru: ruData,
          en: enData,
          uz: uzData
        });
      } catch (err) {
        console.error('Error loading dua data:', err);
        setError(t('errorLoadingDuas'));
      } finally {
        setIsLoading(false);
      }
    };

    loadDuaData();
  }, [categoryId, locale]);

  // Показываем индикатор загрузки или ожидаем готовности локали
  if (isLoading || !isLocaleReady) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-gray-200 dark:border-gray-700 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Book className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold" style={{ color: 'var(--color-text)' }}>
              {t('loading')}
            </h3>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {t('DuaDhikr.loadingContent')}
            </p>
            <div className="flex items-center justify-center space-x-2 mt-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Показываем ошибку
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center bg-red-100 dark:bg-red-900/20">
            <Book className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-semibold text-red-600 dark:text-red-400">
            {t('errorLoadingDuas')}
          </h3>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {error}
          </p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={() => window.location.reload()}>
              {t('DuaDhikr.retry')}
            </Button>
            <Link href="/dua-dhikr">
              <Button variant="outline">
                {t('DuaDhikr.backToCategories')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: 'var(--color-background)' }}>
      
      {/* Декоративные элементы */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-96 h-96 rounded-full blur-3xl opacity-10" 
             style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))` }}></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-96 h-96 rounded-full blur-3xl opacity-10"
             style={{ background: `linear-gradient(45deg, var(--color-accent), var(--color-primary))` }}></div>
      </div>

      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur-xl border-b shadow-lg" style={{ 
        backgroundColor: 'var(--color-background-secondary)',
        borderColor: 'var(--color-border)',
        opacity: 0.95
      }}>
        <div className="max-w-6xl mx-auto px-4 py-4">
          
          {/* Mobile Header */}
          <div className="flex items-center justify-between mb-4 md:hidden">
            <div className="flex items-center gap-2">
              <Link href="/dua-dhikr">
                <Button variant="ghost" size="sm" className="px-2">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/quran">
                <Button variant="ghost" size="sm" className="px-2">
                  <Home className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            <div className="text-center flex-1 mx-4">
              <h1 className="font-bold text-lg" style={{ color: 'var(--color-primary)' }}>
                {t(`DuaDhikr.categories.${categoryId}`)}
              </h1>
            </div>

            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${colors.gradient} flex items-center justify-center`}>
              <IconComponent className="w-4 h-4 text-white" />
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden md:flex items-center justify-between">
            
            {/* Left Navigation */}
            <div className="flex items-center gap-4">
              <Link href="/dua-dhikr">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  {t('back')}
                </Button>
              </Link>
              
              <Link href="/quran">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Home className="w-4 h-4" />
                  {t('home')}
                </Button>
              </Link>
            </div>

            {/* Center - Category Info */}
            <div className="text-center p-4 rounded-xl border shadow-lg" style={{
              backgroundColor: 'var(--color-background-secondary)',
              borderColor: 'var(--color-border)'
            }}>
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center shadow-lg`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold" style={{ color: 'var(--color-primary)' }}>
                    {t(`DuaDhikr.categories.${categoryId}`)}
                  </h1>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    {t(`DuaDhikr.descriptions.${categoryId}`)}
                  </p>
                </div>
              </div>
            </div>

            {/* Right - Stats */}
            <div className="text-right">
              <div className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
                {duaData?.ru?.length || 0}
              </div>
              <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                {t('totalDuas')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Category Description Card - Mobile */}
        <div className="md:hidden mb-6">
          <div className="p-4 rounded-xl border" style={{
            backgroundColor: 'var(--color-background-secondary)',
            borderColor: 'var(--color-border)'
          }}>
            <p className="text-sm text-center" style={{ color: 'var(--color-text-secondary)' }}>
              {t(`DuaDhikr.descriptions.${categoryId}`)}
            </p>
            <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
              <div className="text-center">
                <div className="text-lg font-bold" style={{ color: 'var(--color-primary)' }}>
                  {duaData?.ru?.length || 0}
                </div>
                <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  {t('duasCount')}
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold" style={{ color: 'var(--color-primary)' }}>
                  {t('DuaDhikr.languageIndicator')}
                </div>
                <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  {t('language')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dua List Component */}
        {duaData && (
          <DuaList 
            category={categoryId}
            duaData={duaData}
          />
        )}
      </div>
    </div>
  );
}