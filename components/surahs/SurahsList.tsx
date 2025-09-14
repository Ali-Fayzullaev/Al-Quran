"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react";
import CountUp from "react-countup";
import { useState } from "react";

interface Surah {
  number: number;
  name: string;
  englishName: string;
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
        className="group relative overflow-hidden rounded-2xl border shadow-lg p-6 cursor-pointer bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-700 transition-transform duration-300 hover:scale-105 hover:shadow-2xl"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-[#13A895] opacity-10 group-hover:opacity-20 transition" />

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-full bg-[#13A895]/20 text-[#13A895]">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-xl text-gray-900 dark:text-white">
            {surah.number}. {surah.englishName}
          </h3>
        </div>

        {/* Arabic Name */}
        <p className="mt-2 text-lg font-medium text-gray-700 dark:text-gray-300">
          {surah.name}
        </p>

        {/* Info (hover эффект) */}
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {hovered ? (
            <CountUp start={0} end={surah.numberOfAyahs} duration={2} />
          ) : (
            surah.numberOfAyahs
          )}{" "}
          аятов – <span className="capitalize">{surah.revelationType}</span>
        </p>

        <div className="mt-4 h-1 w-0 group-hover:w-full bg-[#13A895] transition-all duration-500 rounded-full" />
      </div>
    </Link>
  );
}
