"use client";

import { useMemo, useState } from "react";
import { useLocale } from "@/context/LocaleContext";
import { liveStreamList } from "@/lib/liveStreams";
import { LiveStreamCard } from "@/components/LiveStreamCard";
import { Button } from "@/components/ui/button";
import { RefreshCw, Radio } from "lucide-react";

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
    <main
      className="min-h-screen"
      style={{ backgroundColor: "var(--fixed-background)" }}
    >
      <section className="relative overflow-hidden border-b" style={{ borderColor: "var(--color-border)" }}>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-500/15 via-transparent to-indigo-500/10" />
        <div className="relative mx-auto max-w-6xl px-6 py-16">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-3xl space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
                <Radio className="h-4 w-4" />
                {t("liveStreams.nav")}
              </span>
              <h1 className="text-4xl font-bold leading-tight text-white md:text-5xl">
                {t("liveStreams.title")}
              </h1>
              <p className="text-base text-white/80 md:text-lg">
                {t("liveStreams.subtitle")}
              </p>
            </div>

            <div className="flex flex-col items-start gap-3 rounded-2xl border border-white/15 bg-white/10 p-5 text-white backdrop-blur">
              <div className="text-sm uppercase tracking-[0.3em] text-white/60">
                {t("liveStreams.status.lastUpdated")}
              </div>
              <div className="text-2xl font-semibold">{formattedUpdatedAt}</div>
              <Button
                variant="secondary"
                className="rounded-full border border-white/20 bg-white/10 px-5 py-2 text-white hover:bg-white/20"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                {isRefreshing ? t("liveStreams.actions.refreshing") : t("liveStreams.actions.refresh")}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {liveStreamList.map((stream) => (
            <LiveStreamCard key={stream.id} stream={stream} locale={locale} t={t} />
          ))}
        </div>
      </section>
    </main>
  );
}
