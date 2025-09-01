// app/layout.tsx
"use client";

import "./globals.css";
import { Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { useState } from "react";
import { ThemeProvider } from "next-themes";
import { LocaleProvider } from "@/context/LocaleContext";

import Header from "@/components/Header";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState("en");
  const messages = require(`../messages/${locale}.json`);

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className}>
        <NextIntlClientProvider locale={locale} messages={messages}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system" // светлая/тёмная по системе
          enableSystem
          disableTransitionOnChange
        >
          <LocaleProvider>
          <Header/>
          {children}
          </LocaleProvider>
        </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
