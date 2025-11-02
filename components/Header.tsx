"use client";

import { useState, memo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Book, Search, Navigation, Bookmark, Settings, Palette, Brain, Map } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageToggle } from "./LanguageToggle";
import dynamic from "next/dynamic";
import { useLocale } from "@/context/LocaleContext";
import { useQuranStore } from "@/lib/store";
import { cn } from "@/lib/utils";

interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  badge?: number;
  isPremium?: boolean;
}

// Lazy load ThemeDrawer для лучшей производительности
const ThemeDrawer = dynamic(() => import("./ThemeDrawer"), {
  ssr: false,
});

const Header = memo(function Header() {
  const pathname = usePathname();
  const { locale, t, isLoading } = useLocale();
  const { bookmarks } = useQuranStore();

  const navigation = [
    {
      name: t('home'),
      href: '/',
      icon: Book,
    },
    {
      name: locale === 'en' ? 'Quran Reading' : 'Чтение Корана',
      href: '/quran',
      icon: Book,
      isPremium: true
    },
    {
      name: locale === 'en' ? 'Journey' : 'Путешествие',
      href: '/journey',
      icon: Map,
    },
    {
      name: t('quiz'),
      href: '/quiz',
      icon: Brain,
    },
    {
      name: t('search'),
      href: '/search',
      icon: Search,
    },
    {
      name: t('bookmarks'),
      href: '/bookmarks',
      icon: Bookmark,
      badge: bookmarks.length > 0 ? bookmarks.length : undefined,
    },
    {
      name: t('settings'),
      href: '/settings',
      icon: Settings,
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b backdrop-blur" style={{
      borderColor: 'var(--color-border)',
      backgroundColor: 'var(--fixed-background)',
      opacity: 0.98
    }}>
      <div className="mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo - адаптивный */}
          <div className="flex items-center space-x-2">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg shadow-md theme-bg-primary">
                <Book className="h-5 w-5 text-white" />
              </div>
              <span className="hidden sm:block font-bold text-lg theme-text-primary">
                {t('title')}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105",
                    isActive
                      ? "theme-active-bg shadow-sm"
                      : ""
                  )}
                  style={{
                    color: isActive ? 'var(--color-primary)' : 'var(--fixed-text-secondary)',
                    backgroundColor: isActive ? 'var(--verse-background)' : 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'var(--color-border)';
                      e.currentTarget.style.color = 'var(--color-primary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--fixed-text-secondary)';
                    }
                  }}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                  {item.isPremium && (
                    <span className="ml-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-1 py-0.5 rounded-full font-bold">
                      ★
                    </span>
                  )}
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Mobile Navigation + Controls */}
          <div className="flex items-center space-x-3">
            {/* Controls */}
            <div className="flex items-center space-x-2">
              <ThemeDrawer>
                <button className="p-2 rounded-lg transition-all duration-200 hover:scale-105"
                        title="Настройки темы"
                        style={{ color: 'var(--fixed-text-secondary)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--color-border)';
                          e.currentTarget.style.color = 'var(--color-primary)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = 'var(--fixed-text-secondary)';
                        }}
                >
                  <Palette className="h-5 w-5" />
                </button>
              </ThemeDrawer>
              <ThemeToggle />
              <LanguageToggle />
            </div>

            {/* Mobile Menu */}
            <div className="lg:hidden">
              <MobileNav navigation={navigation} pathname={pathname} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
});

// Мобильная навигация
const MobileNav = memo(function MobileNav({ navigation, pathname }: { navigation: any[]; pathname: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLocale();

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden p-2 rounded-lg transition-all duration-200 hover:scale-105"
        aria-label={t('menu')}
        style={{ backgroundColor: 'var(--verse-background)' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--color-border)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--verse-background)';
        }}
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile menu overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 lg:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="fixed right-0 top-0 h-full w-72 shadow-2xl transform transition-transform duration-300 ease-out"
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: 'var(--fixed-background)' }}
          >
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <h2 className="text-lg font-semibold" style={{ color: 'var(--fixed-text)' }}>{t('menu')}</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg transition-colors"
                aria-label={t('close')}
                style={{ color: 'var(--fixed-text-secondary)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-border)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <nav className="p-4 space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "relative flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 w-full hover:scale-[1.02]",
                      isActive ? "theme-active-bg shadow-sm" : ""
                    )}
                    style={{
                      color: isActive ? 'var(--color-primary)' : 'var(--fixed-text-secondary)',
                      backgroundColor: isActive ? 'var(--verse-background)' : 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'var(--color-border)';
                        e.currentTarget.style.color = 'var(--color-primary)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'var(--fixed-text-secondary)';
                      }
                    }}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="flex-1">{item.name}</span>
                    {item.isPremium && (
                      <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                        ★
                      </span>
                    )}
                    {item.badge && (
                      <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Mobile controls at bottom */}
            <div className="absolute bottom-4 left-4 right-4 p-4 border-t rounded-lg" style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--verse-background)'
            }}>
              <div className="flex items-center justify-between">
                <ThemeToggle />
                <LanguageToggle />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

export default Header;
