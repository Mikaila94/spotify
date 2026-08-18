import type { SongDTO } from "../public";

export type FetchSongsResult =
  | { status: "ok"; songs: SongDTO[] }
  | { status: "unauthorized" };

export async function fetchSongs(): Promise<FetchSongsResult> {
  const response = await fetch("/api/songs");

  if (response.status === 401) {
    return { status: "unauthorized" };
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch songs: ${response.statusText}`);
  }

  return {
    status: "ok",
    songs: (await response.json()) as SongDTO[],
  };
}
