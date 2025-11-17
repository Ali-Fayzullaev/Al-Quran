"use client";

import { useMemo, useState } from "react";
import { useLocale } from "@/context/LocaleContext";
import { liveStreamList } from "@/lib/liveStreams";
import { LiveStreamCard } from "@/components/LiveStreamCard";
import { PrayerTimesDisplay } from "@/components/PrayerTimesDisplay";
import { Button } from "@/components/ui/button";
import { RefreshCw, Radio } from "lucide-react";

// Добавляем стили для анимаций
const styles = `
  @keyframes fade-in-up {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .animate-fade-in-up {
    animation: fade-in-up 0.6s ease-out forwards;
    opacity: 0;
  }
`;

export default function LiveStreamsPage() {
  const { locale, t } = useLocale();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(() => new Date());

  const formattedUpdatedAt = useMemo(() => {
    const localeMap: Record<string, string> = {
      ru: "ru-RU",
      uz: "uz-UZ",
      en: "en-US",
    };

    return lastUpdated.toLocaleTimeString(localeMap[locale] ?? "en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [lastUpdated, locale]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLastUpdated(new Date());
      setIsRefreshing(false);
    }, 900);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <main
        className="min-h-screen relative overflow-hidden"
        style={{ backgroundColor: "var(--color-background-secondary)" }}
      >
      <section className="relative overflow-hidden border-b" style={{ borderColor: "var(--color-border)" }}>
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-blue-500/10 to-purple-500/15" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-radial from-emerald-400/30 to-transparent blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-radial from-blue-400/20 to-transparent blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-6xl px-6 py-20">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="max-w-4xl space-y-6">
              <div className="inline-flex items-center gap-3 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.4em] backdrop-blur-sm shadow-lg" style={{ backgroundColor: "var(--color-primary)", color: "white" }}>
                <Radio className="h-5 w-5 animate-pulse" />
                <span>{t("liveStreams.nav")}</span>
                <div className="w-2 h-2 bg-red-600 rounded-full animate-ping" />
              </div>
              <h1 className="text-5xl md:text-7xl font-black leading-[0.9] bg-gradient-to-r from-[var(--color-primary)] via-blue-500 to-purple-600 bg-clip-text text-transparent drop-shadow-2xl">
                {t("liveStreams.title")}
              </h1>
              <p className="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl font-medium">
                {t("liveStreams.subtitle")}
              </p>
            </div>

            <div className="flex flex-col items-center gap-4 rounded-3xl p-6 text-white backdrop-blur-xl border shadow-2xl" style={{ backgroundColor: "rgba(255,255,255,0.1)", borderColor: "rgba(255,255,255,0.2)", borderWidth: "1px", borderStyle: "solid" }}>
              <div className="text-xs uppercase tracking-[0.4em] text-white/70 font-bold text-center">
                {t("liveStreams.status.lastUpdated")}
              </div>
              <div className="text-3xl font-black text-center bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">{formattedUpdatedAt}</div>
              <Button
                variant="secondary"
                className="rounded-full px-6 py-3 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                style={{ backgroundColor: "var(--color-primary)", borderColor: "var(--color-primary)" }}
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-5 w-5 ${isRefreshing ? "animate-spin" : ""}`} />
                <span className="ml-2">{isRefreshing ? t("liveStreams.actions.refreshing") : t("liveStreams.actions.refresh")}</span>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Секция времени намазов */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <PrayerTimesDisplay />
      </section>

      {/* Секция прямых трансляций */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
            🕌 Святые места
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Прямые трансляции из самых священных мест ислама
          </p>
        </div>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 xl:gap-12">
          {liveStreamList.map((stream, index) => (
            <div key={stream.id} className={`animate-fade-in-up ${index === 1 ? 'lg:mt-8' : ''}`} style={{ animationDelay: `${index * 200}ms` }}>
              <LiveStreamCard stream={stream} locale={locale} t={t} />
            </div>
          ))}
        </div>
      </section>
      </main>
    </>
  );
}
