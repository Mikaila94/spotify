import "server-only";

import prisma from "@/shared/db/prisma";
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
