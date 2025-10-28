"use client";

import "./globals.css";
import { Inter, Amiri } from "next/font/google";
import { useState } from "react";
import { ThemeProvider } from "next-themes";
import { LocaleProvider } from "@/context/LocaleContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import Header from "@/components/Header";
import { ForceColorApplication } from "@/components/ForceColorApplication";

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
              <ForceColorApplication />
              <div className="min-h-screen bg-background">
                <Header />
                <main>{children}</main>
              </div>
            </LocaleProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
