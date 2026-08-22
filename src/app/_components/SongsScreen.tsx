"use client";

import { Box, Grid } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { SongCatalog, useSongLyrics } from "@/modules/catalog/client";
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
  const { currentTrack, isPlaying, playTrack } = usePlayback();

  const handleUnauthorized = useCallback(() => {
    router.replace("/sign-in");
    router.refresh();
  }, [router]);

  const { data: lyrics, error, isLoading, mutate } = useSongLyrics(
    currentTrack?.id ?? null,
    handleUnauthorized,
  );

  return (
    <Grid templateColumns="1fr 1fr" gap={6}>
      <Box>
        <SongCatalog
          currentSongId={currentTrack?.id ?? null}
          isPlaying={isPlaying}
          onSelectSong={(song, songs) =>
            playTrack(toPlayableTrack(song), songs.map(toPlayableTrack))
          }
          onUnauthorized={handleUnauthorized}
        />
      </Box>
      <Box>
        <LyricsPanel
          lyrics={lyrics}
          isLoading={isLoading}
          error={error}
          onRetry={() => void mutate()}
        />
      </Box>
    </Grid>
  );
}
