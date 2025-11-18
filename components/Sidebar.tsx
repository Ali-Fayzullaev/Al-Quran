// components/Sidebar.tsx
"use client";

import {
  useState,
  memo,
  useEffect,
  useMemo,
  useCallback,
  type CSSProperties,
} from "react";
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
  Radio,
  Menu,
  X,
  Bot,
  MessageSquare,
  Star,
  Calendar,
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageToggle } from "./LanguageToggle";
import dynamic from "next/dynamic";
import { useLocale } from "@/context/LocaleContext";
import { useQuranStore } from "@/lib/store";
import { cn } from "@/lib/utils";

// Ленивая загрузка ThemeDrawer
const ThemeDrawer = dynamic(() => import("./ThemeDrawer"), {
  ssr: false,
  loading: () => (
    <button className="flex-1 p-2 rounded-lg bg-gray-100 animate-pulse">
      <div className="h-5 w-5 bg-gray-300 rounded mx-auto"></div>
    </button>
  ),
});

// Компонент навигационного элемента
const NavigationItem = memo(
  ({
    item,
    isActive,
    onClose,
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
          isActive ? "text-white shadow-md" : "hover:translate-x-1"
        )}
        style={
          isActive
            ? { backgroundColor: "var(--color-primary)" }
            : { color: "var(--color-text)" }
        }
      >
        <div className="relative">
          <Icon className="h-5 w-5" />
          {item.badge && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center text-[10px]">
              {item.badge > 99 ? "99+" : item.badge}
            </span>
          )}
        </div>

        <span className="flex-1">{item.name}</span>
        {item.isPremium && (
          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
        )}
      </Link>
    );
  }
);

NavigationItem.displayName = "NavigationItem";

