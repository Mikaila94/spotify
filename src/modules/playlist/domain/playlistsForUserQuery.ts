export function playlistsForUserQuery(userId: number) {
  return {
    where: { userId },
    orderBy: { name: "asc" as const },
    select: { id: true, name: true },
  };
}
