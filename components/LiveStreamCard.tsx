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
    <article className="overflow-hidden rounded-3xl border border-white/10 bg-[var(--verse-background)] shadow-[0_20px_45px_rgba(15,23,42,0.25)] transition-transform duration-300 hover:-translate-y-2">
      <div className="relative aspect-video">
        <iframe
          src={stream.youtubeEmbedUrl}
          title={t(stream.titleKey)}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent"></div>
        <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-semibold text-white shadow">
          <span className="relative flex items-center gap-2">
            <span className="flex h-2 w-2 animate-pulse rounded-full bg-white"></span>
            {stream.isLive ? t("liveStreams.status.live") : t("liveStreams.status.offline")}
          </span>
        </div>
        {stream.officialSource && (
          <div className="absolute right-4 top-4 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-emerald-700 shadow">
            <ShieldCheck className="h-4 w-4" />
            {t("liveStreams.status.official")}
          </div>
        )}
      </div>

      <div className="space-y-6 p-6 text-white">
        <header className="space-y-2">
          <h3 className="text-2xl font-semibold leading-tight">{t(stream.titleKey)}</h3>
          <p className="text-sm text-white/70">{t(stream.descriptionKey)}</p>
        </header>

        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-white/80">
          <div className="flex items-center gap-2 rounded-full border border-white/15 bg-black/20 px-3 py-1">
            <Wifi className="h-4 w-4" />
            <span>{stream.isLive ? t("liveStreams.status.liveSignal") : t("liveStreams.status.waiting")}</span>
            {formattedViewers && (
              <span className="ml-2 border-l border-white/20 pl-2">
                {t("liveStreams.status.currentViewers")}: {formattedViewers}
              </span>
            )}
          </div>

          <Button
            asChild
            variant="secondary"
            className="rounded-full border border-white/20 bg-white/10 px-5 py-2 text-white hover:bg-white/20"
          >
            <a href={stream.youtubeEmbedUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              {t("liveStreams.actions.openYoutube")}
            </a>
          </Button>
        </div>
      </div>
    </article>
  );
}
