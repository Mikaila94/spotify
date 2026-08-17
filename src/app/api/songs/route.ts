import { NextResponse } from "next/server";
import { getSession } from "@/features/auth/session";
import prisma from "@/lib/prisma";
import { SongDTO } from "@/types/song";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
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

    const songsDTO: SongDTO[] = songs.map((song) => ({
      id: song.id,
      name: song.name,
      durationMs: song.durationMs,
      url: song.url,
      album: song.album ? {
        id: song.album.id,
        title: song.album.title,
      } : null,
      artists: song.artists.map((artist) => ({
        id: artist.artist.id,
        name: artist.artist.name,
      })),
    }));

    return NextResponse.json(songsDTO);
  } catch (error) {
    console.error("Error fetching songs:", error);
    return NextResponse.json(
      { error: "Failed to fetch songs" },
      { status: 500 }
    );
  }
}
