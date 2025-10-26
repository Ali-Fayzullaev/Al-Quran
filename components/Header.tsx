"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Book, Search, Navigation, Bookmark } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageToggle } from "./LanguageToggle";
import { useLocale } from "@/context/LocaleContext";
import { useQuranStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function Header() {
  const pathname = usePathname();
  const { locale } = useLocale();
  const { bookmarks } = useQuranStore();

  const navigation = [
    {
      name: locale === 'en' ? 'Home' : 'Главная',
      href: '/',
      icon: Book,
    },
    {
      name: locale === 'en' ? 'Surahs' : 'Суры',
      href: '/surahs',
      icon: Book,
    },
    {
      name: locale === 'en' ? 'Juz' : 'Джуз',
      href: '/juz',
      icon: Navigation,
    },
    {
      name: locale === 'en' ? 'Search' : 'Поиск',
      href: '/search',
      icon: Search,
    },
    {
      name: locale === 'en' ? 'Bookmarks' : 'Закладки',
      href: '/bookmarks',
      icon: Bookmark,
      badge: bookmarks.length > 0 ? bookmarks.length : undefined,
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo - адаптивный */}
          <div className="flex items-center space-x-2">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg">
                <Book className="h-5 w-5 text-white" />
              </div>
              <span className="hidden sm:block font-bold text-lg bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Al-Quran
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
                    "relative flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Mobile Navigation + Controls */}
          <div className="flex items-center space-x-2">
            {/* Controls */}
            <div className="flex items-center space-x-2">
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
}

// Мобильная навигация
function MobileNav({ navigation, pathname }: { navigation: any[]; pathname: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile menu overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="fixed right-0 top-0 h-full w-64 bg-white dark:bg-gray-900 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold">Menu</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
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
                      "relative flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors w-full",
                      isActive
                        ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="flex-1">{item.name}</span>
                    {item.badge && (
                      <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
