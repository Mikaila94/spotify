import type { LyricLine } from "./domain/lyrics";

export type { LyricLine };

export interface SongDTO {
  id: number;
  name: string;
  durationMs: number | null;
  url: string;
  lyrics: LyricLine[];
  album: {
    id: number;
    title: string;
  } | null;
  artists: Array<{
    id: number;
    name: string;
  }>;
}
