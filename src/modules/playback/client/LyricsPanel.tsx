"use client";

import { Box, Text } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { useAnimationFrame } from "@/shared/hooks/useAnimationFrame";
import type { LyricLine } from "../public";
import { usePlayback } from "./PlaybackContext";

function findActiveLyricIndex(lyrics: LyricLine[], currentTime: number) {
  return lyrics.reduce(
    (lastIndex, line, index) => (line.time <= currentTime ? index : lastIndex),
    -1,
  );
}

export function LyricsPanel() {
  const { currentTrack, isPlaying, audioRef, seek } = usePlayback();
  const [activeLineIndex, setActiveLineIndex] = useState(-1);
  const activeLineRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lyrics = currentTrack?.lyrics ?? [];

  useEffect(() => {
    setActiveLineIndex(-1);
  }, [currentTrack?.id]);

  useAnimationFrame(() => {
    if (!audioRef.current || lyrics.length === 0) return;

    const newIndex = findActiveLyricIndex(
      lyrics,
      audioRef.current.currentTime,
    );
    setActiveLineIndex((previousIndex) =>
      previousIndex !== newIndex ? newIndex : previousIndex,
    );
  }, isPlaying);

  function handleSeek(time: number) {
    seek(time);
    setActiveLineIndex(findActiveLyricIndex(lyrics, time));
  }

  useEffect(() => {
    if (activeLineRef.current && containerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [activeLineIndex]);

  if (!currentTrack) {
    return (
      <Box
        h="calc(100vh - 250px)"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Text color="gray.500" fontSize="lg">
          Select a song to view lyrics
        </Text>
      </Box>
    );
  }

  if (lyrics.length === 0) {
    return (
      <Box
        h="calc(100vh - 250px)"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Text color="gray.500" fontSize="lg">
          No lyrics available for this song
        </Text>
      </Box>
    );
  }

  return (
    <Box
      ref={containerRef}
      h="calc(100vh - 250px)"
      overflowY="auto"
      overflowX="hidden"
      p={6}
      css={{
        "&::-webkit-scrollbar": {
          width: "8px",
        },
        "&::-webkit-scrollbar-track": {
          background: "transparent",
        },
        "&::-webkit-scrollbar-thumb": {
          background: "#444",
          borderRadius: "4px",
        },
      }}
    >
      {lyrics.map((line, index) => (
        <Box
          key={`${line.time}-${index}`}
          ref={index === activeLineIndex ? activeLineRef : null}
          py={3}
          textAlign="center"
          transition="all 0.3s ease"
          cursor="pointer"
          onClick={() => handleSeek(line.time)}
          _hover={{
            color: "white",
            transform: "scale(1.02)",
          }}
        >
          <Text
            fontSize="xl"
            fontWeight={index === activeLineIndex ? "bold" : "normal"}
            color={index === activeLineIndex ? "white" : "gray.600"}
            transform={index === activeLineIndex ? "scale(1.05)" : "scale(1)"}
            transition="all 0.3s ease"
          >
            {line.text}
          </Text>
        </Box>
      ))}
    </Box>
  );
}
