import { getSession } from "@/modules/auth/server";
import { songIdSchema } from "@/modules/catalog/public";
import { playlistIdSchema } from "@/modules/playlist/public";
import { createPlaylistSong } from "@/modules/playlist/server";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ songId: string; playlistId: string }> },
) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { songId, playlistId } = await params;
  const songIdResult = songIdSchema.safeParse(songId);
  const playlistIdResult = playlistIdSchema.safeParse(playlistId);

  if (!playlistIdResult.success) {
    return NextResponse.json({ error: "Invalid playlist id" }, { status: 400 });
  }

  if (!songIdResult.success) {
    return NextResponse.json({ error: "Invalid song id" }, { status: 400 });
  }

  try {
    const playlistSong = await createPlaylistSong(
      playlistIdResult.data,
      songIdResult.data,
      session.id,
    );
  } catch (error) {
    console.error("Error adding song to playlist:", error);
    return NextResponse.json(
      { error: "Failed to add song to playlist" },
      { status: 500 },
    );
  }
}
