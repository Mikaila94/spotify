"use client";

import { Box, Flex, Button, Text, Stack } from "@chakra-ui/react";
import { FaPlay, FaPause, FaVolumeUp } from "react-icons/fa";
import { useMusicPlayer } from "@/contexts/MusicPlayerContext";
import { useState, useRef, useEffect } from "react";

function formatTime(seconds: number) {
  if (!isFinite(seconds) || seconds < 0) {
    return "0:00";
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function PlayerLayout() {
  const { currentSong, isPlaying, togglePlayPause, currentTime, seek } =
    useMusicPlayer();
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const duration = currentSong?.durationMs ? currentSong.durationMs / 1000 : 0;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Use refs to access latest values without triggering re-renders
  const currentSongRef = useRef(currentSong);
  const seekRef = useRef(seek);
  const durationRef = useRef(duration);

  // Keep refs in sync
  useEffect(() => {
    currentSongRef.current = currentSong;
    seekRef.current = seek;
    durationRef.current = duration;
  }, [currentSong, seek, duration]);

  function calculateTimeFromPosition(clientX: number): number {
    if (!progressBarRef.current) return 0;
    const rect = progressBarRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = x / rect.width;
    return percentage * durationRef.current;
  }

  function handleMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    if (!currentSongRef.current) return;
    setIsDragging(true);
    const newTime = calculateTimeFromPosition(e.clientX);
    seekRef.current(newTime);
  }

  // Use useEffect to manage global mouse event listeners
  useEffect(() => {
    if (!isDragging) return;

    function handleMouseMove(e: MouseEvent) {
      if (!currentSongRef.current) return;
      const newTime = calculateTimeFromPosition(e.clientX);
      seekRef.current(newTime);
    }

    function handleMouseUp() {
      setIsDragging(false);
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  return (
    <Box p={4} h="80px">
      <Flex align="center" justify="space-between" h="100%">
        {/* Left section - Currently playing */}
        <Flex align="center" w="300px">
          <Box w="48px" h="48px" bg="gray.600" borderRadius="md" mr={3}>
            {/* Album art placeholder */}
          </Box>
          <Box>
            <Text color="white" fontSize="sm" fontWeight="medium">
              {currentSong?.name || "No song playing"}
            </Text>
            <Text color="gray.400" fontSize="xs">
              {currentSong?.artists.map((artist) => artist.name).join(", ") || ""}

            </Text>
          </Box>
        </Flex>

        {/* Center section - Player controls */}
        <Flex direction="column" align="center" flex="1" maxW="600px">
          <Stack direction="row" gap={4} mb={2}>
            <Button
              aria-label="Play/Pause"
              variant="solid"
              colorScheme="green"
              borderRadius="full"
              w="40px"
              h="40px"
              minW="40px"
              p={0}
              display="flex"
              alignItems="center"
              justifyContent="center"
              onClick={togglePlayPause}
              disabled={!currentSong}
              _hover={{ transform: "scale(1.05)" }}
              transition="transform 0.2s"
            >
              {isPlaying ? <FaPause size={16} /> : <FaPlay size={16} />}
            </Button>
          </Stack>
          <Stack direction="row" gap={3} w="100%" align="center">
            <Text color="gray.400" fontSize="xs" minW="40px">
              {formatTime(currentTime)}
            </Text>
            <Box
              ref={progressBarRef}
              flex="1"
              py={2}
              cursor="pointer"
              onMouseDown={handleMouseDown}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <Box
                position="relative"
                h={isHovering || isDragging ? "6px" : "4px"}
                bg="gray.600"
                borderRadius="full"
                transition="height 0.1s"
              >
                {/* Progress bar */}
                <Box
                  w={`${progress}%`}
                  h="100%"
                  bg="green.500"
                  borderRadius="full"
                  position="relative"
                />

                {/* Thumb indicator - only visible on hover or drag */}
                {(isHovering || isDragging) && (
                  <Box
                    position="absolute"
                    left={`${progress}%`}
                    top="50%"
                    transform="translate(-50%, -50%)"
                    w="14px"
                    h="14px"
                    bg="white"
                    borderRadius="full"
                    boxShadow="0 2px 8px rgba(0,0,0,0.4)"
                    transition="transform 0.1s"
                    _hover={{ transform: "translate(-50%, -50%) scale(1.2)" }}
                  />
                )}
              </Box>
            </Box>
            <Text color="gray.400" fontSize="xs" minW="40px" textAlign="right">
              {formatTime(duration)}
            </Text>
          </Stack>
        </Flex>

        {/* Right section - Volume */}
        <Flex align="center" w="200px" justify="flex-end">
          <Stack direction="row" gap={2} align="center">
            <FaVolumeUp color="gray.400" size="14px" />
            <Box
              w="100px"
              h="4px"
              bg="gray.600"
              borderRadius="full"
              position="relative"
            >
              <Box w="70%" h="100%" bg="green.500" borderRadius="full" />
            </Box>
          </Stack>
        </Flex>
      </Flex>
    </Box>
  );
}
