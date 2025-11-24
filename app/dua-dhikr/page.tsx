// src/app/dua-dhikr/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useLocale } from "@/context/LocaleContext";
import Link from "next/link";
import { 
  Sun, 
  Moon, 
  Building2, 
  Heart, 
  Star, 
  ChevronRight,
  Book,
  Languages,
  Home,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

export default function DuaDhikrPage() {
  const { locale, t } = useLocale();
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  if (!isMounted) {
    return (
      <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--color-primary)' }}></div>
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
          <div className="flex items-center justify-between">
            
            {/* Left - Navigation */}
            <div className="flex items-center gap-4">
              <Link href="/quran">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Home className="w-4 h-4" />
                  {t("home")}
                </Button>
              </Link>
            </div>

            {/* Center - Title */}
            <div className="text-center">
              <h1 className="font-bold text-2xl" style={{ color: 'var(--color-primary)' }}>
                {t("DuaDhikr.title")}
              </h1>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                {t("DuaDhikr.subtitle")}
              </p>
            </div>

            {/* Right - Saved Duas */}
            <div className="flex items-center">
              <Link href="/dua-dhikr/saved">
                <Button variant="outline" size="sm" className="gap-2">
                  <Star className="w-4 h-4" />
                  {t("saved")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Introduction Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 p-6 rounded-2xl border shadow-lg mb-6" style={{
            backgroundColor: 'var(--color-background-secondary)',
            borderColor: 'var(--color-border)'
          }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center" 
                 style={{ backgroundColor: 'var(--color-primary)' }}>
              <Book className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
                {t('DuaDhikr.title')}
              </h2>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                {t('DuaDhikr.subtitle')}
              </p>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {duaCategories.map((category, index) => {
            const IconComponent = category.icon;
            
            return (
              <Link 
                key={category.id} 
                href={`/dua-dhikr/${category.id}`}
                className="group"
              >
                <div 
                  className={`
                    p-6 rounded-2xl border-2 transition-all duration-500 
                    hover:shadow-2xl hover:-translate-y-2 hover:scale-105
                    ${category.bgColor} ${category.borderColor}
                    group-hover:border-opacity-100
                  `}
                  style={{
                    backgroundColor: 'var(--color-background-secondary)',
                    borderColor: 'var(--color-border)',
                    borderWidth: '1px'
                  }}
                >
                  {/* Icon with Gradient Background */}
                  <div className="relative mb-4">
                    <div 
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${category.gradient} 
                                  flex items-center justify-center shadow-lg 
                                  group-hover:rotate-12 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    
                    {/* Animated Ring */}
                    <div 
                      className={`absolute inset-0 w-16 h-16 rounded-2xl border-2 
                                  opacity-0 group-hover:opacity-100 group-hover:scale-125 
                                  transition-all duration-500 ${category.borderColor}`}
                    ></div>
                  </div>

                  {/* Content */}
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
                      {t(`DuaDhikr.categories.${category.id}`)}
                    </h3>
                    
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                      {t(`DuaDhikr.descriptions.${category.id}`)}
                    </p>
                    
                    {/* View All Button */}
                    <div className="flex items-center justify-between pt-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="gap-2 group-hover:gap-3 transition-all duration-300"
                        style={{ color: 'var(--color-primary)' }}
                      >
                        {t('DuaDhikr.viewAll')}
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </Button>
                      
                      {/* Language indicator */}
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }}></div>
                        <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                          {t('DuaDhikr.languageIndicator')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar Animation */}
                  <div className="mt-4 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${category.gradient} 
                                  w-0 group-hover:w-full transition-all duration-1000 ease-out`}
                    ></div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: 'Утром', count: '15+', icon: Sun },
            { label: 'Вечером', count: '12+', icon: Moon },
            { label: 'После намаза', count: '20+', icon: Building2 },
            { label: 'Ежедневно', count: '30+', icon: Heart }
          ].map((stat, index) => {
            const IconComponent = stat.icon;
            const labels = [t("morning"), t("evening"), t("afterPrayer"), t("daily")];
            
            return (
              <div 
                key={index}
                className="p-4 rounded-xl border text-center hover:shadow-lg transition-all duration-300"
                style={{
                  backgroundColor: 'var(--color-background-secondary)',
                  borderColor: 'var(--color-border)',
                  borderWidth: '1px'
                }}
              >
                <div className="w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center"
                     style={{ backgroundColor: 'var(--color-primary)' }}>
                  <IconComponent className="w-4 h-4 text-white" />
                </div>
                <div className="text-2xl font-bold mb-1" style={{ color: 'var(--color-primary)' }}>
                  {stat.count}
                </div>
                <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  {labels[index]}
                </div>
              </div>
            );
          })}
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: '📖' },
            { icon: '🌐' },
            { icon: '✨' }
          ].map((feature, index) => {
            const titles = [t("arabicText"), t("translations"), t("benefits")];
            const descriptions = [t("arabicTextDesc"), t("translationsDesc"), t("benefitsDesc")];
            
            return (
              <div 
                key={index}
                className="p-6 rounded-xl border hover:shadow-lg transition-all duration-300"
                style={{
                  backgroundColor: 'var(--color-background-secondary)',
                  borderColor: 'var(--color-border)',
                  borderWidth: '1px'
                }}
              >
                <div className="text-3xl mb-4 text-center">{feature.icon}</div>
                <h3 className="text-lg font-semibold mb-2 text-center" style={{ color: 'var(--color-text)' }}>
                  {titles[index]}
                </h3>
                <p className="text-sm text-center" style={{ color: 'var(--color-text-secondary)' }}>
                  {descriptions[index]}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}