export function playlistForUserQuery(playlistId: number, userId: number) {
  return {
    where: { id: playlistId, userId },
    select: {
      id: true,
      name: true,
      description: true,
      items: {
        orderBy: [{ position: "asc" as const }, { addedAt: "asc" as const }],
        select: {
          song: {
            select: {
              id: true,
              name: true,
              durationMs: true,
              url: true,
              artists: {
                orderBy: { order: "asc" as const },
                select: { artist: { select: { name: true } } },
              },
            },
          },
        },
      },
    },
  };
}
