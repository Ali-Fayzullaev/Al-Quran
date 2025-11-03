"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Book, BookOpen, Volume2, Grid3X3, ArrowRight, Play, Settings } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import dynamic from 'next/dynamic';
import MotivationalQuotes from "@/components/quran/MotivationalQuotes";

// Создаем отдельные компоненты загрузки
const MushafLoader = () => (
  <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--fixed-background)' }}>
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 mx-auto mb-4" style={{ borderColor: '#10b981' }}></div>
      <p style={{ color: 'var(--fixed-text)' }}>Загружаем страницы Мусхафа...</p>
    </div>
  </div>
);

const SurahsLoader = () => (
  <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--fixed-background)' }}>
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 mx-auto mb-4" style={{ borderColor: '#3b82f6' }}></div>
      <p style={{ color: 'var(--fixed-text)' }}>Загружаем список сур...</p>
    </div>
  </div>
);

const JuzLoader = () => (
  <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--fixed-background)' }}>
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 mx-auto mb-4" style={{ borderColor: '#8b5cf6' }}></div>
      <p style={{ color: 'var(--fixed-text)' }}>Загружаем джузы для изучения...</p>
    </div>
  </div>
);

// Lazy loading компонентов для оптимизации
const QuranInfiniteScroll = dynamic(() => import("@/components/mushaf/QuranInfiniteScroll"), {
  loading: MushafLoader,
  ssr: false
});

const SurahsContent = dynamic(() => import("@/components/surahs/SurahsList"), {
  loading: SurahsLoader,
  ssr: false
});

const JuzNavigation = dynamic(() => import("@/components/quran/JuzNavigation"), {
  loading: JuzLoader,
  ssr: false
});

type ReadingMode = 'selection' | 'mushaf' | 'surahs' | 'juz';

interface ReadingModeConfig {
  id: ReadingMode;
  title: string;
  titleArabic: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  features: string[];
  bgGradient: string;
}

// Лоадер для режимов чтения
function ReadingModeLoader({ mode }: { mode: string }) {
  const { locale } = useLocale();
  
  const modeNames = {
    mushaf: locale === 'en' ? 'Mushaf Reader' : 'Мусхаф',
    surahs: locale === 'en' ? 'Surah Reader' : 'Чтение сур',
    juz: locale === 'en' ? 'Juz Reader' : 'Чтение по джузам'
  };

  return (
    <div className="min-h-screen flex items-center justify-center"
         style={{ backgroundColor: 'var(--fixed-background)' }}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 mx-auto mb-6"
             style={{ borderColor: 'var(--color-primary)' }}></div>
        <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--fixed-text)' }}>
          {locale === 'en' ? 'Loading' : 'Загрузка'}
        </h3>
        <p style={{ color: 'var(--fixed-text-secondary)' }}>
          {modeNames[mode as keyof typeof modeNames]}...
        </p>
      </div>
    </div>
  );
}

