"use client";

import { Box, Text } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { useAnimationFrame } from "@/shared/hooks/useAnimationFrame";
import { usePlayback } from "./PlaybackContext";

type LyricLine = {
  time: number;
  text: string;
};

const LYRICS_BY_TRACK_NAME: Record<string, LyricLine[]> = {
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
  "Echoes of Silence": [
    { time: 15, text: "Talk to me, baby" },
    { time: 18, text: "Tell me what you're feeling" },
    { time: 23, text: "You say you don't need to go" },
    { time: 27, text: "Don't you pretend you didn't know" },
    { time: 32, text: "How all of this would end up?" },
    { time: 36, text: "Girl, I saw it in your eyes" },
    { time: 40, text: "And, baby, I can read your mind" },
    { time: 44, text: "And expectations were not in sight" },
    { time: 48, text: "You knew that talking dirty to me on the phone" },
    { time: 53, text: "Would get me here" },
    { time: 56, text: "'Cause we both wanted to do this" },
    { time: 60, text: "But I could tell that you were scared" },
    { time: 64, text: "'Cause you thought there was more to us" },
    { time: 68, text: "But you knew how this would end" },
    { time: 73, text: "It's gonna end how you expected" },
    { time: 77, text: "Girl, you're such a masochist" },
    { time: 81, text: "And I ask why" },
    { time: 89, text: "And you reply" },
    { time: 98, text: "I like the thrill" },
    { time: 106, text: "Nothing's gonna make me feel this real" },
    { time: 114, text: "So, baby, don't go home" },
    { time: 122, text: "I don't wanna spend tonight alone" },
    { time: 131, text: "Baby, please" },
    { time: 139, text: "Would you end your night with me?" },
    { time: 147, text: "Don't you leave me all behind" },
    { time: 155, text: "Don't you leave my little life" },
    { time: 164, text: "Don't you leave my little lie" },
    { time: 172, text: "Ooh, ooh" },
    { time: 180, text: "No, no, no, no, no" },
    { time: 184, text: "No, no, no, no, no" },
    { time: 188, text: "No, no, no, no, no" },
    { time: 197, text: "No, no, no, no, no" },
    { time: 201, text: "No, no, no, no, no" },
    { time: 205, text: "No, no, no, no, no" },
    { time: 212, text: "Ooh, ooh" },
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
  const lyrics = currentTrack
    ? LYRICS_BY_TRACK_NAME[currentTrack.name] || []
    : [];

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
