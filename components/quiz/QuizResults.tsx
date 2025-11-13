"use client";

import { motion } from "framer-motion";
import {
  Trophy,
  Target,
  Clock,
  TrendingUp,
  BookOpen,
  RefreshCw,
  Home,
  Award,
  Heart,
  Star,
  Sparkles,
  ThumbsUp,
  BookMarked,
  Flame,
} from "lucide-react";
import CountUp from "react-countup";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/context/LocaleContext";
import { useQuranStore } from "@/lib/store";
import type {
  QuizResult,
  PerformanceLevel,
  IslamicMotivation,
} from "@/lib/quizTypes";
import Link from "next/link";

interface QuizResultsProps {
  result: QuizResult;
  onRetry: () => void;
}

// Islamic motivations based on performance
const MOTIVATIONS: Record<PerformanceLevel["level"], IslamicMotivation> = {
  excellent: {
    type: "ayah",
    arabic: "إِنَّ مَعَ الْعُسْرِ يُسْرًا",
    translation: "Indeed, with hardship comes ease.",
    reference: "Quran 94:6",
  },
  good: {
    type: "hadith",
    arabic: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ",
    translation:
      "The best among you are those who learn the Quran and teach it.",
    reference: "Sahih al-Bukhari",
  },
  average: {
    type: "dua",
    arabic: "رَبِّ زِدْنِي عِلْمًا",
    translation: "My Lord, increase me in knowledge.",
    reference: "Quran 20:114",
  },
  "needs-improvement": {
    type: "hadith",
    arabic:
      "مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ",
    translation:
      "Whoever treads a path seeking knowledge, Allah will make easy for him the path to Paradise.",
    reference: "Sahih Muslim",
  },
};

