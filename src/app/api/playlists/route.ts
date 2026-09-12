import { NextResponse } from "next/server";
import { getSession } from "@/modules/auth/server";
import { listPlaylistsForUser } from "@/modules/playlist/server";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    return NextResponse.json(await listPlaylistsForUser(session.id));
  } catch (error) {
    console.error("Error fetching playlists:", error);
    return NextResponse.json(
      { error: "Failed to fetch playlists" },
      { status: 500 },
    );
  }
}
