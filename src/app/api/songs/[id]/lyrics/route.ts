import { NextResponse } from "next/server";
import { getSession } from "@/modules/auth/server";
import { songIdSchema } from "@/modules/catalog/public";
import { getSongLyrics } from "@/modules/catalog/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const songId = songIdSchema.safeParse((await params).id);

  if (!songId.success) {
    return NextResponse.json({ error: "Invalid song id" }, { status: 400 });
  }

  try {
    const lyrics = await getSongLyrics(songId.data);

    if (lyrics === null) {
      return NextResponse.json({ error: "Song not found" }, { status: 404 });
    }

    return NextResponse.json({ lyrics });
  } catch (error) {
    console.error("Error fetching lyrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch lyrics" },
      { status: 500 },
    );
  }
}
