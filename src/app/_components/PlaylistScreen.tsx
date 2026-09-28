"use client";

import { Box, Heading, Table, Text } from "@chakra-ui/react";
import { FaVolumeUp } from "react-icons/fa";
import { usePlayback } from "@/modules/playback/client";
import type { PlaylistDetail } from "@/modules/playlist/public";
import { formatDuration } from "@/shared/format/duration";

export function PlaylistScreen({ playlist }: { playlist: PlaylistDetail }) {
  const { currentTrack, isPlaying, playTrack } = usePlayback();

  return (
    <Box>
      <Heading color="white" mb={1}>
        {playlist.name}
      </Heading>
      {playlist.description ? (
        <Text color="gray.400" mb={6}>
          {playlist.description}
        </Text>
      ) : null}

      {playlist.tracks.length === 0 ? (
        <Text color="gray.400" mt={6}>
          This playlist is empty.
        </Text>
      ) : (
        <Table.Root
          variant="outline"
          size="sm"
          mt={6}
          css={{
            "& th, & td": {
              paddingInline: "14px",
              paddingBlock: "10px",
            },
          }}
        >
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader color="gray.400">#</Table.ColumnHeader>
              <Table.ColumnHeader color="gray.400">Title</Table.ColumnHeader>
              <Table.ColumnHeader color="gray.400">Artist</Table.ColumnHeader>
              <Table.ColumnHeader color="gray.400">Duration</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {playlist.tracks.map((track, index) => {
              const isCurrent = track.id === currentTrack?.id;

              return (
                <Table.Row
                  key={track.id}
                  onClick={() => playTrack(track, playlist.tracks)}
                  cursor="pointer"
                  bg={isCurrent ? "whiteAlpha.200" : "transparent"}
                  boxShadow={
                    isCurrent
                      ? "inset 3px 0 0 0 var(--chakra-colors-green-400)"
                      : undefined
                  }
                  _hover={{
                    bg: isCurrent ? "whiteAlpha.200" : "whiteAlpha.100",
                  }}
                  aria-current={isCurrent ? "true" : undefined}
                >
                  <Table.Cell
                    color={isCurrent ? "green.400" : "gray.400"}
                    w="48px"
                  >
                    {isCurrent && isPlaying ? (
                      <FaVolumeUp size={12} />
                    ) : (
                      index + 1
                    )}
                  </Table.Cell>
                  <Table.Cell
                    color={isCurrent ? "green.400" : "white"}
                    fontWeight={isCurrent ? "semibold" : "normal"}
                  >
                    {track.name}
                  </Table.Cell>
                  <Table.Cell color="gray.300">
                    {track.artists.map((artist) => artist.name).join(", ")}
                  </Table.Cell>
                  <Table.Cell color="gray.400">
                    {formatDuration(track.durationMs)}
                  </Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table.Root>
      )}
    </Box>
  );
}
