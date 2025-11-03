"use client";

import { useLocale } from "@/context/LocaleContext";
import { Book, Quote, Hand, Search, Play, Bookmark, TrendingUp, Users, Globe, Star } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useRandomAyah, useSurahs } from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";

// Lazy loading для производительности
const CountUp = dynamic(() => import("react-countup"), { 
  ssr: false,
  loading: () => <span>0</span>
});

// Lazy loading больших компонентов
const MotionDiv = dynamic(() => 
  import("framer-motion").then(mod => ({ default: mod.motion.div })), 
  { ssr: false }
);

export default function HomePage() {
  const { locale, t } = useLocale();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  // Получаем случайный аят дня
  const { data: randomAyah, isLoading: loadingAyah } = useRandomAyah(
    locale === 'en' ? 'en.asad' : 'ru.kuliev'
  );

  // Получаем список сур для статистики
  const { data: surahs } = useSurahs();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const quranStats = [
    { 
      number: 114, 
      label: t("surahs"),
      icon: Book
    },
    { 
      number: 6236, 
      label: t("verses"),
      icon: Quote
    },
    { 
      number: 30, 
      label: t("juz"),
      icon: Star
    },
    { 
      number: 604, 
      label: t("pages"),
      icon: TrendingUp
    }
  ];

  const popularSurahs = [
    { number: 1, name: "Al-Fatiha", translation: locale === "en" ? "The Opening" : "Открывающая" },
    { number: 2, name: "Al-Baqarah", translation: locale === "en" ? "The Cow" : "Корова" },
    { number: 18, name: "Al-Kahf", translation: locale === "en" ? "The Cave" : "Пещера" },
    { number: 36, name: "Ya-Sin", translation: locale === "en" ? "Ya-Sin" : "Я Син" },
    { number: 55, name: "Ar-Rahman", translation: locale === "en" ? "The Beneficent" : "Милостивый" },
    { number: 67, name: "Al-Mulk", translation: locale === "en" ? "The Sovereignty" : "Власть" },
  ];

  return (
    <main className="min-h-screen transition-colors" style={{ 
      backgroundColor: 'var(--fixed-background)',
      color: 'var(--fixed-text)'
    }}>
      
      {/* Hero Section */}
      <section className="relative py-20 px-6 border-b" style={{
        backgroundColor: 'var(--verse-background)',
        borderColor: 'var(--color-border)'
      }}>
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium mb-6" style={{
              backgroundColor: 'var(--verse-background)',
              borderColor: 'var(--color-border)'
            }}>
              <Star className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
              <span style={{ color: 'var(--fixed-text-secondary)' }}>{t("bestQuranExperience")}</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6" style={{ color: 'var(--fixed-text)' }}>
              {t("title")}
            </h1>
            
            <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-8 leading-relaxed" style={{ color: 'var(--fixed-text-secondary)' }}>
              {locale === "en"
                ? "Experience the Holy Quran with modern technology. Read, listen, search, and reflect with our intelligent platform designed for Muslims worldwide."
                : "Познавайте Священный Коран с помощью современных технологий. Читайте, слушайте, ищите и размышляйте с нашей интеллектуальной платформой для мусульман всего мира."}
            </p>

            {/* Search Bar */}
            <motion.form
              onSubmit={handleSearch}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="max-w-2xl mx-auto mb-12"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: 'var(--fixed-text-secondary)' }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("searchPlaceholder")}
                  className="w-full pl-12 pr-6 py-4 text-lg border rounded-xl focus:ring-2 focus:outline-none transition-all"
                  style={{
                    backgroundColor: 'var(--verse-background)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--fixed-text)'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--color-primary)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(var(--color-primary-rgb), 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--color-border)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <Button 
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2 theme-override-primary rounded-lg"
                >
                  {t("search")}
                </Button>
              </div>
            </motion.form>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6" style={{ backgroundColor: 'var(--fixed-background)' }}>
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {quranStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl border mb-4" style={{
                    backgroundColor: 'var(--verse-background)',
                    borderColor: 'var(--color-border)'
                  }}>
                    <Icon className="w-8 h-8" style={{ color: 'var(--color-primary)' }} />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold mb-2" style={{ color: 'var(--fixed-text)' }}>
                    <CountUp end={stat.number} duration={2} />
                  </div>
                  <div className="font-medium" style={{ color: 'var(--fixed-text-secondary)' }}>
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Verse of the Day */}
      {randomAyah && (
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-center mb-8"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--fixed-text)' }}>
                {t("verseOfTheDay")}
              </h2>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="p-8 md:p-12 rounded-2xl border" style={{
                backgroundColor: 'var(--verse-background)',
                borderColor: 'var(--color-border)'
              }}>
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium" style={{
                  backgroundColor: 'var(--color-primary)'
                }}>
                  <Quote className="w-4 h-4" />
                  {locale === "en" ? `Verse ${randomAyah.numberInSurah}` : `Аят ${randomAyah.numberInSurah}`}
                </div>
              </div>
              
              <blockquote className="text-xl md:text-2xl leading-relaxed text-center font-medium italic mb-6" style={{ color: 'var(--fixed-text-secondary)' }}>
                "{randomAyah.text}"
              </blockquote>
              
              <div className="text-center">
                <p className="font-semibold" style={{ color: 'var(--color-primary)' }}>
                  {locale === "en" ? `Juz ${randomAyah.juz} • Page ${randomAyah.page}` : `Джуз ${randomAyah.juz} • Страница ${randomAyah.page}`}
                </p>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Features Grid */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--fixed-text)' }}>
              {t("exploreKnowledge")}
            </h2>
            <p className="text-xl max-w-2xl mx-auto" style={{ color: 'var(--fixed-text-secondary)' }}>
              {locale === "en" 
                ? "Access the complete Quran, authentic Hadith collections, and daily duas with modern features"
                : "Получите доступ к полному Корану, достоверным сборникам хадисов и ежедневным дуа с современными возможностями"}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              <Link href="/quran" className="group block">
                <div className="relative p-8 rounded-3xl transition-all duration-300 group-hover:shadow-2xl group-hover:scale-105 overflow-hidden theme-card-elegant"
                  style={{
                    background: `linear-gradient(135deg, var(--color-secondary) 0%, var(--color-background-secondary) 100%)`,
                    borderColor: 'var(--color-primary)'
                  }}>
                  <div className="absolute top-0 right-0 w-32 h-32 rounded-full -translate-y-16 translate-x-16 opacity-20"
                    style={{ backgroundColor: 'var(--color-primary)' }}></div>
                  <Book className="w-12 h-12 mb-6 relative z-10" style={{ color: 'var(--color-primary)' }} />
                  <h3 className="text-2xl font-bold mb-4 relative z-10" style={{ color: 'var(--fixed-text)' }}>
                    {locale === "en" ? "Holy Quran" : "Священный Коран"}
                  </h3>
                  <p className="mb-6 relative z-10" style={{ color: 'var(--fixed-text-secondary)' }}>
                    {locale === "en"
                      ? "Read and listen to all 114 Surahs with multiple translations, audio recitations, and advanced study tools."
                      : "Читайте и слушайте все 114 сур с множественными переводами, аудио-чтениями и продвинутыми инструментами изучения."}
                  </p>
                  <div className="flex items-center gap-2 font-semibold relative z-10" style={{ color: 'var(--color-primary)' }}>
                    <span>{locale === "en" ? "Start Reading" : "Начать чтение"}</span>
                    <Play className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.4 }}
            >
              <div className="relative p-8 rounded-3xl transition-all duration-300 hover:shadow-2xl hover:scale-105 overflow-hidden cursor-pointer theme-card-elegant"
                style={{
                  background: `linear-gradient(135deg, var(--color-secondary) 0%, var(--color-background-secondary) 100%)`,
                  borderColor: 'var(--color-primary)'
                }}>
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full -translate-y-16 translate-x-16 opacity-20"
                  style={{ backgroundColor: 'var(--color-primary)' }}></div>
                <Quote className="w-12 h-12 mb-6 relative z-10" style={{ color: 'var(--color-primary)' }} />
                <h3 className="text-2xl font-bold mb-4 relative z-10" style={{ color: 'var(--fixed-text)' }}>
                  {locale === "en" ? "Hadith Collections" : "Сборники хадисов"}
                </h3>
                <p className="mb-6 relative z-10" style={{ color: 'var(--fixed-text-secondary)' }}>
                  {locale === "en"
                    ? "Explore authentic Hadith from Sahih Bukhari, Sahih Muslim, and other trusted collections."
                    : "Изучайте достоверные хадисы из Сахих аль-Бухари, Сахих Муслим и других надежных сборников."}
                </p>
                <div className="flex items-center gap-2 font-semibold relative z-10" style={{ color: 'var(--color-primary)' }}>
                  <span>{locale === "en" ? "Coming Soon" : "Скоро"}</span>
                  <Star className="w-4 h-4" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.6 }}
            >
              <div className="relative p-8 rounded-3xl transition-all duration-300 hover:shadow-2xl hover:scale-105 overflow-hidden cursor-pointer theme-card-elegant"
                style={{
                  background: `linear-gradient(135deg, var(--color-secondary) 0%, var(--color-background-secondary) 100%)`,
                  borderColor: 'var(--color-primary)'
                }}>
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full -translate-y-16 translate-x-16 opacity-20"
                  style={{ backgroundColor: 'var(--color-primary)' }}></div>
                <Hand className="w-12 h-12 mb-6 relative z-10" style={{ color: 'var(--color-primary)' }} />
                <h3 className="text-2xl font-bold mb-4 relative z-10" style={{ color: 'var(--fixed-text)' }}>
                  {locale === "en" ? "Daily Duas" : "Ежедневные дуа"}
                </h3>
                <p className="mb-6 relative z-10" style={{ color: 'var(--fixed-text-secondary)' }}>
                  {locale === "en"
                    ? "Learn and practice essential daily prayers and supplications with audio pronunciation guides."
                    : "Изучайте и практикуйте важные ежедневные молитвы и мольбы с аудио-гидами произношения."}
                </p>
                <div className="flex items-center gap-2 font-semibold relative z-10" style={{ color: 'var(--color-primary)' }}>
                  <span>{locale === "en" ? "Coming Soon" : "Скоро"}</span>
                  <Star className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Popular Surahs */}
      <section className="py-16 px-6" style={{
        backgroundColor: 'var(--verse-background)'
      }}>
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--fixed-text)' }}>
              {locale === "en" ? "Popular Surahs" : "Популярные суры"}
            </h2>
            <p className="text-xl" style={{ color: 'var(--fixed-text-secondary)' }}>
              {locale === "en" ? "Most read and beloved chapters" : "Наиболее читаемые и любимые главы"}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularSurahs.map((surah, index) => (
              <motion.div
                key={surah.number}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 2.0 + index * 0.1 }}
              >
                <Link href={`/surah/${surah.number}`}>
                  <div className="p-6 rounded-2xl shadow-sm border transition-all duration-300 group"
                    style={{
                      backgroundColor: 'var(--fixed-background)',
                      borderColor: 'var(--color-border)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-primary)';
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-border)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                    }}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg transition-colors border-2"
                        style={{
                          backgroundColor: 'var(--verse-background)',
                          borderColor: 'var(--color-primary)',
                          color: 'var(--color-primary)'
                        }}>
                        {surah.number}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--fixed-text)' }}>
                          {surah.name}
                        </h3>
                        <p className="text-sm" style={{ color: 'var(--fixed-text-secondary)' }}>
                          {surah.translation}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 2.8 }}
            className="text-center mt-12"
          >
            <Link href="/surahs">
              <Button className="px-8 py-4 theme-override-primary rounded-2xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                {locale === "en" ? "View All Surahs" : "Посмотреть все суры"}
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
