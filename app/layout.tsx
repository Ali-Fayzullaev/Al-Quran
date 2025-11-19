// app/layout.tsx
"use client";

import "./globals-optimized.css";
import { Inter, Amiri } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { LocaleProvider } from "@/context/LocaleContext";
import { ColorThemeProvider } from "@/context/ColorThemeContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { CriticalResourcePreloader } from "@/lib/critical-preloader";
import NavigationLoader from "@/components/NavigationLoader";
import PerformanceMonitor from "@/components/PerformanceMonitor";

// Ленивая загрузка компонентов для ускорения
const Sidebar = dynamic(() => import("@/components/Sidebar"), { 
  ssr: false,
  loading: () => <div className="w-64 h-screen bg-gray-100"></div>
});

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

const amiri = Amiri({ 
  subsets: ["arabic", "latin"], 
  weight: ["400", "700"],
  variable: "--font-amiri",
  display: "swap"
});

// Еще более агрессивная оптимизация QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000, // 10 минут - дольше кеш
      gcTime: 15 * 60 * 1000, // 15 минут в памяти
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false, // Не перезагружаем при восстановлении сети
      retry: false, // Отключаем retry для скорости
      networkMode: 'online',
    },
  },
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${amiri.variable}`}>
      <head>
        {/* Критические предзагрузки */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="preconnect" href="https://api.alquran.cloud" />
        <link rel="dns-prefetch" href="https://api.alquran.cloud" />
        
        {/* Предзагрузка критических ресурсов */}
        <link 
          rel="preload" 
          href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&display=swap" 
          as="style" 
        />
        
        {/* Мета-теги для производительности */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      </head>
      <body className={inter.className}>
        {/* Критический предзагрузчик - запускается первым */}
        <CriticalResourcePreloader />
        
        <QueryClientProvider client={queryClient}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange={true}
          >
            <LocaleProvider>
              <ColorThemeProvider>
                <div className="min-h-screen bg-background">
                  {/* Глобальный индикатор загрузки */}
                  <NavigationLoader />
                  
                  {/* Мониторинг производительности */}
                  <PerformanceMonitor />
                  
                  <Sidebar />
                  
                  {/* Убираем margin-left так как sidebar теперь overlay */}
                  <main className="min-h-screen">
                    {children}
                  </main>
                </div>
              </ColorThemeProvider>
            </LocaleProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
