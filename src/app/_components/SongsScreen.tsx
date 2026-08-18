"use client";

import { Box, Grid } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { SongCatalog } from "@/modules/catalog/client";
import type { SongDTO } from "@/modules/catalog/public";
import { LyricsPanel, usePlayback } from "@/modules/playback/client";
import type { PlayableTrack } from "@/modules/playback/public";

function toPlayableTrack(song: SongDTO): PlayableTrack {
  return {
    id: song.id,
    name: song.name,
    durationMs: song.durationMs,
    url: song.url,
    artists: song.artists.map(({ name }) => ({ name })),
  };
}

export function SongsScreen() {
  const router = useRouter();
  const { currentTrack, playTrack } = usePlayback();

  const handleUnauthorized = useCallback(() => {
    router.replace("/sign-in");
    router.refresh();
  }, [router]);

  return (
    <Grid templateColumns="1fr 1fr" gap={6}>
      <Box>
        <SongCatalog
          selectedSongId={currentTrack?.id ?? null}
          onSelectSong={(song) => playTrack(toPlayableTrack(song))}
          onUnauthorized={handleUnauthorized}
        />
      </Box>
      <Box>
        <LyricsPanel />
      </Box>
    </Grid>
  );
}
