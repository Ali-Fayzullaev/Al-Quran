"use client";

import { useState, memo, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Book, 
  Search, 
  Bookmark, 
  Settings, 
  Palette, 
  Brain, 
  Map,
  Home,
  Menu,
  X,
  Bot,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageToggle } from "./LanguageToggle";
import dynamic from "next/dynamic";
import { useLocale } from "@/context/LocaleContext";
import { useQuranStore } from "@/lib/store";
import { cn } from "@/lib/utils";

// Ленивая загрузка ThemeDrawer только при клике
const ThemeDrawer = dynamic(() => import("./ThemeDrawer"), {
  ssr: false,
  loading: () => (
    <button className="flex-1 p-2 rounded-lg bg-gray-100 animate-pulse">
      <div className="h-5 w-5 bg-gray-300 rounded mx-auto"></div>
    </button>
  )
});

// Мемоизированный компонент навигационного элемента
const NavigationItem = memo(({ 
  item, 
  isActive, 
  onClose 
}: {
  item: any;
  isActive: boolean;
  onClose: () => void;
}) => {
  const Icon = item.icon;
  
  return (
    <Link
      href={item.href}
      onClick={onClose}
      className={cn(
        "relative flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium group transition-all duration-200",
        isActive
          ? "bg-primary text-primary-foreground shadow-md"
          : "text-foreground hover:bg-accent hover:text-accent-foreground hover:translate-x-1"
      )}
    >
      <div className="relative">
        <Icon className="h-5 w-5" />
        {item.badge && (
          <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center text-[10px]">
            {item.badge > 99 ? '99+' : item.badge}
          </span>
        )}
      </div>
      
      <span className="flex-1">{item.name}</span>
      {item.isPremium && (
        <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
          PRO
        </span>
      )}
    </Link>
  );
});

NavigationItem.displayName = 'NavigationItem';

