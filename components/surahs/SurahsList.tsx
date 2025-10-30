"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react";
import CountUp from "react-countup";
import { useState } from "react";

interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

interface SurahsListProps {
  surahs: Surah[];
}

export default function SurahsList({ surahs }: SurahsListProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {surahs.map((surah) => (
        <HoverCard key={surah.number} surah={surah} />
      ))}
    </div>
  );
}

// 👇 отдельная карточка с hover-анимацией
function HoverCard({ surah }: { surah: Surah }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link href={`/surah/${surah.number}`}>
      <div
        className="group relative overflow-hidden rounded-2xl border shadow-lg p-6 cursor-pointer bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:theme-border-primary"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full theme-decoration group-hover:theme-bg-primary-20 transition" />

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-full theme-bg-primary-20 theme-text-primary">
            <span className="text-lg font-bold">{surah.number}</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 group-hover:theme-text-primary">
              {surah.englishName}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{surah.englishNameTranslation}</p>
          </div>
        </div>

        {/* Arabic name */}
        <div className="mt-4 text-center" dir="rtl">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 font-amiri group-hover:theme-text-primary">
            {surah.name}
          </h2>
        </div>

        {/* Footer info */}
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>{surah.numberOfAyahs} аятов</span>
          <span className="capitalize">{surah.revelationType}</span>
        </div>

        <div className="mt-4 h-1 w-0 group-hover:w-full theme-bg-primary transition-all duration-500 rounded-full" />
      </div>
    </Link>
  );
}