const Sidebar = memo(function Sidebar() {
  const pathname = usePathname();
  const { locale, t } = useLocale();
  const { bookmarks } = useQuranStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Монтируем компонент только на клиенте
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Навигационные элементы
  const navigation = useMemo(() => {
    // Отладка: проверим что возвращает функция t
    console.log("Debug translations:", {
      home: t("home"),
      quranReading: t("quranReading"),
      journey: t("journey"),
      quiz: t("quiz"),
      locale: locale,
    });

    return [
      {
        name: t("home"),
        href: "/",
        icon: Home,
        category: "main",
      },
      {
        name: t("quranReading"),
        href: "/quran",
        icon: Book,
        isPremium: true,
        category: "main",
      },
      {
        name: t("journey"),
        href: "/journey",
        icon: Map,
        category: "learning",
      },
      {
        name: t("liveStreams.nav"),
        href: "/live",
        icon: Radio,
        category: "main",
      },
      {
        name: t("plannerTitle") || "Планировщик",
        href: "/planner",
        icon: Calendar,
        category: "learning",
      },
      {
        name: t("quiz"),
        href: "/quiz",
        icon: Brain,
        category: "learning",
      },
      {
        name: t("aiHelperNav"),
        href: "/ai-helper",
        icon: Bot,
        isPremium: true,
        category: "tools",
      },
      {
        name: t("search"),
        href: "/search",
        icon: Search,
        category: "tools",
      },
      {
        name: locale === "en" ? "Find Mosques" : locale === "ru" ? "Поиск мечетей" : "Masjid topish",
        href: "/mosque-finder",
        icon: Map,
        category: "tools",
      },
      {
        name: t("bookmarks"),
        href: "/bookmarks",
        icon: Bookmark,
        badge: bookmarks.length > 0 ? bookmarks.length : undefined,
        category: "tools",
      },
      {
        name: t("feedback"),
        href: "/feedback",
        icon: MessageSquare,
        category: "settings",
      },
      {
        name: t("settings"),
        href: "/settings",
        icon: Settings,
        category: "settings",
      },
    ];
  }, [locale, t, bookmarks.length]);

  // Категории
  const categories = useMemo(
    () => ({
      main: t("main"),
      learning: t("learning"),
      tools: t("tools"),
      settings: t("settingsCategory"),
    }),
    [t]
  );

  const closeSidebar = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const toggleButtonClassName = useMemo(
    () =>
      cn(
        "fixed z-[60] flex h-11 w-11 items-center justify-center rounded-full shadow-2xl border transition-all duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "text-white"
      ),
    []
  );

  const toggleButtonStyle = useMemo<CSSProperties>(
    () => ({
      position: "fixed",
      background:
        "linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))",
      borderColor: "rgba(255,255,255,0.35)",
      boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
      top: "calc(env(safe-area-inset-top, 0px) + 0.75rem)",
      right: "calc(env(safe-area-inset-right, 0px) + 0.75rem)",
      left: "auto",
      bottom: "auto",
    }),
    []
  );

  const navScrollStyle = useMemo<CSSProperties>(
    () => ({
      WebkitOverflowScrolling: "touch",
      overscrollBehavior: "contain",
      touchAction: "pan-y",
      height:
        "calc(100dvh - (5rem * 3) - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px))",
      maxHeight:
        "calc(100dvh - (5rem * 3) - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px))",
    }),
    []
  );

  // Закрытие при клике вне sidebar
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const sidebar = document.getElementById("main-sidebar");
      const toggleButton = document.getElementById("sidebar-toggle");

      if (
        sidebar &&
        !sidebar.contains(target) &&
        !toggleButton?.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Закрытие при Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  // Блокировка скролла
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Если не монтирован, не рендерим sidebar (только кнопку)
  if (!isMounted) {
    return (
      <button
        id="sidebar-toggle"
        className={toggleButtonClassName}
        style={toggleButtonStyle}
        title={t("openMenu")}
        aria-label={t("openMenu")}
      >
        <Menu className="h-5 w-5" />
      </button>
    );
  }

  return (
    <>
      {/* Кнопка меню */}
      <button
        id="sidebar-toggle"
        onClick={toggleSidebar}
        className={toggleButtonClassName}
        style={toggleButtonStyle}
        title={t("openMenu")}
        aria-label={t("openMenu")}
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 backdrop-blur-sm transition-all duration-300 z-40",
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        )}
        onClick={closeSidebar}
      />

      {/* Sidebar */}
      <aside
        id="main-sidebar"
        className={cn(
          "fixed top-0 left-0 h-full w-80 z-50 transition-transform duration-300 ease-out flex flex-col",
          "border-r shadow-2xl",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{
          backgroundColor: "var(--color-surface)",
          borderColor: "var(--color-border)",
        }}
      >
        {/* Header - фиксированная высота */}
        <div
          className="flex-shrink-0 h-20 flex items-center justify-between p-6 border-b"
          style={{ borderColor: "var(--color-border)" }}
        >
          <Link
            href="/"
            onClick={closeSidebar}
            className="flex items-center space-x-3 group"
          >
            <div
              className="flex items-center justify-center w-10 h-10 rounded-xl shadow-md transition-transform group-hover:scale-105"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              <Book className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1
                className="font-bold text-xl"
                style={{ color: "var(--color-text)" }}
              >
                {t("title")}
              </h1>
              <p
                className="text-xs"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {t("islamicLearningPlatform")}
              </p>
            </div>
          </Link>

          <button
            onClick={closeSidebar}
            className="p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
            style={{ color: "var(--color-text-secondary)" }}
            title={t("closeMenu")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Controls - фиксированная высота */}
        <div
          className="flex-shrink-0 h-20 flex items-center p-4 border-b"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div className="flex items-center justify-between space-x-2 w-full">
            <ThemeDrawer>
              <button
                className="flex-1 p-3 rounded-xl flex items-center justify-center space-x-2 transition-all duration-200 group hover:opacity-90"
                style={{ backgroundColor: "var(--color-muted)" }}
              >
                <Palette className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                <span
                  className="text-sm font-medium"
                  style={{ color: "var(--color-text)" }}
                >
                  {t("themes")}
                </span>
              </button>
            </ThemeDrawer>
            <div className="flex space-x-1">
              <ThemeToggle />
              <LanguageToggle />
            </div>
          </div>
        </div>

        {/* Navigation - растягивается на всю доступную высоту */}
        <div
          className="flex-1 min-h-0 overflow-y-auto"
          style={navScrollStyle}
        >
          <nav
            className="p-4 space-y-6"
            style={{
              paddingBottom:
                "calc(env(safe-area-inset-bottom, 0px) + 1.5rem)",
            }}
          >
              {Object.entries(categories).map(([categoryKey, categoryName]) => {
                const categoryItems = navigation.filter(
                  (item) => item.category === categoryKey
                );
                if (categoryItems.length === 0) return null;

                return (
                  <div key={categoryKey}>
                    <h3
                      className="text-xs font-bold uppercase tracking-wider mb-3 px-2"
                      style={{ color: "var(--color-text-secondary)" }}
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
          </nav>
        </div>

        {/* Footer - фиксированная высота */}
        <div
          className="flex-shrink-0 h-20 flex items-center p-4 border-t"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div
            className="text-center text-xs px-4 py-2 rounded-lg w-full"
            style={{
              color: "var(--color-text-secondary)",
              backgroundColor: "var(--color-muted)",
            }}
          >
            <p className="font-medium">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
            <p className="mt-1">{t("inTheNameOfAllah")}</p>
          </div>
        </div>
      </aside>
    </>
  );
});

export default Sidebar;