export default function QuranReadingPage() {
  const { locale } = useLocale();
  const [currentMode, setCurrentMode] = useState<ReadingMode>('selection');

  const readingModes: ReadingModeConfig[] = [
    {
      id: 'mushaf',
      title: locale === 'en' ? 'Mushaf Reading' : 'Чтение Мусхафа',
      titleArabic: 'قراءة المصحف',
      description: locale === 'en' 
        ? 'Traditional page-by-page reading experience. Perfect for focused study and memorization.'
        : 'Традиционное чтение страница за страницей. Идеально для изучения и заучивания.',
      icon: <BookOpen className="w-8 h-8" />,
      color: '#10b981',
      features: [
        locale === 'en' ? '📖 Page-by-page reading' : '📖 Чтение по страницам',
        locale === 'en' ? '🎯 Focus mode' : '🎯 Режим концентрации',
        locale === 'en' ? '⚡ Fast navigation' : '⚡ Быстрая навигация',
        locale === 'en' ? '📱 Mobile optimized' : '📱 Оптимизировано для мобильных'
      ],
      bgGradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
    },
    {
      id: 'surahs',
      title: locale === 'en' ? 'Surah Reading' : 'Чтение по сурам',
      titleArabic: 'قراءة السور',
      description: locale === 'en'
        ? 'Read individual surahs with translations and audio. Great for daily reading and understanding.'
        : 'Читайте отдельные суры с переводами и аудио. Отлично для ежедневного чтения и понимания.',
      icon: <Book className="w-8 h-8" />,
      color: '#3b82f6',
      features: [
        locale === 'en' ? '🔊 Audio recitation' : '🔊 Аудио чтение',
        locale === 'en' ? '🌍 Multiple translations' : '🌍 Множественные переводы',
        locale === 'en' ? '🔍 Search & filter' : '🔍 Поиск и фильтры',
        locale === 'en' ? '📚 Surah information' : '📚 Информация о сурах'
      ],
      bgGradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
    },
    {
      id: 'juz',
      title: locale === 'en' ? 'Juz Reading (Khatm)' : 'Чтение по джузам (Хатм)',
      titleArabic: 'قراءة الأجزاء - ختم القرآن',
      description: locale === 'en'
        ? 'Complete the Quran in 30 parts with translations and audio. Perfect for structured reading plan.'
        : 'Завершите Коран за 30 частей с переводами и аудио. Идеально для структурированного плана чтения.',
      icon: <Grid3X3 className="w-8 h-8" />,
      color: '#8b5cf6',
      features: [
        locale === 'en' ? '📅 30-day reading plan' : '📅 30-дневный план чтения',
        locale === 'en' ? '🎵 Full audio support' : '🎵 Полная поддержка аудио',
        locale === 'en' ? '📊 Progress tracking' : '📊 Отслеживание прогресса',
        locale === 'en' ? '🏆 Completion rewards' : '🏆 Награды за завершение'
      ],
      bgGradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
    }
  ];

  if (currentMode !== 'selection') {
    return (
      <div className="min-h-screen">
        {/* Кнопка возврата */}
        <div className="fixed top-4 left-4 z-50">
          <Button
            onClick={() => setCurrentMode('selection')}
            variant="ghost"
            size="sm"
            className="bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm border border-white/20"
          >
            <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
            {locale === 'en' ? 'Back to Menu' : 'Назад в меню'}
          </Button>
        </div>

        {/* Контент режимов */}
        <AnimatePresence mode="wait">
          {currentMode === 'mushaf' && (
            <motion.div
              key="mushaf"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
            >
              <QuranInfiniteScroll />
            </motion.div>
          )}
          
          {currentMode === 'surahs' && (
            <motion.div
              key="surahs"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
            >
              <SurahsContent />
            </motion.div>
          )}
          
          {currentMode === 'juz' && (
            <motion.div
              key="juz"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
            >
              <JuzNavigation />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--fixed-background)' }}>
      <div className="relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 px-4"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
                 style={{ 
                   background: 'linear-gradient(135deg, var(--color-primary) 0%, #059669 100%)',
                   boxShadow: '0 10px 40px rgba(16, 185, 129, 0.3)'
                 }}>
              <BookOpen className="w-10 h-10 text-white" />
            </div>
          </motion.div>

          <h1 className="text-4xl md:text-6xl font-bold mb-4" 
              style={{ color: 'var(--fixed-text)' }}>
            {locale === 'en' ? 'Quran Reading' : 'Чтение Корана'}
          </h1>
          
          <h2 className="text-2xl md:text-3xl font-bold mb-6 font-amiri" 
              dir="rtl" style={{ color: 'var(--color-primary)' }}>
            قراءة القرآن الكريم
          </h2>

          <p className="text-xl max-w-3xl mx-auto leading-relaxed" 
             style={{ color: 'var(--fixed-text-secondary)' }}>
            {locale === 'en' 
              ? 'Choose your preferred reading experience. Each mode is designed for different purposes and preferences.'
              : 'Выберите предпочитаемый способ чтения. Каждый режим разработан для разных целей и предпочтений.'}
          </p>
        </motion.div>

        {/* Motivational Quotes Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="max-w-6xl mx-auto px-4 mb-16"
        >
          <MotivationalQuotes />
        </motion.div>

        {/* Reading Modes */}
        <div className="max-w-6xl mx-auto px-4 pb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {readingModes.map((mode, index) => (
              <motion.div
                key={mode.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.2 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="group cursor-pointer"
                onClick={() => setCurrentMode(mode.id)}
              >
                <div className="relative overflow-hidden rounded-3xl border-2 transition-all duration-300 hover:shadow-2xl"
                     style={{
                       backgroundColor: 'var(--verse-background)',
                       borderColor: 'var(--color-border)',
                       boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                     }}
                     onMouseEnter={(e) => {
                       e.currentTarget.style.borderColor = mode.color;
                       e.currentTarget.style.boxShadow = `0 20px 60px ${mode.color}30`;
                     }}
                     onMouseLeave={(e) => {
                       e.currentTarget.style.borderColor = 'var(--color-border)';
                       e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.1)';
                     }}>
                  
                  {/* Gradient Header */}
                  <div className="h-32 relative overflow-hidden"
                       style={{ background: mode.bgGradient }}>
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="relative h-full flex items-center justify-center">
                      <div className="text-white">{mode.icon}</div>
                    </div>
                    
                    {/* Decorative Pattern */}
                    <div className="absolute top-0 right-0 w-24 h-24 opacity-20">
                      <div className="w-full h-full rounded-full border-4 border-white"></div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--fixed-text)' }}>
                      {mode.title}
                    </h3>
                    
                    <h4 className="text-lg font-bold mb-4 font-amiri" 
                        dir="rtl" style={{ color: mode.color }}>
                      {mode.titleArabic}
                    </h4>

                    <p className="text-sm leading-relaxed mb-6" 
                       style={{ color: 'var(--fixed-text-secondary)' }}>
                      {mode.description}
                    </p>

                    {/* Features */}
                    <div className="space-y-2 mb-6">
                      {mode.features.map((feature, idx) => (
                        <div key={idx} className="text-sm flex items-center"
                             style={{ color: 'var(--fixed-text-secondary)' }}>
                          <span className="mr-2">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Action Button */}
                    <Button 
                      className="w-full group-hover:scale-105 transition-transform duration-200"
                      style={{ 
                        backgroundColor: mode.color,
                        borderColor: mode.color
                      }}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {locale === 'en' ? 'Start Reading' : 'Начать чтение'}
                    </Button>
                  </div>

                  {/* Hover Effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                       style={{ background: `${mode.color}05` }}></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center pb-16 px-4"
        >
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-4 mb-4">
              <Settings className="w-5 h-5" style={{ color: 'var(--fixed-text-secondary)' }} />
              <span className="text-sm" style={{ color: 'var(--fixed-text-secondary)' }}>
                {locale === 'en' 
                  ? 'All modes support dark/light themes and multiple languages'
                  : 'Все режимы поддерживают темные/светлые темы и множественные языки'}
              </span>
            </div>
            
            <p className="text-xs" style={{ color: 'var(--fixed-text-secondary)', opacity: 0.7 }}>
              {locale === 'en'
                ? 'Switch between modes anytime using the back button'
                : 'Переключайтесь между режимами в любое время с помощью кнопки назад'}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}