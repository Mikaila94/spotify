import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/modules/auth/server";
import { songIdSchema } from "@/modules/catalog/public";
import { playlistIdSchema } from "@/modules/playlist/public";
import {
  createPlaylistSong,
  CreatePlaylistSongStatus,
} from "@/modules/playlist/server";

const addSongBodySchema = z.object({
  songId: songIdSchema,
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const playlistId = playlistIdSchema.safeParse((await params).id);

  if (!playlistId.success) {
    return NextResponse.json({ error: "Invalid playlist id" }, { status: 400 });
  }

  const body = addSongBodySchema.safeParse(
    await request.json().catch(() => null),
  );

  if (!body.success) {
    return NextResponse.json({ error: "Invalid song id" }, { status: 400 });
  }

  let result;

  try {
    result = await createPlaylistSong(
      playlistId.data,
      body.data.songId,
      session.id,
    );
  } catch (error) {
    console.error("Error adding song to playlist:", error);
    return NextResponse.json(
      { error: "Failed to add song to playlist" },
      { status: 500 },
    );
  }

  switch (result.status) {
    case CreatePlaylistSongStatus.CREATED:
      return NextResponse.json(
        { playlistId: result.playlistId, songId: result.songId },
        { status: 201 },
      );
    case CreatePlaylistSongStatus.NOT_FOUND:
      return NextResponse.json({ error: "Playlist not found" }, { status: 404 });
    case CreatePlaylistSongStatus.SONG_NOT_FOUND:
      return NextResponse.json({ error: "Song not found" }, { status: 404 });
    case CreatePlaylistSongStatus.ALREADY_IN_PLAYLIST:
      return NextResponse.json(
        { error: "Song already in playlist" },
        { status: 409 },
      );
  }
}