const Sidebar = memo(function Sidebar() {
  const pathname = usePathname();
  const { locale, t } = useLocale();
  const { bookmarks } = useQuranStore();
  const [isOpen, setIsOpen] = useState(false); // По умолчанию скрыт
  const [isMounted, setIsMounted] = useState(false);

  // Мемоизируем навигационные элементы
  const navigation = useMemo(() => [
    {
      name: t('home'),
      href: '/',
      icon: Home,
      category: 'main'
    },
    {
      name: locale === 'en' ? 'Quran Reading' : 'Чтение Корана',
      href: '/quran',
      icon: Book,
      isPremium: true,
      category: 'main'
    },
    {
      name: locale === 'en' ? 'Journey' : 'Путешествие',
      href: '/journey',
      icon: Map,
      category: 'learning'
    },
    {
      name: t('quiz'),
      href: '/quiz',
      icon: Brain,
      category: 'learning'
    },
    {
      name: locale === 'en' ? 'AI Helper' : 'AI Помощник',
      href: '/ai-helper',
      icon: Bot,
      isPremium: true,
      category: 'tools'
    },
    {
      name: t('search'),
      href: '/search',
      icon: Search,
      category: 'tools'
    },
    {
      name: t('bookmarks'),
      href: '/bookmarks',
      icon: Bookmark,
      badge: bookmarks.length > 0 ? bookmarks.length : undefined,
      category: 'tools'
    },
    {
      name: locale === 'en' ? 'Feedback' : 'Обратная связь',
      href: '/feedback',
      icon: MessageSquare,
      category: 'settings'
    },
    {
      name: t('settings'),
      href: '/settings',
      icon: Settings,
      category: 'settings'
    },
  ], [locale, t, bookmarks.length]);

  // Мемоизируем категории
  const categories = useMemo(() => ({
    main: locale === 'en' ? 'Main' : 'Основное',
    learning: locale === 'en' ? 'Learning' : 'Обучение',
    tools: locale === 'en' ? 'Tools' : 'Инструменты',
    settings: locale === 'en' ? 'Settings' : 'Настройки'
  }), [locale]);

  const closeSidebar = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  // Закрытие при клике вне sidebar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const sidebar = document.getElementById('main-sidebar');
      const toggleButton = document.getElementById('sidebar-toggle');
      
      if (sidebar && !sidebar.contains(target) && !toggleButton?.contains(target) && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Закрытие при нажатии Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Блокировка скролла при открытом sidebar на мобильных
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Обновление CSS переменной для контента
  useEffect(() => {
    setIsMounted(true);
    // Всегда 0, так как sidebar overlay
    document.documentElement.style.setProperty('--sidebar-width', '0px');
  }, []);

  if (!isMounted) {
    return null; // Избегаем hydration mismatch
  }

  return (
    <>
      {/* Кнопка открытия sidebar - фиксированная */}
      <button
        id="sidebar-toggle"
        onClick={toggleSidebar}
        className={cn(
          "fixed top-4 left-4 z-[70] p-3 rounded-xl shadow-lg border backdrop-blur-sm transition-all duration-300",
          "hover:scale-105 active:scale-95 hover:shadow-xl",
          isOpen && "lg:hidden" // Скрываем на десктопе когда sidebar открыт
        )}
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
          color: 'var(--color-primary)'
        }}
        title={locale === 'en' ? 'Open menu' : 'Открыть меню'}
      >
        {isOpen ? <PanelLeftClose className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Overlay для мобильных и десктопа */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[50] bg-black/50 backdrop-blur-sm transition-opacity duration-300"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside 
        id="main-sidebar"
        className={cn(
          "fixed top-0 left-0 h-full z-[60] transition-transform duration-300 ease-out",
          "w-80 bg-background/95 backdrop-blur-xl border-r shadow-2xl",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{
          borderColor: 'var(--color-border)'
        }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-6 border-b"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <Link href="/" onClick={closeSidebar} className="flex items-center space-x-3 group">
            <div 
              className="flex items-center justify-center w-10 h-10 rounded-xl shadow-md transition-transform group-hover:scale-105"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              <Book className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-xl" style={{ color: 'var(--color-text)' }}>
                {t('title')}
              </h1>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                {locale === 'en' ? 'Islamic Learning Platform' : 'Платформа изучения ислама'}
              </p>
            </div>
          </Link>
          
          <button
            onClick={closeSidebar}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
            title={locale === 'en' ? 'Close menu' : 'Закрыть меню'}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quick Controls */}
        <div 
          className="p-4 border-b"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center justify-between space-x-2">
            <ThemeDrawer>
              <button 
                className="flex-1 p-3 rounded-xl hover:bg-accent flex items-center justify-center space-x-2 transition-all duration-200 group"
                style={{ backgroundColor: 'var(--color-muted)' }}
              >
                <Palette className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                <span className="text-sm font-medium">
                  {locale === 'en' ? 'Themes' : 'Темы'}
                </span>
              </button>
            </ThemeDrawer>
            <div className="flex space-x-1">
              <ThemeToggle />
              <LanguageToggle />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-6">
            {Object.entries(categories).map(([categoryKey, categoryName]) => {
              const categoryItems = navigation.filter(item => item.category === categoryKey);
              if (categoryItems.length === 0) return null;

              return (
                <div key={categoryKey}>
                  <h3 
                    className="text-xs font-bold uppercase tracking-wider mb-3 px-2"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {categoryName}
                  </h3>
                  
                  <div className="space-y-1">
                    {categoryItems.map((item) => (
                      <NavigationItem
                        key={item.href}
                        item={item}
                        isActive={pathname === item.href}
                        onClose={closeSidebar}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div 
          className="p-4 border-t"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <div 
            className="text-center text-xs px-4 py-2 rounded-lg"
            style={{ 
              color: 'var(--color-text-secondary)',
              backgroundColor: 'var(--color-muted)'
            }}
          >
            <p className="font-medium">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
            <p className="mt-1">
              {locale === 'en' ? 'In the name of Allah' : 'Во имя Аллаха'}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
});

export default Sidebar;