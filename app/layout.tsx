"use client";

import "./globals.css";
import { Inter, Amiri } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { LocaleProvider } from "@/context/LocaleContext";
import { ColorThemeProvider } from "@/context/ColorThemeContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import Sidebar from "@/components/Sidebar";
import { ForceColorApplication } from "@/components/ForceColorApplication";
import { LoadingBar } from "@/components/LoadingBar";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter"
});

const amiri = Amiri({ 
  subsets: ["arabic", "latin"], 
  weight: ["400", "700"],
  variable: "--font-amiri"
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 60 * 1000, // 30 minutes - дольше кешируем Коран данные 
      gcTime: 60 * 60 * 1000, // 1 hour - дольше держим в памяти
      refetchOnWindowFocus: false, // Не перезагружаем при фокусе
      refetchOnMount: false, // Не перезагружаем при монтировании если есть кеш
      retry: 1, // Меньше попыток повторения
      retryDelay: 1000, // Быстрая задержка между попытками
    },
  },
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${amiri.variable}`}>
      <body className={inter.className}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <LocaleProvider>
              <ColorThemeProvider>
                <ForceColorApplication />
                <LoadingBar />
                <div className="min-h-screen bg-background">
                  {/* Sidebar Navigation */}
                  <Sidebar />
                  
                  {/* Main Content Area - используем CSS переменную */}
                  <div 
                    className="transition-all duration-300"
                    style={{ 
                      marginLeft: 'var(--sidebar-width, 256px)' 
                    }}
                  >
                    {/* Mobile spacing for mobile header */}
                    <div className="lg:hidden h-16"></div>
                    
                    {/* Main content */}
                    <main className="min-h-screen">
                      {children}
                    </main>
                  </div>
                </div>
              </ColorThemeProvider>
            </LocaleProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
