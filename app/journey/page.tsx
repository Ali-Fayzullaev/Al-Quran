"use client";

import { useState, type CSSProperties } from "react";
import { useLocale } from "@/context/LocaleContext";
import JourneyMap from "@/components/journey/JourneyMap";
import JourneyStats from "@/components/journey/JourneyStats";
import JourneyAchievements from "@/components/journey/JourneyAchievements";
import JourneyQuiz from "@/components/journey/JourneyQuiz";
import { Map, BarChart3, Trophy, Brain } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";

type JourneyTabId = "map" | "stats" | "achievements" | "quiz";

export default function JourneyPage() {
  const { t } = useLocale();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<JourneyTabId>("map");

  const tabScrollStyle: CSSProperties = {
    WebkitOverflowScrolling: "touch",
  };

  const tabItems: Array<{ id: JourneyTabId; label: string; icon: LucideIcon }> = [
    { id: "map", label: t("journeyMap"), icon: Map },
    { id: "stats", label: t("statistics"), icon: BarChart3 },
    { id: "achievements", label: t("achievements"), icon: Trophy },
    { id: "quiz", label: t("quiz"), icon: Brain },
  ];

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
              {t("quranJourney")}
            </h1>
            <p
              className="text-lg max-w-2xl mx-auto"
              style={{ color: "var(--fixed-text-secondary)" }}
            >
              {t("journeyDescription")}
            </p>
          </div>
        </div>

        {/* Табы навигации */}
        <div className="mb-8">
          <div
            className=" bg-opacity-50"
            style={{
              backgroundColor: "var(--fixed-background-secondary)",
              borderColor: "var(--color-border)",
            }}
          >
            <div
              className="flex gap-3 overflow-x-auto pb-3 sm:pb-2 sm:flex-wrap"
              style={tabScrollStyle}
            >
              {tabItems.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`min-w-[200px] sm:min-w-0 sm:flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-xl transition-all font-medium ${
                    activeTab === id
                      ? "shadow-lg"
                      : "opacity-90 hover:opacity-100"
                  }`}
                  style={{
                    backgroundColor:
                      activeTab === id
                        ? "var(--color-primary)"
                        : "var(--fixed-background)",
                    borderColor:
                      activeTab === id
                        ? "var(--color-primary)"
                        : "var(--color-border)",
                    color: activeTab === id ? "white" : "var(--fixed-text)",
                  }}
                  aria-pressed={activeTab === id}
                >
                  <Icon className="w-5 h-5" />
                  <span className="whitespace-nowrap">{label}</span>
                </button>
              ))}
            </div>
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
