"use client";

import { useState } from "react";
import { useLocale } from "@/context/LocaleContext";
import JourneyMap from "@/components/journey/JourneyMap";
import JourneyStats from "@/components/journey/JourneyStats";
import JourneyAchievements from "@/components/journey/JourneyAchievements";
import JourneyQuiz from "@/components/journey/JourneyQuiz";
import { Map, BarChart3, Trophy, Brain } from "lucide-react";
import { useRouter } from "next/navigation";

export default function JourneyPage() {
  const { locale, t } = useLocale();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "map" | "stats" | "achievements" | "quiz"
  >("map");


  const handleStartQuiz = (surahNumber: number) => {
    // Перенаправляем на страницу квиза для конкретной суры
    router.push(`/quiz?surah=${surahNumber}`);
  };

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--fixed-background)" }}
    >
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Приветственный баннер */}
        <div
          className="mb-8 p-8 rounded-3xl border-2 relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, var(--color-secondary) 0%, var(--color-background-secondary) 100%)`,
            borderColor: "var(--color-primary)",
          }}
        >
          <div
            className="absolute inset-0 opacity-5"
            style={{
              background: `linear-gradient(135deg, var(--color-secondary) 0%, var(--color-background-secondary) 100%)`,
              borderColor: "var(--color-primary)",
            }}
          />

          <div className="relative z-10 text-center space-y-4">
            <div className="text-6xl mb-4">🗺️</div>
            <h1
              className="text-4xl md:text-5xl font-bold"
              style={{ color: "var(--fixed-text)" }}
            >
              {t('quranJourney')}
            </h1>
            <p
              className="text-lg max-w-2xl mx-auto"
              style={{ color: "var(--fixed-text-secondary)" }}
            >
              {t('journeyDescription')}
            </p>
          </div>
        </div>

        {/* Табы навигации */}
        <div className="mb-8">
          <div
            className="flex gap-3 p-2 rounded-2xl border-2 bg-opacity-50"
            style={{
              backgroundColor: "var(--fixed-background-secondary)",
              borderColor: "var(--color-border)",
            }}
          >
            <button
              onClick={() => setActiveTab("map")}
              className="flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-xl transition-all font-medium"
              style={{
                backgroundColor:
                  activeTab === "map" ? "var(--color-primary)" : "transparent",
                color: activeTab === "map" ? "white" : "var(--fixed-text)",
              }}
            >
              <Map className="w-5 h-5" />
              <span>{t('journeyMap')}</span>
            </button>

            <button
              onClick={() => setActiveTab("stats")}
              className="flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-xl transition-all font-medium"
              style={{
                backgroundColor:
                  activeTab === "stats" ? "var(--color-primary)" : "transparent",
                color: activeTab === "stats" ? "white" : "var(--fixed-text)",
              }}
            >
              <BarChart3 className="w-5 h-5" />
              <span>{t('statistics')}</span>
            </button>

            <button
              onClick={() => setActiveTab("achievements")}
              className="flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-xl transition-all font-medium"
              style={{
                backgroundColor:
                  activeTab === "achievements" ? "var(--color-primary)" : "transparent",
                color:
                  activeTab === "achievements" ? "white" : "var(--fixed-text)",
              }}
            >
              <Trophy className="w-5 h-5" />
              <span>{t('achievements')}</span>
            </button>

            <button
              onClick={() => setActiveTab("quiz")}
              className="flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-xl transition-all font-medium"
              style={{
                backgroundColor:
                  activeTab === "quiz" ? "var(--color-primary)" : "transparent",
                color: activeTab === "quiz" ? "white" : "var(--fixed-text)",
              }}
            >
              <Brain className="w-5 h-5" />
              <span>{t('quiz')}</span>
            </button>
          </div>
        </div>

        {/* Контент табов */}
        <div>
          {activeTab === "map" && <JourneyMap onStartQuiz={handleStartQuiz} />}
          {activeTab === "stats" && <JourneyStats />}
          {activeTab === "achievements" && <JourneyAchievements />}
          {activeTab === "quiz" && (
            <JourneyQuiz onBack={() => setActiveTab("map")} />
          )}
        </div>
      </div>
    </div>
  );
}
