"use client";

import { Box, Button, Heading, Table } from "@chakra-ui/react";
import { FaVolumeUp } from "react-icons/fa";
import { errorMessage } from "@/shared/http/apiError";
import type { SongDTO } from "../public";
import { useSongs } from "./useSongs";

interface SongCatalogProps {
  currentSongId: number | null;
  isPlaying: boolean;
  onSelectSong: (song: SongDTO, songs: SongDTO[]) => void;
  onUnauthorized: () => void;
}

function formatDuration(ms: number | null) {
  if (ms === null || ms <= 0) {
    return "0:00";
  }
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

interface CatalogSongRowProps {
  song: SongDTO;
  position: number;
  isCurrent: boolean;
  isPlaying: boolean;
  onSelect: (song: SongDTO) => void;
}

function CatalogSongRow({
  song,
  position,
  isCurrent,
  isPlaying,
  onSelect,
}: CatalogSongRowProps) {
  const showPlayingIcon = isCurrent && isPlaying;
  const titleColor = isCurrent ? "green.400" : "white";
  const rowBg = isCurrent ? "whiteAlpha.200" : "transparent";

  return (
    <Table.Row
      onClick={() => onSelect(song)}
      cursor="pointer"
      bg={rowBg}
      boxShadow={isCurrent ? "inset 3px 0 0 0 var(--chakra-colors-green-400)" : undefined}
      _hover={{ bg: isCurrent ? "whiteAlpha.200" : "whiteAlpha.100" }}
      aria-current={isCurrent ? "true" : undefined}
    >
      <Table.Cell color={isCurrent ? "green.400" : "gray.400"} w="40px">
        {showPlayingIcon ? <FaVolumeUp size={12} /> : position}
      </Table.Cell>
      <Table.Cell color={titleColor} fontWeight={isCurrent ? "semibold" : "normal"}>
        {song.name}
      </Table.Cell>
      <Table.Cell color="gray.300">
        {song.artists.map((artist) => artist.name).join(", ")}
      </Table.Cell>
      <Table.Cell color="gray.300">{song.album?.title ?? "—"}</Table.Cell>
      <Table.Cell color="gray.400">{formatDuration(song.durationMs)}</Table.Cell>
    </Table.Row>
  );
}

export function SongCatalog({
  currentSongId,
  isPlaying,
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

  if (songs === undefined || songs.length === 0) {
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
            <CatalogSongRow
              key={song.id}
              song={song}
              position={index + 1}
              isCurrent={song.id === currentSongId}
              isPlaying={isPlaying}
              onSelect={(selected) => onSelectSong(selected, songs)}
            />
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  );
}
