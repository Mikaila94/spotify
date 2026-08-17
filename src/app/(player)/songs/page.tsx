"use client";

import { Box, Heading, Table, Grid, Button } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useMusicPlayer } from "@/contexts/MusicPlayerContext";
import LyricsDisplay from "@/components/LyricsDisplay/LyricsDisplay";
import { SongDTO } from "@/types/song";

export default function SongsPage() {
  const router = useRouter();
  const [songs, setSongs] = useState<SongDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { setCurrentSong, currentSong } = useMusicPlayer();

  const loadSongs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/songs");

      if (response.status === 401) {
        router.replace("/sign-in");
        router.refresh();
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch songs: ${response.statusText}`);
      }

      const data = (await response.json()) as SongDTO[];
      setSongs(data);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Unable to load songs"
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadSongs();
  }, [loadSongs]);

  const formatDuration = (ms: number | null) => {
    if (!ms) return "0:00";
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <Box>
        <Heading color="white" mb={6}>
          Songs
        </Heading>
        <Box color="gray.400">Loading...</Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Heading color="white" mb={6}>
          Songs
        </Heading>
        <Box color="red.400" mb={4}>
          {error}
        </Box>
        <Button onClick={loadSongs}>Retry</Button>
      </Box>
    );
  }

  if (songs.length === 0) {
    return (
      <Box>
        <Heading color="white" mb={6}>
          No songs found
        </Heading>
      </Box>
    );
  }

  return (
    <Box>
      <Heading color="white" mb={6}>
        Songs
      </Heading>

      <Grid templateColumns="1fr 1fr" gap={6}>
        <Box>
          <Table.Root variant="outline" size="sm">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader color="gray.400">#</Table.ColumnHeader>
                <Table.ColumnHeader color="gray.400">Title</Table.ColumnHeader>
                <Table.ColumnHeader color="gray.400">Artist</Table.ColumnHeader>
                <Table.ColumnHeader color="gray.400">Album</Table.ColumnHeader>
                <Table.ColumnHeader color="gray.400">
                  Duration
                </Table.ColumnHeader>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {songs.map((song, index) => (
                <Table.Row
                  key={song.id}
                  onClick={() => setCurrentSong(song)}
                  cursor="pointer"
                  _hover={{ bg: "gray.700" }}
                  bg={currentSong?.id === song.id ? "gray.800" : "transparent"}
                >
                  <Table.Cell color="gray.400">{index + 1}</Table.Cell>
                  <Table.Cell color="white">{song.name}</Table.Cell>
                  <Table.Cell color="gray.300">
                    {song.artists.map((artist) => artist.name).join(", ")}
                  </Table.Cell>
                  <Table.Cell color="gray.300">
                    {song.album?.title || "—"}
                  </Table.Cell>
                  <Table.Cell color="gray.400">
                    {formatDuration(song.durationMs)}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>

        <Box>
          <LyricsDisplay />
        </Box>
      </Grid>
    </Box>
  );
}
