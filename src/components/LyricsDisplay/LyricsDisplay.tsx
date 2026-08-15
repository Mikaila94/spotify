"use client";

import { Box, Text } from "@chakra-ui/react";
import { useMusicPlayer } from "@/contexts/MusicPlayerContext";
import { useEffect, useRef, useState } from "react";
import { useAnimationFrame } from "@/lib/useAnimationFrame";

type LyricLine = {
  time: number;
  text: string;
};

// Mock lyrics data for the 5 songs (placeholder text only)
const LYRICS_BY_SONG_NAME: Record<string, LyricLine[]> = {
  "Hollow Lights": [
    { time: 0, text: "Opening sounds" },
    { time: 8, text: "Gentle intro" },
    { time: 16, text: "First verse begins" },
    { time: 24, text: "Words flow through" },
    { time: 32, text: "Building melody" },
    { time: 40, text: "Rising higher now" },
    { time: 48, text: "Verse continues" },
    { time: 56, text: "Reaching the peak" },
    { time: 64, text: "Chorus arrives here" },
    { time: 72, text: "Repeating the theme" },
    { time: 80, text: "Energy builds up" },
    { time: 88, text: "Second verse starts" },
    { time: 96, text: "Different feeling" },
    { time: 104, text: "New perspective" },
    { time: 112, text: "Story unfolds" },
    { time: 120, text: "Moving forward" },
    { time: 128, text: "Back to chorus" },
    { time: 136, text: "Repeating again" },
    { time: 144, text: "Strong and clear" },
    { time: 152, text: "Bridge section" },
    { time: 160, text: "Something changes" },
    { time: 168, text: "New direction" },
    { time: 176, text: "Building tension" },
    { time: 184, text: "Almost there" },
    { time: 192, text: "Final chorus" },
    { time: 200, text: "One more time" },
    { time: 208, text: "Last refrain" },
    { time: 216, text: "Peak moment" },
    { time: 224, text: "Holding strong" },
    { time: 232, text: "Starting to fade" },
    { time: 240, text: "Outro begins" },
    { time: 248, text: "Slowly winding down" },
    { time: 256, text: "Getting quieter" },
    { time: 264, text: "Almost done" },
    { time: 272, text: "Final moments" },
    { time: 280, text: "Very soft now" },
    { time: 288, text: "Nearly finished" },
    { time: 296, text: "Last echoes" },
    { time: 304, text: "Fading away" },
    { time: 312, text: "Almost silent" },
    { time: 320, text: "Final breath" },
    { time: 328, text: "Ending soon" },
    { time: 336, text: "Last notes" },
    { time: 344, text: "Finishing up" },
    { time: 352, text: "The end approaches" },
    { time: 360, text: "Final line" },
    { time: 368, text: "..." },
  ],
  "Static Bloom": [
    { time: 0, text: "A quiet signal appears" },
    { time: 24, text: "The rhythm starts to grow" },
    { time: 48, text: "Colors move through the sound" },
    { time: 72, text: "A new pattern takes shape" },
    { time: 96, text: "The melody opens up" },
    { time: 120, text: "Everything moves together" },
    { time: 144, text: "The theme returns again" },
    { time: 168, text: "Energy begins to rise" },
    { time: 192, text: "The final section arrives" },
    { time: 216, text: "The sound slowly fades" },
  ],
  "Chromatic Run": [
    { time: 0, text: "Starting sequence..." },
    { time: 12, text: "Rhythm kicks in" },
    { time: 24, text: "Melody takes over" },
    { time: 36, text: "First chorus" },
    { time: 48, text: "Verse two" },
    { time: 60, text: "Building tension" },
    { time: 72, text: "Chorus returns" },
    { time: 84, text: "Bridge moment" },
    { time: 96, text: "Final section" },
    { time: 108, text: "Ending phrase" },
  ],
  "Transit Lines": [
    { time: 0, text: "Intro soundscape..." },
    { time: 10, text: "Journey begins" },
    { time: 20, text: "Moving forward" },
    { time: 30, text: "First destination" },
    { time: 40, text: "Transitioning" },
    { time: 50, text: "New section" },
    { time: 60, text: "Picking up pace" },
    { time: 70, text: "Chorus hits" },
    { time: 80, text: "Bridge arrives" },
    { time: 90, text: "Final run" },
    { time: 100, text: "Conclusion" },
  ],
  "Cold Start": [
    { time: 0, text: "Cold beginning..." },
    { time: 15, text: "Warming up" },
    { time: 30, text: "First verse" },
    { time: 45, text: "Building warmth" },
    { time: 60, text: "Chorus emerges" },
    { time: 75, text: "Second verse" },
    { time: 90, text: "Bridge section" },
    { time: 105, text: "Final chorus" },
    { time: 120, text: "Cooling down" },
  ],
};

// Utility function to find the active lyric line index based on current time
function findActiveLyricIndex(
  lyrics: LyricLine[],
  currentTime: number,
): number {
  return lyrics.reduce(
    (lastIndex, line, index) => (line.time <= currentTime ? index : lastIndex),
    -1,
  );
}

export default function LyricsDisplay() {
  const { currentSong, isPlaying, audioRef, seek } = useMusicPlayer();
  const [activeLineIndex, setActiveLineIndex] = useState(-1);
  const activeLineRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const lyrics = currentSong ? LYRICS_BY_SONG_NAME[currentSong.name] || [] : [];

  // Game Loop: Poll audio currentTime and update activeLineIndex only when it changes
  useAnimationFrame(() => {
    if (!audioRef.current || lyrics.length === 0) return;

    const currentTime = audioRef.current.currentTime;
    const newIndex = findActiveLyricIndex(lyrics, currentTime);

    // Only update state if index actually changed (prevents unnecessary re-renders)
    setActiveLineIndex((prevIndex) =>
      prevIndex !== newIndex ? newIndex : prevIndex,
    );
  }, isPlaying);

  // Handle seeking: immediately update to the correct line for snappy response
  const handleSeek = (time: number) => {
    seek(time);
    const newIndex = findActiveLyricIndex(lyrics, time);
    setActiveLineIndex(newIndex);
  };

  // Auto-scroll to keep active line centered
  useEffect(() => {
    if (activeLineRef.current && containerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [activeLineIndex]);

  if (!currentSong) {
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
          key={index}
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
