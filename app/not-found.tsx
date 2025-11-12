'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import CustomColorSettings from '../components/CustomColorSettings';
import { 
  Home, 
  BookOpen, 
  Calendar, 
  List, 
  Settings, 
  Moon, 
  Sparkles,
  Quote,
  Church
} from 'lucide-react';

export default function NotFound() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Красивый аят из Корана (Коран 2:286)
  const ayah = {
    arabic: "لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا",
    translation: "Аллах не возлагает на душу ничего сверх её возможностей",
    reference: "Коран 2:286"
  };

  // Мотивационное сообщение
  const motivationalMessage = {
    title: "Страница не найдена",
    subtitle: "Возможно, вы заблудились в поиске знаний",
    description: "Не беспокойтесь, каждое путешествие в поисках истины ценно. Вернемся к изучению Священного Корана."
  };

  if (!mounted) {
    return <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background)' }} />;
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{ 
        background: `linear-gradient(135deg, 
          color-mix(in srgb, var(--color-primary) 3%, var(--color-background)) 0%,
          var(--color-background) 50%,
          color-mix(in srgb, var(--color-primary) 5%, var(--color-background)) 100%)`
      }}
    >
      {/* Скрытый компонент для инициализации цветовых настроек */}
      <div style={{ display: 'none' }}>
        <CustomColorSettings />
      </div>

      <div className="max-w-4xl mx-auto text-center">
        {/* Декоративный фон */}
        <div className="not-found-bg-pattern"></div>

        {/* Основная карточка */}
        <div 
          className="rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden planner-card-animated not-found-container"
          style={{ 
            backgroundColor: 'var(--color-background)', 
            borderColor: 'var(--color-border)', 
            borderWidth: '1px' 
          }}
        >
          {/* Декоративные элементы */}
          <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full opacity-10 islamic-pattern-animated" 
               style={{ backgroundColor: 'var(--color-primary)' }}></div>
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full opacity-5"
               style={{ backgroundColor: 'var(--color-primary)' }}></div>

          {/* Иконка 404 */}
          <div className="mb-8">
            <div className="text-8xl md:text-9xl font-bold opacity-20 mb-4 not-found-404-number" 
                 style={{ color: 'var(--color-primary)' }}>404</div>
            <div className="mb-6 text-7xl not-found-mosque-icon">
              🕌
            </div>
          </div>

          {/* Заголовок */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>
              {motivationalMessage.title}
            </h1>
            <h2 className="text-xl md:text-2xl mb-4" style={{ color: 'var(--color-primary)' }}>
              {motivationalMessage.subtitle}
            </h2>
            <p className="text-lg leading-relaxed max-w-2xl mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
              {motivationalMessage.description}
            </p>
          </div>

          {/* Священный аят */}
          <div className="mb-10">
            <div 
              className="rounded-2xl p-8 mb-6 relative not-found-ayah-container"
              style={{ 
                backgroundColor: 'var(--color-background-secondary)',
                borderColor: 'var(--color-border)',
                borderWidth: '1px'
              }}
            >
              {/* Декоративные кавычки */}
              <div className="absolute -top-2 -left-2 opacity-30" style={{ color: 'var(--color-primary)' }}>
                <Quote size={32} />
              </div>
              <div className="absolute -bottom-2 -right-2 opacity-30 rotate-180" style={{ color: 'var(--color-primary)' }}>
                <Quote size={32} />
              </div>

              {/* Арабский текст */}
              <div className="mb-6 relative z-10">
                <div 
                  className="quran-text-animated not-found-arabic-text text-3xl md:text-4xl leading-loose font-arabic text-center mb-4"
                  style={{ 
                    fontFamily: 'var(--font-arabic)',
                    color: 'var(--color-text)',
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  {ayah.arabic}
                </div>
              </div>

              {/* Перевод */}
              <div className="relative z-10">
                <p className="text-lg md:text-xl italic leading-relaxed mb-3" style={{ color: 'var(--color-text)' }}>
                  "{ayah.translation}"
                </p>
                <div className="flex items-center justify-center">
                  <span className="px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2"
                        style={{ backgroundColor: 'var(--color-muted)', color: 'var(--color-primary)' }}>
                    <BookOpen size={16} />
                    {ayah.reference}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Кнопки действий */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link 
              href="/"
              className="px-8 py-4 text-white rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center space-x-2 planner-button-animated not-found-btn-primary"
              style={{ backgroundColor: 'var(--color-primary)' }}
              onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = 'var(--color-primary-dark)'}
              onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = 'var(--color-primary)'}
            >
              <Home size={24} />
              <span>Вернуться домой</span>
            </Link>

            <Link 
              href="/quran"
              className="px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center space-x-2 not-found-btn-secondary"
              style={{ 
                backgroundColor: 'transparent',
                borderColor: 'var(--color-primary)',
                borderWidth: '2px',
                color: 'var(--color-primary)'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.backgroundColor = 'var(--color-primary)';
                (e.target as HTMLElement).style.color = 'white';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.backgroundColor = 'transparent';
                (e.target as HTMLElement).style.color = 'var(--color-primary)';
              }}
            >
              <BookOpen size={24} />
              <span>Читать Коран</span>
            </Link>
          </div>

          {/* Дополнительные ссылки */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <Link 
              href="/planner"
              className="p-4 rounded-xl transition-all duration-200 hover:shadow-lg group not-found-nav-card relative"
              style={{ backgroundColor: 'var(--color-background-secondary)' }}
              onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = 'var(--color-muted)'}
              onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = 'var(--color-background-secondary)'}
            >
              <div className="mb-2">
                <Calendar size={48} style={{ color: 'var(--color-primary)' }} />
              </div>
              <div className="font-semibold mb-1" style={{ color: 'var(--color-text)' }}>Планировщик</div>
              <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Создать план изучения</div>
            </Link>

            <Link 
              href="/surahs"
              className="p-4 rounded-xl transition-all duration-200 hover:shadow-lg group not-found-nav-card relative"
              style={{ backgroundColor: 'var(--color-background-secondary)' }}
              onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = 'var(--color-muted)'}
              onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = 'var(--color-background-secondary)'}
            >
              <div className="mb-2">
                <List size={48} style={{ color: 'var(--color-primary)' }} />
              </div>
              <div className="font-semibold mb-1" style={{ color: 'var(--color-text)' }}>Суры</div>
              <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Список всех сур</div>
            </Link>

            <Link 
              href="/settings"
              className="p-4 rounded-xl transition-all duration-200 hover:shadow-lg group not-found-nav-card relative"
              style={{ backgroundColor: 'var(--color-background-secondary)' }}
              onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = 'var(--color-muted)'}
              onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = 'var(--color-background-secondary)'}
            >
              <div className="mb-2">
                <Settings size={48} style={{ color: 'var(--color-primary)' }} />
              </div>
              <div className="font-semibold mb-1" style={{ color: 'var(--color-text)' }}>Настройки</div>
              <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Персонализация</div>
            </Link>
          </div>

          {/* Вдохновляющее сообщение */}
          <div className="mt-12 pt-8 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-center justify-center space-x-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              <Moon size={16} />
              <span>Каждый шаг в поиске знаний приближает нас к истине</span>
              <Sparkles size={16} />
            </div>
          </div>
        </div>

        {/* Плавающие декоративные элементы */}
        <div className="absolute top-20 left-10 w-6 h-6 rounded-full opacity-20 islamic-pattern-animated" 
             style={{ backgroundColor: 'var(--color-primary)', animationDelay: '1s' }}></div>
        <div className="absolute top-40 right-16 w-4 h-4 rounded-full opacity-30" 
             style={{ backgroundColor: 'var(--color-primary)', animation: 'islamic-pattern-float 8s ease-in-out infinite', animationDelay: '2s' }}></div>
        <div className="absolute bottom-32 left-20 w-5 h-5 rounded-full opacity-25" 
             style={{ backgroundColor: 'var(--color-primary)', animation: 'islamic-pattern-float 10s ease-in-out infinite', animationDelay: '3s' }}></div>
      </div>
    </div>
  );
}