"use client";

import { Box, Button, Heading, Table } from "@chakra-ui/react";
import { errorMessage } from "@/shared/http/apiError";
import type { SongDTO } from "../public";
import { useSongs } from "./useSongs";

interface SongCatalogProps {
  selectedSongId: number | null;
  onSelectSong: (song: SongDTO) => void;
  onUnauthorized: () => void;
}

function formatDuration(ms: number | null) {
  if (!ms) return "0:00";
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function SongCatalog({
  selectedSongId,
  onSelectSong,
  onUnauthorized,
}: SongCatalogProps) {
  const { data: songs, error, isLoading, mutate } = useSongs(onUnauthorized);

  if (isLoading) {
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
          {errorMessage(error, "Unable to load songs")}
        </Box>
        <Button onClick={() => void mutate()}>Retry</Button>
      </Box>
    );
  }

  if (!songs || songs.length === 0) {
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
      <Table.Root variant="outline" size="sm">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader color="gray.400">#</Table.ColumnHeader>
            <Table.ColumnHeader color="gray.400">Title</Table.ColumnHeader>
            <Table.ColumnHeader color="gray.400">Artist</Table.ColumnHeader>
            <Table.ColumnHeader color="gray.400">Album</Table.ColumnHeader>
            <Table.ColumnHeader color="gray.400">Duration</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {songs.map((song, index) => (
            <Table.Row
              key={song.id}
              onClick={() => onSelectSong(song)}
              cursor="pointer"
              _hover={{ bg: "gray.700" }}
              bg={selectedSongId === song.id ? "gray.800" : "transparent"}
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
  );
}
