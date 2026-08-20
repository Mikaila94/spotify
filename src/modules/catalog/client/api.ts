import { z } from "zod";
import { songListSchema, songLyricsDTOSchema } from "../domain/song";
import type { LyricLine, SongDTO } from "../public";
import { readApiError } from "@/shared/http/apiError";

export class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized");
    this.name = "UnauthorizedError";
  }
}

async function catalogGet<T>(url: string, schema: z.ZodType<T>): Promise<T> {
  const response = await fetch(url);

  if (response.status === 401) {
    throw new UnauthorizedError();
  }

  if (!response.ok) {
    throw new Error(
      await readApiError(response, `Failed to fetch: ${response.statusText}`),
    );
  }

  const parsed = schema.safeParse(await response.json());

  if (!parsed.success) {
    throw new Error("Invalid response");
  }

  return parsed.data;
}

export async function fetchSongs(url: string): Promise<SongDTO[]> {
  return catalogGet(url, songListSchema);
}

export async function fetchSongLyrics(url: string): Promise<LyricLine[]> {
  const payload = await catalogGet(url, songLyricsDTOSchema);
  return payload.lyrics;
}
