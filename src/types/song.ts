export interface SongDTO {
  id: number;
  name: string;
  durationMs: number | null;
  url: string;
  album: {
    id: number;
    title: string;
  } | null;
  artists: Array<{
    id: number;
    name: string;
  }>;
}






