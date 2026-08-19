import "server-only";

import prisma from "@/shared/db/prisma";
import { parseLyrics } from "../domain/lyrics";
import type { SongDTO } from "../public";

export async function listSongs(): Promise<SongDTO[]> {
  const songs = await prisma.song.findMany({
    include: {
      album: true,
      artists: {
        include: {
          artist: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return songs.map((song) => ({
    id: song.id,
    name: song.name,
    durationMs: song.durationMs,
    url: song.url,
    lyrics: parseLyrics(song.lyrics),
    album: song.album
      ? {
          id: song.album.id,
          title: song.album.title,
        }
      : null,
    artists: song.artists.map(({ artist }) => ({
      id: artist.id,
      name: artist.name,
    })),
  }));
}
