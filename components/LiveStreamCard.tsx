import { LiveStreamInfo } from "@/lib/liveStreams";
import { Button } from "@/components/ui/button";
import { ExternalLink, ShieldCheck, Wifi } from "lucide-react";

interface LiveStreamCardProps {
  stream: LiveStreamInfo;
  locale: string;
  t: (key: string) => string;
}

export function LiveStreamCard({ stream, locale, t }: LiveStreamCardProps) {
  const formattedViewers =
    typeof stream.currentViewers === "number"
      ? new Intl.NumberFormat(locale).format(stream.currentViewers)
      : null;

  return (
    <article className="group overflow-hidden rounded-3xl shadow-2xl transition-all duration-500 hover:-translate-y-3 hover:shadow-[0_35px_80px_rgba(0,0,0,0.25)] relative" style={{ backgroundColor: "var(--color-background-secondary)", borderColor: "var(--color-border)", borderWidth: "2px", borderStyle: "solid" }}>
      <div className="relative aspect-video overflow-hidden">
        <iframe
          src={stream.youtubeEmbedUrl}
          title={t(stream.titleKey)}
          className="h-full w-full transition-transform duration-500 group-hover:scale-105"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/70"></div>
        <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-gradient-to-r from-red-500 to-red-600 px-4 py-2 text-xs font-bold text-white shadow-lg backdrop-blur-sm">
          <span className="relative flex items-center gap-2">
            <span className="flex h-3 w-3 animate-pulse rounded-full bg-white shadow-lg"></span>
            <span className="uppercase tracking-wider">{stream.isLive ? t("liveStreams.status.live") : t("liveStreams.status.offline")}</span>
          </span>
        </div>
        {stream.officialSource && (
          <div className="absolute right-4 top-4 flex items-center gap-2 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary)] px-4 py-2 text-xs font-bold text-white shadow-lg backdrop-blur-sm">
            <ShieldCheck className="h-4 w-4" />
            <span className="uppercase tracking-wider">{t("liveStreams.status.official")}</span>
          </div>
        )}
      </div>

      <div className="space-y-8 p-8 relative">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-emerald-500/5 to-blue-500/5 opacity-50"></div>
        <header className="space-y-4 relative z-10">
          <h3 className="text-3xl font-bold leading-tight bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">{t(stream.titleKey)}</h3>
          <p className="text-base text-gray-600 leading-relaxed font-medium">{t(stream.descriptionKey)}</p>
        </header>

        <div className="flex flex-col gap-6 relative z-10">
          <div className="flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-gray-100 to-gray-50 px-6 py-4 shadow-inner" style={{ borderColor: "var(--color-border)", borderWidth: "1px", borderStyle: "solid" }}>
            <Wifi className="h-5 w-5 text-emerald-600" />
            <span className="font-semibold text-gray-700">{stream.isLive ? t("liveStreams.status.liveSignal") : t("liveStreams.status.waiting")}</span>
            {formattedViewers && (
              <span className="ml-3 border-l border-gray-300 pl-3 text-gray-600 font-medium">
                {t("liveStreams.status.currentViewers")}: {formattedViewers}
              </span>
            )}
          </div>

          <Button
            asChild
            variant="secondary"
            className="w-full rounded-2xl px-6 py-4 text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group"
            style={{ backgroundColor: "var(--color-primary)", borderColor: "var(--color-primary)" }}
          >
            <a href={stream.youtubeEmbedUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3">
              <ExternalLink className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
              <span>{t("liveStreams.actions.openYoutube")}</span>
            </a>
          </Button>
        </div>
      </div>
    </article>
  );
}
