"use client";

import { useState, memo, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Book, 
  Search, 
  Navigation, 
  Bookmark, 
  Settings, 
  Palette, 
  Brain, 
  Map,
  Home,
  Menu,
  X,
  EyeOff,
  Minimize2,
  Maximize2,
  Square,
  Bot,
  MessageSquare
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

type SidebarSize = 'hidden' | 'small' | 'medium' | 'large';

// Мемоизированный компонент навигационного элемента
const NavigationItem = memo(({ 
  item, 
  isActive, 
  isCompact, 
  onMobileClose 
}: {
  item: any;
  isActive: boolean;
  isCompact: boolean;
  onMobileClose: () => void;
}) => {
  const Icon = item.icon;
  
  return (
    <Link
      href={item.href}
      onClick={onMobileClose}
      className={cn(
        "relative flex items-center rounded-lg text-sm font-medium group",
        isCompact ? "justify-center p-3" : "space-x-3 px-3 py-3",
        isActive
          ? "bg-primary/10 text-primary shadow-sm"
          : "text-foreground hover:bg-accent hover:text-accent-foreground"
      )}
      title={isCompact ? item.name : undefined}
    >
      <div className="relative">
        <Icon className={cn("h-5 w-5", isActive ? "text-primary" : "")} />
        {item.badge && (
          <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center text-[10px]">
            {item.badge > 99 ? '99+' : item.badge}
          </span>
        )}
      </div>
      
      {!isCompact && (
        <>
          <span className="flex-1">{item.name}</span>
          {item.isPremium && (
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
              ★
            </span>
          )}
        </>
      )}
      
      {isActive && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
      )}
    </Link>
  );
});

NavigationItem.displayName = 'NavigationItem';

const Sidebar = memo(function Sidebar() {
  const pathname = usePathname();
  const { locale, t } = useLocale();
  const { bookmarks } = useQuranStore();
  const [sidebarSize, setSidebarSize] = useState<SidebarSize>('medium');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

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

  // Оптимизированные колбэки
  const handleMobileClose = useCallback(() => {
    setIsMobileOpen(false);
  }, []);

  const cycleSidebarSize = useCallback(() => {
    const sizes: SidebarSize[] = ['hidden', 'small', 'medium', 'large'];
    setSidebarSize(current => {
      const currentIndex = sizes.indexOf(current);
      const nextIndex = (currentIndex + 1) % sizes.length;
      return sizes[nextIndex];
    });
  }, []);

  // Быстрая CSS-only анимация
  useEffect(() => {
    const sidebarWidths = { hidden: 0, small: 64, medium: 256, large: 320 };
    document.documentElement.style.setProperty('--sidebar-width', `${sidebarWidths[sidebarSize]}px`);
    localStorage.setItem('sidebarSize', sidebarSize);
  }, [sidebarSize]);

  useEffect(() => {
    const savedSize = localStorage.getItem('sidebarSize') as SidebarSize;
    if (savedSize && ['hidden', 'small', 'medium', 'large'].includes(savedSize)) {
      setSidebarSize(savedSize);
    }
  }, []);

  const sidebarWidths = {
    hidden: 'w-0',
    small: 'w-16',
    medium: 'w-64', 
    large: 'w-80'
  };

  const isCompact = sidebarSize === 'small';
  const isHidden = sidebarSize === 'hidden';

  // Мемоизируем иконку размера
  const SizeIcon = useMemo(() => {
    const icons = {
      hidden: EyeOff,
      small: Minimize2,
      medium: Square,
      large: Maximize2
    };
    const IconComponent = icons[sidebarSize];
    return <IconComponent className="h-5 w-5" />;
  }, [sidebarSize]);

  if (isHidden) {
    return (
      <button
        onClick={cycleSidebarSize}
        className="fixed top-4 left-4 z-[60] lg:block hidden p-3 rounded-full bg-primary text-primary-foreground shadow-2xl hover:bg-primary/90"
        title="Показать sidebar"
      >
        {SizeIcon}
      </button>
    );
  }

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg shadow-md bg-primary">
              <Book className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground">
              {t('title')}
            </span>
          </Link>
          
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2 rounded-lg hover:bg-accent"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-50 bg-black/50"
          onClick={handleMobileClose}
        />
      )}

      {/* Sidebar Size Toggle */}
      <button
        onClick={cycleSidebarSize}
        className="fixed top-4 z-[60] lg:block hidden p-3 rounded-full bg-primary text-primary-foreground shadow-2xl hover:bg-primary/90"
        title={`Размер sidebar: ${sidebarSize}`}
        style={{
          left: sidebarSize === 'small' ? '80px' : 
                sidebarSize === 'medium' ? '272px' : '336px'
        }}
      >
        {SizeIcon}
      </button>

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 h-full bg-background border-r border-border shadow-lg z-40",
        sidebarWidths[sidebarSize],
        "lg:translate-x-0",
        isMobileOpen ? "translate-x-0 w-72" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          {!isCompact ? (
            <div className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg shadow-md bg-primary">
                <Book className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg text-foreground">
                {t('title')}
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-center w-full">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg shadow-md bg-primary">
                <Book className="h-5 w-5 text-primary-foreground" />
              </div>
            </div>
          )}
          
          <button
            onClick={handleMobileClose}
            className="lg:hidden p-2 rounded-lg hover:bg-accent"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Controls */}
        {!isCompact && (
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between space-x-2">
              <ThemeDrawer>
                <button className="flex-1 p-2 rounded-lg hover:bg-accent flex items-center justify-center space-x-2">
                  <Palette className="h-5 w-5" />
                  <span className="text-sm">Темы</span>
                </button>
              </ThemeDrawer>
              <ThemeToggle />
              <LanguageToggle />
            </div>
          </div>
        )}

        {isCompact && (
          <div className="p-2 border-b border-border space-y-2">
            <ThemeDrawer>
              <button className="w-full p-2 rounded-lg hover:bg-accent flex items-center justify-center">
                <Palette className="h-5 w-5" />
              </button>
            </ThemeDrawer>
            <div className="flex flex-col space-y-2">
              <ThemeToggle />
              <LanguageToggle />
            </div>
          </div>
        )}

        {/* Navigation с оптимизированным скроллом */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin">
          {Object.entries(categories).map(([categoryKey, categoryName]) => {
            const categoryItems = navigation.filter(item => item.category === categoryKey);
            if (categoryItems.length === 0) return null;

            return (
              <div key={categoryKey}>
                {!isCompact && (
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    {categoryName}
                  </h3>
                )}
                
                <div className="space-y-1">
                  {categoryItems.map((item) => (
                    <NavigationItem
                      key={item.href}
                      item={item}
                      isActive={pathname === item.href}
                      isCompact={isCompact}
                      onMobileClose={handleMobileClose}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
});

export default Sidebar;