export function QuizResults({ result, onRetry }: QuizResultsProps) {
  const { t } = useLocale();
  const customButtonColor = "var(--color-primary)";
  const { score, totalPoints, percentage, timeSpent, performance, answers } =
    result;

  // Determine performance level
  const getPerformanceLevel = (): PerformanceLevel => {
    if (percentage >= 90) {
      return {
        level: "excellent",
        title: t("excellentTitle"),
        message: t("excellentMessage"),
        motivation: MOTIVATIONS.excellent,
        recommendations: [
          t("recExcellent1"),
          t("recExcellent2"),
          t("recExcellent3"),
        ],
      };
    } else if (percentage >= 70) {
      return {
        level: "good",
        title: t("goodTitle"),
        message: t("goodMessage"),
        motivation: MOTIVATIONS.good,
        recommendations: [t("recGood1"), t("recGood2"), t("recGood3")],
      };
    } else if (percentage >= 50) {
      return {
        level: "average",
        title: t("averageTitle"),
        message: t("averageMessage"),
        motivation: MOTIVATIONS.average,
        recommendations: [t("recAverage1"), t("recAverage2"), t("recAverage3")],
      };
    } else {
      return {
        level: "needs-improvement",
        title: t("needsImprovementTitle"),
        message: t("needsImprovementMessage"),
        motivation: MOTIVATIONS["needs-improvement"],
        recommendations: [
          t("recNeedsImprovement1"),
          t("recNeedsImprovement2"),
          t("recNeedsImprovement3"),
          t("recNeedsImprovement4"),
        ],
      };
    }
  };

  const performanceLevel = getPerformanceLevel();
  const correctAnswers = answers.filter((a) => a.isCorrect).length;
  const avgTimePerQuestion = Math.round(performance.averageTimePerQuestion);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-4xl mx-auto p-6"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="inline-block p-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 mb-4"
        >
          {percentage >= 90 ? (
            <Sparkles className="w-16 h-16 text-white" />
          ) : percentage >= 70 ? (
            <ThumbsUp className="w-16 h-16 text-white" />
          ) : percentage >= 50 ? (
            <BookMarked className="w-16 h-16 text-white" />
          ) : (
            <Flame className="w-16 h-16 text-white" />
          )}
        </motion.div>
        <h1 className="text-3xl font-bold mb-2">{performanceLevel.title}</h1>
        <p className="text-muted-foreground">{performanceLevel.message}</p>
      </div>

      {/* Score Display */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
      >
        <div className="p-6 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center gap-2 mb-2 text-emerald-600 dark:text-emerald-400">
            <Target className="w-5 h-5" />
            <span className="text-sm font-medium">{t("score")}</span>
          </div>
          <div className="text-3xl font-bold">
            <CountUp end={percentage} duration={2} decimals={1} />%
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {score}/{totalPoints} {t("points")}
          </p>
        </div>

        <div className="p-6 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-2 text-blue-600 dark:text-blue-400">
            <Award className="w-5 h-5" />
            <span className="text-sm font-medium">{t("correct")}</span>
          </div>
          <div className="text-3xl font-bold">
            <CountUp end={correctAnswers} duration={2} />
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {t("outOf")} {answers.length}
          </p>
        </div>

        <div className="p-6 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-2 mb-2 text-purple-600 dark:text-purple-400">
            <Clock className="w-5 h-5" />
            <span className="text-sm font-medium">{t("time")}</span>
          </div>
          <div className="text-3xl font-bold">{formatTime(timeSpent)}</div>
          <p className="text-sm text-muted-foreground mt-1">
            {t("avg")}: {avgTimePerQuestion}s
          </p>
        </div>

        <div className="p-6 rounded-lg bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 border border-orange-200 dark:border-orange-800">
          <div className="flex items-center gap-2 mb-2 text-orange-600 dark:text-orange-400">
            <TrendingUp className="w-5 h-5" />
            <span className="text-sm font-medium">{t("accuracy")}</span>
          </div>
          <div className="text-3xl font-bold">
            <CountUp
              end={(correctAnswers / answers.length) * 100}
              duration={2}
              decimals={0}
            />
            %
          </div>
        </div>
      </motion.div>

      {/* Performance by Type */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mb-8 p-6 rounded-lg bg-card border"
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          {t("performanceByType")}
        </h3>
        <div className="space-y-3">
          {Object.entries(performance.byType).map(([type, stats]) => {
            const accuracy =
              stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;
            // Translate question type
            const typeKey =
              type === "guess-surah"
                ? "guessSurah"
                : type === "continue-ayah"
                ? "continueAyah"
                : type === "fill-missing-word"
                ? "fillMissingWord"
                : type === "surah-description"
                ? "surahDescription"
                : type;
            return (
              <div key={type} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="capitalize">{t(typeKey)}</span>
                  <span className="font-medium">
                    {stats.correct}/{stats.total} ({accuracy.toFixed(0)}%)
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${accuracy}%` }}
                    transition={{ delay: 0.5, duration: 1 }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Islamic Motivation */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mb-8 p-6 rounded-lg bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950 dark:to-yellow-950 border border-amber-200 dark:border-amber-800"
      >
        <div className="flex items-center gap-2 mb-3 text-amber-700 dark:text-amber-300">
          <Heart className="w-5 h-5" />
          <span className="font-semibold">{t("spiritualReminder")}</span>
        </div>
        <p className="text-xl text-right mb-2 leading-relaxed arabic-text text-amber-900 dark:text-amber-100">
          {performanceLevel.motivation.arabic}
        </p>
        <p className="text-sm italic text-amber-800 dark:text-amber-200 mb-1">
          "{performanceLevel.motivation.translation}"
        </p>
        <p className="text-xs text-amber-600 dark:text-amber-400">
          - {performanceLevel.motivation.reference}
        </p>
      </motion.div>

      {/* Recommendations */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mb-8 p-6 rounded-lg bg-card border"
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Star className="w-5 h-5" />
          {t("recommendations")}
        </h3>
        <ul className="space-y-2">
          {performanceLevel.recommendations.map((rec, index) => (
            <motion.li
              key={index}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className="flex items-start gap-2"
            >
              <span className="text-emerald-500 dark:text-emerald-400 mt-1">
                ✓
              </span>
              <span className="text-sm">{rec}</span>
            </motion.li>
          ))}
        </ul>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6, ease: "easeOut" }}
        className="flex flex-col sm:flex-row gap-4 w-full justify-center items-center mt-6"
      >
        {/* Кнопка "Попробовать снова" */}
        <Button
          onClick={onRetry}
          className="flex-1 w-full py-6 text-lg border-2 border-[var(--color-primary)] font-semibold rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl"
        >
          <RefreshCw className="w-5 h-5 mr-2" />
          {t("tryAgain")}
        </Button>

        <Button
          onClick={() => window.location.reload()}
          className="w-full flex-1 py-6 text-white text-lg bg-[var(--color-primary)] "
        >
          <Home className="w-5 h-5 mr-2" />
          {t("backToHome")}
        </Button>
        
      </motion.div>
    </motion.div>
  );
}
