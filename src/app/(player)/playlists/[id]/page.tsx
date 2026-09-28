import { notFound, redirect } from "next/navigation";
import { PlaylistScreen } from "@/app/_components/PlaylistScreen";
import { getSession } from "@/modules/auth/server";
import { playlistIdSchema } from "@/modules/playlist/public";
import { getPlaylistForUser } from "@/modules/playlist/server";

export default async function PlaylistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/sign-in");
  }

  const { id } = await params;
  const playlistId = playlistIdSchema.safeParse(id);

  if (!playlistId.success) {
    notFound();
  }

  const playlist = await getPlaylistForUser(playlistId.data, session.id);

  if (!playlist) {
    notFound();
  }

  return <PlaylistScreen playlist={playlist} />;
}
