export interface LyricLine {
  time: number;
  text: string;
}

export interface PlayableTrack {
  id: number;
  name: string;
  durationMs: number | null;
  url: string;
  artists: Array<{
    name: string;
  }>;
}
