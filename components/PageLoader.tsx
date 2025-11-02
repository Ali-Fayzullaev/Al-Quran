"use client";

import { motion } from "framer-motion";
import { Book, Loader2, BookOpen, Navigation, Search, Settings, Brain, Map } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";

interface PageLoaderProps {
  type?: 'quran' | 'mushaf' | 'surahs' | 'juz' | 'search' | 'settings' | 'quiz' | 'journey' | 'default';
  message?: string;
}

export function PageLoader({ type = 'default', message }: PageLoaderProps) {
  const { locale } = useLocale();

  const loaderConfig = {
    quran: {
      icon: BookOpen,
      title: locale === 'en' ? 'Loading Quran' : 'Загрузка Корана',
      subtitle: locale === 'en' ? 'Preparing reading modes for you' : 'Подготавливаем режимы чтения',
      color: 'text-green-500',
      bgGradient: 'from-green-500/10 to-emerald-500/10'
    },
    mushaf: {
      icon: Book,
      title: locale === 'en' ? 'Loading Mushaf' : 'Загрузка Мусхафа',
      subtitle: locale === 'en' ? 'Preparing pages for reading' : 'Подготавливаем страницы для чтения',
      color: 'text-blue-500',
      bgGradient: 'from-blue-500/10 to-indigo-500/10'
    },
    surahs: {
      icon: Book,
      title: locale === 'en' ? 'Loading Surahs' : 'Загрузка Сур',
      subtitle: locale === 'en' ? 'Fetching chapter information' : 'Получаем информацию о главах',
      color: 'text-purple-500',
      bgGradient: 'from-purple-500/10 to-violet-500/10'
    },
    juz: {
      icon: Navigation,
      title: locale === 'en' ? 'Loading Juz' : 'Загрузка Джузов',
      subtitle: locale === 'en' ? 'Preparing reading plan' : 'Подготавливаем план чтения',
      color: 'text-orange-500',
      bgGradient: 'from-orange-500/10 to-amber-500/10'
    },
    search: {
      icon: Search,
      title: locale === 'en' ? 'Loading Search' : 'Загрузка Поиска',
      subtitle: locale === 'en' ? 'Preparing search tools' : 'Подготавливаем инструменты поиска',
      color: 'text-cyan-500',
      bgGradient: 'from-cyan-500/10 to-teal-500/10'
    },
    settings: {
      icon: Settings,
      title: locale === 'en' ? 'Loading Settings' : 'Загрузка Настроек',
      subtitle: locale === 'en' ? 'Preparing preferences' : 'Подготавливаем настройки',
      color: 'text-gray-500',
      bgGradient: 'from-gray-500/10 to-slate-500/10'
    },
    quiz: {
      icon: Brain,
      title: locale === 'en' ? 'Loading Quiz' : 'Загрузка Викторины',
      subtitle: locale === 'en' ? 'Preparing questions' : 'Подготавливаем вопросы',
      color: 'text-pink-500',
      bgGradient: 'from-pink-500/10 to-rose-500/10'
    },
    journey: {
      icon: Map,
      title: locale === 'en' ? 'Loading Journey' : 'Загрузка Путешествия',
      subtitle: locale === 'en' ? 'Preparing your learning path' : 'Подготавливаем ваш путь обучения',
      color: 'text-emerald-500',
      bgGradient: 'from-emerald-500/10 to-green-500/10'
    },
    default: {
      icon: Book,
      title: locale === 'en' ? 'Loading' : 'Загрузка',
      subtitle: locale === 'en' ? 'Please wait' : 'Пожалуйста, подождите',
      color: 'text-primary',
      bgGradient: 'from-primary/10 to-primary/5'
    }
  };

  const config = loaderConfig[type];
  const IconComponent = config.icon;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`bg-gradient-to-br ${config.bgGradient} rounded-3xl p-12 shadow-2xl border border-border max-w-md mx-4`}
      >
        <div className="text-center">
          {/* Анимированная иконка */}
          <div className="mb-8">
            <div className="relative inline-block">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <IconComponent className={`w-20 h-20 ${config.color} mx-auto`} />
              </motion.div>
              
              {/* Вращающийся спиннер */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute -bottom-2 -right-2"
              >
                <div className={`w-8 h-8 border-2 border-current ${config.color} rounded-full border-t-transparent`} />
              </motion.div>
            </div>
          </div>

          {/* Заголовок */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold text-foreground mb-3"
          >
            {config.title}
          </motion.h2>

          {/* Подзаголовок */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-muted-foreground mb-8"
          >
            {message || config.subtitle}
          </motion.p>

          {/* Анимированные точки */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex justify-center space-x-2"
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
                className={`w-3 h-3 rounded-full ${config.color.replace('text-', 'bg-')}`}
              />
            ))}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

// Компонент для быстрой загрузки (мини-версия)
export function MiniLoader({ message }: { message?: string }) {
  const { locale } = useLocale();
  
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="inline-block mb-4"
        >
          <Loader2 className="w-8 h-8 text-primary" />
        </motion.div>
        <p className="text-sm text-muted-foreground">
          {message || (locale === 'en' ? 'Loading...' : 'Загрузка...')}
        </p>
      </div>
    </div>
  );
}