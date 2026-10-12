import "server-only";

import { Prisma } from "@/generated/prisma/client";
import prisma from "@/shared/db/prisma";

export const CreatePlaylistSongStatus = {
  CREATED: "CREATED",
  NOT_FOUND: "NOT_FOUND",
  ALREADY_IN_PLAYLIST: "ALREADY_IN_PLAYLIST",
  SONG_NOT_FOUND: "SONG_NOT_FOUND",
} as const;

interface Created {
  status: "CREATED";
  playlistId: number;
  songId: number;
}

interface NotFound {
  status: "NOT_FOUND";
}

interface AlreadyInPlaylist {
  status: "ALREADY_IN_PLAYLIST";
}

interface SongNotFound {
  status: "SONG_NOT_FOUND";
}

export type CreatePlaylistSongResult =
  | Created
  | NotFound
  | AlreadyInPlaylist
  | SongNotFound;

export async function createPlaylistSong(
  playlistId: number,
  songId: number,
  userId: number,
): Promise<CreatePlaylistSongResult> {
  const playlist = await prisma.playlist.findFirst({
    where: {
      id: playlistId,
      userId,
    },
    select: { id: true },
  });

  if (!playlist) {
    return { status: CreatePlaylistSongStatus.NOT_FOUND };
  }

  try {
    const playlistSong = await prisma.playlistSong.create({
      data: {
        playlistId,
        songId,
      },
      select: {
        playlistId: true,
        songId: true,
      },
    });

    return {
      status: CreatePlaylistSongStatus.CREATED,
      playlistId: playlistSong.playlistId,
      songId: playlistSong.songId,
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return { status: CreatePlaylistSongStatus.ALREADY_IN_PLAYLIST };
      }

      if (error.code === "P2003") {
        return { status: CreatePlaylistSongStatus.SONG_NOT_FOUND };
      }
    }

    throw error;
  }
}
