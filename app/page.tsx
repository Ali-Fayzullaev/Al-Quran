"use client";

import { useLocale } from "@/context/LocaleContext";
import { Book, Quote, Hand } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const { locale } = useLocale();

  return (
    <main className="min-h-screen bg-white text-gray-900 dark:bg-neutral-950 dark:text-gray-100 transition-colors">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-20 px-6">
        <h2 className="text-4xl md:text-6xl font-extrabold text-green-700 dark:text-yellow-400">
          {locale === "en"
            ? "Welcome to Quran AI"
            : "Добро пожаловать в Коран AI"}
        </h2>
        <p className="mt-4 text-lg max-w-2xl text-gray-700 dark:text-gray-300">
          {locale === "en"
            ? "Explore the Quran, Hadith, and Dua with a modern design."
            : "Исследуйте Коран, Хадисы и Ду'а в современном оформлении."}
        </p>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 px-8 pb-16">
        <Link href="/surahs">
          <div className="p-6 rounded-2xl shadow-lg bg-green-100 dark:bg-neutral-800">
            <Book className="w-10 h-10 text-green-700 dark:text-yellow-400 mb-4" />
            <h3 className="text-xl font-semibold">
              {locale === "en" ? "Quran" : "Коран"}
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              {locale === "en"
                ? "Read and listen to the Quran."
                : "Читайте и слушайте Коран."}
            </p>
          </div>
        </Link>

        <div className="p-6 rounded-2xl shadow-lg bg-green-100 dark:bg-neutral-800">
          <Quote className="w-10 h-10 text-green-700 dark:text-yellow-400 mb-4" />
          <h3 className="text-xl font-semibold">
            {locale === "en" ? "Hadith" : "Хадисы"}
          </h3>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            {locale === "en"
              ? "Discover collections of Hadith."
              : "Изучайте сборники хадисов."}
          </p>
        </div>

        <div className="p-6 rounded-2xl shadow-lg bg-green-100 dark:bg-neutral-800">
          <Hand className="w-10 h-10 text-green-700 dark:text-yellow-400 mb-4" />
          <h3 className="text-xl font-semibold">
            {locale === "en" ? "Dua" : "Ду'а"}
          </h3>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            {locale === "en"
              ? "Read and learn daily duas."
              : "Читайте и учите ежедневные дуа."}
          </p>
        </div>
      </section>
    </main>
  );
}
