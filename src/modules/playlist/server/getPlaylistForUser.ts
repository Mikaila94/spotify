import "server-only";

import prisma from "@/shared/db/prisma";
import { playlistForUserQuery } from "../domain/playlistForUserQuery";
import type { PlaylistDetail } from "../public";

export async function getPlaylistForUser(
  playlistId: number,
  userId: number,
): Promise<PlaylistDetail | null> {
  const playlist = await prisma.playlist.findFirst(
    playlistForUserQuery(playlistId, userId),
  );

  if (!playlist) {
    return null;
  }

  return {
    id: playlist.id,
    name: playlist.name,
    description: playlist.description,
    tracks: playlist.items.map(({ song }) => ({
      id: song.id,
      name: song.name,
      durationMs: song.durationMs,
      url: song.url,
      artists: song.artists.map(({ artist }) => ({ name: artist.name })),
    })),
  };
}
