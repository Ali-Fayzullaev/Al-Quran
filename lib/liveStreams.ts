export interface LiveStreamInfo {
  id: "mecca" | "medina";
  youtubeEmbedUrl: string;
  officialSource: boolean;
  currentViewers?: number | null;
  isLive: boolean;
  titleKey: string;
  descriptionKey: string;
}

export type LiveStreams = Record<LiveStreamInfo["id"], LiveStreamInfo>;

export const liveStreams: LiveStreams = {
  mecca: {
    id: "mecca",
    youtubeEmbedUrl:
      "https://www.youtube.com/embed/7-Qf3g-0xEI?si=MIws6Q-1lMaTBSUN",
    officialSource: true,
    currentViewers: null,
    isLive: true,
    titleKey: "liveStreams.locations.mecca.title",
    descriptionKey: "liveStreams.locations.mecca.description",
  },
  medina: {
    id: "medina",
    youtubeEmbedUrl:
      "https://www.youtube.com/embed/TpT8b8JFZ6E?si=gsm99jHXGeps9NQg",
    officialSource: true,
    currentViewers: null,
    isLive: true,
    titleKey: "liveStreams.locations.medina.title",
    descriptionKey: "liveStreams.locations.medina.description",
  },
};

export const liveStreamList = Object.values(liveStreams);
