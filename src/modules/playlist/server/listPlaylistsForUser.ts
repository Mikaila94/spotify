import "server-only";

import prisma from "@/shared/db/prisma";
import { playlistsForUserQuery } from "../domain/playlistsForUserQuery";
import type { PlaylistSummary } from "../public";

export async function listPlaylistsForUser(
  userId: number,
): Promise<PlaylistSummary[]> {
  return prisma.playlist.findMany(playlistsForUserQuery(userId));
}
