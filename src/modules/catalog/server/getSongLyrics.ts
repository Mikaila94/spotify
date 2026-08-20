import "server-only";

import prisma from "@/shared/db/prisma";
import { parseLyrics } from "../domain/lyrics";
import type { LyricLine } from "../public";

export async function getSongLyrics(
  songId: number,
): Promise<LyricLine[] | null> {
  const song = await prisma.song.findUnique({
    where: { id: songId },
    select: { lyrics: true },
  });

  if (!song) {
    return null;
  }

  return parseLyrics(song.lyrics);
}
