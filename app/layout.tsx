"use client";

import "./globals.css";
import { Inter, Amiri } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { useState } from "react";
import { ThemeProvider } from "next-themes";
import { LocaleProvider } from "@/context/LocaleContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import Header from "@/components/Header";

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
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState("en");
  
  let messages;
  try {
    messages = require(`../messages/${locale}.json`);
  } catch (error) {
    messages = {};
  }

  return (
    <html lang={locale} suppressHydrationWarning className={`${inter.variable} ${amiri.variable}`}>
      <body className={inter.className}>
        <QueryClientProvider client={queryClient}>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <LocaleProvider>
                <Header/>
                {children}
              </LocaleProvider>
            </ThemeProvider>
          </NextIntlClientProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
