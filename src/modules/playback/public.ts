export interface LyricLine {
  time: number;
  text: string;
}

export interface PlayableTrack {
  id: number;
  name: string;
  durationMs: number | null;
  url: string;
  lyrics: LyricLine[];
  artists: Array<{
    name: string;
  }>;
}
